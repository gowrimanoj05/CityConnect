import axios from "axios"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

export const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
})

// Auth APIs
export const authAPI = {
  register: (data) => axios.post(`${API_BASE}/auth/register`, data),
  login: (data) => axios.post(`${API_BASE}/auth/login`, data),
}

// Notice APIs
export const noticeAPI = {
  get: () => axios.get(`${API_BASE}/notices`, getAuthHeader()),
  getAll: () => axios.get(`${API_BASE}/notices/all`, getAuthHeader()),
  create: (data) => axios.post(`${API_BASE}/notices`, data, getAuthHeader()),
}

// Complaint APIs
export const complaintAPI = {
  get: () => axios.get(`${API_BASE}/complaints`, getAuthHeader()),
  getAll: () => axios.get(`${API_BASE}/complaints/admin/all`, getAuthHeader()),
  create: (data) => axios.post(`${API_BASE}/complaints`, data, getAuthHeader()),
  update: (id, data) => axios.patch(`${API_BASE}/complaints/${id}`, data, getAuthHeader()),
  addComment: (id, data) => axios.post(`${API_BASE}/complaints/${id}/comment`, data, getAuthHeader()),
}

// Chatbot API
export const chatbotAPI = {
  sendMessage: (message) => axios.post(`${API_BASE}/chatbot/message`, { message }, getAuthHeader()),
}
