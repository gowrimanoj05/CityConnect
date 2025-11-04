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
} from "@mui/material"
import { noticeAPI } from "../api/api.js"

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filterCategory, setFilterCategory] = useState("")

  useEffect(() => {
    fetchNotices()
  }, [])

  const fetchNotices = async () => {
    try {
      const { data } = await noticeAPI.getAll()
      setNotices(data)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch notices")
    } finally {
      setLoading(false)
    }
  }

  const filteredNotices = filterCategory ? notices.filter((n) => n.category === filterCategory) : notices

  if (loading) return <CircularProgress />

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        All Notices
      </Typography>

      <FormControl sx={{ mb: 2, minWidth: 200 }}>
        <InputLabel>Filter by Category</InputLabel>
        <Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} label="Filter by Category">
          <MenuItem value="">All</MenuItem>
          <MenuItem value="maintenance">Maintenance</MenuItem>
          <MenuItem value="alert">Alert</MenuItem>
          <MenuItem value="announcement">Announcement</MenuItem>
          <MenuItem value="event">Event</MenuItem>
        </Select>
      </FormControl>

      {error && <Typography color="error">{error}</Typography>}

      <Box sx={{ display: "grid", gap: 2 }}>
        {filteredNotices.map((notice) => (
          <Card key={notice._id}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="h6">{notice.title}</Typography>
                <Chip label={notice.category} size="small" />
              </Box>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                Area: {notice.area} • By {notice.createdBy?.name} • {new Date(notice.createdAt).toLocaleDateString()}
              </Typography>
              <Typography variant="body1">{notice.content}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  )
}
