import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { assessmentAPI } from "../services/api";
import toast from "react-hot-toast";
import {
  ClipboardList, Clock, CheckCircle, Shield, ChevronRight,
  User, Mail, Phone, AlertCircle, BookOpen, Brain, Heart, Zap
} from "lucide-react";
import RedBeanLogo from "../components/common/RedBeanLogo";
import { io } from "socket.io-client";

const SOCKET_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace("/api", "");

const SECTIONS = [
  { icon: <Brain size={14} />, code: "A", label: "Logical & IQ Assessment" },
  { icon: <Zap size={14} />, code: "B", label: "Decision Making" },
  { icon: <Heart size={14} />, code: "C", label: "Integrity" },
  { icon: <BookOpen size={14} />, code: "D", label: "Stress & Work Style" },
];

export default function Home() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(30);
  const [timerEnabled, setTimerEnabled] = useState(true);

  useEffect(() => {
    assessmentAPI.getConfig()
      .then(res => {
        setTimerMinutes(res.data.timerMinutes);
        setTimerEnabled(res.data.timerEnabled !== false);
      })
      .catch(() => {});

    const socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });
    socket.on("timer-updated", (data) => {
      setTimerMinutes(data.timerMinutes);
      if (data.timerEnabled !== undefined) setTimerEnabled(data.timerEnabled !== false);
    });
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
      sessionStorage.setItem("assessmentSession", JSON.stringify({ sessionId, candidate: form, timerMinutes, timerEnabled }));
      navigate("/assessment");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to start. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ── Left brand panel ── */}
      <div className="hidden lg:flex lg:w-[42%] bg-gradient-to-br from-gray-950 via-gray-900 to-brand-900 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-brand-700/10 pointer-events-none" />
        <div className="absolute -bottom-40 -right-20 w-[28rem] h-[28rem] rounded-full bg-brand-500/10 pointer-events-none" />
        <div className="absolute top-1/3 right-0 w-64 h-64 rounded-full bg-white/[0.015] pointer-events-none" />

        <div className="relative z-10">
          <RedBeanLogo size="lg" />
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-brand-700/20 border border-brand-500/30 text-brand-300 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <Shield size={12} /> Candidate Assessment Portal
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Hiring<br />Assessment Portal
          </h1>
          <p className="text-gray-400 text-sm mb-10 leading-relaxed">
            A structured evaluation to help us understand your aptitude, decision-making ability, and professional work style.
          </p>

          {/* Assessment stats */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { value: "40", label: "Questions", color: "text-brand-400" },
              { value: timerEnabled ? `${timerMinutes}m` : "Open", label: timerEnabled ? "Time Limit" : "No Limit", color: "text-amber-400" },
              { value: "4", label: "Sections", color: "text-blue-400" },
            ].map((s, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
                <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-gray-500 text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Sections list */}
          <div className="space-y-2.5">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Assessment Sections</div>
            {SECTIONS.map((s) => (
              <div key={s.code} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-brand-400 shrink-0 text-xs">
                  {s.icon}
                </div>
                <div>
                  <span className="text-white/80 text-xs font-medium">Section {s.code}</span>
                  <span className="text-gray-600 text-xs"> · {s.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <div className="h-px bg-white/10 mb-5" />
          <p className="text-gray-600 text-xs">© 2026 Red Bean Hospitality · Food for Happiness</p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <RedBeanLogo size="lg" />
          </div>

          {/* Mobile info pills */}
          <div className="lg:hidden flex gap-2 justify-center mb-6 flex-wrap">
            {[
              { icon: <ClipboardList size={13} />, text: "4 Sections" },
              { icon: <Clock size={13} />, text: timerEnabled ? `${timerMinutes} Min` : "No Limit" },
              { icon: <CheckCircle size={13} />, text: "40 Questions" },
            ].map((pill, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm">
                <span className="text-brand-700">{pill.icon}</span>
                {pill.text}
              </div>
            ))}
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.08)] border border-gray-100 p-8">
            <div className="mb-7">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-600 to-brand-800 rounded-xl flex items-center justify-center mb-5 shadow-sm">
                <ClipboardList size={20} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Begin Your Assessment</h2>
              <p className="text-gray-500 text-sm">Enter your details to start the evaluation process</p>
            </div>

            <form onSubmit={handleStart} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name *</label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className="input-field pl-10 text-sm"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address *</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@email.com"
                    className="input-field pl-10 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number *</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+91 XXXXX XXXXX"
                    className="input-field pl-10 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex gap-2.5">
                <AlertCircle size={15} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed">
                  {timerEnabled
                    ? `You have ${timerMinutes} minutes to complete all 40 questions. Once started, you cannot leave without submitting.`
                    : "Complete all 40 questions at your own pace. Once started, you cannot leave without submitting."
                  }
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 text-sm font-semibold flex items-center justify-center gap-2 mt-1"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Starting Assessment...
                  </>
                ) : (
                  <>
                    Start Assessment
                    <ChevronRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">Your results will be reviewed by our HR team within 2–3 business days</p>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">© Red Bean Hospitality · Food for Happiness</p>
        </div>
      </div>
    </div>
  );
}
