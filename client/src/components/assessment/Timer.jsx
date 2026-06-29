import { useState, useEffect, useCallback } from "react";
import { Clock } from "lucide-react";

export default function Timer({ duration = 30 * 60, onExpire }) {
  const [seconds, setSeconds] = useState(duration);

  const tick = useCallback(() => {
    setSeconds(s => {
      if (s <= 1) { onExpire(); return 0; }
      return s - 1;
    });
  }, [onExpire]);

  useEffect(() => {
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tick]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const isWarning = seconds <= 5 * 60;
  const isCritical = seconds <= 60;

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold text-lg ${
      isCritical ? "bg-red-100 text-red-700 animate-pulse" :
      isWarning ? "bg-amber-100 text-amber-700" :
      "bg-brand-50 text-brand-700"
    }`}>
      <Clock size={18} />
      {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
    </div>
  );
}
