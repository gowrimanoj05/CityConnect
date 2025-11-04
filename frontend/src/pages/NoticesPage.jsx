"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, Typography, Box, Chip, CircularProgress } from "@mui/material"
import { noticeAPI } from "../api/api.js"

export default function NoticesPage() {
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchNotices()
  }, [])

  const fetchNotices = async () => {
    try {
      const { data } = await noticeAPI.get()
      setNotices(data)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch notices")
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <CircularProgress />

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Area Notices
      </Typography>

      {error && <Typography color="error">{error}</Typography>}

      {notices.length === 0 ? (
        <Typography>No notices available.</Typography>
      ) : (
        <Box sx={{ display: "grid", gap: 2 }}>
          {notices.map((notice) => (
            <Card key={notice._id}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="h6">{notice.title}</Typography>
                  <Chip label={notice.category} size="small" />
                </Box>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  By {notice.createdBy?.name} • {new Date(notice.createdAt).toLocaleDateString()}
                </Typography>
                <Typography variant="body1">{notice.content}</Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  )
}
