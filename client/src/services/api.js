import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api"
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const assessmentAPI = {
  getConfig: () => API.get("/assessment/config"),
  getPositions: () => API.get("/assessment/positions"),
  getQuestions: (params) => API.get("/assessment/questions", { params }),
  startSession: (data) => API.post("/assessment/start", data),
  submitAnswers: (data) => API.post("/assessment/submit", data)
};

export const adminAPI = {
  login: (data) => API.post("/admin/login", data),
  getMe: () => API.get("/admin/me"),
  getStats: () => API.get("/admin/stats"),
  getSubmissions: (params) => API.get("/admin/submissions", { params }),
  getSubmission: (id) => API.get(`/admin/submissions/${id}`),
  deleteSubmission: (id) => API.delete(`/admin/submissions/${id}`),
  getSettings: () => API.get("/admin/settings"),
  updateSettings: (data) => API.put("/admin/settings", data)
};

export const questionsAPI = {
  getAll: (params) => API.get("/questions", { params }),
  getPositions: () => API.get("/questions/positions"),
  create: (data) => API.post("/questions", data),
  update: (id, data) => API.put(`/questions/${id}`, data),
  remove: (id) => API.delete(`/questions/${id}`)
};
