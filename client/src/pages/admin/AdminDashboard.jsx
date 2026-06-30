import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { adminAPI } from "../../services/api";
import { useSocket } from "../../hooks/useSocket";
import toast from "react-hot-toast";
import {
  Users, Trophy, TrendingUp, Calendar, Search, Eye, Trash2,
  LogOut, ChevronLeft, ChevronRight, RefreshCw, Settings, Bell, FileQuestion,
  Clock, ToggleLeft, ToggleRight, BarChart2, CheckCircle2
} from "lucide-react";
import RedBeanLogo from "../../components/common/RedBeanLogo";

const GRADE_BADGE = {
  Excellent: "bg-green-100 text-green-700 border border-green-200",
  Good: "bg-blue-100 text-blue-700 border border-blue-200",
  Average: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  "Below Average": "bg-orange-100 text-orange-700 border border-orange-200",
  Poor: "bg-red-100 text-red-700 border border-red-200"
};

const GRADE_BAR = {
  Excellent: "bg-green-500",
  Good: "bg-blue-500",
  Average: "bg-yellow-400",
  "Below Average": "bg-orange-400",
  Poor: "bg-red-500"
};

const GRADE_ORDER = ["Excellent", "Good", "Average", "Below Average", "Poor"];

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
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [savingTimer, setSavingTimer] = useState(false);
  const [togglingTimer, setTogglingTimer] = useState(false);
  const [newCount, setNewCount] = useState(0);

  const fetchStats = useCallback(async () => {
    try {
      const res = await adminAPI.getStats();
      setStats(res.data);
    } catch { /* silent — server may be waking up */ }
  }, []);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getSubmissions({ page, limit: 15, search, grade: gradeFilter });
      setSubmissions(res.data.submissions);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch { /* silent — server may be waking up */ }
    finally { setLoading(false); }
  }, [page, search, gradeFilter]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchSubmissions(); }, [fetchSubmissions]);
  useEffect(() => {
    adminAPI.getSettings().then(res => {
      setTimerMinutes(res.data.timerMinutes);
      setTimerInput(res.data.timerMinutes);
      setTimerEnabled(res.data.timerEnabled !== false);
    }).catch(() => {});
  }, []);

  useSocket(
    (data) => {
      toast.custom((t) => (
        <div className={`${t.visible ? "animate-enter" : "animate-leave"} bg-white border-l-4 border-brand-700 shadow-xl rounded-xl px-4 py-3.5 flex items-start gap-3 max-w-sm`}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center shrink-0">
            <span className="text-base font-black text-brand-700">{data.candidate?.name?.charAt(0)?.toUpperCase()}</span>
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">New Submission</p>
            <p className="text-xs text-gray-500 mt-0.5">{data.candidate?.name}</p>
            <p className="text-xs font-semibold text-brand-700 mt-0.5">{data.percentage}% · {data.grade}</p>
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
      if (data.timerEnabled !== undefined) setTimerEnabled(data.timerEnabled !== false);
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

  const handleToggleTimer = async () => {
    setTogglingTimer(true);
    try {
      const res = await adminAPI.updateSettings({ timerEnabled: !timerEnabled });
      setTimerEnabled(res.data.timerEnabled !== false);
      toast.success(`Timer ${res.data.timerEnabled ? "enabled" : "disabled"}`);
    } catch {
      toast.error("Failed to update timer");
    } finally { setTogglingTimer(false); }
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

  const gradeMap = {};
  (stats?.gradeBreakdown || []).forEach(g => { gradeMap[g._id] = g.count; });
  const maxGrade = Math.max(1, ...Object.values(gradeMap));

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      {/* ── Navbar ── */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RedBeanLogo size="sm" />
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-gray-900 leading-tight">Assessment Dashboard</h1>
              <p className="text-xs text-gray-400">Welcome back, {admin?.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {newCount > 0 && (
              <div className="relative mr-1">
                <div className="flex items-center gap-1.5 bg-brand-50 text-brand-700 text-xs font-semibold px-2.5 py-1.5 rounded-full border border-brand-200">
                  <Bell size={12} />
                  {newCount} new
                </div>
              </div>
            )}
            <button
              onClick={() => navigate("/admin/questions")}
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-brand-700 px-3 py-2 rounded-lg hover:bg-brand-50 transition font-medium"
            >
              <FileQuestion size={15} />
              <span className="hidden sm:inline">Questions</span>
            </button>
            <button
              onClick={() => { fetchStats(); fetchSubmissions(); setNewCount(0); }}
              className="p-2 text-gray-500 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition"
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={() => { logout(); navigate("/admin/login"); }}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-5 py-6 space-y-5">

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {[
            {
              icon: <Users size={18} />,
              label: "Total Submissions",
              value: stats?.total ?? "—",
              sub: "All time",
              accent: "from-brand-600 to-brand-800",
              bg: "bg-brand-50",
              text: "text-brand-700"
            },
            {
              icon: <Calendar size={18} />,
              label: "Today's Tests",
              value: stats?.todayCount ?? "—",
              sub: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
              accent: "from-purple-600 to-purple-800",
              bg: "bg-purple-50",
              text: "text-purple-600"
            },
            {
              icon: <TrendingUp size={18} />,
              label: "Average Score",
              value: stats ? `${stats.avgPercentage}%` : "—",
              sub: "Across all candidates",
              accent: "from-green-600 to-green-800",
              bg: "bg-green-50",
              text: "text-green-600"
            },
            {
              icon: <Trophy size={18} />,
              label: "Excellent Grade",
              value: gradeMap["Excellent"] ?? "—",
              sub: "Top performers",
              accent: "from-amber-500 to-amber-700",
              bg: "bg-amber-50",
              text: "text-amber-600"
            },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${s.accent} flex items-center justify-center text-white shrink-0 shadow-sm`}>
                {s.icon}
              </div>
              <div className="min-w-0">
                <div className="text-xl sm:text-2xl font-black text-gray-900 leading-none">{s.value}</div>
                <div className="text-xs font-semibold text-gray-600 mt-1 truncate">{s.label}</div>
                <div className="text-[10px] text-gray-400 mt-0.5 hidden sm:block">{s.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Grade Distribution + Timer Settings ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Grade Distribution */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <BarChart2 size={16} className="text-gray-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Grade Distribution</h3>
                <p className="text-xs text-gray-400">Performance breakdown</p>
              </div>
            </div>
            {stats ? (
              <div className="space-y-2.5">
                {GRADE_ORDER.map(grade => {
                  const count = gradeMap[grade] || 0;
                  const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                  return (
                    <div key={grade} className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-24 shrink-0">{grade}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all ${GRADE_BAR[grade]}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-gray-700 w-8 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-24 text-gray-300 text-sm">Loading...</div>
            )}
          </div>

          {/* Timer Settings */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Clock size={16} className="text-gray-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Assessment Timer</h3>
                  <p className="text-xs text-gray-400">Controls candidate time limit</p>
                </div>
              </div>

              <button
                onClick={handleToggleTimer}
                disabled={togglingTimer}
                className="flex items-center gap-2 focus:outline-none"
                title={timerEnabled ? "Disable timer" : "Enable timer"}
              >
                {timerEnabled
                  ? <ToggleRight size={32} className="text-green-500" />
                  : <ToggleLeft size={32} className="text-gray-300" />
                }
                <span className={`text-sm font-semibold ${timerEnabled ? "text-green-600" : "text-gray-400"}`}>
                  {timerEnabled ? "ON" : "OFF"}
                </span>
              </button>
            </div>

            <div className={`rounded-xl border p-4 transition-colors ${timerEnabled ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}>
              {timerEnabled ? (
                <div>
                  <div className="text-xs text-green-700 font-semibold mb-3 flex items-center gap-1.5">
                    <CheckCircle2 size={12} /> Timer is active — candidates see a countdown
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      max={180}
                      value={timerInput}
                      onChange={e => setTimerInput(e.target.value)}
                      className="input-field w-20 py-2 text-center font-bold text-base"
                    />
                    <span className="text-sm text-gray-500 font-medium">minutes</span>
                    <button
                      onClick={handleSaveTimer}
                      disabled={savingTimer}
                      className="btn-primary py-2 px-5 text-sm ml-auto"
                    >
                      {savingTimer ? "Saving..." : "Save"}
                    </button>
                  </div>
                  <p className="text-xs text-green-600/70 mt-2">Current: {timerMinutes} min · Range: 1–180 min</p>
                </div>
              ) : (
                <div className="text-center py-2">
                  <div className="text-sm text-gray-500 font-medium">Timer is disabled</div>
                  <p className="text-xs text-gray-400 mt-1">Candidates can take as long as needed</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Filter bar ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 sm:p-4">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="flex-1 relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search name or email..."
                className="input-field pl-9 py-2 sm:py-2.5 text-sm w-full"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={gradeFilter}
                onChange={e => { setGradeFilter(e.target.value); setPage(1); }}
                className="input-field py-2 sm:py-2.5 flex-1 sm:w-36 text-sm"
              >
                <option value="">All Grades</option>
                {GRADE_ORDER.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <button type="submit" className="btn-primary py-2 sm:py-2.5 px-4 sm:px-6 text-sm whitespace-nowrap">
                Search
              </button>
            </div>
          </form>
        </div>

        {/* ── Submissions table ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-900 text-sm">Candidate Submissions</h2>
              <p className="text-xs text-gray-400 mt-0.5">{total} total record{total !== 1 ? "s" : ""}</p>
            </div>
            {newCount > 0 && (
              <div className="flex items-center gap-1.5 bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-brand-200">
                <Bell size={11} /> {newCount} new since last refresh
              </div>
            )}
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700 mx-auto mb-3" />
              <p className="text-xs text-gray-400">Loading submissions...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Users size={24} className="text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium text-sm">No submissions found</p>
              <p className="text-gray-400 text-xs mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100">
                    {[
                      { label: "Candidate", cls: "" },
                      { label: "Score", cls: "" },
                      { label: "Grade", cls: "" },
                      { label: "Time", cls: "hidden sm:table-cell" },
                      { label: "Submitted", cls: "hidden lg:table-cell" },
                      { label: "Actions", cls: "" },
                    ].map(h => (
                      <th key={h.label} className={`text-left px-3 sm:px-5 py-3 sm:py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider ${h.cls}`}>
                        {h.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {submissions.map(s => (
                    <tr key={s._id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-3 sm:px-5 py-3 sm:py-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center shrink-0">
                            <span className="text-xs sm:text-sm font-black text-brand-700">{s.candidate.name.charAt(0).toUpperCase()}</span>
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900 text-sm truncate max-w-[100px] sm:max-w-none">{s.candidate.name}</div>
                            <div className="text-xs text-gray-400 mt-0.5 truncate max-w-[100px] sm:max-w-[180px]">{s.candidate.email}</div>
                            {s.candidate.phone && <div className="text-xs text-gray-400 hidden sm:block">{s.candidate.phone}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-5 py-3 sm:py-4 whitespace-nowrap">
                        <div className="font-black text-gray-900 text-sm sm:text-base">{s.percentage}%</div>
                        <div className="text-[10px] sm:text-xs text-gray-400">{s.score}/{s.totalQuestions}</div>
                      </td>
                      <td className="px-3 sm:px-5 py-3 sm:py-4">
                        <span className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold whitespace-nowrap ${GRADE_BADGE[s.grade] || ""}`}>
                          {s.grade}
                        </span>
                      </td>
                      <td className="hidden sm:table-cell px-3 sm:px-5 py-3 sm:py-4 text-gray-500 text-xs whitespace-nowrap">{formatTime(s.timeTaken)}</td>
                      <td className="hidden lg:table-cell px-3 sm:px-5 py-3 sm:py-4 text-gray-500 text-xs whitespace-nowrap">{formatDate(s.submittedAt)}</td>
                      <td className="px-3 sm:px-5 py-3 sm:py-4">
                        <div className="flex gap-1">
                          <button
                            onClick={() => navigate(`/admin/submissions/${s._id}`)}
                            className="p-1.5 sm:p-2 text-brand-700 hover:bg-brand-50 rounded-lg transition"
                            title="View Report"
                          >
                            <Eye size={14} />
                          </button>
                          {admin?.role === "superadmin" && (
                            <button
                              onClick={() => handleDelete(s._id, s.candidate.name)}
                              className="p-1.5 sm:p-2 text-red-400 hover:bg-red-50 rounded-lg transition"
                              title="Delete"
                            >
                              <Trash2 size={14} />
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
            <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500">Page {page} of {pages} · {total} records</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1 disabled:opacity-40"
                >
                  <ChevronLeft size={14} /> Prev
                </button>
                <button
                  onClick={() => setPage(p => Math.min(pages, p + 1))}
                  disabled={page === pages}
                  className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1 disabled:opacity-40"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
