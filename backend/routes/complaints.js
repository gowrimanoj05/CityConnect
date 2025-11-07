import express from "express"
import { verifyToken, verifyAdmin } from "../middleware/auth.js"
import Complaint from "../models/Complaint.js"
import User from "../models/User.js"

const router = express.Router()

// Get user's complaints
router.get("/", verifyToken, async (req, res) => {
  try {
    const complaints = await Complaint.find({ userId: req.userId }).populate("userId", "name").sort({ createdAt: -1 })
    res.json(complaints)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get all complaints (admin)
router.get("/admin/all", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const complaints = await Complaint.find().populate("userId", "name email area").sort({ createdAt: -1 })
    res.json(complaints)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create complaint
router.post("/", verifyToken, async (req, res) => {
  try {
    const { title, description, category, area, priority } = req.body
    const user = await User.findById(req.userId)

    const complaint = new Complaint({
      title,
      description,
      category,
      area: area || user.area,
      priority,
      userId: req.userId,
    })
    await complaint.save()
    res.status(201).json(complaint)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update complaint status (admin)
router.patch("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { status, priority } = req.body
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, { status, priority }, { new: true })
    res.json(complaint)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Add comment to complaint
router.post("/:id/comment", verifyToken, async (req, res) => {
  try {
    const { text } = req.body
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: { text, author: req.userId } } },
      { new: true },
    )
    res.json(complaint)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
