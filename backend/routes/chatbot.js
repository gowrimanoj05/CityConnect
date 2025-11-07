import express from "express"
import { verifyToken } from "../middleware/auth.js"
import ChatLog from "../models/ChatLog.js"
import Complaint from "../models/Complaint.js"
import User from "../models/User.js"

const router = express.Router()

// Knowledge base for common issues and solutions
const solutionDatabase = {
  water: {
    keywords: ["water", "leak", "pipe", "pressure", "supply"],
    solutions: [
      "Check if main water valve is open",
      "Inspect all visible pipes for leaks",
      "Contact emergency line if water is contaminated",
      "Check if payment is up to date",
    ],
    solvable: true,
  },
  electricity: {
    keywords: ["electricity", "power", "outage", "circuit", "breaker", "light"],
    solutions: [
      "Check if main breaker is switched on",
      "Reset tripped circuit breaker",
      "Check if bill is paid",
      "Test outlet with another device",
      "Do not touch wet outlets",
    ],
    solvable: true,
  },
  road: {
    keywords: ["road", "pothole", "damage", "broken", "street", "pavement"],
    solutions: [
      "Avoid the damaged area if possible",
      "Report location details for faster repairs",
      "Document with photos for records",
    ],
    solvable: false,
  },
  sanitation: {
    keywords: ["garbage", "waste", "drain", "sewage", "cleaning", "sanitation"],
    solutions: [
      "Ensure proper waste segregation",
      "Keep drainage area clear of debris",
      "Dispose waste in designated bins",
      "Contact sanitation department for bulk waste",
    ],
    solvable: false,
  },
}

function detectIssueType(message) {
  const lowerMessage = message.toLowerCase()

  for (const [category, data] of Object.entries(solutionDatabase)) {
    if (data.keywords.some((keyword) => lowerMessage.includes(keyword))) {
      return {
        category,
        isSolvable: data.solvable,
        suggestions: data.solutions,
      }
    }
  }

  return {
    category: "other",
    isSolvable: false,
    suggestions: ["Please file a detailed complaint so our team can assist you"],
  }
}

function detectPriority(message) {
  const lowerMessage = message.toLowerCase()
  if (lowerMessage.match(/urgent|emergency|critical|immediately|asap|danger/)) {
    return "high"
  }
  if (lowerMessage.match(/soon|quickly|fast/)) {
    return "medium"
  }
  return "low"
}

function generateComplaintTitle(message, category) {
  const words = message.split(" ").slice(0, 8).join(" ")
  return words.length > 50 ? words.substring(0, 50) + "..." : words
}

router.post("/message", verifyToken, async (req, res) => {
  try {
    const { message } = req.body

    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    const issueAnalysis = detectIssueType(message)
    const priority = detectPriority(message)
    const title = generateComplaintTitle(message, issueAnalysis.category)

    // Prepare chatbot response based on solvability
    let botResponse = ""
    let autoComplaintCreated = false
    let complaintId = null

    if (issueAnalysis.isSolvable) {
      botResponse = `I detected this is a ${issueAnalysis.category} issue. Here are some steps you can try:\n\n`
      issueAnalysis.suggestions.forEach((suggestion, idx) => {
        botResponse += `${idx + 1}. ${suggestion}\n`
      })
      botResponse += `\nIf these steps don't resolve your issue, please file a formal complaint and our team will assist you.`
    } else {
      const complaint = new Complaint({
        title,
        description: message,
        category: issueAnalysis.category,
        area: user.area,
        address: user.address,
        priority,
        userId: req.userId,
        status: "open",
      })
      await complaint.save()
      complaintId = complaint._id
      autoComplaintCreated = true

      botResponse = `I understand this is a ${issueAnalysis.category} issue that requires professional assistance. `
      botResponse += `I've automatically created a formal complaint for you with priority level: ${priority}.\n\n`
      botResponse += `Complaint Details:\n`
      botResponse += `• Location: ${user.address}\n`
      botResponse += `• Area: ${user.area}\n`
      botResponse += `• Priority: ${priority}\n\n`
      botResponse += `Our team will contact you shortly at ${user.phone}. You can track the status in your complaints dashboard.`
    }

    const chatLog = new ChatLog({
      userId: req.userId,
      userMessage: message,
      botResponse,
      intent: issueAnalysis.category,
      complaintCreated: complaintId,
    })
    await chatLog.save()

    res.json({
      response: botResponse,
      intent: issueAnalysis.category,
      isSolvable: issueAnalysis.isSolvable,
      priority,
      complaintCreated: complaintId,
      autoComplaintCreated,
    })
  } catch (error) {
    console.log("[v0] Chatbot error:", error.message)
    res.status(500).json({ message: error.message })
  }
})

export default router
