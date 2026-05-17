"use client";
import { useState, useCallback } from "react";
import { Upload, Loader2, Download, ShieldAlert, ShieldCheck, AlertCircle } from "lucide-react";
import Papa from "papaparse";
import { classifyBatch, type ClassificationResult, type EmployeeRecord } from "@/lib/api";

interface Row extends ClassificationResult { _index: number; _dept: string; _pos: string; }

export default function BatchPage() {
  const [rows, setRows]       = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const process = async (file: File) => {
    setError(null); setRows([]); setLoading(true);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async ({ data }) => {
        try {
          const records = data.map((r) => ({
            employee_department:        r.employee_department       ?? "Engineering Department",
            employee_position:          r.employee_position         ?? "Design Engineer",
            employee_campus:            r.employee_campus           ?? "Campus A",
            employee_origin_country:    r.employee_origin_country   ?? "South Africa",
            num_entries:                +(r.num_entries             ?? 0),
            num_unique_campus:          +(r.num_unique_campus       ?? 1),
            late_exit_flag:             +(r.late_exit_flag          ?? 0),
            entry_during_weekend:       +(r.entry_during_weekend    ?? 0),
            total_printed_pages:        +(r.total_printed_pages     ?? 0),
            num_printed_pages_off_hours:+(r.num_printed_pages_off_hours ?? 0),
            total_files_burned:         +(r.total_files_burned      ?? 0),
            burned_from_other:          +(r.burned_from_other       ?? 0),
            is_abroad:                  +(r.is_abroad               ?? 0),
            trip_day_number:            +(r.trip_day_number         ?? 0),
            hostility_country_level:    +(r.hostility_country_level ?? 0),
            employee_seniority_years:   +(r.employee_seniority_years ?? 5),
            employee_classification:    +(r.employee_classification ?? 2),
            has_criminal_record:        +(r.has_criminal_record     ?? 0),
            has_medical_history:        +(r.has_medical_history     ?? 0),
            has_foreign_citizenship:    +(r.has_foreign_citizenship ?? 0),
            is_contractor:              +(r.is_contractor           ?? 0),
          } as EmployeeRecord));

          const results = await classifyBatch(records);
          setRows(results.map((res, i) => ({
            ...res,
            _index: i + 1,
            _dept: data[i].employee_department ?? "",
            _pos:  data[i].employee_position   ?? "",
          })));
        } catch (e: unknown) {
          setError(e instanceof Error ? e.message : "Classification failed");
        } finally {
          setLoading(false);
        }
      },
      error: () => { setError("Failed to parse CSV"); setLoading(false); },
    });
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f?.name.endsWith(".csv")) process(f);
  }, []);

  const download = () => {
    const csv = ["#,Department,Position,Label,Confidence %,Top driver",
      ...rows.map((r) =>
        `${r._index},${r._dept},${r._pos},${r.label},${(r.confidence * 100).toFixed(1)},${r.top_drivers[0]?.feature ?? ""}`
      )].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "threat_classifications.csv";
    a.click();
  };

  const malCount = rows.filter((r) => r.label === "Malicious").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Batch upload</h1>
        <p className="text-sm text-gray-500 mt-1">Upload a CSV file in the dataset format to classify multiple records at once.</p>
      </div>

      <div
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-colors ${dragging ? "border-gray-400 bg-gray-50" : "border-gray-200 bg-white"}`}
      >
        <Upload size={24} className="mx-auto text-gray-300 mb-3" />
        <p className="text-sm text-gray-500">Drag and drop a CSV file, or</p>
        <label className="cursor-pointer">
          <span className="inline-block mt-2 text-sm font-medium text-gray-900 underline underline-offset-2">browse files</span>
          <input type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) process(f); }} />
        </label>
        <p className="text-xs text-gray-400 mt-2">Must match the dataset schema · max 500 records per batch</p>
      </div>

      {loading && (
        <div className="flex items-center gap-2.5 text-sm text-gray-500 p-4 bg-white border border-gray-200 rounded-xl">
          <Loader2 size={15} className="animate-spin" /> Classifying records…
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2.5 p-4 rounded-xl border border-[#F7C1C1] bg-[#FCEBEB]">
          <AlertCircle size={15} className="mt-0.5 flex-shrink-0 text-[#A32D2D]" />
          <p className="text-sm text-[#791F1F]">{error}</p>
        </div>
      )}

      {rows.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="card"><p className="text-xs text-gray-400">Total records</p><p className="text-2xl font-semibold text-gray-900 mt-1">{rows.length}</p></div>
            <div className="card border-[#F7C1C1]"><p className="text-xs text-gray-400">Flagged malicious</p><p className="text-2xl font-semibold text-[#A32D2D] mt-1">{malCount}</p></div>
            <div className="card border-[#C0DD97]"><p className="text-xs text-gray-400">Cleared benign</p><p className="text-2xl font-semibold text-[#3B6D11] mt-1">{rows.length - malCount}</p></div>
          </div>

          <div className="card p-0 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">Results</p>
              <button onClick={download} className="btn-secondary text-xs py-1.5 px-3 gap-1.5">
                <Download size={13} /> Download CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {["#","Department","Position","Label","Confidence","Top driver"].map((h) => (
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
                        <span className={r.label === "Malicious" ? "badge-malicious" : "badge-benign"}>
                          {r.label === "Malicious"
                            ? <><ShieldAlert size={10} /> Malicious</>
                            : <><ShieldCheck size={10} /> Benign</>}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-700 text-xs font-mono">{(r.confidence * 100).toFixed(1)}%</td>
                      <td className="px-4 py-2.5 text-gray-500 text-xs">{r.top_drivers[0]?.feature ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
