import express from "express"
import { verifyToken, verifyAdmin } from "../middleware/auth.js"
import Notice from "../models/Notice.js"
import User from "../models/User.js" // Added import for User model

const router = express.Router()

// Get notices for citizen's area
router.get("/", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    const notices = await Notice.find({ area: user.area }).populate("createdBy", "name").sort({ createdAt: -1 })
    res.json(notices)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get all notices (admin)
router.get("/all", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const notices = await Notice.find().populate("createdBy", "name").sort({ createdAt: -1 })
    res.json(notices)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create notice (admin)
router.post("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { title, content, area, category } = req.body
    const notice = new Notice({
      title,
      content,
      area,
      category,
      createdBy: req.userId,
    })
    await notice.save()
    res.status(201).json(notice)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
