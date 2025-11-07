import express from "express"
import jwt from "jsonwebtoken"
import User from "../models/User.js"

const router = express.Router()

const ADMIN_SETUP_CODE = process.env.ADMIN_SETUP_CODE || "ADMIN_SECRET_2024"

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, address, area, phone, adminCode } = req.body

    let user = await User.findOne({ email })
    if (user) {
      return res.status(400).json({ message: "User already exists" })
    }

    let role = "citizen"
    if (adminCode === ADMIN_SETUP_CODE) {
      role = "admin"
    }

    user = new User({ name, email, password, address, area, phone, role })
    await user.save()

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" })

    res.status(201).json({ token, user: { id: user._id, name, email, role } })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" })

    res.json({ token, user: { id: user._id, name: user.name, email, role: user.role } })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
