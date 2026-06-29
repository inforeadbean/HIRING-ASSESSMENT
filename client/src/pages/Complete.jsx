import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

export default function Complete() {
  const navigate = useNavigate();

  useEffect(() => {
    const stored = sessionStorage.getItem("assessmentResult");
    if (!stored) { navigate("/"); return; }
    sessionStorage.removeItem("assessmentSession");
    sessionStorage.removeItem("assessmentResult");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center py-10 px-4">
      <div className="max-w-lg w-full">
        <div className="card text-center">
          <CheckCircle2 className="mx-auto text-green-500 mb-4" size={64} />
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Assessment Complete!</h1>
          <p className="text-gray-500 text-lg mb-6">Your responses have been submitted successfully.</p>
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-6 py-5">
            <p className="text-blue-800 font-medium text-base">Thank you for completing the assessment!</p>
            <p className="text-blue-600 text-sm mt-2">Our HR team will review your results and get back to you soon.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
