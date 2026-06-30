import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { assessmentAPI } from "../services/api";
import Timer from "../components/assessment/Timer";
import toast from "react-hot-toast";
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Clock, Grid3X3, X } from "lucide-react";
import RedBeanLogo from "../components/common/RedBeanLogo";

const SECTION_LABELS = { A: "Logical & IQ", B: "Decision Making", C: "Integrity", D: "Stress & Work Style" };

export default function Assessment() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [startTime] = useState(Date.now());
  const [showNavDrawer, setShowNavDrawer] = useState(false);

  const session = JSON.parse(sessionStorage.getItem("assessmentSession") || "{}");
  const timerMinutes = session.timerMinutes || 30;
  const timerEnabled = session.timerEnabled !== false;

  useEffect(() => {
    if (!session.sessionId) { navigate("/"); return; }
    const { position, experience } = session.candidate || {};
    assessmentAPI.getQuestions({ position, experience })
      .then(res => setQuestions(res.data.questions))
      .catch(() => toast.error("Failed to load questions"))
      .finally(() => setLoading(false));

    const warnOnLeave = (e) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", warnOnLeave);
    return () => window.removeEventListener("beforeunload", warnOnLeave);
  }, []);

  const handleAnswer = (optionIndex) => {
    setAnswers(prev => ({ ...prev, [questions[current].id]: optionIndex }));
  };

  const submitAssessment = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const formattedAnswers = Object.entries(answers).map(([id, selectedOption]) => ({
        questionId: id,
        selectedOption
      }));
      const timeTaken = Math.round((Date.now() - startTime) / 1000);
      const res = await assessmentAPI.submitAnswers({
        sessionId: session.sessionId,
        answers: formattedAnswers,
        timeTaken
      });
      sessionStorage.setItem("assessmentResult", JSON.stringify(res.data));
      navigate("/complete");
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed. Please try again.");
      setSubmitting(false);
    }
  }, [answers, session.sessionId, startTime, submitting, navigate]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-brand-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-700 mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Loading questions...</p>
      </div>
    </div>
  );

  const q = questions[current];
  if (!q) return null;
  const answered = Object.keys(answers).length;
  const allAnswered = answered === questions.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Top Bar ── */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3">

          {/* Left: logo + info */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <RedBeanLogo size="sm" />
            <div className="min-w-0">
              <div className="text-[11px] sm:text-xs text-gray-500 leading-none truncate">
                Q{current + 1}/{questions.length}
                <span className="hidden sm:inline"> · {session.candidate?.name}</span>
              </div>
              <div className="text-xs sm:text-sm font-semibold text-gray-800 truncate sm:hidden">
                {session.candidate?.name}
              </div>
            </div>
          </div>

          {/* Center: timer */}
          <div className="flex-shrink-0">
            {timerEnabled ? (
              <Timer duration={timerMinutes * 60} onExpire={() => { toast.error("Time's up! Submitting..."); submitAssessment(); }} />
            ) : (
              <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-100 px-2 sm:px-3 py-1.5 rounded-full whitespace-nowrap">
                <Clock size={12} />
                <span className="hidden xs:inline sm:inline">No limit</span>
              </div>
            )}
          </div>

          {/* Right: answered count + nav toggle */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="text-right hidden sm:block">
              <div className="text-xs text-gray-500">Answered</div>
              <div className="text-sm font-bold text-gray-800">{answered}/{questions.length}</div>
            </div>
            <div className={`text-xs font-bold px-2 py-1 rounded-full sm:hidden ${allAnswered ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
              {answered}/{questions.length}
            </div>
            {/* Mobile nav grid toggle */}
            <button
              onClick={() => setShowNavDrawer(v => !v)}
              className="md:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition flex-shrink-0"
              title="Question Navigator"
            >
              {showNavDrawer ? <X size={16} /> : <Grid3X3 size={16} />}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-200">
          <div className="h-1 bg-brand-700 transition-all duration-300" style={{ width: `${(answered / questions.length) * 100}%` }} />
        </div>
      </div>

      {/* ── Mobile navigator drawer ── */}
      {showNavDrawer && (
        <div className="md:hidden bg-white border-b border-gray-200 shadow-lg px-4 py-4">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Jump to question</div>
          <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5 mb-3">
            {questions.map((_, i) => {
              const isAnswered = answers[questions[i]?.id] !== undefined;
              return (
                <button
                  key={i}
                  onClick={() => { setCurrent(i); setShowNavDrawer(false); }}
                  className={`h-8 rounded-lg text-xs font-bold transition ${
                    i === current ? "bg-brand-700 text-white" :
                    isAnswered ? "bg-green-100 text-green-700" :
                    "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-brand-700" /> Current</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-green-100 border border-green-300" /> Done</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-gray-100 border border-gray-300" /> Pending</span>
          </div>
          {allAnswered && (
            <button
              onClick={submitAssessment}
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit Assessment ✓"}
            </button>
          )}
        </div>
      )}

      {/* ── Main content ── */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 flex flex-col md:grid md:grid-cols-4 md:items-start gap-4 sm:gap-5 md:gap-6">

        {/* ── Desktop sidebar navigator ── */}
        <div className="hidden md:block md:col-span-1">
          <div className="card sticky top-[60px]">
            <div className="text-sm font-semibold text-gray-700 mb-3">Questions</div>
            <div className="grid grid-cols-4 gap-1">
              {questions.map((_, i) => {
                const isAnswered = answers[questions[i]?.id] !== undefined;
                return (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    title={`Question ${i + 1}`}
                    className={`w-full aspect-square rounded text-xs font-semibold transition-colors ${
                      i === current ? "bg-brand-700 text-white" :
                      isAnswered ? "bg-green-100 text-green-700" :
                      "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 space-y-1 text-xs text-gray-500">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-brand-700" /> Current</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-green-100 border border-green-300" /> Answered</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-gray-100 border border-gray-300" /> Pending</div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className={`text-xs font-semibold mb-2 ${allAnswered ? "text-green-600" : "text-amber-600"}`}>
                {allAnswered ? "All answered!" : `${questions.length - answered} remaining`}
              </div>
              {allAnswered && (
                <button
                  onClick={submitAssessment}
                  disabled={submitting}
                  className="w-full text-xs py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition disabled:opacity-60"
                >
                  {submitting ? "Submitting..." : "Submit ✓"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Question card ── */}
        <div className="md:col-span-3">
          <div className="card">
            <div className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-700 px-3 py-1 rounded-full text-xs font-semibold mb-4">
              <span>Section {q.sectionCode}</span>
              <span className="text-brand-400">·</span>
              <span className="hidden sm:inline">{SECTION_LABELS[q.sectionCode]}</span>
              <span className="sm:hidden">{q.sectionCode === "A" ? "Logical" : q.sectionCode === "B" ? "Decision" : q.sectionCode === "C" ? "Integrity" : "Work Style"}</span>
            </div>

            <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-5 leading-relaxed">
              Q{current + 1}. {q.question}
            </h2>

            <div className="space-y-2 sm:space-y-3 mb-5 sm:mb-8">
              {q.options.map((option, i) => {
                const selected = answers[q.id] === i;
                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    className={`w-full text-left px-3 sm:px-5 py-3 sm:py-4 rounded-xl border-2 transition-all flex items-center gap-2 sm:gap-3 ${
                      selected
                        ? "border-brand-600 bg-brand-50 text-brand-900"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    {selected
                      ? <CheckCircle2 size={18} className="text-brand-700 shrink-0" />
                      : <Circle size={18} className="text-gray-300 shrink-0" />
                    }
                    <span className="font-semibold text-gray-400 w-5 shrink-0 text-sm">{String.fromCharCode(65 + i)}.</span>
                    <span className="text-sm leading-snug">{option}</span>
                  </button>
                );
              })}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between border-t pt-4 gap-2">
              <button
                onClick={() => setCurrent(c => Math.max(0, c - 1))}
                disabled={current === 0}
                className="btn-secondary flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-sm disabled:opacity-40"
              >
                <ChevronLeft size={16} />
                <span className="hidden sm:inline">Previous</span>
              </button>

              <span className="text-xs text-gray-400 md:hidden">
                {answered}/{questions.length} answered
              </span>

              {current < questions.length - 1 ? (
                <button
                  onClick={() => setCurrent(c => c + 1)}
                  className="btn-primary flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-sm"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight size={16} />
                </button>
              ) : allAnswered ? (
                <button
                  onClick={submitAssessment}
                  disabled={submitting}
                  className="btn-primary flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-sm bg-green-600 hover:bg-green-700"
                >
                  {submitting ? "Submitting..." : "Submit ✓"}
                </button>
              ) : (
                <div className="text-right">
                  <div className="text-xs text-amber-600 font-semibold">{questions.length - answered} unanswered</div>
                  <div className="text-[10px] text-gray-400 hidden sm:block">Answer all to submit</div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile-only prominent submit button when all answered */}
          {allAnswered && (
            <div className="md:hidden mt-3">
              <button
                onClick={submitAssessment}
                disabled={submitting}
                className="w-full py-4 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold text-base transition disabled:opacity-60 shadow-lg shadow-green-200"
              >
                {submitting ? "Submitting..." : "Submit Assessment ✓"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
