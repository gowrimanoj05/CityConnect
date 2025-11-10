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

  const getStatusColor = (status) =>
    ({
      open: "warning",
      "in-progress": "info",
      resolved: "success",
      closed: "default",
    })[status] || "default"

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    )

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3, mt: 2 }}>
      <Box>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
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
                sx={{
                  cursor: "pointer",
                  borderRadius: 3,
                  transition: "0.3s",
                  boxShadow: selectedComplaint?._id === complaint._id ? 5 : 1,
                  "&:hover": { boxShadow: 5 },
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="h6" fontWeight={500}>
                      {complaint.title}
                    </Typography>
                    <Chip label={complaint.status} color={getStatusColor(complaint.status)} size="small" />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {complaint.category} • {new Date(complaint.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>

      {selectedComplaint && (
        <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
          <CardContent>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
              {selectedComplaint.title}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Status:</strong> {selectedComplaint.status}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Priority:</strong> {selectedComplaint.priority}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
              {selectedComplaint.description}
            </Typography>

            <Typography variant="h6" sx={{ mb: 1 }}>
              Comments
            </Typography>
            <Box sx={{ mb: 2, maxHeight: 200, overflowY: "auto", p: 2, bgcolor: "#f9f9f9", borderRadius: 2 }}>
              {selectedComplaint.comments?.map((c, idx) => (
                <Box key={idx} sx={{ mb: 1 }}>
                  <Typography variant="body2" fontWeight="bold">
                    {c.author?.name || "Admin"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {c.text}
                  </Typography>
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
              sx={{ mb: 2 }}
            />
            <Button variant="contained" fullWidth onClick={handleAddComment}>
              Add Comment
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}
