import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminAPI } from "../../services/api";
import { ArrowLeft, CheckCircle2, XCircle, Minus, User, Mail, Phone, Briefcase } from "lucide-react";

const GRADE_BADGE = {
  Excellent: "bg-green-100 text-green-700 border-green-200",
  Good: "bg-blue-100 text-blue-700 border-blue-200",
  Average: "bg-yellow-100 text-yellow-700 border-yellow-200",
  "Below Average": "bg-orange-100 text-orange-700 border-orange-200",
  Poor: "bg-red-100 text-red-700 border-red-200"
};

const SECTION_LABELS = { A: "Logical & IQ Assessment", B: "Decision Making", C: "Integrity", D: "Stress & Work Style" };

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

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-700" /></div>;
  if (!submission) return null;

  const { candidate, answers, score, totalQuestions, percentage, grade, sectionScores, timeTaken, submittedAt } = submission;
  const grouped = (answers || []).reduce((acc, a) => {
    if (!acc[a.sectionCode]) acc[a.sectionCode] = [];
    acc[a.sectionCode].push(a);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate("/admin/dashboard")} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition">
          <ArrowLeft size={18} /> Back to Dashboard
        </button>

        {/* Header */}
        <div className="card mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{candidate.name}</h1>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1"><Mail size={14} />{candidate.email}</span>
                <span className="flex items-center gap-1"><Phone size={14} />{candidate.phone}</span>
                <span className="flex items-center gap-1"><Briefcase size={14} />{candidate.position}</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Submitted: {new Date(submittedAt).toLocaleString("en-IN")} | Time taken: {timeTaken ? `${Math.floor(timeTaken/60)}m ${timeTaken%60}s` : "—"}
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-gray-900">{percentage}%</div>
              <div className="text-sm text-gray-500">{score}/{totalQuestions} correct</div>
              <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-semibold border ${GRADE_BADGE[grade] || ""}`}>{grade}</span>
            </div>
          </div>
        </div>

        {/* Section scores */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {Object.entries(sectionScores || {}).map(([key, sec]) => {
            const pct = Math.round((sec.score / sec.total) * 100);
            return (
              <div key={key} className="card text-center p-4">
                <div className="text-2xl font-bold text-gray-900">{pct}%</div>
                <div className="text-xs text-gray-500 mt-1">{sec.label}</div>
                <div className="text-xs text-gray-400">{sec.score}/{sec.total}</div>
              </div>
            );
          })}
        </div>

        {/* Detailed answers by section */}
        {Object.entries(grouped).map(([sectionCode, qns]) => (
          <div key={sectionCode} className="card mb-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-3">
              Section {sectionCode} — {SECTION_LABELS[sectionCode]}
              <span className="ml-3 text-sm font-normal text-gray-500">
                ({qns.filter(q => q.isCorrect).length}/{qns.length} correct)
              </span>
            </h2>
            <div className="space-y-4">
              {qns.map((q, i) => {
                const options = answers.find(a => a.questionId === q.questionId)?.options || [];
                return (
                  <div key={q.questionId} className={`p-4 rounded-xl border-l-4 ${
                    q.selectedOption === null ? "border-gray-300 bg-gray-50" :
                    q.isCorrect ? "border-green-400 bg-green-50" : "border-red-400 bg-red-50"
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 mt-0.5">
                        {q.selectedOption === null ? <Minus size={18} className="text-gray-400" /> :
                         q.isCorrect ? <CheckCircle2 size={18} className="text-green-600" /> :
                         <XCircle size={18} className="text-red-500" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 mb-2">Q{q.questionId}. {q.question}</p>
                        <div className="text-sm space-y-1">
                          <div className={`${q.selectedOption !== null && !q.isCorrect ? "text-red-600" : "text-gray-500"}`}>
                            Candidate: <strong>{q.selectedOption !== null ? `Option ${String.fromCharCode(65 + q.selectedOption)}` : "Not answered"}</strong>
                          </div>
                          {!q.isCorrect && (
                            <div className="text-green-600">
                              Correct: <strong>Option {String.fromCharCode(65 + q.correctAnswer)}</strong>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
