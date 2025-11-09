// backend/routes/chatbot.js
import express from "express";
import axios from "axios";
import { verifyToken } from "../middleware/auth.js";
import ChatLog from "../models/ChatLog.js";
import Complaint from "../models/Complaint.js";
import User from "../models/User.js";

const router = express.Router();

// ✅ Gemini API endpoint
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent";

// ✅ System prompt
const SYSTEM_PROMPT = `
You are an intelligent city service support chatbot. Your role is to:
1. Understand citizen problems related to city services (water, electricity, roads, sanitation, etc.)
2. Determine if the issue is solvable by the citizen with simple steps or requires professional help
3. Provide clear step-by-step solutions for solvable issues
4. Clearly state when professional help is needed

For each user message, respond ONLY with a JSON object in this exact format:
{
  "botResponse": "Your helpful response text here",
  "category": "water/electricity/road/sanitation/other",
  "isSolvable": true/false,
  "priority": "low/medium/high",
  "suggestedTitle": "Brief title for the issue if complaint needed"
}

Rules:
- Urgent/emergency words → priority = high
- "soon", "quickly", "fast" → priority = medium
- Otherwise → priority = low
- Water/electricity → solvable with steps (isSolvable: true)
- Road/sanitation/structural → needs complaint (isSolvable: false)
- Always respond with **pure JSON** (no markdown, no backticks, no explanations).
`;

router.post("/message", verifyToken, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res
        .status(503)
        .json({ message: "Chatbot unavailable — GEMINI_API_KEY not configured." });
    }

    // ✅ Get user from DB
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    console.log("[chatbot] 🧠 Sending request to Gemini API...");

    // ✅ Send prompt to Gemini
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            role: "user",
            parts: [
              { text: SYSTEM_PROMPT },
              { text: `User message: "${message}"` },
            ],
          },
        ],
      },
      { headers: { "Content-Type": "application/json" } }
    );

    // ✅ Extract response text
    let text =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (!text) throw new Error("Empty response from Gemini API");

    // ✅ Clean potential markdown
    if (text.startsWith("```")) {
      text = text.replace(/^```(json)?/i, "").replace(/```$/, "").trim();
    }

    // ✅ Parse JSON
    let geminiAnalysis;
    try {
      geminiAnalysis = JSON.parse(text);
    } catch (e) {
      console.error("[chatbot] ❌ Invalid JSON from Gemini:", text);
      return res.status(500).json({
        message: "Invalid response format from Gemini",
        details: text,
      });
    }

    // ✅ Validate fields
    if (
      !geminiAnalysis.botResponse ||
      !geminiAnalysis.category ||
      typeof geminiAnalysis.isSolvable !== "boolean"
    ) {
      return res.status(500).json({ message: "Incomplete AI response" });
    }

    let autoComplaintCreated = false;
    let complaintId = null;

    // ✅ Auto-create complaint for unsolvable issues
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
      });
      await complaint.save();
      complaintId = complaint._id;
      autoComplaintCreated = true;
    }

    const botReply = geminiAnalysis.isSolvable
      ? geminiAnalysis.botResponse
      : `${geminiAnalysis.botResponse}\n\n📋 Complaint Created:\n• Location: ${user.address}\n• Area: ${user.area}\n• Priority: ${geminiAnalysis.priority || "medium"}\n\nTrack it on your dashboard.`;

    // ✅ Save chat log
    await new ChatLog({
      userId: req.userId,
      userMessage: message,
      botResponse: botReply,
      intent: geminiAnalysis.category,
      complaintCreated: complaintId,
    }).save();

    // ✅ Send final response
    res.json({
      response: botReply,
      intent: geminiAnalysis.category,
      isSolvable: geminiAnalysis.isSolvable,
      priority: geminiAnalysis.priority || "low",
      autoComplaintCreated,
      complaintCreated: complaintId,
    });
  } catch (error) {
    console.error("[chatbot] 💥 Error:", error.message);
    res.status(500).json({
      message: "Chatbot failed to process your request",
      details: error.message,
    });
  }
});

export default router;
