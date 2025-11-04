"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, Typography, Box, Chip, CircularProgress, TextField, Button } from "@mui/material"
import { complaintAPI } from "../api/api.js"

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [comment, setComment] = useState("")

  useEffect(() => {
    fetchComplaints()
  }, [])

  const fetchComplaints = async () => {
    try {
      const { data } = await complaintAPI.get()
      setComplaints(data)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch complaints")
    } finally {
      setLoading(false)
    }
  }

  const handleAddComment = async () => {
    if (!comment.trim()) return
    try {
      await complaintAPI.addComment(selectedComplaint._id, { text: comment })
      setComment("")
      fetchComplaints()
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add comment")
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      open: "warning",
      "in-progress": "info",
      resolved: "success",
      closed: "default",
    }
    return colors[status] || "default"
  }

  if (loading) return <CircularProgress />

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>
      <Box>
        <Typography variant="h5" sx={{ mb: 2 }}>
          My Complaints
        </Typography>

        {error && <Typography color="error">{error}</Typography>}

        {complaints.length === 0 ? (
          <Typography>No complaints filed.</Typography>
        ) : (
          <Box sx={{ display: "grid", gap: 2 }}>
            {complaints.map((complaint) => (
              <Card
                key={complaint._id}
                onClick={() => setSelectedComplaint(complaint)}
                sx={{ cursor: "pointer", border: selectedComplaint?._id === complaint._id ? "2px solid blue" : "none" }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="h6">{complaint.title}</Typography>
                    <Chip label={complaint.status} color={getStatusColor(complaint.status)} size="small" />
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    {complaint.category} • {new Date(complaint.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>

      {selectedComplaint && (
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2 }}>
                {selectedComplaint.title}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Status:</strong> {selectedComplaint.status}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Priority:</strong> {selectedComplaint.priority}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedComplaint.description}
              </Typography>

              <Typography variant="h6" sx={{ mb: 1 }}>
                Comments
              </Typography>
              <Box sx={{ mb: 2, maxHeight: 200, overflow: "auto", p: 1, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                {selectedComplaint.comments?.map((c, idx) => (
                  <Box key={idx} sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      {c.author?.name || "Admin"}
                    </Typography>
                    <Typography variant="body2">{c.text}</Typography>
                  </Box>
                ))}
              </Box>

              <TextField
                fullWidth
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                multiline
                rows={2}
                sx={{ mb: 1 }}
              />
              <Button variant="contained" fullWidth onClick={handleAddComment}>
                Add Comment
              </Button>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  )
}
