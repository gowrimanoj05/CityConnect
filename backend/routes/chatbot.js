import express from "express"
import axios from "axios"
import { verifyToken } from "../middleware/auth.js"
import ChatLog from "../models/ChatLog.js"
import Complaint from "../models/Complaint.js"

const router = express.Router()

router.post("/message", verifyToken, async (req, res) => {
  try {
    const { message } = req.body

    // Call Dialogflow API
    const dialogflowResponse = await axios.post(
      `https://dialogflow.googleapis.com/v2/projects/${process.env.DIALOGFLOW_PROJECT_ID}/agent/sessions/${req.userId}:detectIntent`,
      {
        queryInput: {
          text: {
            text: message,
            languageCode: "en-US",
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DIALOGFLOW_TOKEN}`,
        },
      },
    )

    const intent = dialogflowResponse.data.queryResult.intent.displayName
    const botResponse = dialogflowResponse.data.queryResult.fulfillmentText

    // If complaint should be created
    let complaintId = null
    if (intent === "create_complaint") {
      const complaint = new Complaint({
        title: "Chatbot Generated Complaint",
        description: message,
        category: "other",
        userId: req.userId,
        status: "open",
      })
      await complaint.save()
      complaintId = complaint._id
    }

    // Log chat
    const chatLog = new ChatLog({
      userId: req.userId,
      userMessage: message,
      botResponse,
      intent,
      complaintCreated: complaintId,
    })
    await chatLog.save()

    res.json({ response: botResponse, intent, complaintCreated: complaintId })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
