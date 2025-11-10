import express from "express"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { verifyToken } from "../middleware/auth.js"
import ChatLog from "../models/ChatLog.js"
import Complaint from "../models/Complaint.js"
import User from "../models/User.js"

const router = express.Router()

if (!process.env.GEMINI_API_KEY) {
  console.error("[v0] GEMINI_API_KEY environment variable is not set")
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const SYSTEM_PROMPT = `You are an intelligent city service support chatbot. Your role is to:
1. Understand citizen problems related to a wide range of city and household services (water, electricity, roads, sanitation, medical, public safety, building maintenance, public facilities, and environmental issues).
2. Determine if the issue is solvable by the citizen with simple steps or requires professional/city help.
3. Provide clear step-by-step solutions for solvable issues (including immediate safety actions and temporary fixes).
4. Clearly state when professional help is needed and provide appropriate emergency/non-emergency contact information.

For each user message, respond ONLY with a JSON object in this exact format:
{
  "botResponse": "Your helpful response text here",
  "category": "water/electricity/road/sanitation/medical/safety/building/environment/other",
  "isSolvable": true/false,
  "priority": "low/medium/high/emergency",
  "suggestedTitle": "Brief title for the issue if complaint needed"
}

Rules:
- **Category Logic (Mandatory Assignments):**
    - **medical:** MUST be assigned if the message contains keywords: **heart attack, stroke, seizure, unconscious, cannot breathe, choking, severe bleeding, ambulance, medical emergency, collapsed.**
    - **safety:** Assigned for non-medical immediate public hazards, crime, or structural/electrical dangers.
    - **water/electricity/road/sanitation/building/environment/other:** Assigned based on the core topic when not a medical/safety emergency.

- **Priority Logic (Absolute Overrides & Time Factor):**
    - **emergency (Highest Priority - Mandatory):** MUST be assigned if the message falls under the 'medical' category or contains keywords indicating immediate threat to life/health (e.g., **fire, gas leak, exposed live wire, active crime, major life-threatening injury**). **This overrides all other priority rules.**
    - **high:** Loss of essential services (water/electricity) for **more than four hours or across multiple days**, significant public hazard, or major failure (e.g., **complete** power outage, **no** water supply, overflowing main sewer, significant road obstruction, large tree down, severe leaks inside a home). Includes words/phrases like: **severe, main, hazard, serious, critical, widespread, major, since yesterday, for hours, total loss, complete outage.**
    - **medium:** Partial service interruption, significant inconvenience, or non-critical issues that require prompt attention (e.g., low water pressure, intermittent power, single street light out, minor road damage, delayed trash collection). Includes words like: **soon, quickly, fast, urgent, important.**
    - **low (Default):** Aesthetic, minor, or long-term administrative issues (e.g., faded road marking, minor pothole, general inquiry, missed recycling pickup). Otherwise default to **low**.

- **Solvability Logic:**
    - **isSolvable: true:** Issues manageable by the citizen (e.g., tripped breaker, single faucet leak, checking own shut-off valve, reporting a specific location, first response to a utility issue).
    - **isSolvable: false:** Issues requiring city intervention, professional resources, or public works maintenance (e.g., **city** water/power outage, sewer backup in the street, road repair, public facility repair, **or any time the citizen confirms they have completed initial troubleshooting steps without success**).

- Always respond with **pure JSON** (no markdown, no backticks, no explanations).`

router.post("/message", verifyToken, async (req, res) => {
  try {
    const { message } = req.body

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: "Message cannot be empty" })
    }

    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    const prompt = `${SYSTEM_PROMPT}\n\nUser message: "${message}"`

    console.log("[v0] Sending request to Gemini 2.0 Flash")
    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    console.log("[v0] Gemini response received:", responseText.substring(0, 100))

    // Parse Gemini's JSON response
    let geminiAnalysis
    try {
      const cleanedResponse = responseText.trim()
      geminiAnalysis = JSON.parse(cleanedResponse)
    } catch (error) {
      console.log("[v0] Failed to parse Gemini response:", responseText)
      console.log("[v0] Parse error:", error.message)

      return res.status(500).json({
        message: "Failed to process your request. Please try again.",
        details: "Invalid response format from AI",
      })
    }

    // Validate required fields
    if (!geminiAnalysis.botResponse || !geminiAnalysis.category || typeof geminiAnalysis.isSolvable !== "boolean") {
      console.log("[v0] Invalid Gemini response structure:", geminiAnalysis)
      return res.status(500).json({ message: "Invalid response structure from AI" })
    }

    let autoComplaintCreated = false
    let complaintId = null

    if (!geminiAnalysis.isSolvable) {
      const complaint = new Complaint({
        title: geminiAnalysis.suggestedTitle || "Service Request",
        description: message,
        category: geminiAnalysis.category,
        area: user.area,
        address: user.address,
        priority: geminiAnalysis.priority || "medium",
        userId: req.userId,
        status: "open",
      })
      await complaint.save()
      complaintId = complaint._id
      autoComplaintCreated = true

      const enhancedResponse =
        `${geminiAnalysis.botResponse}\n\n` +
        `📋 Formal Complaint Created:\n` +
        `• Location: ${user.address}\n` +
        `• Area: ${user.area}\n` +
        `• Priority: ${geminiAnalysis.priority || "medium"}\n\n` +
        `Our team will contact you shortly. Track your complaint in the dashboard.`

      const chatLog = new ChatLog({
        userId: req.userId,
        userMessage: message,
        botResponse: enhancedResponse,
        intent: geminiAnalysis.category,
        complaintCreated: complaintId,
      })
      await chatLog.save()

      return res.json({
        response: enhancedResponse,
        intent: geminiAnalysis.category,
        isSolvable: false,
        priority: geminiAnalysis.priority || "medium",
        complaintCreated: complaintId,
        autoComplaintCreated: true,
      })
    }

    const chatLog = new ChatLog({
      userId: req.userId,
      userMessage: message,
      botResponse: geminiAnalysis.botResponse,
      intent: geminiAnalysis.category,
      complaintCreated: null,
    })
    await chatLog.save()

    res.json({
      response: geminiAnalysis.botResponse,
      intent: geminiAnalysis.category,
      isSolvable: true,
      priority: geminiAnalysis.priority || "low",
      complaintCreated: null,
      autoComplaintCreated: false,
    })
  } catch (error) {
    console.log("[v0] Chatbot error:", error.message)
    console.log("[v0] Error details:", error)
    res.status(500).json({
      message: "An error occurred while processing your request",
      details: error.message,
    })
  }
})

export default router
