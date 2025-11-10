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
                      <Card sx={{ bgcolor: "#e8f5e9", borderLeft: "4px solid #4caf50" }}>
                        <CardContent>
                          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                            <CheckCircleIcon sx={{ color: "#4caf50", mr: 1 }} />
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
                              color={
                                msg.priority === "high"
                                  ? "error"
                                  : msg.priority === "medium"
                                  ? "warning"
                                  : "default"
                              }
                            />
                          </Typography>
                        </CardContent>
                      </Card>
                    )}

                    {msg.isSolvable && !msg.autoComplaintCreated && (
                      <Card sx={{ bgcolor: "#fff3e0", borderLeft: "4px solid #ff9800" }}>
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
