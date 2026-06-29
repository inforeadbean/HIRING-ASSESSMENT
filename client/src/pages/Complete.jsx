import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import RedBeanLogo from "../components/common/RedBeanLogo";

export default function Complete() {
  const navigate = useNavigate();

  useEffect(() => {
    const stored = sessionStorage.getItem("assessmentResult");
    if (!stored) { navigate("/"); return; }
    sessionStorage.removeItem("assessmentSession");
    sessionStorage.removeItem("assessmentResult");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-red-50 flex items-center justify-center py-10 px-4">
      <div className="max-w-lg w-full">
        <div className="card text-center">
          <div className="flex justify-center mb-4">
            <RedBeanLogo size="md" />
          </div>
          <CheckCircle2 className="mx-auto text-green-500 mb-4 mt-2" size={56} />
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Assessment Complete!</h1>
          <p className="text-gray-500 text-lg mb-6">Your responses have been submitted successfully.</p>
          <div className="bg-brand-50 border border-brand-200 rounded-xl px-6 py-5">
            <p className="text-brand-800 font-medium text-base">Thank you for completing the assessment!</p>
            <p className="text-brand-700 text-sm mt-2">Our HR team will review your results and get back to you soon.</p>
          </div>
          <p className="text-xs text-gray-400 mt-6">© Red Bean Hospitality · Food for Happiness</p>
        </div>
      </div>
    </div>
  );
}
