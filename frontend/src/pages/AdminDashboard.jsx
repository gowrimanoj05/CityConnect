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
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, textAlign: "center", fontWeight: 600 }}>
        Admin Menu
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
            City Service Portal — Admin
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
