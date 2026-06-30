import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminAPI } from "../../services/api";
import {
  ArrowLeft, CheckCircle2, XCircle, Minus,
  Mail, Phone, Clock, Calendar, Award, BarChart2, User
} from "lucide-react";
import RedBeanLogo from "../../components/common/RedBeanLogo";

const GRADE_CONFIG = {
  Excellent:      { badge: "bg-green-100 text-green-700 border-green-200",   bar: "bg-green-500",   ring: "border-green-200",  header: "from-green-600 to-emerald-700",  score: "text-green-700" },
  Good:           { badge: "bg-blue-100 text-blue-700 border-blue-200",      bar: "bg-blue-500",    ring: "border-blue-200",   header: "from-blue-600 to-blue-700",      score: "text-blue-700" },
  Average:        { badge: "bg-yellow-100 text-yellow-700 border-yellow-200", bar: "bg-yellow-400",  ring: "border-yellow-200", header: "from-yellow-500 to-amber-600",   score: "text-yellow-700" },
  "Below Average":{ badge: "bg-orange-100 text-orange-700 border-orange-200", bar: "bg-orange-400",  ring: "border-orange-200", header: "from-orange-500 to-orange-600",  score: "text-orange-700" },
  Poor:           { badge: "bg-red-100 text-red-700 border-red-200",         bar: "bg-red-500",     ring: "border-red-200",    header: "from-red-600 to-rose-700",       score: "text-red-700" }
};

const SECTION_COLORS = {
  A: { bg: "bg-purple-50", icon: "bg-purple-100 text-purple-700", bar: "bg-purple-500", text: "text-purple-700" },
  B: { bg: "bg-blue-50",   icon: "bg-blue-100 text-blue-700",     bar: "bg-blue-500",   text: "text-blue-700" },
  C: { bg: "bg-green-50",  icon: "bg-green-100 text-green-700",   bar: "bg-green-500",  text: "text-green-700" },
  D: { bg: "bg-orange-50", icon: "bg-orange-100 text-orange-700", bar: "bg-orange-500", text: "text-orange-700" },
};

const SECTION_LABELS = { A: "Logical & IQ", B: "Decision Making", C: "Integrity", D: "Stress & Work Style" };

const pct = (score, total) => (total ? Math.round((score / total) * 100) : 0);
const barColor = (p) => p >= 90 ? "bg-green-500" : p >= 70 ? "bg-blue-500" : p >= 50 ? "bg-yellow-400" : "bg-red-500";
const formatTime = (s) => s ? `${Math.floor(s / 60)}m ${s % 60}s` : "—";
const formatDate = (d) => new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default function SubmissionView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getSubmission(id)
      .then(res => setSubmission(res.data))
      .catch(() => navigate("/admin/dashboard"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fb]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-700 mx-auto mb-3" />
        <p className="text-sm text-gray-400">Loading report...</p>
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
    <div className="min-h-screen bg-[#f8f9fb]">
      {/* ── Sticky navbar ── */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-5 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-brand-700 transition px-2 py-1.5 rounded-lg hover:bg-brand-50"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <div className="flex items-center gap-2">
            <RedBeanLogo size="sm" />
            <span className="text-sm font-semibold text-gray-700 hidden sm:block">Assessment Report</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 py-6 space-y-5">

        {/* ── Candidate header card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className={`bg-gradient-to-r ${gc.header} px-6 py-5`}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shrink-0">
                  <span className="text-2xl font-black text-white">{candidate.name.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">{candidate.name}</h1>
                  <div className="flex flex-wrap gap-3 mt-1 text-white/70 text-xs">
                    <span className="flex items-center gap-1"><Mail size={11} /> {candidate.email}</span>
                    {candidate.phone && <span className="flex items-center gap-1"><Phone size={11} /> {candidate.phone}</span>}
                  </div>
                </div>
              </div>

              {/* Score badge */}
              <div className="bg-white/15 backdrop-blur-sm border border-white/25 rounded-2xl px-8 py-4 text-center">
                <div className="text-5xl font-black text-white leading-none">{percentage}%</div>
                <div className="text-white/60 text-xs mt-1.5">{score} / {totalQuestions} correct</div>
                <div className={`mt-2.5 inline-block px-4 py-1 rounded-full text-xs font-bold border ${gc.badge}`}>{grade}</div>
              </div>
            </div>
          </div>

          {/* Meta info strip */}
          <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-100 flex flex-wrap gap-x-6 gap-y-1">
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <Calendar size={12} className="text-gray-400" />
              Submitted {formatDate(submittedAt)}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <Clock size={12} className="text-gray-400" />
              Time taken: {formatTime(timeTaken)}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <Award size={12} className="text-gray-400" />
              Grade: {grade}
            </span>
          </div>
        </div>

        {/* ── Section score cards ── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BarChart2 size={15} className="text-gray-500" />
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Section Breakdown</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(sectionScores || {}).map(([key, sec]) => {
              const p = pct(sec.score, sec.total);
              const sc = SECTION_COLORS[key] || SECTION_COLORS.A;
              return (
                <div key={key} className={`rounded-2xl border border-gray-100 shadow-sm p-4 ${sc.bg}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-8 h-8 rounded-xl ${sc.icon} flex items-center justify-center text-xs font-black`}>{key}</div>
                    <span className={`text-sm font-black ${sc.text}`}>{p}%</span>
                  </div>
                  <div className="text-2xl font-black text-gray-900 leading-none">
                    {sec.score}
                    <span className="text-sm font-normal text-gray-400">/{sec.total}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 mb-2.5 truncate">{sec.label || SECTION_LABELS[key]}</div>
                  <div className="w-full bg-white/60 rounded-full h-2">
                    <div className={`h-2 rounded-full ${sc.bar}`} style={{ width: `${p}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Detailed answers by section ── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <User size={15} className="text-gray-500" />
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Detailed Answers</h2>
          </div>
          <div className="space-y-4">
            {["A", "B", "C", "D"].filter(code => grouped[code]).map(sectionCode => {
              const qns = grouped[sectionCode];
              const correct = qns.filter(q => q.isCorrect).length;
              const p = pct(correct, qns.length);
              const sc = SECTION_COLORS[sectionCode] || SECTION_COLORS.A;

              return (
                <div key={sectionCode} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${sc.icon} flex items-center justify-center font-black text-sm`}>
                        {sectionCode}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-sm">{qns[0]?.section || SECTION_LABELS[sectionCode]}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{correct} of {qns.length} correct</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-gray-100 rounded-full h-1.5 hidden sm:block">
                        <div className={`h-1.5 rounded-full ${sc.bar}`} style={{ width: `${p}%` }} />
                      </div>
                      <div className={`text-sm font-black px-3 py-1.5 rounded-xl ${sc.icon}`}>{p}%</div>
                    </div>
                  </div>

                  <div className="divide-y divide-gray-50">
                    {qns.map((q, i) => {
                      const unanswered = q.selectedOption === null || q.selectedOption === undefined;
                      return (
                        <div
                          key={q.questionId}
                          className={`px-6 py-4 transition-colors ${
                            unanswered ? "" : q.isCorrect ? "bg-green-50/40" : "bg-red-50/30"
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className="shrink-0 mt-0.5">
                              {unanswered
                                ? <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center"><Minus size={12} className="text-gray-400" /></div>
                                : q.isCorrect
                                  ? <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center"><CheckCircle2 size={13} className="text-green-600" /></div>
                                  : <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center"><XCircle size={13} className="text-red-500" /></div>
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-800 leading-relaxed mb-2.5">
                                <span className="text-xs font-bold text-gray-400 mr-1.5">Q{i + 1}.</span>
                                {q.question}
                              </p>
                              <div className="flex flex-wrap gap-3 text-xs">
                                <span className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium ${
                                  unanswered ? "bg-gray-100 text-gray-500"
                                  : q.isCorrect ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-600"
                                }`}>
                                  {unanswered
                                    ? "Not answered"
                                    : `Your answer: Option ${String.fromCharCode(65 + q.selectedOption)}`
                                  }
                                </span>
                                {!q.isCorrect && !unanswered && (
                                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium bg-green-100 text-green-700">
                                    Correct: Option {String.fromCharCode(65 + q.correctAnswer)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
