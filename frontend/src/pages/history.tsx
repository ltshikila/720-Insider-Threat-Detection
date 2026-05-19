import { useState } from "react";
import { Clock, Search, Upload, ShieldAlert, ShieldCheck, ChevronDown, ChevronRight, AlertCircle, Trash2 } from "lucide-react";
import { useJobs, type Job, type BatchJob, type AnalyseJob } from "@/lib/jobs";
import { ResultsTable } from "@/pages/batch";

function formatTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatDuration(start: number, end?: number) {
  if (!end) return "";
  const ms = end - start;
  if (ms < 1000) return `${ms} ms`;
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)}s`;
  return `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`;
}

export default function HistoryPage() {
  const { history, clearHistory } = useJobs();
  const [openId, setOpenId] = useState<string | null>(null);

  const total = history.length;

  return (
    <div className="space-y-6">
      <div className="section section-d0 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">History</h1>
          <p className="text-sm text-gray-500 mt-1">
            {total === 0
              ? "No past runs yet."
              : `${total} past run${total === 1 ? "" : "s"} · stored locally in your browser only.`}
          </p>
        </div>
        {total > 0 && (
          <button
            type="button"
            onClick={() => { if (confirm("Clear all history?")) clearHistory(); }}
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#A32D2D] transition-colors"
          >
            <Trash2 size={13} /> Clear all
          </button>
        )}
      </div>

      {total === 0 ? (
        <div className="card text-center py-12 section section-d1">
          <Clock size={24} className="mx-auto text-gray-300 mb-2" />
          <p className="text-sm text-gray-500">No runs yet.</p>
          <p className="text-xs text-gray-400 mt-1">Start an analysis or upload a batch to see entries here.</p>
        </div>
      ) : (
        <div className="space-y-2 section section-d1">
          {history.map((job) => (
            <HistoryEntry
              key={job.id}
              job={job}
              open={openId === job.id}
              onToggle={() => setOpenId((cur) => (cur === job.id ? null : job.id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function HistoryEntry({ job, open, onToggle }: { job: Job; open: boolean; onToggle: () => void }) {
  const isBatch = job.type === "batch";
  const Icon = isBatch ? Upload : Search;
  const isError = job.status === "error";

  return (
    <div className="card p-0 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
      >
        {open ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
        <Icon size={15} className="text-gray-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">
              {isBatch ? `Batch · ${(job as BatchJob).fileName}` : "Employee analysis"}
            </span>
            {isError && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#FCEBEB] text-[#A32D2D]">
                <AlertCircle size={10} /> Failed
              </span>
            )}
            {!isError && !isBatch && (job as AnalyseJob).result && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  (job as AnalyseJob).result!.label === "Malicious"
                    ? "bg-[#FCEBEB] text-[#A32D2D]"
                    : "bg-[#EAF3DE] text-[#3B6D11]"
                }`}
              >
                {(job as AnalyseJob).result!.label === "Malicious"
                  ? <><ShieldAlert size={10} /> Malicious</>
                  : <><ShieldCheck size={10} /> Benign</>}
              </span>
            )}
            {!isError && isBatch && (job as BatchJob).results && (
              <span className="text-xs text-gray-500">
                {(job as BatchJob).results!.filter((r) => r.label === "Malicious").length} flagged of {(job as BatchJob).results!.length}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {formatTime(job.startedAt)}
            {job.finishedAt && ` · took ${formatDuration(job.startedAt, job.finishedAt)}`}
          </p>
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50/50">
          {isBatch ? <BatchDetails job={job as BatchJob} /> : <AnalyseDetails job={job as AnalyseJob} />}
        </div>
      )}
    </div>
  );
}

function BatchDetails({ job }: { job: BatchJob }) {
  if (job.status === "error") {
    return (
      <div className="flex items-start gap-2.5 p-3 mt-2 rounded-lg border border-[#F7C1C1] bg-[#FCEBEB]">
        <AlertCircle size={14} className="mt-0.5 flex-shrink-0 text-[#A32D2D]" />
        <p className="text-sm text-[#791F1F]">{job.error}</p>
      </div>
    );
  }
  if (!job.results || job.results.length === 0) {
    return <p className="text-sm text-gray-400 py-3">No results.</p>;
  }
  const malCount = job.results.filter((r) => r.label === "Malicious").length;
  return (
    <div className="space-y-3 mt-2">
      <div className="grid grid-cols-3 gap-3">
        <div className="card"><p className="text-xs text-gray-400">Total</p><p className="text-xl font-semibold text-gray-900 mt-1">{job.results.length}</p></div>
        <div className="card border-[#F7C1C1]"><p className="text-xs text-gray-400">Flagged malicious</p><p className="text-xl font-semibold text-[#A32D2D] mt-1">{malCount}</p></div>
        <div className="card border-[#C0DD97]"><p className="text-xs text-gray-400">Cleared benign</p><p className="text-xl font-semibold text-[#3B6D11] mt-1">{job.results.length - malCount}</p></div>
      </div>
      <ResultsTable rows={job.results} />
    </div>
  );
}

function AnalyseDetails({ job }: { job: AnalyseJob }) {
  if (job.status === "error") {
    return (
      <div className="flex items-start gap-2.5 p-3 mt-2 rounded-lg border border-[#F7C1C1] bg-[#FCEBEB]">
        <AlertCircle size={14} className="mt-0.5 flex-shrink-0 text-[#A32D2D]" />
        <p className="text-sm text-[#791F1F]">{job.error}</p>
      </div>
    );
  }
  if (!job.result) return <p className="text-sm text-gray-400 py-3">No result.</p>;
  const r = job.result;
  const isMal = r.label === "Malicious";

  return (
    <div className="space-y-3 mt-2">
      <div className={`card border-l-4 ${isMal ? "border-l-[#E24B4A]" : "border-l-[#639922]"}`}>
        <div className="flex items-center gap-2.5 mb-3">
          {isMal ? <ShieldAlert size={18} className="text-[#A32D2D]" /> : <ShieldCheck size={18} className="text-[#3B6D11]" />}
          <h3 className="text-sm font-semibold text-gray-900">
            {isMal ? "Malicious activity detected" : "Behaviour appears normal"}
          </h3>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white rounded-lg p-3 border border-gray-100">
            <p className="text-[11px] text-gray-400">Classification</p>
            <p className="text-base font-semibold text-gray-900 mt-0.5">{r.label}</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-100">
            <p className="text-[11px] text-gray-400">Malicious confidence</p>
            <p className="text-base font-semibold text-gray-900 mt-0.5">{(r.confidence * 100).toFixed(1)}%</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-100">
            <p className="text-[11px] text-gray-400">Benign confidence</p>
            <p className="text-base font-semibold text-gray-900 mt-0.5">{((1 - r.confidence) * 100).toFixed(1)}%</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">{r.summary}</p>
      </div>

      <div className="card">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Top risk drivers</h3>
        <div className="space-y-2">
          {r.top_drivers.map((d, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{i + 1}. {d.feature}</span>
              <span className={`text-xs font-medium ${d.direction === "malicious" ? "text-[#185FA5]" : "text-[#A32D2D]"}`}>
                {d.shap_value > 0 ? "+" : ""}{d.shap_value.toFixed(3)} influence · toward {d.direction}
              </span>
            </div>
          ))}
        </div>
      </div>

      <details className="card">
        <summary className="text-sm font-medium text-gray-900 cursor-pointer">Input snapshot</summary>
        <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
          {Object.entries(job.input).map(([k, v]) => (
            <div key={k} className="flex justify-between border-b border-gray-100 py-1">
              <span className="text-gray-500">{k}</span>
              <span className="font-mono text-gray-700">{String(v)}</span>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
