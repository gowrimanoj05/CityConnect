// backend/routes/chatbot.js
import express from "express";
import { verifyToken } from "../middleware/auth.js";
import ChatLog from "../models/ChatLog.js";
import Complaint from "../models/Complaint.js";
import User from "../models/User.js";
import dotenv from "dotenv";

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";

dotenv.config();
const router = express.Router();

// ✅ Initialize Gemini model (LangChain v1 syntax)
const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  model: "gemini-2.0-flash",
  temperature: 0.7,
});

// ✅ System Prompt
const SYSTEM_PROMPT = `
You are an intelligent city service support chatbot. Your role is to:
1. Understand citizen problems related to city and household services (water, electricity, roads, sanitation, medical, public safety, building maintenance, public facilities, and environmental issues).
2. Determine if the issue can be solved by the citizen with simple, safe steps — or if it requires official city-level maintenance or emergency help.
3. Respond ONLY with helpful, safe, and clear information.

Respond ONLY with a JSON object in this exact format:
{{
  "botResponse": "Helpful response text",
  "category": "water/electricity/road/sanitation/medical/safety/building/environment/mechanical/other",
  "isSolvable": true/false,
  "priority": "low/medium/high/emergency",
  "suggestedTitle": "Brief title for the issue if complaint or service appointment needed"
}}

Rules for determining solvability:
- Mark **isSolvable = false** for ANY of the following:
  - City-managed or public services (garbage not collected, potholes, streetlights not working, water outage, power outage, drainage blockage, public facility damage, etc.)
  - Emergencies (fire, electrocution, gas leak, collapsed structure, medical emergency, etc.)
  - Anything that requires a city technician or department action.
- Mark **isSolvable = true** only for small household-level problems the user can safely handle themselves (checking fuse, cleaning tap aerator, unclogging sink, etc.)
- For unresolved service requests or repeated complaints, also set **isSolvable = false** and suggest complaint creation.
- If the user’s query is unrelated to city services (like jokes, greetings, or weather questions), clearly say it’s outside your scope and set **category = "other"** and **isSolvable = true** so no complaint is created.
- Always include a relevant **category** and **priority**.
- Output must be pure JSON, no markdown, no explanations.
`;

const prompt = new PromptTemplate({
  template: `${SYSTEM_PROMPT}\n\nUser message: "{message}"`,
  inputVariables: ["message"],
});

const chain = RunnableSequence.from([prompt, model]);

// ✅ Chatbot Route
router.post("/message", verifyToken, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ Run LangChain pipeline
    const result = await chain.invoke({ message });

    let text = result.content;
    if (typeof text !== "string") text = JSON.stringify(result, null, 2);

    if (text.startsWith("```")) {
      text = text.replace(/^```(json)?/i, "").replace(/```$/, "").trim();
    }

    let geminiAnalysis;
    try {
      geminiAnalysis = JSON.parse(text);
    } catch (e) {
      console.error("[chatbot] Invalid JSON from Gemini:", text);
      return res.status(500).json({
        message: "Invalid response format from Gemini via LangChain",
        details: text,
      });
    }

    // Log raw output for debugging
    console.log("[Gemini Output]", geminiAnalysis);

    if (!geminiAnalysis.botResponse || !geminiAnalysis.category) {
      return res.status(500).json({ message: "Incomplete AI response" });
    }

    // ✅ Detect irrelevant / small-talk / off-topic queries
    const userMessageLower = message.toLowerCase();

    const irrelevantKeywords = [
      "joke", "hello", "hi", "hey", "how are you",
      "good morning", "good evening", "weather",
      "song", "news", "story", "who are you",
      "thanks", "thank you", "ok", "bye", "goodbye"
    ];

    const isUserIrrelevant = irrelevantKeywords.some(k =>
      userMessageLower.includes(k)
    );

    const isGeminiIrrelevant =
      geminiAnalysis.category?.toLowerCase() === "other" ||
      /not.*(service|issue|problem)|cannot|sorry|assist/i.test(
        geminiAnalysis.botResponse
      );

    const isIrrelevant = isUserIrrelevant || isGeminiIrrelevant;

    let autoComplaintCreated = false;
    let complaintId = null;

    // ✅ EARLY EXIT: Skip complaint creation for irrelevant queries
    if (isIrrelevant) {
      console.log("[Chatbot] Skipping complaint creation (irrelevant query)");
    } else if (!geminiAnalysis.isSolvable) {
      // ✅ Create complaint only for genuine city issues
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

    // ✅ Prepare bot response
    const botReply = autoComplaintCreated
      ? `${geminiAnalysis.botResponse}\n\n📋 Complaint Created:\n• Location: ${user.address}\n• Area: ${user.area}\n• Priority: ${geminiAnalysis.priority || "medium"}\n\nTrack it on your dashboard.`
      : geminiAnalysis.botResponse;

    // ✅ Log the conversation
    await new ChatLog({
      userId: req.userId,
      userMessage: message,
      botResponse: botReply,
      intent: geminiAnalysis.category,
      complaintCreated: complaintId,
    }).save();

    // ✅ Return final response
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
