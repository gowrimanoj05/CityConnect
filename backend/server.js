import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.js"
import noticeRoutes from "./routes/notices.js"
import complaintRoutes from "./routes/complaints.js"
import chatbotRoutes from "./routes/chatbot.js"

dotenv.config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

console.log("⚠️ MongoDB not connected — running in mock mode.");


// Routes
app.use("/api/auth", authRoutes)
app.use("/api/notices", noticeRoutes)
app.use("/api/complaints", complaintRoutes)
app.use("/api/chatbot", chatbotRoutes)

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "Server is running" })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
