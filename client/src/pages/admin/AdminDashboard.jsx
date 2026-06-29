import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { adminAPI } from "../../services/api";
import toast from "react-hot-toast";
import {
  Users, Trophy, TrendingUp, Calendar, Search, Eye, Trash2,
  LogOut, ChevronLeft, ChevronRight, RefreshCw, Settings
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

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete submission by ${name}? This cannot be undone.`)) return;
    try {
      await adminAPI.deleteSubmission(id);
      toast.success("Deleted");
      fetchSubmissions();
      fetchStats();
    } catch { toast.error("Delete failed"); }
  };

  const handleSaveTimer = async () => {
    const val = parseInt(timerInput);
    if (!val || val < 5 || val > 120) return toast.error("Timer must be between 5 and 120 minutes");
    setSavingTimer(true);
    try {
      await adminAPI.updateSettings({ timerMinutes: val });
      setTimerMinutes(val);
      toast.success(`Timer updated to ${val} minutes`);
    } catch { toast.error("Failed to update timer"); }
    finally { setSavingTimer(false); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchSubmissions();
  };

  const formatDate = (d) => new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const formatTime = (s) => s ? `${Math.floor(s/60)}m ${s%60}s` : "—";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RedBeanLogo size="sm" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Assessment Dashboard</h1>
              <p className="text-xs text-gray-500">Welcome, {admin?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => { fetchStats(); fetchSubmissions(); }} className="p-2 text-gray-500 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition">
              <RefreshCw size={18} />
            </button>
            <button onClick={() => { logout(); navigate("/admin/login"); }} className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { icon: <Users className="text-blue-600" size={22} />, label: "Total Submissions", value: stats.total, bg: "bg-blue-50" },
              { icon: <Calendar className="text-purple-600" size={22} />, label: "Today's Tests", value: stats.todayCount, bg: "bg-purple-50" },
              { icon: <TrendingUp className="text-green-600" size={22} />, label: "Avg. Score", value: `${stats.avgPercentage}%`, bg: "bg-green-50" },
              { icon: <Trophy className="text-yellow-600" size={22} />, label: "Excellent Grade", value: stats.gradeBreakdown.find(g => g._id === "Excellent")?.count || 0, bg: "bg-yellow-50" }
            ].map((s, i) => (
              <div key={i} className="card flex items-center gap-4">
                <div className={`p-3 rounded-xl ${s.bg}`}>{s.icon}</div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                  <div className="text-xs text-gray-500">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Timer Settings (superadmin only) */}
        {admin?.role === "superadmin" && (
          <div className="card mb-6 flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2 text-gray-700 font-semibold">
              <Settings size={18} className="text-blue-600" /> Assessment Timer
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={5}
                max={120}
                value={timerInput}
                onChange={e => setTimerInput(e.target.value)}
                className="input-field w-24 py-1.5 text-center font-semibold"
              />
              <span className="text-gray-500 text-sm">minutes</span>
              <button
                onClick={handleSaveTimer}
                disabled={savingTimer || parseInt(timerInput) === timerMinutes}
                className="btn-primary py-1.5 px-4 text-sm"
              >
                {savingTimer ? "Saving..." : "Save"}
              </button>
              <span className="text-xs text-gray-400">Current: {timerMinutes} min</span>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="card mb-4">
          <form onSubmit={handleSearch} className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-48 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="input-field pl-9 py-2"
              />
            </div>
            <select value={gradeFilter} onChange={e => { setGradeFilter(e.target.value); setPage(1); }} className="input-field py-2 w-44">
              <option value="">All Grades</option>
              {["Excellent", "Good", "Average", "Below Average", "Poor"].map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <button type="submit" className="btn-primary py-2 px-5">Search</button>
          </form>
        </div>

        {/* Table */}
        <div className="card overflow-hidden p-0">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-semibold text-gray-900">Submissions ({total})</h2>
          </div>
          {loading ? (
            <div className="py-16 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700 mx-auto" />
            </div>
          ) : submissions.length === 0 ? (
            <div className="py-16 text-center text-gray-400">No submissions found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {["Candidate", "Position", "Score", "Grade", "Time Taken", "Date", "Actions"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {submissions.map(s => (
                    <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-900">{s.candidate.name}</div>
                        <div className="text-xs text-gray-400">{s.candidate.email}</div>
                      </td>
                      <td className="px-4 py-4 text-gray-600">{s.candidate.position}</td>
                      <td className="px-4 py-4">
                        <div className="font-semibold text-gray-900">{s.percentage}%</div>
                        <div className="text-xs text-gray-400">{s.score}/{s.totalQuestions}</div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${GRADE_BADGE[s.grade] || ""}`}>{s.grade}</span>
                      </td>
                      <td className="px-4 py-4 text-gray-500">{formatTime(s.timeTaken)}</td>
                      <td className="px-4 py-4 text-gray-500">{formatDate(s.submittedAt)}</td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => navigate(`/admin/submissions/${s._id}`)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="View details">
                            <Eye size={16} />
                          </button>
                          {admin?.role === "superadmin" && (
                            <button onClick={() => handleDelete(s._id, s.candidate.name)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition" title="Delete">
                              <Trash2 size={16} />
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
          {/* Pagination */}
          {pages > 1 && (
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm text-gray-500">Page {page} of {pages}</span>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary py-1 px-3 text-sm">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="btn-secondary py-1 px-3 text-sm">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
