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
import AdminComplaintsPage from "./AdminComplaintsPage.jsx"
import AdminNoticesPage from "./AdminNoticesPage.jsx"
import CreateNoticePage from "./CreateNoticePage.jsx"
import AdminStatsPage from "./AdminStatsPage.jsx"

export default function AdminDashboard() {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const menuItems = [
    { label: "Dashboard", path: "/admin" },
    { label: "Manage Complaints", path: "/admin/complaints" },
    { label: "Manage Notices", path: "/admin/notices" },
    { label: "Post Notice", path: "/admin/notice/new" },
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
            City Service Portal - Admin
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
            <Route path="" element={<AdminStatsPage />} />
            <Route path="complaints" element={<AdminComplaintsPage />} />
            <Route path="notices" element={<AdminNoticesPage />} />
            <Route path="notice/new" element={<CreateNoticePage />} />
          </Routes>
        </Container>
      </Box>
    </Box>
  )
}
