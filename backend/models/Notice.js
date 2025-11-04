import mongoose from "mongoose"

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  area: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ["maintenance", "alert", "announcement", "event"],
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.model("Notice", noticeSchema)
