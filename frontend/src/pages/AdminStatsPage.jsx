"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, Grid, Typography, Box } from "@mui/material"
import { complaintAPI, noticeAPI } from "../api/api.js"

export default function AdminStatsPage() {
  const [stats, setStats] = useState({
    totalComplaints: 0,
    openComplaints: 0,
    totalNotices: 0,
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const complaintsRes = await complaintAPI.getAll()
      const noticesRes = await noticeAPI.getAll()

      setStats({
        totalComplaints: complaintsRes.data.length,
        openComplaints: complaintsRes.data.filter((c) => c.status === "open").length,
        totalNotices: noticesRes.data.length,
      })
    } catch (error) {
      console.error("Failed to fetch stats")
    }
  }

  const statCards = [
    { title: "Total Complaints", value: stats.totalComplaints, color: "#ff9800" },
    { title: "Open Complaints", value: stats.openComplaints, color: "#f44336" },
    { title: "Total Notices", value: stats.totalNotices, color: "#2196f3" },
  ]

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Admin Dashboard
      </Typography>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {statCards.map((card) => (
          <Grid item xs={12} sm={6} md={4} key={card.title}>
            <Card sx={{ bgcolor: card.color, color: "white" }}>
              <CardContent>
                <Typography variant="h6">{card.title}</Typography>
                <Typography variant="h3">{card.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Quick Actions
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Use the sidebar to manage complaints, post notices, and monitor service requests.
          </Typography>
          <Typography variant="body2">
            All citizen complaints are tracked with status updates for better transparency.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
