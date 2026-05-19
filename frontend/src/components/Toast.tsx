import Link from "next/link";
import { X, ShieldCheck, AlertCircle } from "lucide-react";
import { useJobs } from "@/lib/jobs";

export default function ToastOutlet() {
  const { toasts, dismissToast } = useJobs();

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => {
        const href = t.jobType === "batch" ? "/batch" : "/analyse";
        const isError = t.status === "error";
        const Icon = isError ? AlertCircle : ShieldCheck;
        return (
          <Link
            key={t.id}
            href={href}
            onClick={() => dismissToast(t.id)}
            className={`pointer-events-auto flex items-start gap-3 min-w-[280px] max-w-sm px-4 py-3 rounded-xl shadow-lg border bg-white ${
              isError ? "border-[#F7C1C1]" : "border-gray-200"
            } hover:border-gray-300 transition-colors`}
            style={{ animation: "toast-in 0.25s ease-out" }}
          >
            <Icon
              size={16}
              className={`mt-0.5 flex-shrink-0 ${isError ? "text-[#A32D2D]" : "text-[#3B6D11]"}`}
            />
            <span className="flex-1 text-sm text-gray-700 leading-snug">{t.message}</span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                dismissToast(t.id);
              }}
              className="flex-shrink-0 text-gray-300 hover:text-gray-600 transition-colors"
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </Link>
        );
      })}
      <style jsx global>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
