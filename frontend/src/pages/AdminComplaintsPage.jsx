"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  TextField,
  Divider,
} from "@mui/material"
import { complaintAPI } from "../api/api.js"

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [comment, setComment] = useState("")
  const [filterStatus, setFilterStatus] = useState("")

  useEffect(() => {
    fetchComplaints()
  }, [])

  const fetchComplaints = async () => {
    try {
      const { data } = await complaintAPI.getAll()
      setComplaints(data)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch complaints")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (complaintId, newStatus) => {
    try {
      await complaintAPI.update(complaintId, { status: newStatus })
      fetchComplaints()
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update complaint")
    }
  }

  const handleAddComment = async () => {
    if (!comment.trim()) return
    try {
      await complaintAPI.addComment(selectedComplaint._id, { text: comment })
      setComment("")
      fetchComplaints()
      setSelectedComplaint(null)
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

  const filteredComplaints = filterStatus ? complaints.filter((c) => c.status === filterStatus) : complaints

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}><CircularProgress /></Box>

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3, mt: 2 }}>
      <Box>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
          All Complaints
        </Typography>

        <FormControl sx={{ mb: 2, minWidth: 200 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} label="Filter by Status">
            <MenuItem value="">All</MenuItem>
            <MenuItem value="open">Open</MenuItem>
            <MenuItem value="in-progress">In Progress</MenuItem>
            <MenuItem value="resolved">Resolved</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
          </Select>
        </FormControl>

        {error && <Typography color="error" sx={{ mb: 1 }}>{error}</Typography>}

        <Box sx={{ display: "grid", gap: 2 }}>
          {filteredComplaints.map((complaint) => (
            <Card
              key={complaint._id}
              onClick={() => setSelectedComplaint(complaint)}
              sx={{
                cursor: "pointer",
                transition: "0.3s",
                boxShadow: selectedComplaint?._id === complaint._id ? 5 : 1,
                "&:hover": { boxShadow: 5 },
                borderRadius: 2,
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="h6" fontWeight={500}>{complaint.title}</Typography>
                  <Chip label={complaint.status} color={getStatusColor(complaint.status)} size="small" />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  From <b>{complaint.userId?.name}</b> • {complaint.userId?.area}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {selectedComplaint && (
        <Box>
          <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                {selectedComplaint.title}
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2"><strong>Citizen:</strong> {selectedComplaint.userId?.name}</Typography>
                <Typography variant="body2"><strong>Email:</strong> {selectedComplaint.userId?.email}</Typography>
                <Typography variant="body2"><strong>Area:</strong> {selectedComplaint.userId?.area}</Typography>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                {selectedComplaint.description}
              </Typography>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={selectedComplaint.status}
                  onChange={(e) => handleStatusChange(selectedComplaint._id, e.target.value)}
                  label="Status"
                >
                  <MenuItem value="open">Open</MenuItem>
                  <MenuItem value="in-progress">In Progress</MenuItem>
                  <MenuItem value="resolved">Resolved</MenuItem>
                  <MenuItem value="closed">Closed</MenuItem>
                </Select>
              </FormControl>

              <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
                Comments
              </Typography>
              <Box sx={{ mb: 2, maxHeight: 200, overflow: "auto", p: 2, bgcolor: "#f9f9f9", borderRadius: 2 }}>
                {selectedComplaint.comments?.map((c, idx) => (
                  <Box key={idx} sx={{ mb: 1 }}>
                    <Typography variant="body2" fontWeight="bold">
                      {c.author?.name || "Admin"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">{c.text}</Typography>
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
        </Box>
      )}
    </Box>
  )
}
