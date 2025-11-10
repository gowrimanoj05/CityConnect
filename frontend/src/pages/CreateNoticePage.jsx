"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Paper, TextField, Button, Typography, Box, Select, MenuItem, FormControl, InputLabel } from "@mui/material"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import { noticeAPI } from "../api/api.js"

const validationSchema = Yup.object({
  title: Yup.string().required("Title required"),
  content: Yup.string().required("Content required"),
  area: Yup.string().required("Area required"),
  category: Yup.string().required("Category required"),
})

export default function CreateNoticePage() {
  const navigate = useNavigate()
  const [error, setError] = useState("")

  const handleSubmit = async (values) => {
    try {
      await noticeAPI.create(values)
      navigate("/admin/notices")
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create notice")
    }
  }

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 4 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          Post a New Notice
        </Typography>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Formik
          initialValues={{
            title: "",
            content: "",
            area: "Downtown",
            category: "announcement",
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
                label="Content"
                name="content"
                multiline
                rows={4}
                margin="normal"
                error={touched.content && !!errors.content}
                helperText={<ErrorMessage name="content" />}
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

              <FormControl fullWidth margin="normal">
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={values.category}
                  onChange={(e) => setFieldValue("category", e.target.value)}
                  label="Category"
                >
                  <MenuItem value="maintenance">Maintenance</MenuItem>
                  <MenuItem value="alert">Alert</MenuItem>
                  <MenuItem value="announcement">Announcement</MenuItem>
                  <MenuItem value="event">Event</MenuItem>
                </Select>
              </FormControl>

              <Button fullWidth variant="contained" sx={{ mt: 3 }} type="submit">
                Post Notice
              </Button>
            </Form>
          )}
        </Formik>
      </Paper>
    </Box>
  )
}
