import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { questionsAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { Plus, Edit2, Trash2, ArrowLeft, Filter, X, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
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

const SECTION_COLOR = { A: "bg-purple-100 text-purple-700", B: "bg-blue-100 text-blue-700", C: "bg-green-100 text-green-700", D: "bg-orange-100 text-orange-700" };

export default function QuestionManager() {
  const navigate = useNavigate();
  const { admin } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterPosition, setFilterPosition] = useState("all");
  const [filterExperience, setFilterExperience] = useState("all");
  const [filterSection, setFilterSection] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

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

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  };

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
    if (form.options.some(o => !o.trim())) return toast.error("All 4 options must be filled");
    if (!form.question.trim()) return toast.error("Question text is required");
    if (!form.targetPositions.length || form.targetPositions.every(p => !p.trim())) return toast.error("Enter a position name or select All Positions");
    if (!form.experienceLevels.length) return toast.error("Select at least one experience level");
    setSaving(true);
    try {
      if (editingId) {
        await questionsAPI.update(editingId, form);
        toast.success("Question updated");
      } else {
        await questionsAPI.create(form);
        toast.success("Question added");
      }
      closeForm();
      fetchQuestions();
    } catch (err) {
      const errMsg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Save failed";
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, text) => {
    if (!window.confirm(`Delete: "${text.slice(0, 60)}..."?`)) return;
    try {
      await questionsAPI.remove(id);
      toast.success("Question deleted");
      fetchQuestions();
    } catch {
      toast.error("Delete failed");
    }
  };

  const toggleExperience = (exp) => {
    setForm(f => {
      const current = f.experienceLevels;
      if (exp === "all") return { ...f, experienceLevels: ["all"] };
      const without = current.filter(e => e !== "all");
      return without.includes(exp)
        ? { ...f, experienceLevels: without.filter(e => e !== exp) || ["all"] }
        : { ...f, experienceLevels: [...without, exp] };
    });
  };

  const sectionLabel = (code) => SECTIONS.find(s => s.code === code)?.label || code;

  const groupedBySection = ["A","B","C","D"].map(code => ({
    code,
    label: sectionLabel(code),
    items: questions.filter(q => q.sectionCode === code)
  })).filter(g => g.items.length > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RedBeanLogo size="sm" />
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">Question Manager</h1>
              <p className="text-xs text-gray-500">Create & manage assessment questions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-brand-700 px-3 py-1.5 rounded-lg hover:bg-brand-50 transition"
            >
              <ArrowLeft size={15} /> Dashboard
            </button>
            <button onClick={openAdd} className="btn-primary flex items-center gap-1.5 py-1.5 px-4 text-sm">
              <Plus size={16} /> Add Question
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="card mb-5 py-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <Filter size={15} /> Filter:
            </div>
            <select value={filterPosition} onChange={e => setFilterPosition(e.target.value)} className="input-field py-1.5 text-sm w-52">
              <option value="all">All Positions</option>
              {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={filterExperience} onChange={e => setFilterExperience(e.target.value)} className="input-field py-1.5 text-sm w-44">
              <option value="all">All Experience</option>
              {EXPERIENCE_LEVELS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
            </select>
            <select value={filterSection} onChange={e => setFilterSection(e.target.value)} className="input-field py-1.5 text-sm w-44">
              <option value="">All Sections</option>
              {SECTIONS.map(s => <option key={s.code} value={s.code}>Section {s.code} – {s.label}</option>)}
            </select>
            {(filterPosition !== "all" || filterExperience !== "all" || filterSection) && (
              <button onClick={() => { setFilterPosition("all"); setFilterExperience("all"); setFilterSection(""); }} className="text-xs text-brand-700 hover:underline flex items-center gap-1">
                <X size={12} /> Clear filters
              </button>
            )}
            <span className="ml-auto text-sm text-gray-500 font-medium">{questions.length} question{questions.length !== 1 ? "s" : ""}</span>
          </div>
        </div>

        {/* Info callout when no questions */}
        {!loading && questions.length === 0 && (
          <div className="card text-center py-16">
            <div className="text-5xl mb-4">📝</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No questions found</h3>
            <p className="text-gray-400 text-sm mb-5">
              {filterPosition !== "all" || filterExperience !== "all"
                ? "No questions match the current filters. Try changing the filters or add new questions."
                : "Start by adding questions. You can target specific job positions and experience levels."}
            </p>
            <button onClick={openAdd} className="btn-primary mx-auto flex items-center gap-2 w-fit">
              <Plus size={16} /> Add First Question
            </button>
          </div>
        )}

        {loading && (
          <div className="py-16 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700 mx-auto" />
          </div>
        )}

        {/* Questions grouped by section */}
        {!loading && questions.length > 0 && (
          <div className="space-y-4">
            {groupedBySection.map(group => (
              <div key={group.code} className="card p-0 overflow-hidden">
                <div className={`px-5 py-3 border-b border-gray-100 flex items-center gap-3 bg-gray-50/60`}>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${SECTION_COLOR[group.code]}`}>
                    Section {group.code}
                  </span>
                  <span className="font-semibold text-gray-800 text-sm">{group.label}</span>
                  <span className="ml-auto text-xs text-gray-400">{group.items.length} question{group.items.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {group.items.map((q, idx) => (
                    <div key={q._id} className="px-5 py-3.5">
                      <div className="flex items-start gap-3">
                        <span className="text-xs font-bold text-gray-400 mt-0.5 w-5 shrink-0">{idx + 1}.</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 leading-snug">{q.question}</p>
                          {/* Tags */}
                          <div className="flex gap-1.5 mt-1.5 flex-wrap">
                            {q.targetPositions.map(p => (
                              <span key={p} className="text-[10px] bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded font-medium">
                                {p === "all" ? "All Positions" : p}
                              </span>
                            ))}
                            {q.experienceLevels.map(e => (
                              <span key={e} className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">
                                {e === "all" ? "All Levels" : `${e} yrs`}
                              </span>
                            ))}
                          </div>
                          {/* Expanded options */}
                          {expandedId === q._id && (
                            <div className="mt-3 space-y-1.5">
                              {q.options.map((opt, i) => (
                                <div key={i} className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg ${i === q.correctAnswer ? "bg-green-50 text-green-700 font-semibold" : "text-gray-600 bg-gray-50"}`}>
                                  {i === q.correctAnswer && <CheckCircle size={12} className="shrink-0" />}
                                  <span className="font-medium w-4">{String.fromCharCode(65+i)}.</span>
                                  {opt}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => setExpandedId(expandedId === q._id ? null : q._id)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                            title="Preview options"
                          >
                            {expandedId === q._id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                          <button onClick={() => openEdit(q)} className="p-1.5 text-brand-700 hover:bg-brand-50 rounded-lg transition" title="Edit">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDelete(q._id, q.question)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition" title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{editingId ? "Edit Question" : "Add New Question"}</h2>
              <button onClick={closeForm} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="px-6 py-5 space-y-5">
              {/* Target Position */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Target Job Position *</label>
                <div className="flex items-center gap-3 mb-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.targetPositions.includes("all")}
                      onChange={e => setForm(f => ({ ...f, targetPositions: e.target.checked ? ["all"] : [""] }))}
                      className="accent-brand-700 w-4 h-4"
                    />
                    <span className="text-sm font-medium text-gray-700">Apply to All Positions</span>
                  </label>
                </div>
                {!form.targetPositions.includes("all") && (
                  <input
                    value={form.targetPositions[0] === "all" ? "" : (form.targetPositions[0] || "")}
                    onChange={e => setForm(f => ({ ...f, targetPositions: e.target.value ? [e.target.value] : [] }))}
                    placeholder="e.g. Restaurant Manager"
                    className="input-field text-sm"
                  />
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {form.targetPositions.includes("all")
                    ? "This question will appear for all candidates regardless of position."
                    : "Candidates who select this position will get this question."}
                </p>
              </div>

              {/* Target Experience */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Target Experience Level *</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => toggleExperience("all")}
                    className={`px-3 py-1.5 text-xs rounded-full border font-medium transition ${form.experienceLevels.includes("all") ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 text-gray-600 hover:border-blue-400"}`}
                  >
                    All Levels
                  </button>
                  {EXPERIENCE_LEVELS.map(e => (
                    <button
                      key={e.value} type="button"
                      onClick={() => toggleExperience(e.value)}
                      className={`px-3 py-1.5 text-xs rounded-full border font-medium transition ${form.experienceLevels.includes(e.value) && !form.experienceLevels.includes("all") ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 text-gray-600 hover:border-blue-400"}`}
                    >
                      {e.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Selected: {form.experienceLevels.includes("all") ? "All Levels" : form.experienceLevels.join(", ") || "None"}
                </p>
              </div>

              {/* Section */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Section *</label>
                <select
                  value={form.sectionCode}
                  onChange={e => {
                    const s = SECTIONS.find(sec => sec.code === e.target.value);
                    setForm(f => ({ ...f, sectionCode: s.code, section: s.label }));
                  }}
                  className="input-field text-sm"
                >
                  {SECTIONS.map(s => (
                    <option key={s.code} value={s.code}>Section {s.code} — {s.label}</option>
                  ))}
                </select>
              </div>

              {/* Question */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Question Text *</label>
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Answer Options * <span className="text-xs font-normal text-gray-400">(click radio to set correct answer)</span></label>
                <div className="space-y-2">
                  {form.options.map((opt, i) => (
                    <div key={i} className={`flex items-center gap-2 p-2 rounded-lg border transition ${form.correctAnswer === i ? "border-green-400 bg-green-50" : "border-gray-200"}`}>
                      <input
                        type="radio"
                        name="correct"
                        checked={form.correctAnswer === i}
                        onChange={() => setForm(f => ({ ...f, correctAnswer: i }))}
                        className="accent-green-600 shrink-0"
                        title="Mark as correct"
                      />
                      <span className="text-sm font-semibold text-gray-500 w-5">{String.fromCharCode(65+i)}.</span>
                      <input
                        value={opt}
                        onChange={e => setForm(f => { const opts = [...f.options]; opts[i] = e.target.value; return { ...f, options: opts }; })}
                        className="flex-1 text-sm bg-transparent border-none outline-none placeholder-gray-300"
                        placeholder={`Option ${String.fromCharCode(65+i)}`}
                        required
                      />
                      {form.correctAnswer === i && <CheckCircle size={14} className="text-green-500 shrink-0" />}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={closeForm} className="btn-secondary px-5">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary px-6">
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
