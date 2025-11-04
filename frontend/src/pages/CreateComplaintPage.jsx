"use client"

import { useState, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { Paper, TextField, Button, Typography, Box, Select, MenuItem, FormControl, InputLabel } from "@mui/material"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import AuthContext from "../context/AuthContext.jsx"
import { complaintAPI } from "../api/api.js"

const validationSchema = Yup.object({
  title: Yup.string().required("Title required"),
  description: Yup.string().required("Description required"),
  category: Yup.string().required("Category required"),
  priority: Yup.string().required("Priority required"),
})

export default function CreateComplaintPage() {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [error, setError] = useState("")

  const handleSubmit = async (values) => {
    try {
      await complaintAPI.create(values)
      navigate("/citizen/complaints")
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create complaint")
    }
  }

  return (
    <Box sx={{ maxWidth: 600, mx: "auto" }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          File a New Complaint
        </Typography>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Formik
          initialValues={{
            title: "",
            description: "",
            category: "other",
            priority: "medium",
            area: user?.area || "",
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, values, setFieldValue }) => (
            <Form>
              <Field
                as={TextField}
                fullWidth
                label="Title"
                name="title"
                margin="normal"
                error={touched.title && !!errors.title}
                helperText={<ErrorMessage name="title" />}
              />

              <Field
                as={TextField}
                fullWidth
                label="Description"
                name="description"
                multiline
                rows={4}
                margin="normal"
                error={touched.description && !!errors.description}
                helperText={<ErrorMessage name="description" />}
              />

              <FormControl fullWidth margin="normal">
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={values.category}
                  onChange={(e) => setFieldValue("category", e.target.value)}
                  label="Category"
                >
                  <MenuItem value="water">Water Supply</MenuItem>
                  <MenuItem value="electricity">Electricity</MenuItem>
                  <MenuItem value="road">Road & Infrastructure</MenuItem>
                  <MenuItem value="sanitation">Sanitation</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal">
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={values.priority}
                  onChange={(e) => setFieldValue("priority", e.target.value)}
                  label="Priority"
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>

              <TextField fullWidth label="Area" value={values.area} disabled margin="normal" />

              <Button fullWidth variant="contained" sx={{ mt: 3 }} type="submit">
                Submit Complaint
              </Button>
            </Form>
          )}
        </Formik>
      </Paper>
    </Box>
  )
}
