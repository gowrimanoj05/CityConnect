"use client"

import { useState, useContext } from "react"
import { Routes, Route, useNavigate } from "react-router-dom"
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material"
import AuthContext from "../context/AuthContext.jsx"
import NoticesPage from "./NoticesPage.jsx"
import ComplaintsPage from "./ComplaintsPage.jsx"
import CreateComplaintPage from "./CreateComplaintPage.jsx"
import ChatbotPage from "./ChatbotPage.jsx"

export default function CitizenDashboard() {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const menuItems = [
    { label: "Dashboard", path: "/citizen" },
    { label: "Notices", path: "/citizen/notices" },
    { label: "My Complaints", path: "/citizen/complaints" },
    { label: "New Complaint", path: "/citizen/complaint/new" },
    { label: "Chat Support", path: "/citizen/chat" },
  ]

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const drawer = (
    <List>
      {menuItems.map((item) => (
        <ListItem key={item.path} disablePadding>
          <ListItemButton
            onClick={() => {
              navigate(item.path)
              setMobileOpen(false)
            }}
          >
            <ListItemText primary={item.label} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  )

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            City Service Portal - Citizen
          </Typography>
          <Typography sx={{ mr: 2 }}>{user?.name}</Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} sx={{ width: 250 }}>
        {drawer}
      </Drawer>

      <Box sx={{ display: { xs: "none", md: "block" }, width: 250, mt: 8 }}>
        <Drawer variant="permanent" open>
          {drawer}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Container maxWidth="lg">
          <Routes>
            <Route path="" element={<DashboardHome />} />
            <Route path="notices" element={<NoticesPage />} />
            <Route path="complaints" element={<ComplaintsPage />} />
            <Route path="complaint/new" element={<CreateComplaintPage />} />
            <Route path="chat" element={<ChatbotPage />} />
          </Routes>
        </Container>
      </Box>
    </Box>
  )
}

function DashboardHome() {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Welcome to City Service Portal
      </Typography>
      <Typography variant="body1" color="textSecondary">
        Use the sidebar to navigate through notices, complaints, and support services.
      </Typography>
    </Box>
  )
}
