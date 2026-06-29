import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { assessmentAPI } from "../services/api";
import Timer from "../components/assessment/Timer";
import toast from "react-hot-toast";
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Clock } from "lucide-react";
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

  const handleSubmit = () => {
    submitAssessment();
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-brand-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-700 mx-auto mb-4" />
        <p className="text-gray-500">Loading questions...</p>
      </div>
    </div>
  );

  const q = questions[current];
  if (!q) return null;
  const answered = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RedBeanLogo size="sm" />
            <div>
              <div className="text-sm text-gray-500">Question {current + 1} of {questions.length}</div>
              <div className="font-semibold text-gray-800">{session.candidate?.name}</div>
            </div>
          </div>
          {timerEnabled ? (
            <Timer duration={timerMinutes * 60} onExpire={() => { toast.error("Time's up! Submitting..."); submitAssessment(); }} />
          ) : (
            <div className="flex items-center gap-1.5 text-sm text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">
              <Clock size={14} /> No time limit
            </div>
          )}
          <div className="text-right">
            <div className="text-sm text-gray-500">Answered</div>
            <div className="font-semibold text-gray-800">{answered}/{questions.length}</div>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-gray-200">
          <div className="h-1 bg-brand-700 transition-all" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-4 gap-6">
        {/* Question navigator */}
        <div className="col-span-1">
          <div className="card">
            <div className="text-sm font-semibold text-gray-700 mb-3">Questions</div>
            <div className="grid grid-cols-4 gap-1">
              {questions.map((_, i) => {
                const isAnswered = answers[questions[i]?.id] !== undefined;
                return (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`w-8 h-8 rounded text-xs font-semibold transition-colors ${
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
            <div className="mt-4 space-y-1 text-xs">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-brand-700" /> Current</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-green-100 border border-green-300" /> Answered</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-gray-100 border border-gray-300" /> Not answered</div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className={`text-xs font-medium mb-2 ${answered === questions.length ? "text-green-600" : "text-amber-600"}`}>
                {answered === questions.length ? "All questions answered!" : `${questions.length - answered} remaining`}
              </div>
              {answered === questions.length && (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full text-xs py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition disabled:opacity-60"
                >
                  {submitting ? "Submitting..." : "Submit Assessment ✓"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Question card */}
        <div className="col-span-3">
          <div className="card">
            <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 px-3 py-1 rounded-full text-xs font-medium mb-4">
              Section {q.sectionCode} — {SECTION_LABELS[q.sectionCode]}
            </div>

            <h2 className="text-lg font-semibold text-gray-900 mb-6 leading-relaxed">
              Q{current + 1}. {q.question}
            </h2>

            <div className="space-y-3 mb-8">
              {q.options.map((option, i) => {
                const selected = answers[q.id] === i;
                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all font-medium flex items-center gap-3 ${
                      selected
                        ? "border-brand-600 bg-brand-50 text-brand-900"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    {selected ? <CheckCircle2 size={20} className="text-brand-700 shrink-0" /> : <Circle size={20} className="text-gray-300 shrink-0" />}
                    <span className="font-medium text-gray-500 w-5">{String.fromCharCode(65 + i)}.</span>
                    {option}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <button
                onClick={() => setCurrent(c => Math.max(0, c - 1))}
                disabled={current === 0}
                className="btn-secondary flex items-center gap-2"
              >
                <ChevronLeft size={18} /> Previous
              </button>
              {current < questions.length - 1 ? (
                <button onClick={() => setCurrent(c => c + 1)} className="btn-primary flex items-center gap-2">
                  Next <ChevronRight size={18} />
                </button>
              ) : answered === questions.length ? (
                <button onClick={handleSubmit} disabled={submitting} className="btn-primary flex items-center gap-2 bg-green-600 hover:bg-green-700">
                  {submitting ? "Submitting..." : "Submit Assessment ✓"}
                </button>
              ) : (
                <div className="text-right">
                  <div className="text-xs text-amber-600 font-medium">{questions.length - answered} question(s) unanswered</div>
                  <div className="text-xs text-gray-400">Answer all to submit</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
