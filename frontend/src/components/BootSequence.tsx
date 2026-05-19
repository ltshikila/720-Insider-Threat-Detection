import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";

const STORAGE_KEY = "soteria.booted";

const LINES = [
  "Initializing classification engine",
  "Loading Random Forest · 100 trees",
  "Calibrating SHAP explainer",
  "Linking 21-dimensional feature space",
  "Loading employee profile encoders",
  "Mounting confusion matrix telemetry",
  "Running self-diagnostic",
  "Establishing secure channel · localhost:8000",
  "Verifying inference endpoint",
  "Soteria online · standing by",
];

const LINE_INTERVAL_MS = 420;
const HOLD_AFTER_LAST_MS = 800;
const FADE_OUT_MS = 500;

type Phase = "hidden" | "booting" | "fading";

export default function BootSequence() {
  const [phase, setPhase] = useState<Phase>("hidden");
  const [step, setStep]   = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem(STORAGE_KEY) === "1") return;
    setPhase("booting");
  }, []);

  useEffect(() => {
    if (phase !== "booting") return;
    if (step < LINES.length) {
      const t = setTimeout(() => setStep((s) => s + 1), LINE_INTERVAL_MS);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setPhase("fading"), HOLD_AFTER_LAST_MS);
    return () => clearTimeout(t);
  }, [phase, step]);

  useEffect(() => {
    if (phase !== "fading") return;
    try { window.sessionStorage.setItem(STORAGE_KEY, "1"); } catch { /* ignore */ }
    const t = setTimeout(() => setPhase("hidden"), FADE_OUT_MS);
    return () => clearTimeout(t);
  }, [phase]);

  const skip = () => {
    try { window.sessionStorage.setItem(STORAGE_KEY, "1"); } catch { /* ignore */ }
    setPhase("fading");
  };

  if (phase === "hidden") return null;

  const progress = Math.min(1, step / LINES.length);

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#04061a] text-white overflow-hidden"
      style={{
        animation:
          phase === "fading"
            ? `boot-overlay-out ${FADE_OUT_MS}ms ease-out forwards`
            : "boot-overlay-in 0.3s ease-out forwards",
      }}
    >
      {/* Sweeping scan line for sci-fi flavour */}
      <div
        className="absolute left-0 right-0 h-px pointer-events-none"
        style={{
          background: "linear-gradient(90deg, transparent, #a5b4fc 50%, transparent)",
          boxShadow: "0 0 12px 1px #a5b4fc",
          animation: "boot-scan 2.4s linear infinite",
        }}
      />

      {/* Skip control */}
      <button
        type="button"
        onClick={skip}
        className="absolute top-5 right-6 text-[11px] tracking-[0.2em] text-gray-500 hover:text-white transition-colors font-mono uppercase"
      >
        Skip →
      </button>

      {/* HUD with concentric rings and shield */}
      <div className="relative w-44 h-44 mb-8">
        <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full" style={{ animation: "boot-ring-cw 9s linear infinite" }}>
          <circle cx="100" cy="100" r="94" fill="none" stroke="#a5b4fc" strokeWidth="1" strokeDasharray="2 8" opacity="0.7" />
          <circle cx="100" cy="100" r="94" fill="none" stroke="#c7d2fe" strokeWidth="1.5" strokeDasharray="40 360" />
        </svg>
        <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full" style={{ animation: "boot-ring-ccw 6s linear infinite" }}>
          <circle cx="100" cy="100" r="76" fill="none" stroke="#818cf8" strokeWidth="1" strokeDasharray="6 12" opacity="0.5" />
          <circle cx="100" cy="100" r="76" fill="none" stroke="#ffffff" strokeWidth="1" strokeDasharray="20 360" />
        </svg>
        <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full">
          <circle cx="100" cy="100" r="58" fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.25" />
        </svg>
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ animation: "boot-pulse 2.4s ease-in-out infinite" }}
        >
          <ShieldCheck
            size={56}
            strokeWidth={1.5}
            className="text-white"
            style={{ filter: "drop-shadow(0 0 12px rgba(165, 180, 252, 0.9))" }}
          />
        </div>
      </div>

      {/* Wordmark */}
      <h1 className="text-2xl font-semibold tracking-[0.4em] text-white">SOTERIA</h1>
      <p className="mt-1 text-[11px] tracking-[0.3em] uppercase text-indigo-300/70">Insider Threat Detection</p>

      {/* Boot log */}
      <div className="mt-10 w-[min(540px,90vw)] font-mono text-[12.5px] leading-6 text-gray-300 space-y-1">
        {LINES.slice(0, step).map((line, i) => (
          <div
            key={i}
            className="flex items-center gap-2"
            style={{ animation: "boot-line-in 0.25s ease-out backwards" }}
          >
            <span className="text-indigo-400">&gt;</span>
            <span className="flex-1">{line}</span>
            <span className="text-emerald-400">[OK]</span>
          </div>
        ))}
        {step < LINES.length && (
          <div className="flex items-center gap-2 text-indigo-300/60">
            <span className="text-indigo-400">&gt;</span>
            <span className="flex-1">{LINES[step]}</span>
            <span className="inline-flex gap-0.5">
              <span className="w-1 h-1 bg-indigo-400 rounded-full" style={{ animation: "boot-pulse 0.9s ease-in-out infinite" }} />
              <span className="w-1 h-1 bg-indigo-400 rounded-full" style={{ animation: "boot-pulse 0.9s ease-in-out 0.15s infinite" }} />
              <span className="w-1 h-1 bg-indigo-400 rounded-full" style={{ animation: "boot-pulse 0.9s ease-in-out 0.3s infinite" }} />
            </span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="mt-10 w-[min(540px,90vw)]">
        <div className="flex items-center justify-between text-[10px] tracking-[0.25em] font-mono uppercase text-gray-500 mb-2">
          <span>System check</span>
          <span>{Math.round(progress * 100)}%</span>
        </div>
        <div className="h-px bg-gray-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-400 to-white"
            style={{
              width: `${progress * 100}%`,
              transition: "width 0.25s ease-out",
              boxShadow: "0 0 8px rgba(165, 180, 252, 0.6)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
