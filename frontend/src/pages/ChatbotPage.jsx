"use client"

import { useState, useRef, useEffect } from "react"
import { Paper, TextField, Button, Typography, Box, CircularProgress, Chip, Card, CardContent } from "@mui/material"
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
    <Box sx={{ maxWidth: 700, mx: "auto", height: "90vh", display: "flex", flexDirection: "column" }}>
      <Box sx={{ p: 2, bgcolor: "#f5f5f5", borderBottom: "1px solid #ddd" }}>
        <Typography variant="h6">City Service Assistant</Typography>
        <Typography variant="caption" color="textSecondary">
          Describe your issue and I'll provide solutions or create a formal complaint
        </Typography>
      </Box>

      <Paper sx={{ flex: 1, p: 2, mb: 2, overflow: "auto", bgcolor: "#fafafa" }}>
        {messages.length === 0 && (
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Typography variant="h6" color="textSecondary">
              👋 Welcome to City Service Assistant
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              Describe any city service issue you're facing. I can:
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Chip label="✓ Provide solutions for common issues" sx={{ m: 0.5 }} />
              <Chip label="✓ Auto-file formal complaints" sx={{ m: 0.5 }} />
              <Chip label="✓ Track your location for service" sx={{ m: 0.5 }} />
            </Box>
          </Box>
        )}
        {messages.map((msg, idx) => (
          <Box
            key={idx}
            sx={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              mb: 2,
            }}
          >
            <Box sx={{ maxWidth: "80%" }}>
              {/* User message */}
              {msg.role === "user" && (
                <Paper
                  sx={{
                    p: 1.5,
                    bgcolor: "#1976d2",
                    color: "white",
                  }}
                >
                  <Typography variant="body2">{msg.text}</Typography>
                </Paper>
              )}

              {/* Bot message with metadata */}
              {msg.role === "bot" && (
                <Box>
                  <Paper
                    sx={{
                      p: 1.5,
                      bgcolor: "#e0e0e0",
                      color: "black",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                      {msg.text}
                    </Typography>
                  </Paper>

                  {msg.autoComplaintCreated && (
                    <Card sx={{ bgcolor: "#e8f5e9", borderLeft: "4px solid #4caf50" }}>
                      <CardContent>
                        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                          <CheckCircleIcon sx={{ color: "#4caf50", mr: 1 }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                            Complaint Auto-Filed
                          </Typography>
                        </Box>
                        <Typography variant="caption">
                          Category: <strong>{msg.category}</strong>
                        </Typography>
                        <br />
                        <Typography variant="caption">
                          Priority:{" "}
                          <Chip
                            label={msg.priority}
                            size="small"
                            color={
                              msg.priority === "high" ? "error" : msg.priority === "medium" ? "warning" : "default"
                            }
                            sx={{ ml: 0.5 }}
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
                          <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                            Try These Steps First
                          </Typography>
                        </Box>
                        <Typography variant="caption">
                          Category: <strong>{msg.category}</strong>
                        </Typography>
                      </CardContent>
                    </Card>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        ))}
        {loading && <CircularProgress size={24} />}
        <div ref={messagesEndRef} />
      </Paper>

      <Box sx={{ display: "flex", gap: 1 }}>
        <TextField
          fullWidth
          placeholder="Describe your issue (e.g., 'Water leak in apartment', 'Power outage on my street')..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          disabled={loading}
          multiline
          maxRows={3}
        />
        <Button variant="contained" onClick={handleSendMessage} disabled={loading} endIcon={<SendIcon />}>
          Send
        </Button>
      </Box>
    </Box>
  )
}
