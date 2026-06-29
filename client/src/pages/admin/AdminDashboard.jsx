import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { adminAPI } from "../../services/api";
import { useSocket } from "../../hooks/useSocket";
import toast from "react-hot-toast";
import {
  Users, Trophy, TrendingUp, Calendar, Search, Eye, Trash2,
  LogOut, ChevronLeft, ChevronRight, RefreshCw, Settings, Bell
} from "lucide-react";
import RedBeanLogo from "../../components/common/RedBeanLogo";

const GRADE_BADGE = {
  Excellent: "bg-green-100 text-green-700",
  Good: "bg-blue-100 text-blue-700",
  Average: "bg-yellow-100 text-yellow-700",
  "Below Average": "bg-orange-100 text-orange-700",
  Poor: "bg-red-100 text-red-700"
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { admin, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [timerMinutes, setTimerMinutes] = useState(30);
  const [timerInput, setTimerInput] = useState(30);
  const [savingTimer, setSavingTimer] = useState(false);
  const [newCount, setNewCount] = useState(0);

  const fetchStats = useCallback(async () => {
    try {
      const res = await adminAPI.getStats();
      setStats(res.data);
    } catch { toast.error("Failed to load stats"); }
  }, []);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getSubmissions({ page, limit: 15, search, grade: gradeFilter });
      setSubmissions(res.data.submissions);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch { toast.error("Failed to load submissions"); }
    finally { setLoading(false); }
  }, [page, search, gradeFilter]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchSubmissions(); }, [fetchSubmissions]);
  useEffect(() => {
    adminAPI.getSettings().then(res => {
      setTimerMinutes(res.data.timerMinutes);
      setTimerInput(res.data.timerMinutes);
    }).catch(() => {});
  }, []);

  // Real-time socket events
  useSocket(
    (data) => {
      toast.custom((t) => (
        <div className={`${t.visible ? "animate-enter" : "animate-leave"} bg-white border-l-4 border-brand-700 shadow-lg rounded-lg px-4 py-3 flex items-start gap-3 max-w-sm`}>
          <Bell size={18} className="text-brand-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-gray-900 text-sm">New Submission!</p>
            <p className="text-xs text-gray-500">{data.candidate?.name} · {data.candidate?.position}</p>
            <p className="text-xs font-medium text-brand-700">{data.percentage}% · {data.grade}</p>
          </div>
        </div>
      ), { duration: 6000 });
      setNewCount(c => c + 1);
      fetchStats();
      if (page === 1) fetchSubmissions();
    },
    (data) => {
      setTimerMinutes(data.timerMinutes);
      setTimerInput(data.timerMinutes);
    }
  );

  const handleSaveTimer = async () => {
    const val = parseInt(timerInput);
    if (!val || val < 1 || val > 180) return toast.error("Timer must be between 1 and 180 minutes");
    setSavingTimer(true);
    try {
      const res = await adminAPI.updateSettings({ timerMinutes: val });
      setTimerMinutes(res.data.timerMinutes);
      setTimerInput(res.data.timerMinutes);
      toast.success(`Timer set to ${res.data.timerMinutes} minutes`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update timer");
    } finally { setSavingTimer(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete submission by ${name}?`)) return;
    try {
      await adminAPI.deleteSubmission(id);
      toast.success("Deleted");
      fetchSubmissions();
      fetchStats();
    } catch { toast.error("Delete failed"); }
  };

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchSubmissions(); };
  const formatDate = (d) => new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const formatTime = (s) => s ? `${Math.floor(s / 60)}m ${s % 60}s` : "—";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RedBeanLogo size="sm" />
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">Assessment Dashboard</h1>
              <p className="text-xs text-gray-500">Welcome, {admin?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {newCount > 0 && (
              <div className="relative">
                <Bell size={20} className="text-brand-700" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-700 text-white text-[9px] rounded-full flex items-center justify-center font-bold">{newCount}</span>
              </div>
            )}
            <button onClick={() => { fetchStats(); fetchSubmissions(); setNewCount(0); }} className="p-2 text-gray-500 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition" title="Refresh">
              <RefreshCw size={17} />
            </button>
            <button onClick={() => { logout(); navigate("/admin/login"); }} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition">
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
            {[
              { icon: <Users size={20} />, label: "Total Submissions", value: stats.total, color: "text-brand-700", bg: "bg-brand-50" },
              { icon: <Calendar size={20} />, label: "Today's Tests", value: stats.todayCount, color: "text-purple-600", bg: "bg-purple-50" },
              { icon: <TrendingUp size={20} />, label: "Avg. Score", value: `${stats.avgPercentage}%`, color: "text-green-600", bg: "bg-green-50" },
              { icon: <Trophy size={20} />, label: "Excellent Grade", value: stats.gradeBreakdown.find(g => g._id === "Excellent")?.count || 0, color: "text-yellow-600", bg: "bg-yellow-50" }
            ].map((s, i) => (
              <div key={i} className="card flex items-center gap-4 py-4">
                <div className={`p-3 rounded-xl ${s.bg} ${s.color}`}>{s.icon}</div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                  <div className="text-xs text-gray-500">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Timer Settings */}
        <div className="card mb-5 flex items-center gap-4 flex-wrap py-4">
          <div className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
            <Settings size={16} className="text-brand-700" /> Assessment Timer
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="number" min={1} max={180}
              value={timerInput}
              onChange={e => setTimerInput(e.target.value)}
              className="input-field w-20 py-1.5 text-center font-bold text-sm"
            />
            <span className="text-gray-500 text-sm">minutes</span>
            <button
              onClick={handleSaveTimer}
              disabled={savingTimer}
              className="btn-primary py-1.5 px-4 text-sm"
            >
              {savingTimer ? "Saving..." : "Save"}
            </button>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">Current: {timerMinutes} min</span>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-4 py-4">
          <form onSubmit={handleSearch} className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-48 relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="input-field pl-9 py-2 text-sm" />
            </div>
            <select value={gradeFilter} onChange={e => { setGradeFilter(e.target.value); setPage(1); }} className="input-field py-2 w-40 text-sm">
              <option value="">All Grades</option>
              {["Excellent", "Good", "Average", "Below Average", "Poor"].map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <button type="submit" className="btn-primary py-2 px-5 text-sm">Search</button>
          </form>
        </div>

        {/* Table */}
        <div className="card overflow-hidden p-0">
          <div className="px-5 py-3.5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="font-semibold text-gray-900 text-sm">Submissions ({total})</h2>
            {newCount > 0 && (
              <span className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full font-medium">{newCount} new</span>
            )}
          </div>
          {loading ? (
            <div className="py-16 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700 mx-auto" />
            </div>
          ) : submissions.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">No submissions found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["Candidate", "Position", "Score", "Grade", "Time Taken", "Date", "Actions"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {submissions.map(s => (
                    <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-gray-900">{s.candidate.name}</div>
                        <div className="text-xs text-gray-400">{s.candidate.email}</div>
                      </td>
                      <td className="px-4 py-3.5 text-gray-600 text-xs">{s.candidate.position}</td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-gray-900">{s.percentage}%</div>
                        <div className="text-xs text-gray-400">{s.score}/{s.totalQuestions}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${GRADE_BADGE[s.grade] || ""}`}>{s.grade}</span>
                      </td>
                      <td className="px-4 py-3.5 text-gray-500 text-xs">{formatTime(s.timeTaken)}</td>
                      <td className="px-4 py-3.5 text-gray-500 text-xs">{formatDate(s.submittedAt)}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex gap-1.5">
                          <button onClick={() => navigate(`/admin/submissions/${s._id}`)} className="p-1.5 text-brand-700 hover:bg-brand-50 rounded-lg transition" title="View">
                            <Eye size={15} />
                          </button>
                          {admin?.role === "superadmin" && (
                            <button onClick={() => handleDelete(s._id, s.candidate.name)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition" title="Delete">
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {pages > 1 && (
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500">Page {page} of {pages}</span>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary py-1 px-3 text-xs"><ChevronLeft size={14} /></button>
                <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="btn-secondary py-1 px-3 text-xs"><ChevronRight size={14} /></button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
