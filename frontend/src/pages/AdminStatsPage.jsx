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
    } catch {
      console.error("Failed to fetch stats")
    }
  }

  const statCards = [
    { title: "Total Complaints", value: stats.totalComplaints, color: "#1976d2" },
    { title: "Open Complaints", value: stats.openComplaints, color: "#f44336" },
    { title: "Total Notices", value: stats.totalNotices, color: "#4caf50" },
  ]

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Admin Dashboard Overview
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card) => (
          <Grid item xs={12} sm={6} md={4} key={card.title}>
            <Card
              sx={{
                bgcolor: card.color,
                color: "white",
                textAlign: "center",
                py: 2,
                borderRadius: 3,
                boxShadow: 4,
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  {card.title}
                </Typography>
                <Typography variant="h3" fontWeight={600}>
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
            Quick Actions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Use the sidebar to manage complaints, post new notices, and monitor service requests in real-time. Stay
            updated with all ongoing citizen activities and issues for your area.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
