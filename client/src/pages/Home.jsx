import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { assessmentAPI } from "../services/api";
import toast from "react-hot-toast";
import { ClipboardList, Clock, CheckCircle } from "lucide-react";
import RedBeanLogo from "../components/common/RedBeanLogo";
import { io } from "socket.io-client";

const SOCKET_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace("/api", "");

export default function Home() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(30);

  useEffect(() => {
    assessmentAPI.getConfig()
      .then(res => setTimerMinutes(res.data.timerMinutes))
      .catch(() => {});

    const socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });
    socket.on("timer-updated", (data) => setTimerMinutes(data.timerMinutes));
    return () => socket.disconnect();
  }, []);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleStart = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email || !form.phone.trim()) {
      return toast.error("Please fill all fields");
    }
    setLoading(true);
    try {
      const res = await assessmentAPI.startSession(form);
      const { sessionId } = res.data;
      sessionStorage.setItem("assessmentSession", JSON.stringify({ sessionId, candidate: form, timerMinutes }));
      navigate("/assessment");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to start. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-red-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-5">
            <RedBeanLogo size="lg" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Hiring Assessment Portal</h1>
          <p className="text-gray-500 text-lg">Complete the assessment to move forward in the selection process</p>
          <div className="w-16 h-1 bg-brand-700 rounded-full mx-auto mt-4" />
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: <ClipboardList size={20} />, label: "4 Sections", sub: "MCQ Format" },
            { icon: <Clock size={20} />, label: `${timerMinutes} Minutes`, sub: "Timed Assessment" },
            { icon: <CheckCircle size={20} />, label: "Role-Based", sub: "Tailored Questions" }
          ].map((item, i) => (
            <div key={i} className="card text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-brand-50 text-brand-700 rounded-xl mb-2">
                {item.icon}
              </div>
              <div className="font-semibold text-gray-900">{item.label}</div>
              <div className="text-sm text-gray-500">{item.sub}</div>
            </div>
          ))}
        </div>

        {/* Registration Form */}
        <div className="card max-w-xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Candidate Information</h2>
          <form onSubmit={handleStart} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@email.com" className="input-field" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX" className="input-field" required />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
              <strong>Note:</strong> You have {timerMinutes} minutes to complete the assessment. Questions are tailored to your selected position and experience. Each question has one correct answer.
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full text-base">
              {loading ? "Starting..." : "Start Assessment →"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">© Red Bean Hospitality · Food for Happiness</p>
      </div>
    </div>
  );
}
