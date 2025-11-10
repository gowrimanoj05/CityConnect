"use client"

import { useState, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { Container, Paper, TextField, Button, Typography, Box, Link } from "@mui/material"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import AuthContext from "../context/AuthContext.jsx"
import { authAPI } from "../api/api.js"

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email required"),
  password: Yup.string().min(6, "Min 6 characters").required("Password required"),
})

export default function LoginPage() {
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()
  const [error, setError] = useState("")

  const handleSubmit = async (values) => {
    try {
      const { data } = await authAPI.login(values)
      login(data.token, data.user)
      navigate(data.user.role === "admin" ? "/admin" : "/citizen")
    } catch (err) {
      setError(err.response?.data?.message || "Login failed")
    }
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 4 }}>
          <Typography variant="h4" component="h1" sx={{ mb: 3, textAlign: "center", fontWeight: 600 }}>
            City Service Portal
          </Typography>

          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched }) => (
              <Form>
                <Field
                  as={TextField}
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  margin="normal"
                  error={touched.email && !!errors.email}
                  helperText={<ErrorMessage name="email" />}
                />

                <Field
                  as={TextField}
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  margin="normal"
                  error={touched.password && !!errors.password}
                  helperText={<ErrorMessage name="password" />}
                />

                <Button fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} type="submit">
                  Login
                </Button>

                <Typography sx={{ textAlign: "center" }}>
                  New user?{" "}
                  <Link href="/register" sx={{ cursor: "pointer" }}>
                    Register here
                  </Link>
                </Typography>
              </Form>
            )}
          </Formik>
        </Paper>
      </Box>
    </Container>
  )
}
