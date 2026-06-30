import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import RedBeanLogo from "../components/common/RedBeanLogo";

const GRADE_CONFIG = {
  Excellent:      { bg: "from-green-50 to-emerald-50",  badge: "bg-green-100 text-green-700 border-green-200",   bar: "bg-green-500",   score: "text-green-700"  },
  Good:           { bg: "from-blue-50 to-sky-50",        badge: "bg-blue-100 text-blue-700 border-blue-200",      bar: "bg-blue-500",    score: "text-blue-700"   },
  Average:        { bg: "from-yellow-50 to-amber-50",    badge: "bg-yellow-100 text-yellow-700 border-yellow-200", bar: "bg-yellow-500",  score: "text-yellow-700" },
  "Below Average":{ bg: "from-orange-50 to-amber-50",    badge: "bg-orange-100 text-orange-700 border-orange-200", bar: "bg-orange-500",  score: "text-orange-700" },
  Poor:           { bg: "from-red-50 to-rose-50",        badge: "bg-red-100 text-red-700 border-red-200",         bar: "bg-red-500",     score: "text-red-700"    }
};

const SECTION_KEYS = ["A", "B", "C", "D"];

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

  const { score, totalQuestions, percentage, grade, sectionScores } = result;
  const gc = GRADE_CONFIG[grade] || GRADE_CONFIG.Poor;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${gc.bg} via-white py-6 sm:py-10 px-4`}>
      <div className="max-w-xl mx-auto">
        {/* Logo */}
        <div className="flex justify-center mb-5 sm:mb-6">
          <RedBeanLogo size="md" />
        </div>

        {/* Result card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Success header */}
          <div className="bg-gradient-to-r from-brand-700 to-brand-800 px-4 sm:px-6 py-5 text-center">
            <CheckCircle2 className="mx-auto text-white/90 mb-2" size={36} />
            <h1 className="text-lg sm:text-xl font-bold text-white">Assessment Submitted!</h1>
            <p className="text-brand-200 text-xs sm:text-sm mt-1">Your responses have been recorded</p>
          </div>

          {/* Score section */}
          <div className="px-4 sm:px-6 py-5 sm:py-6 text-center border-b border-gray-100">
            <div className={`inline-flex flex-col items-center bg-gradient-to-br ${gc.bg} border ${gc.badge.split(" ").find(c => c.startsWith("border"))} rounded-2xl px-8 sm:px-10 py-5 sm:py-6`}>
              <div className={`text-5xl sm:text-6xl font-black leading-none ${gc.score}`}>{percentage}%</div>
              <div className="text-gray-500 text-xs sm:text-sm mt-2">{score} / {totalQuestions} correct</div>
              <div className={`mt-3 px-4 sm:px-5 py-1.5 rounded-full text-xs sm:text-sm font-bold border ${gc.badge}`}>{grade}</div>
            </div>
          </div>

          {/* Section breakdown */}
          {sectionScores && (
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 sm:mb-4">Section Breakdown</h3>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-2.5 sm:gap-3">
                {SECTION_KEYS.filter(k => sectionScores[k]).map(key => {
                  const sec = sectionScores[key];
                  const pct = Math.round((sec.score / sec.total) * 100);
                  const barCls = pct >= 90 ? "bg-green-500" : pct >= 70 ? "bg-blue-500" : pct >= 50 ? "bg-yellow-400" : "bg-red-500";
                  const labelCls = pct >= 70 ? "text-green-600 bg-green-50" : "text-red-500 bg-red-50";
                  return (
                    <div key={key} className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-gray-700">Sec {key}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${labelCls}`}>{pct}%</span>
                      </div>
                      <div className="text-[11px] text-gray-400 mb-2 truncate leading-tight">{sec.label}</div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${barCls}`} style={{ width: `${pct}%` }} />
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1">{sec.score}/{sec.total}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Thank you */}
          <div className="px-4 sm:px-6 py-4 sm:py-5 text-center">
            <p className="text-gray-700 font-medium text-sm">Thank you for completing the assessment!</p>
            <p className="text-gray-400 text-xs mt-1.5">Our HR team will review your results and reach out to you shortly.</p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-5 sm:mt-6">© Red Bean Hospitality · Food for Happiness</p>
      </div>
    </div>
  );
}
