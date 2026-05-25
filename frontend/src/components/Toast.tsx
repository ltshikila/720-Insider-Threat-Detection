import Link from "next/link";
import { X, ShieldCheck, AlertCircle, ArrowUpRight } from "lucide-react";
import { useJobs } from "@/lib/jobs";

const TTL_MS = 6000;

export default function ToastOutlet() {
  const { toasts, dismissToast } = useJobs();

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => {
        const href = t.jobType === "batch" ? "/batch" : "/analyse";
        const isError = t.status === "error";
        const Icon = isError ? AlertCircle : ShieldCheck;
        const accentBg   = isError ? "bg-[#A32D2D]"  : "bg-[#3B6D11]";
        const accentText = isError ? "text-[#A32D2D]" : "text-[#3B6D11]";
        const accentBgLight = isError ? "bg-[#FCEBEB]" : "bg-[#EAF3DE]";
        const title = isError
          ? "Failed"
          : t.jobType === "batch" ? "Batch complete" : "Analysis complete";

        return (
          <Link
            key={t.id}
            href={href}
            onClick={() => dismissToast(t.id)}
            className="pointer-events-auto group relative flex items-start gap-3.5 min-w-[360px] max-w-md pl-5 pr-4 py-4 rounded-xl bg-white shadow-2xl border border-gray-200 hover:border-gray-300 hover:-translate-y-0.5 transition-all overflow-hidden"
            style={{ animation: "toast-in 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) backwards" }}
          >
            {/* Left accent bar */}
            <span className={`absolute left-0 top-0 bottom-0 w-1 ${accentBg}`} />

            {/* Icon in a colored chip */}
            <span className={`flex-shrink-0 w-9 h-9 rounded-lg ${accentBgLight} flex items-center justify-center`}>
              <Icon size={18} className={accentText} />
            </span>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 leading-tight">{title}</p>
              <p className="text-xs text-gray-600 mt-1 leading-snug">{t.message}</p>
              <p className="text-[11px] font-medium text-gray-900 mt-2 inline-flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                View results <ArrowUpRight size={11} />
              </p>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                dismissToast(t.id);
              }}
              className="flex-shrink-0 text-gray-300 hover:text-gray-600 transition-colors -mt-0.5"
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>

            {/* Auto-dismiss countdown bar */}
            <span
              className={`absolute left-0 right-0 bottom-0 h-0.5 ${accentBg} opacity-30`}
              style={{
                animation: `toast-countdown ${TTL_MS}ms linear forwards`,
                transformOrigin: "left",
              }}
            />
          </Link>
        );
      })}

      <style jsx global>{`
        @keyframes toast-in {
          0%   { opacity: 0; transform: translateX(40px) scale(0.95); }
          60%  { opacity: 1; }
          100% { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes toast-countdown {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }
      `}</style>
    </div>
  );
}
