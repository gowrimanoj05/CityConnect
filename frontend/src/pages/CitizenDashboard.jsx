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
  IconButton,
  Divider,
} from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
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
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, textAlign: "center", fontWeight: 600 }}>
        Citizen Menu
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              sx={{
                borderRadius: 2,
                "&:hover": { bgcolor: "action.hover" },
              }}
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
    </Box>
  )

  return (
    <Box sx={{ display: "flex" }}>
      {/* FIXED APP BAR ABOVE DRAWER */}
      <AppBar
        position="fixed"
        color="primary"
        elevation={3}
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 500 }}>
            City Service Portal — Citizen
          </Typography>
          <Typography sx={{ mr: 2 }}>{user?.name}</Typography>
          <Button color="inherit" variant="outlined" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* MOBILE DRAWER */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: 250,
            boxSizing: "border-box",
            top: 64,
            height: "calc(100% - 64px)",
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* PERMANENT DRAWER (DESKTOP) */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            width: 250,
            boxSizing: "border-box",
            mt: "64px",
            height: "calc(100% - 64px)",
          },
        }}
        open
      >
        {drawer}
      </Drawer>

      {/* MAIN CONTENT */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          ml: { md: "250px" },
          transition: "margin 0.3s ease",
        }}
      >
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
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
        Welcome to City Service Portal
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Use the sidebar to check notices, manage complaints, or chat with our assistant.
      </Typography>
    </Box>
  )
}
