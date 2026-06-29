import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Trophy, Target, Clock } from "lucide-react";

const GRADE_CONFIG = {
  Excellent: { color: "text-green-600", bg: "bg-green-50", border: "border-green-200", emoji: "🏆" },
  Good: { color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", emoji: "👍" },
  Average: { color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200", emoji: "👌" },
  "Below Average": { color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", emoji: "📈" },
  Poor: { color: "text-red-600", bg: "bg-red-50", border: "border-red-200", emoji: "📚" }
};

export default function Complete() {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("assessmentResult");
    if (!stored) { navigate("/"); return; }
    setResult(JSON.parse(stored));
    sessionStorage.removeItem("assessmentSession");
    sessionStorage.removeItem("assessmentResult");
  }, [navigate]);

  if (!result) return null;

  const grade = GRADE_CONFIG[result.grade] || GRADE_CONFIG.Poor;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center py-10 px-4">
      <div className="max-w-2xl w-full">
        <div className="card text-center mb-6">
          <div className="text-5xl mb-4">{grade.emoji}</div>
          <CheckCircle2 className="mx-auto text-green-500 mb-3" size={48} />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Assessment Complete!</h1>
          <p className="text-gray-500">Your responses have been submitted successfully</p>

          {/* Score display */}
          <div className={`inline-flex flex-col items-center mt-6 px-10 py-6 rounded-2xl border-2 ${grade.bg} ${grade.border}`}>
            <div className={`text-6xl font-black ${grade.color}`}>{result.percentage}%</div>
            <div className={`text-2xl font-bold ${grade.color} mt-1`}>{result.grade}</div>
            <div className="text-gray-500 text-sm mt-1">{result.score} / {result.totalQuestions} correct</div>
          </div>
        </div>

        {/* Section breakdown */}
        <div className="card mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Target size={20} className="text-blue-600" /> Section-wise Performance
          </h2>
          <div className="space-y-4">
            {Object.entries(result.sectionScores || {}).map(([key, sec]) => {
              const pct = Math.round((sec.score / sec.total) * 100);
              return (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{sec.label}</span>
                    <span className="text-gray-500">{sec.score}/{sec.total} ({pct}%)</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all ${pct >= 80 ? "bg-green-500" : pct >= 60 ? "bg-blue-500" : pct >= 40 ? "bg-yellow-500" : "bg-red-500"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card text-center bg-blue-50 border-blue-200">
          <p className="text-blue-800 font-medium">Thank you for completing the assessment!</p>
          <p className="text-blue-600 text-sm mt-1">Our HR team will review your results and get back to you soon.</p>
        </div>
      </div>
    </div>
  );
}
