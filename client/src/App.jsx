import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Home from "./pages/Home";
import Assessment from "./pages/Assessment";
import Complete from "./pages/Complete";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import SubmissionView from "./pages/admin/SubmissionView";
import QuestionManager from "./pages/admin/QuestionManager";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000/api");

export default function App() {
  useEffect(() => {
    // Ping the server every 10 minutes to prevent Render free tier from spinning down
    const ping = () => fetch(`${API_BASE}/health`).catch(() => {});
    ping(); // immediate ping on app load
    const interval = setInterval(ping, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/complete" element={<Complete />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/submissions/:id" element={<ProtectedRoute><SubmissionView /></ProtectedRoute>} />
          <Route path="/admin/questions" element={<ProtectedRoute><QuestionManager /></ProtectedRoute>} />
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
