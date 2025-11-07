"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
} from "@mui/material"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import { authAPI } from "../api/api.js"

const validationSchema = Yup.object({
  name: Yup.string().required("Name required"),
  email: Yup.string().email("Invalid email").required("Email required"),
  password: Yup.string().min(6, "Min 6 characters").required("Password required"),
  area: Yup.string().required("Area required"),
  phone: Yup.string().required("Phone required"),
})

export default function RegisterPage() {
  const navigate = useNavigate()
  const [error, setError] = useState("")
  const [isAdminRegistration, setIsAdminRegistration] = useState(false)

  const handleSubmit = async (values) => {
    try {
      const registrationData = {
        ...values,
        ...(isAdminRegistration && { adminCode: values.adminCode }),
      }
      await authAPI.register(registrationData)
      navigate("/login")
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed")
    }
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" sx={{ mb: 3, textAlign: "center" }}>
            Register
          </Typography>

          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <Formik
            initialValues={{
              name: "",
              email: "",
              password: "",
              area: "",
              phone: "",
              adminCode: "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, values, setFieldValue }) => (
              <Form>
                <Field
                  as={TextField}
                  fullWidth
                  label="Full Name"
                  name="name"
                  margin="normal"
                  error={touched.name && !!errors.name}
                  helperText={<ErrorMessage name="name" />}
                />

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

                <FormControl fullWidth margin="normal">
                  <InputLabel>Area</InputLabel>
                  <Select
                    name="area"
                    value={values.area}
                    onChange={(e) => setFieldValue("area", e.target.value)}
                    label="Area"
                  >
                    <MenuItem value="Downtown">Downtown</MenuItem>
                    <MenuItem value="Midtown">Midtown</MenuItem>
                    <MenuItem value="Uptown">Uptown</MenuItem>
                    <MenuItem value="Suburbs">Suburbs</MenuItem>
                  </Select>
                </FormControl>

                <Field
                  as={TextField}
                  fullWidth
                  label="Phone"
                  name="phone"
                  margin="normal"
                  error={touched.phone && !!errors.phone}
                  helperText={<ErrorMessage name="phone" />}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isAdminRegistration}
                      onChange={(e) => setIsAdminRegistration(e.target.checked)}
                    />
                  }
                  label="Register as Admin"
                  sx={{ mt: 2, mb: 2 }}
                />

                {isAdminRegistration && (
                  <Field
                    as={TextField}
                    fullWidth
                    label="Admin Setup Code"
                    name="adminCode"
                    type="password"
                    margin="normal"
                    error={touched.adminCode && !!errors.adminCode}
                    helperText="Enter the admin setup code provided by the system administrator"
                  />
                )}

                <Button fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} type="submit">
                  Register
                </Button>

                <Typography sx={{ textAlign: "center" }}>
                  Already registered?{" "}
                  <Link href="/login" sx={{ cursor: "pointer" }}>
                    Login here
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
