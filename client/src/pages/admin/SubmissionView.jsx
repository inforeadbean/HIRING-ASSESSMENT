import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminAPI } from "../../services/api";
import { ArrowLeft, CheckCircle2, XCircle, Minus, Mail, Phone, Clock, Calendar } from "lucide-react";
import RedBeanLogo from "../../components/common/RedBeanLogo";

const GRADE_CONFIG = {
  Excellent:     { badge: "bg-green-100 text-green-700 border-green-200",   bar: "bg-green-500",  ring: "ring-green-200"  },
  Good:          { badge: "bg-blue-100 text-blue-700 border-blue-200",      bar: "bg-blue-500",   ring: "ring-blue-200"   },
  Average:       { badge: "bg-yellow-100 text-yellow-700 border-yellow-200", bar: "bg-yellow-500", ring: "ring-yellow-200" },
  "Below Average":{ badge: "bg-orange-100 text-orange-700 border-orange-200", bar: "bg-orange-500", ring: "ring-orange-200" },
  Poor:          { badge: "bg-red-100 text-red-700 border-red-200",         bar: "bg-red-500",    ring: "ring-red-200"    }
};

const SECTION_LABELS = { A: "Logical & IQ", B: "Decision Making", C: "Integrity", D: "Stress & Work Style" };

const sectionPct = (score, total) => (total ? Math.round((score / total) * 100) : 0);
const barColor   = (p) => p >= 90 ? "bg-green-500" : p >= 70 ? "bg-blue-500" : p >= 50 ? "bg-yellow-400" : "bg-red-500";
const formatTime = (s) => s ? `${Math.floor(s / 60)}m ${s % 60}s` : "—";
const formatDate = (d) => new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default function SubmissionView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    adminAPI.getSubmission(id)
      .then(res => setSubmission(res.data))
      .catch(() => navigate("/admin/dashboard"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-700 mx-auto mb-3" />
        <p className="text-sm text-gray-400">Loading submission...</p>
      </div>
    </div>
  );
  if (!submission) return null;

  const { candidate, answers, score, totalQuestions, percentage, grade, sectionScores, timeTaken, submittedAt } = submission;
  const gc = GRADE_CONFIG[grade] || GRADE_CONFIG.Poor;

  const grouped = (answers || []).reduce((acc, a) => {
    if (!acc[a.sectionCode]) acc[a.sectionCode] = [];
    acc[a.sectionCode].push(a);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky navbar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-brand-700 transition"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <div className="flex items-center gap-2">
            <RedBeanLogo size="sm" />
            <span className="text-sm font-semibold text-gray-700 hidden sm:block">Assessment Report</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">

        {/* ── Candidate header ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center shrink-0 shadow-sm">
                <span className="text-2xl font-black text-brand-700">{candidate.name.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{candidate.name}</h1>
                <div className="flex flex-wrap gap-3 mt-1.5 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5"><Mail size={13} className="text-gray-400" />{candidate.email}</span>
                  {candidate.phone && <span className="flex items-center gap-1.5"><Phone size={13} className="text-gray-400" />{candidate.phone}</span>}
                </div>
                <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Calendar size={11} />{formatDate(submittedAt)}</span>
                  <span className="flex items-center gap-1"><Clock size={11} />Time taken: {formatTime(timeTaken)}</span>
                </div>
              </div>
            </div>

            {/* Score badge */}
            <div className={`text-center px-8 py-5 rounded-2xl border ${gc.badge} ring-4 ${gc.ring} ring-opacity-30`}>
              <div className="text-5xl font-black leading-none">{percentage}%</div>
              <div className="text-sm opacity-60 mt-1">{score} / {totalQuestions} correct</div>
              <div className={`mt-2.5 inline-block px-4 py-1 rounded-full text-xs font-bold border ${gc.badge}`}>{grade}</div>
            </div>
          </div>
        </div>

        {/* ── Section scores ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(sectionScores || {}).map(([key, sec]) => {
            const pct = sectionPct(sec.score, sec.total);
            return (
              <div key={key} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-7 h-7 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">{key}</div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${pct >= 70 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>{pct}%</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-0.5">{sec.score}<span className="text-sm font-normal text-gray-400">/{sec.total}</span></div>
                <div className="text-xs text-gray-500 mb-2">{sec.label || SECTION_LABELS[key]}</div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full transition-all ${barColor(pct)}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Detailed answers by section ── */}
        {["A", "B", "C", "D"].filter(code => grouped[code]).map(sectionCode => {
          const qns = grouped[sectionCode];
          const correct = qns.filter(q => q.isCorrect).length;
          const pct = sectionPct(correct, qns.length);
          return (
            <div key={sectionCode} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Section header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">
                    {sectionCode}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{qns[0]?.section || SECTION_LABELS[sectionCode]}</div>
                    <div className="text-xs text-gray-400">{correct} of {qns.length} correct</div>
                  </div>
                </div>
                <div className={`text-sm font-bold px-3 py-1 rounded-full ${pct >= 70 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                  {pct}%
                </div>
              </div>

              {/* Question rows */}
              <div className="divide-y divide-gray-50">
                {qns.map((q, i) => (
                  <div key={q.questionId} className={`px-6 py-4 ${
                    q.selectedOption === null ? "" :
                    q.isCorrect ? "bg-green-50/40" : "bg-red-50/40"
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 mt-0.5">
                        {q.selectedOption === null
                          ? <Minus size={16} className="text-gray-300" />
                          : q.isCorrect
                            ? <CheckCircle2 size={16} className="text-green-500" />
                            : <XCircle size={16} className="text-red-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 leading-relaxed mb-2">
                          <span className="font-semibold text-gray-400 mr-1.5">Q{i + 1}.</span>
                          {q.question}
                        </p>
                        <div className="flex flex-wrap gap-4 text-xs">
                          <span className={q.selectedOption !== null && !q.isCorrect ? "text-red-500 font-medium" : "text-gray-500"}>
                            Candidate:{" "}
                            <strong>{q.selectedOption !== null ? `Option ${String.fromCharCode(65 + q.selectedOption)}` : "Not answered"}</strong>
                          </span>
                          {!q.isCorrect && (
                            <span className="text-green-600 font-medium">
                              Correct: <strong>Option {String.fromCharCode(65 + q.correctAnswer)}</strong>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
