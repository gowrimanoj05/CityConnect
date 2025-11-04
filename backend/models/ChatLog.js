import mongoose from "mongoose"

const chatLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  userMessage: String,
  botResponse: String,
  intent: String,
  complaintCreated: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Complaint",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.model("ChatLog", chatLogSchema)
