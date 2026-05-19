import { useCallback, useState } from "react";
import { Upload, Loader2, Download, ShieldAlert, ShieldCheck, AlertCircle } from "lucide-react";
import { CountUp } from "@/lib/useCountUp";
import { useJobs, type BatchRow } from "@/lib/jobs";

export default function BatchPage() {
  const { batchJob, runBatch, clearBatch } = useJobs();
  const [dragging, setDragging] = useState(false);

  const startUpload = useCallback((f: File) => {
    if (!f.name.endsWith(".csv")) return;
    runBatch(f);
  }, [runBatch]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) startUpload(f);
  }, [startUpload]);

  const isRunning = batchJob?.status === "running";
  const rows = batchJob?.status === "done" ? batchJob.results ?? [] : [];
  const error = batchJob?.status === "error" ? batchJob.error : null;
  const progress = batchJob?.status === "running" ? { done: batchJob.done, total: batchJob.total } : { done: 0, total: 0 };
  const malCount = rows.filter((r) => r.label === "Malicious").length;

  const download = () => {
    if (rows.length === 0) return;
    const csv = ["#,Department,Position,Label,Confidence %,Top risk factor",
      ...rows.map((r) =>
        `${r._index},${r._dept},${r._pos},${r.label},${(r.confidence * 100).toFixed(1)},${r.top_drivers[0]?.feature ?? ""}`
      )].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "threat_classifications.csv";
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="section section-d0 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Batch upload</h1>
          <p className="text-sm text-gray-500 mt-1">Upload a CSV file in the dataset format to classify multiple records at once.</p>
        </div>
        {batchJob && batchJob.status !== "running" && (
          <button
            type="button"
            onClick={clearBatch}
            className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <div
        onDrop={onDrop}
        onDragOver={(e) => { if (!isRunning) { e.preventDefault(); setDragging(true); } }}
        onDragLeave={() => setDragging(false)}
        className={`section section-d1 relative border-2 border-dashed rounded-xl p-10 text-center transition-colors ${
          isRunning
            ? "border-gray-200 bg-gray-50 opacity-60 pointer-events-none"
            : dragging ? "border-gray-400 bg-gray-50" : "border-gray-200 bg-white"
        }`}
      >
        <Upload size={24} className="mx-auto text-gray-300 mb-3" />
        <p className="text-sm text-gray-500">Drag and drop a CSV file, or</p>
        <label className={isRunning ? "" : "cursor-pointer"}>
          <span className="inline-block mt-2 text-sm font-medium text-gray-900 underline underline-offset-2">browse files</span>
          <input
            type="file"
            accept=".csv"
            className="hidden"
            disabled={isRunning}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) startUpload(f); }}
          />
        </label>
        <p className="text-xs text-gray-400 mt-2">CSV must have the same columns as the training dataset · max 500 records per batch</p>
      </div>

      {isRunning && (
        <div className="section section-d2 p-4 bg-white border border-gray-200 rounded-xl">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span className="flex items-center gap-2.5">
              <Loader2 size={15} className="animate-spin text-gray-500" />
              Classifying {batchJob.fileName}...
            </span>
            <span className="font-mono text-xs text-gray-500">
              {progress.total > 0
                ? `${progress.done} / ${progress.total} (${Math.round((progress.done / progress.total) * 100)}%)`
                : "preparing..."}
            </span>
          </div>
          <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gray-900 transition-all duration-200 ease-out"
              style={{ width: progress.total > 0 ? `${(progress.done / progress.total) * 100}%` : "0%" }}
            />
          </div>
          <p className="text-[11px] text-gray-400 mt-3">You can leave this page; the job will keep running and you&apos;ll get a notification when it finishes.</p>
        </div>
      )}

      {error && (
        <div className="section section-d2 flex items-start gap-2.5 p-4 rounded-xl border border-[#F7C1C1] bg-[#FCEBEB]">
          <AlertCircle size={15} className="mt-0.5 flex-shrink-0 text-[#A32D2D]" />
          <p className="text-sm text-[#791F1F]">{error}</p>
        </div>
      )}

      {rows.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3 section section-d2">
            <div className="card"><p className="text-xs text-gray-400">Total records</p><p className="text-2xl font-semibold text-gray-900 mt-1"><CountUp value={rows.length} format="integer" /></p></div>
            <div className="card border-[#F7C1C1]"><p className="text-xs text-gray-400">Flagged malicious</p><p className="text-2xl font-semibold text-[#A32D2D] mt-1"><CountUp value={malCount} format="integer" /></p></div>
            <div className="card border-[#C0DD97]"><p className="text-xs text-gray-400">Cleared benign</p><p className="text-2xl font-semibold text-[#3B6D11] mt-1"><CountUp value={rows.length - malCount} format="integer" /></p></div>
          </div>

          <ResultsTable rows={rows} onDownload={download} />
        </div>
      )}
    </div>
  );
}

export function ResultsTable({ rows, onDownload }: { rows: BatchRow[]; onDownload?: () => void }) {
  return (
    <div className="card p-0 overflow-hidden section section-d3">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
        <p className="text-sm font-medium text-gray-900">Results</p>
        {onDownload && (
          <button
            type="button"
            onClick={onDownload}
            className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 py-1.5 px-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <Download size={13} /> Download CSV
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["#","Department","Position","Label","Confidence","Top risk factor"].map((h) => (
                <th key={h} className="text-left text-xs font-medium text-gray-400 px-4 py-2.5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map((r) => (
              <tr key={r._index} className={r.label === "Malicious" ? "bg-[#FCEBEB]/40" : ""}>
                <td className="px-4 py-2.5 text-gray-400 text-xs">{r._index}</td>
                <td className="px-4 py-2.5 text-gray-600 text-xs max-w-[140px] truncate">{r._dept}</td>
                <td className="px-4 py-2.5 text-gray-600 text-xs max-w-[140px] truncate">{r._pos}</td>
                <td className="px-4 py-2.5">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                      r.label === "Malicious"
                        ? "bg-[#FCEBEB] text-[#A32D2D]"
                        : "bg-[#EAF3DE] text-[#3B6D11]"
                    }`}
                  >
                    {r.label === "Malicious"
                      ? <><ShieldAlert size={10} /> Malicious</>
                      : <><ShieldCheck size={10} /> Benign</>}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-gray-700 text-xs font-mono">{(r.confidence * 100).toFixed(1)}%</td>
                <td className="px-4 py-2.5 text-gray-500 text-xs">{r.top_drivers[0]?.feature ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
