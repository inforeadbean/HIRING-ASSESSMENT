import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { Lock, Eye, EyeOff, Users, BarChart3, FileQuestion, Shield } from "lucide-react";
import RedBeanLogo from "../../components/common/RedBeanLogo";

const FEATURES = [
  { icon: <Users size={16} />, text: "Real-time submission tracking" },
  { icon: <BarChart3 size={16} />, text: "Performance analytics & grade reports" },
  { icon: <FileQuestion size={16} />, text: "Dynamic question management" },
  { icon: <Shield size={16} />, text: "Secure role-based access control" }
];

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate("/admin/dashboard");
    } catch {
      toast.error("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left brand panel (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-gray-950 via-gray-900 to-brand-900 flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-brand-700/10 pointer-events-none" />
        <div className="absolute -bottom-40 -right-20 w-[28rem] h-[28rem] rounded-full bg-brand-500/10 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-white/[0.02] pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10">
          <RedBeanLogo size="lg" />
        </div>

        {/* Headline + features */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-brand-700/20 border border-brand-500/30 text-brand-300 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <Shield size={12} /> HR Management System
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-3">
            Hiring Assessment<br />Admin Portal
          </h1>
          <p className="text-gray-400 text-base mb-10 leading-relaxed">
            Streamline your recruitment with intelligent assessments, real-time analytics, and automated candidate scoring.
          </p>

          <div className="space-y-3">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-brand-400 shrink-0">
                  {f.icon}
                </div>
                <span className="text-gray-300 text-sm">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <div className="h-px bg-white/10 mb-5" />
          <p className="text-gray-600 text-xs">© 2026 Red Bean Hospitality · Food for Happiness</p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-6 sm:mb-8">
            <RedBeanLogo size="lg" />
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.08)] border border-gray-100 p-5 sm:p-8">
            {/* Header */}
            <div className="mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-600 to-brand-800 rounded-xl flex items-center justify-center mb-5 shadow-sm">
                <Lock size={20} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
              <p className="text-gray-500 text-sm">Sign in to your admin account to continue</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                <input
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  placeholder="Enter your username"
                  className="input-field text-sm"
                  required
                  autoComplete="username"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Enter your password"
                    className="input-field pr-12 text-sm"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                    tabIndex={-1}
                  >
                    {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 text-sm font-semibold tracking-wide mt-1"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : "Sign In →"}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-7 pt-6 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">
                For account access, contact your system administrator
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-5">
            © Red Bean Hospitality · Food for Happiness
          </p>
        </div>
      </div>
    </div>
  );
}
