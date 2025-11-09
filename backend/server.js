// backend/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";

// ✅ Load .env right away
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// ✅ Debug logs
console.log("[server] GEMINI_API_KEY loaded:", !!process.env.GEMINI_API_KEY);
console.log("[server] MONGO_URI loaded:", !!process.env.MONGO_URI);

// ✅ MongoDB Connection
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI missing in .env!");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI, { dbName: "cityconnect" })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Import routes
import authRoutes from "./routes/auth.js";
import noticeRoutes from "./routes/notices.js";
import complaintRoutes from "./routes/complaints.js";
import chatbotRoutes from "./routes/chatbot.js";

// ✅ Use routes
app.use("/api/auth", authRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/chatbot", chatbotRoutes);

// ✅ Health check
app.get("/api/health", (req, res) => res.json({ status: "Server is running" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
