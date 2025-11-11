"use client"

import { useState, useRef, useEffect } from "react"
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Chip,
  Card,
  CardContent,
} from "@mui/material"
import SendIcon from "@mui/icons-material/Send"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import WarningIcon from "@mui/icons-material/Warning"
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
          autoComplaintCreated: data.autoComplaintCreated,
          isSolvable: data.isSolvable,
          priority: data.priority,
          category: data.intent,
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Sorry, I encountered an error. Please try again." },
      ])
    } finally {
      setLoading(false)
    }
  }

  // ✅ Color logic for chip and card
  const getPriorityStyle = (priority) => {
    switch (priority?.toLowerCase()) {
      case "emergency":
        return {
          chip: { backgroundColor: "#d32f2f", color: "white" },
          card: { bgcolor: "#ffebee", borderLeft: "5px solid #d32f2f" },
          icon: "#d32f2f",
        }
      case "high":
        return {
          chip: { backgroundColor: "#f57c00", color: "white" },
          card: { bgcolor: "#fff3e0", borderLeft: "5px solid #f57c00" },
          icon: "#f57c00",
        }
      case "medium":
        return {
          chip: { backgroundColor: "#fbc02d", color: "black" },
          card: { bgcolor: "#fffde7", borderLeft: "5px solid #fbc02d" },
          icon: "#fbc02d",
        }
      case "low":
        return {
          chip: { backgroundColor: "#388e3c", color: "white" },
          card: { bgcolor: "#e8f5e9", borderLeft: "5px solid #388e3c" },
          icon: "#388e3c",
        }
      default:
        return {
          chip: { backgroundColor: "#9e9e9e", color: "white" },
          card: { bgcolor: "#f5f5f5", borderLeft: "5px solid #9e9e9e" },
          icon: "#9e9e9e",
        }
    }
  }

  return (
    <Box
      sx={{
        maxWidth: 700,
        mx: "auto",
        height: "90vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ p: 2, bgcolor: "#1976d2", color: "white", borderRadius: "8px 8px 0 0" }}>
        <Typography variant="h6">City Service Assistant</Typography>
        <Typography variant="caption">
          Describe your issue — I'll suggest fixes or create a complaint automatically.
        </Typography>
      </Box>

      <Paper
        sx={{
          flex: 1,
          p: 2,
          mb: 2,
          overflowY: "auto",
          bgcolor: "#fafafa",
          borderRadius: "0 0 8px 8px",
        }}
        elevation={2}
      >
        {messages.length === 0 ? (
          <Box sx={{ textAlign: "center", mt: 5 }}>
            <Typography variant="h6" color="textSecondary">
              👋 Welcome to City Service Assistant
            </Typography>
            <Typography variant="body2" sx={{ mt: 2 }}>
              I can guide you or file complaints automatically for your city service issues.
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Chip label="✓ Suggest fixes" sx={{ m: 0.5 }} />
              <Chip label="✓ Auto-file complaints" sx={{ m: 0.5 }} />
              <Chip label="✓ Location-aware" sx={{ m: 0.5 }} />
            </Box>
          </Box>
        ) : (
          messages.map((msg, idx) => (
            <Box
              key={idx}
              sx={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                mb: 2,
              }}
            >
              <Box sx={{ maxWidth: "80%" }}>
                {msg.role === "user" && (
                  <Paper sx={{ p: 1.5, bgcolor: "#1976d2", color: "white", borderRadius: 2 }}>
                    <Typography variant="body2">{msg.text}</Typography>
                  </Paper>
                )}

                {msg.role === "bot" && (
                  <Box>
                    <Paper sx={{ p: 1.5, bgcolor: "#e0e0e0", mb: 1, borderRadius: 2 }}>
                      <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                        {msg.text}
                      </Typography>
                    </Paper>

                    {msg.autoComplaintCreated && (
                      <Card sx={getPriorityStyle(msg.priority).card}>
                        <CardContent>
                          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                            <CheckCircleIcon
                              sx={{ color: getPriorityStyle(msg.priority).icon, mr: 1 }}
                            />
                            <Typography fontWeight="bold">Complaint Auto-Filed</Typography>
                          </Box>
                          <Typography variant="caption">
                            Category: <b>{msg.category}</b>
                          </Typography>
                          <br />
                          <Typography variant="caption">
                            Priority:{" "}
                            <Chip
                              label={msg.priority}
                              size="small"
                              sx={getPriorityStyle(msg.priority).chip}
                            />
                          </Typography>
                        </CardContent>
                      </Card>
                    )}

                    {msg.isSolvable && !msg.autoComplaintCreated && (
                      <Card sx={{ bgcolor: "#fff3e0", borderLeft: "5px solid #ff9800" }}>
                        <CardContent>
                          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                            <WarningIcon sx={{ color: "#ff9800", mr: 1 }} />
                            <Typography fontWeight="bold">Try These Steps First</Typography>
                          </Box>
                          <Typography variant="caption">
                            Category: <b>{msg.category}</b>
                          </Typography>
                        </CardContent>
                      </Card>
                    )}
                  </Box>
                )}
              </Box>
            </Box>
          ))
        )}
        {loading && (
          <Box sx={{ textAlign: "center", mt: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Paper>

      <Box sx={{ display: "flex", gap: 1 }}>
        <TextField
          fullWidth
          placeholder="Describe your issue..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          disabled={loading}
          multiline
          maxRows={3}
        />
        <Button
          variant="contained"
          onClick={handleSendMessage}
          disabled={loading}
          endIcon={<SendIcon />}
        >
          Send
        </Button>
      </Box>
    </Box>
  )
}
