"use client"

import { useState, useRef, useEffect } from "react"
import { Paper, TextField, Button, Typography, Box, CircularProgress } from "@mui/material"
import SendIcon from "@mui/icons-material/Send"
import { chatbotAPI } from "../api/api.js"

export default function ChatbotPage() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage = input
    setInput("")
    setMessages((prev) => [...prev, { role: "user", text: userMessage }])
    setLoading(true)

    try {
      const { data } = await chatbotAPI.sendMessage(userMessage)
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: data.response,
          complaintCreated: data.complaintCreated,
        },
      ])
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Sorry, I encountered an error. Please try again.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", height: "80vh", display: "flex", flexDirection: "column" }}>
      <Paper sx={{ flex: 1, p: 2, mb: 2, overflow: "auto" }}>
        {messages.map((msg, idx) => (
          <Box
            key={idx}
            sx={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              mb: 2,
            }}
          >
            <Paper
              sx={{
                p: 1.5,
                maxWidth: "70%",
                bgcolor: msg.role === "user" ? "#1976d2" : "#e0e0e0",
                color: msg.role === "user" ? "white" : "black",
              }}
            >
              <Typography variant="body2">{msg.text}</Typography>
              {msg.complaintCreated && (
                <Typography variant="caption" sx={{ display: "block", mt: 1 }}>
                  Complaint created successfully!
                </Typography>
              )}
            </Paper>
          </Box>
        ))}
        {loading && <CircularProgress size={24} />}
        <div ref={messagesEndRef} />
      </Paper>

      <Box sx={{ display: "flex", gap: 1 }}>
        <TextField
          fullWidth
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          disabled={loading}
        />
        <Button variant="contained" onClick={handleSendMessage} disabled={loading} endIcon={<SendIcon />}>
          Send
        </Button>
      </Box>
    </Box>
  )
}
