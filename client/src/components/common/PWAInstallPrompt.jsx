import { useState, useEffect } from "react";
import { Download, X, Smartphone } from "lucide-react";

export default function PWAInstallPrompt() {
  const [prompt, setPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Don't show if already running as installed PWA
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    // Don't show if dismissed in this session
    if (sessionStorage.getItem("pwa-prompt-dismissed")) return;

    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
      // Small delay so it doesn't pop up immediately on load
      setTimeout(() => setShow(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setPrompt(null);
    setShow(false);
  };

  const handleDismiss = () => {
    sessionStorage.setItem("pwa-prompt-dismissed", "1");
    setShow(false);
  };

  if (!show || installed) return null;

  return (
    <div
      className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-4 sm:w-[340px] z-50 animate-in slide-in-from-bottom-4 duration-300"
      style={{ animation: "slideUp 0.3s ease-out" }}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header strip */}
        <div className="bg-gradient-to-r from-brand-700 to-brand-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
              <Smartphone size={16} className="text-white" />
            </div>
            <div>
              <p className="text-white text-sm font-bold leading-none">Install App</p>
              <p className="text-white/60 text-xs mt-0.5">Add to home screen</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white/70 hover:text-white transition"
            aria-label="Dismiss"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-3.5">
          <div className="flex items-start gap-3 mb-3.5">
            <img src="/icons/icon-192.svg" alt="App icon" className="w-12 h-12 rounded-xl shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-900">Red Bean Assessment</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                Install for quick access, offline support, and a native app experience on your device.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleDismiss}
              className="flex-1 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-500 hover:bg-gray-50 transition"
            >
              Not now
            </button>
            <button
              onClick={handleInstall}
              className="flex-1 py-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-xs font-bold text-white transition flex items-center justify-center gap-1.5"
            >
              <Download size={13} />
              Install
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
