import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { assessmentAPI } from "../services/api";
import toast from "react-hot-toast";
import { ClipboardList, Clock, Shield, Users } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", position: "", experience: "" });
  const [loading, setLoading] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(30);

  useEffect(() => {
    assessmentAPI.getConfig()
      .then(res => setTimerMinutes(res.data.timerMinutes))
      .catch(() => {});
  }, []);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleStart = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.position) {
      return toast.error("Please fill all required fields");
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Shield size={16} /> Secure Hiring Assessment
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Hiring Assessment Portal</h1>
          <p className="text-gray-500 text-lg">Complete the assessment to move forward in the selection process</p>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: <ClipboardList size={20} />, label: "20 Questions", sub: "4 Sections" },
            { icon: <Clock size={20} />, label: `${timerMinutes} Minutes`, sub: "Timed Assessment" },
            { icon: <Users size={20} />, label: "MCQ Format", sub: "Single Best Answer" }
          ].map((item, i) => (
            <div key={i} className="card text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 rounded-xl mb-2">
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX" className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position Applied For *</label>
                <input name="position" value={form.position} onChange={handleChange} placeholder="e.g. Restaurant Manager" className="input-field" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
              <select name="experience" value={form.experience} onChange={handleChange} className="input-field">
                <option value="">Select experience</option>
                <option value="0-1">0-1 years (Fresher)</option>
                <option value="1-3">1-3 years</option>
                <option value="3-5">3-5 years</option>
                <option value="5-10">5-10 years</option>
                <option value="10+">10+ years</option>
              </select>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
              <strong>Instructions:</strong> You have {timerMinutes} minutes to complete 20 questions. Each question has one correct answer. You can navigate between questions but must submit before time runs out.
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full text-base">
              {loading ? "Starting..." : "Start Assessment →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
