import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { questionsAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import {
  Plus, Edit2, Trash2, ArrowLeft, Filter, X, CheckCircle,
  ChevronDown, ChevronUp, Brain, Zap, Heart, BookOpen,
  HelpCircle
} from "lucide-react";
import RedBeanLogo from "../../components/common/RedBeanLogo";
import { EXPERIENCE_LEVELS, SECTIONS } from "../../constants/positions";

const EMPTY_FORM = {
  question: "",
  options: ["", "", "", ""],
  correctAnswer: 0,
  section: "Logical & IQ Assessment",
  sectionCode: "A",
  targetPositions: ["all"],
  experienceLevels: ["all"],
  isActive: true
};

const SECTION_STYLE = {
  A: { bg: "bg-purple-50", border: "border-purple-200", icon: "bg-purple-100 text-purple-700", badge: "bg-purple-100 text-purple-700", bar: "bg-purple-500", text: "text-purple-700", Icon: Brain },
  B: { bg: "bg-blue-50",   border: "border-blue-200",   icon: "bg-blue-100 text-blue-700",     badge: "bg-blue-100 text-blue-700",   bar: "bg-blue-500",   text: "text-blue-700",   Icon: Zap },
  C: { bg: "bg-green-50",  border: "border-green-200",  icon: "bg-green-100 text-green-700",   badge: "bg-green-100 text-green-700", bar: "bg-green-500",  text: "text-green-700",  Icon: Heart },
  D: { bg: "bg-orange-50", border: "border-orange-200", icon: "bg-orange-100 text-orange-700", badge: "bg-orange-100 text-orange-700",bar: "bg-orange-500", text: "text-orange-700", Icon: BookOpen },
};

export default function QuestionManager() {
  const navigate = useNavigate();
  const { admin } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterPosition, setFilterPosition] = useState("all");
  const [filterExperience, setFilterExperience] = useState("all");
  const [filterSection, setFilterSection] = useState("");
  const [dbPositions, setDbPositions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const fetchPositions = useCallback(async () => {
    try {
      const res = await questionsAPI.getPositions();
      setDbPositions(res.data.positions || []);
    } catch { /* ignore */ }
  }, []);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterPosition !== "all") params.position = filterPosition;
      if (filterExperience !== "all") params.experience = filterExperience;
      if (filterSection) params.section = filterSection;
      const res = await questionsAPI.getAll(params);
      setQuestions(res.data.questions);
    } catch {
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  }, [filterPosition, filterExperience, filterSection]);

  useEffect(() => { fetchPositions(); }, [fetchPositions]);
  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  const openAdd = () => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(true); };

  const openEdit = (q) => {
    setForm({
      question: q.question,
      options: [...q.options],
      correctAnswer: q.correctAnswer,
      section: q.section,
      sectionCode: q.sectionCode,
      targetPositions: [...q.targetPositions],
      experienceLevels: [...q.experienceLevels],
      isActive: q.isActive
    });
    setEditingId(q._id);
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditingId(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.question.trim()) return toast.error("Question text is required");
    if (form.options.some(o => !o.trim())) return toast.error("All 4 options must be filled");
    const positions = form.targetPositions.filter(p => p && p.trim());
    if (!positions.length) return toast.error("Enter a position name or select All Positions");
    if (!form.experienceLevels.length) return toast.error("Select at least one experience level");
    setSaving(true);
    try {
      const payload = { ...form, targetPositions: positions };
      if (editingId) {
        await questionsAPI.update(editingId, payload);
        toast.success("Question updated");
      } else {
        await questionsAPI.create(payload);
        toast.success("Question added");
      }
      closeForm();
      fetchPositions();
      fetchQuestions();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this question?")) return;
    try {
      await questionsAPI.remove(id);
      toast.success("Deleted");
      fetchPositions();
      fetchQuestions();
    } catch { toast.error("Delete failed"); }
  };

  const toggleExperience = (exp) => {
    setForm(f => {
      const current = f.experienceLevels;
      if (exp === "all") return { ...f, experienceLevels: ["all"] };
      const without = current.filter(e => e !== "all");
      return without.includes(exp)
        ? { ...f, experienceLevels: without.length === 1 ? ["all"] : without.filter(e => e !== exp) }
        : { ...f, experienceLevels: [...without, exp] };
    });
  };

  const sectionLabel = (code) => SECTIONS.find(s => s.code === code)?.label || code;

  const groupedBySection = ["A", "B", "C", "D"].map(code => ({
    code,
    label: sectionLabel(code),
    items: questions.filter(q => q.sectionCode === code)
  })).filter(g => g.items.length > 0);

  const hasFilters = filterPosition !== "all" || filterExperience !== "all" || filterSection;

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      {/* ── Navbar ── */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RedBeanLogo size="sm" />
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-tight">Question Manager</h1>
              <p className="text-xs text-gray-400">Manage assessment questions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-700 px-3 py-2 rounded-lg hover:bg-brand-50 transition"
            >
              <ArrowLeft size={15} /> Dashboard
            </button>
            <button
              onClick={openAdd}
              className="btn-primary flex items-center gap-1.5 py-2 px-4 text-sm"
            >
              <Plus size={16} /> Add Question
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-5 py-6">

        {/* ── Filter bar ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 sm:p-4 mb-4 sm:mb-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-wrap">
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider shrink-0">
              <Filter size={14} /> Filter By
            </div>
            <div className="flex gap-2 flex-wrap">
              <select
                value={filterPosition}
                onChange={e => setFilterPosition(e.target.value)}
                className="input-field py-2 text-sm flex-1 sm:w-40 min-w-0"
              >
                <option value="all">All Positions</option>
                {dbPositions.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <select
                value={filterExperience}
                onChange={e => setFilterExperience(e.target.value)}
                className="input-field py-2 text-sm flex-1 sm:w-36 min-w-0"
              >
                <option value="all">All Experience</option>
                {EXPERIENCE_LEVELS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
              </select>
              <select
                value={filterSection}
                onChange={e => setFilterSection(e.target.value)}
                className="input-field py-2 text-sm flex-1 sm:w-44 min-w-0"
              >
                <option value="">All Sections</option>
                {SECTIONS.map(s => <option key={s.code} value={s.code}>Sec {s.code} – {s.label}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3 sm:ml-auto">
              {hasFilters && (
                <button
                  onClick={() => { setFilterPosition("all"); setFilterExperience("all"); setFilterSection(""); }}
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition"
                >
                  <X size={12} /> Clear
                </button>
              )}
              <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
                <span className="text-xs font-black text-gray-900">{questions.length}</span>
                <span className="text-xs text-gray-400">question{questions.length !== 1 ? "s" : ""}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Empty state ── */}
        {!loading && questions.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <HelpCircle size={28} className="text-gray-300" />
            </div>
            <h3 className="text-base font-bold text-gray-700 mb-1">No questions found</h3>
            <p className="text-gray-400 text-sm mb-6">
              {hasFilters ? "No questions match the current filters." : "Start by adding your first question."}
            </p>
            <button onClick={openAdd} className="btn-primary mx-auto flex items-center gap-2 w-fit">
              <Plus size={16} /> Add Question
            </button>
          </div>
        )}

        {loading && (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700 mx-auto mb-3" />
            <p className="text-xs text-gray-400">Loading questions...</p>
          </div>
        )}

        {/* ── Questions grouped by section ── */}
        {!loading && questions.length > 0 && (
          <div className="space-y-5">
            {groupedBySection.map(group => {
              const ss = SECTION_STYLE[group.code] || SECTION_STYLE.A;
              const SectionIcon = ss.Icon;
              return (
                <div key={group.code} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className={`px-6 py-4 border-b ${ss.border} ${ss.bg} flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${ss.icon} flex items-center justify-center shrink-0`}>
                        <SectionIcon size={18} />
                      </div>
                      <div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ss.badge}`}>Section {group.code}</span>
                        <div className="font-bold text-gray-900 text-sm mt-0.5">{group.label}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black text-gray-900">{group.items.length}</div>
                      <div className="text-xs text-gray-400">question{group.items.length !== 1 ? "s" : ""}</div>
                    </div>
                  </div>

                  <div className="divide-y divide-gray-50">
                    {group.items.map((q, idx) => (
                      <div key={q._id} className="px-6 py-4 hover:bg-gray-50/50 transition-colors">
                        <div className="flex items-start gap-4">
                          <span className="text-xs font-black text-gray-300 mt-1 w-6 shrink-0 text-right">{idx + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 leading-snug">{q.question}</p>
                            <div className="flex gap-1.5 mt-2 flex-wrap">
                              {q.targetPositions.map(p => (
                                <span key={p} className="text-[10px] bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded-md font-semibold">
                                  {p === "all" ? "All Positions" : p}
                                </span>
                              ))}
                              {q.experienceLevels.map(e => (
                                <span key={e} className="text-[10px] bg-sky-50 text-sky-600 px-1.5 py-0.5 rounded-md font-semibold">
                                  {e === "all" ? "All Levels" : `${e} yrs`}
                                </span>
                              ))}
                            </div>

                            {expandedId === q._id && (
                              <div className="mt-3 space-y-1.5">
                                {q.options.map((opt, i) => (
                                  <div
                                    key={i}
                                    className={`flex items-center gap-2.5 text-xs px-3 py-2.5 rounded-xl ${
                                      i === q.correctAnswer
                                        ? "bg-green-50 text-green-800 border border-green-200"
                                        : "text-gray-600 bg-gray-50 border border-gray-100"
                                    }`}
                                  >
                                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                                      i === q.correctAnswer ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"
                                    }`}>
                                      {String.fromCharCode(65 + i)}
                                    </span>
                                    <span className="flex-1">{opt}</span>
                                    {i === q.correctAnswer && <CheckCircle size={13} className="text-green-500 shrink-0" />}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => setExpandedId(expandedId === q._id ? null : q._id)}
                              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                              title={expandedId === q._id ? "Hide options" : "Show options"}
                            >
                              {expandedId === q._id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                            </button>
                            <button
                              onClick={() => openEdit(q)}
                              className="p-2 text-brand-700 hover:bg-brand-50 rounded-lg transition"
                              title="Edit"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(q._id)}
                              className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition"
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Add/Edit Modal ── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-4 sm:my-8">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-brand-600 to-brand-800 rounded-xl flex items-center justify-center">
                  {editingId ? <Edit2 size={15} className="text-white" /> : <Plus size={16} className="text-white" />}
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">{editingId ? "Edit Question" : "Add New Question"}</h2>
                  <p className="text-xs text-gray-400">{editingId ? "Update question details" : "Create a new MCQ question"}</p>
                </div>
              </div>
              <button onClick={closeForm} className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="px-4 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-5">

              {/* Section selector */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Section *</label>
                <div className="grid grid-cols-2 gap-2">
                  {SECTIONS.map(s => {
                    const ss = SECTION_STYLE[s.code] || SECTION_STYLE.A;
                    const selected = form.sectionCode === s.code;
                    return (
                      <button
                        key={s.code}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, sectionCode: s.code, section: s.label }))}
                        className={`text-left px-3 py-2.5 rounded-xl border-2 transition-all text-sm ${
                          selected
                            ? `${ss.bg} ${ss.border} ${ss.text} font-semibold`
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        <span className="font-bold">Section {s.code}</span>
                        <span className="text-xs font-normal ml-1 opacity-70">— {s.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target position */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Target Position *</label>
                <label className="flex items-center gap-2.5 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={form.targetPositions.includes("all")}
                    onChange={e => setForm(f => ({ ...f, targetPositions: e.target.checked ? ["all"] : [""] }))}
                    className="accent-brand-700 w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-700">Apply to all positions</span>
                </label>
                {!form.targetPositions.includes("all") && (
                  <input
                    value={form.targetPositions[0] === "all" ? "" : (form.targetPositions[0] || "")}
                    onChange={e => setForm(f => ({ ...f, targetPositions: e.target.value ? [e.target.value] : [""] }))}
                    placeholder="e.g. Restaurant Manager"
                    className="input-field text-sm"
                  />
                )}
              </div>

              {/* Experience level */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Experience Level *</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => toggleExperience("all")}
                    className={`px-3 py-1.5 text-xs rounded-full border font-semibold transition ${
                      form.experienceLevels.includes("all")
                        ? "bg-brand-700 text-white border-brand-700"
                        : "border-gray-300 text-gray-600 hover:border-brand-400"
                    }`}
                  >
                    All Levels
                  </button>
                  {EXPERIENCE_LEVELS.map(e => (
                    <button
                      key={e.value}
                      type="button"
                      onClick={() => toggleExperience(e.value)}
                      className={`px-3 py-1.5 text-xs rounded-full border font-semibold transition ${
                        form.experienceLevels.includes(e.value) && !form.experienceLevels.includes("all")
                          ? "bg-brand-700 text-white border-brand-700"
                          : "border-gray-300 text-gray-600 hover:border-brand-400"
                      }`}
                    >
                      {e.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question text */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Question Text *</label>
                <textarea
                  value={form.question}
                  onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
                  className="input-field text-sm resize-none"
                  rows={3}
                  placeholder="Enter the question..."
                  required
                />
              </div>

              {/* Options */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Answer Options *</label>
                <p className="text-xs text-gray-400 mb-2.5">Click the radio button to mark the correct answer</p>
                <div className="space-y-2">
                  {form.options.map((opt, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                        form.correctAnswer === i
                          ? "border-green-400 bg-green-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="correct"
                        checked={form.correctAnswer === i}
                        onChange={() => setForm(f => ({ ...f, correctAnswer: i }))}
                        className="accent-green-600 shrink-0 w-4 h-4"
                      />
                      <span className="text-sm font-bold text-gray-400 w-5 shrink-0">{String.fromCharCode(65 + i)}.</span>
                      <input
                        value={opt}
                        onChange={e => setForm(f => {
                          const opts = [...f.options];
                          opts[i] = e.target.value;
                          return { ...f, options: opts };
                        })}
                        className="flex-1 text-sm bg-transparent border-none outline-none placeholder-gray-300"
                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                        required
                      />
                      {form.correctAnswer === i && <CheckCircle size={14} className="text-green-500 shrink-0" />}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button type="button" onClick={closeForm} className="btn-secondary px-6 py-2.5">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary px-8 py-2.5">
                  {saving ? "Saving..." : editingId ? "Update Question" : "Add Question"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
