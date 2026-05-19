import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Papa from "papaparse";
import { classifyBatch, classifyEmployee, type ClassificationResult, type EmployeeRecord } from "@/lib/api";

const CHUNK_SIZE = 50;
const HISTORY_KEY = "aitds.history";
const HISTORY_LIMIT = 50;
const TOAST_TTL_MS = 6000;

export interface BatchRow extends ClassificationResult {
  _index: number;
  _dept: string;
  _pos: string;
}

export type BatchJob = {
  id: string;
  type: "batch";
  status: "running" | "done" | "error";
  startedAt: number;
  finishedAt?: number;
  error?: string;
  fileName: string;
  total: number;
  done: number;
  results?: BatchRow[];
};

export type AnalyseJob = {
  id: string;
  type: "analyse";
  status: "running" | "done" | "error";
  startedAt: number;
  finishedAt?: number;
  error?: string;
  input: EmployeeRecord;
  result?: ClassificationResult;
};

export type Job = BatchJob | AnalyseJob;

interface Toast {
  id: string;
  jobId: string;
  jobType: Job["type"];
  message: string;
  status: Job["status"];
}

interface JobsContextValue {
  batchJob: BatchJob | null;
  analyseJob: AnalyseJob | null;
  history: Job[];
  toasts: Toast[];
  runBatch: (file: File) => void;
  runAnalyse: (record: EmployeeRecord) => void;
  clearBatch: () => void;
  clearAnalyse: () => void;
  clearHistory: () => void;
  dismissToast: (id: string) => void;
}

const JobsContext = createContext<JobsContextValue | null>(null);

export function useJobs(): JobsContextValue {
  const ctx = useContext(JobsContext);
  if (!ctx) throw new Error("useJobs must be used inside <JobsProvider>");
  return ctx;
}

const newId = () => Math.random().toString(36).slice(2);

function parseRecords(data: Record<string, string>[]): EmployeeRecord[] {
  return data.map((r) => ({
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
}

export function JobsProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [batchJob, setBatchJob]     = useState<BatchJob | null>(null);
  const [analyseJob, setAnalyseJob] = useState<AnalyseJob | null>(null);
  const [history, setHistory]       = useState<Job[]>([]);
  const [toasts, setToasts]         = useState<Toast[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(HISTORY_KEY);
      if (raw) setHistory(JSON.parse(raw) as Job[]);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch { /* quota/serialization issues are non-fatal */ }
  }, [history]);

  const dismissToast = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const pushToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = newId();
    setToasts((t) => [...t, { ...toast, id }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), TOAST_TTL_MS);
  }, []);

  const finishJob = useCallback((job: Job, expectedPath: string) => {
    setHistory((h) => [job, ...h.filter((x) => x.id !== job.id)].slice(0, HISTORY_LIMIT));
    if (router.pathname !== expectedPath) {
      const message =
        job.status === "error"
          ? job.type === "batch" ? "Batch upload failed" : "Employee analysis failed"
          : job.type === "batch"
            ? `Batch finished: ${job.results?.length ?? 0} records classified`
            : `Analysis complete: ${job.result?.label}`;
      pushToast({ jobId: job.id, jobType: job.type, message, status: job.status });
    }
  }, [router.pathname, pushToast]);

  const runBatch = useCallback((file: File) => {
    const id = newId();
    const base = {
      id, type: "batch" as const, startedAt: Date.now(),
      fileName: file.name, total: 0, done: 0,
    };
    const initial: BatchJob = { ...base, status: "running" };
    setBatchJob(initial);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async ({ data }) => {
        if (data.length > 500) {
          const err: BatchJob = {
            ...initial, status: "error", finishedAt: Date.now(),
            error: `Your CSV has ${data.length.toLocaleString()} rows. The classifier accepts a maximum of 500 records per upload. Please split the file and try again.`,
          };
          setBatchJob(err);
          finishJob(err, "/batch");
          return;
        }
        try {
          const records = parseRecords(data);
          setBatchJob({ ...initial, total: records.length, done: 0 });

          const results: ClassificationResult[] = [];
          for (let i = 0; i < records.length; i += CHUNK_SIZE) {
            const chunk = records.slice(i, i + CHUNK_SIZE);
            const chunkResults = await classifyBatch(chunk);
            results.push(...chunkResults);
            setBatchJob((cur) =>
              cur && cur.id === id
                ? { ...cur, total: records.length, done: results.length }
                : cur
            );
          }

          const rows: BatchRow[] = results.map((res, i) => ({
            ...res,
            _index: i + 1,
            _dept: data[i].employee_department ?? "",
            _pos:  data[i].employee_position   ?? "",
          }));
          const done: BatchJob = {
            ...initial, status: "done", finishedAt: Date.now(),
            total: records.length, done: records.length, results: rows,
          };
          setBatchJob(done);
          finishJob(done, "/batch");
        } catch (e: unknown) {
          const err: BatchJob = {
            ...initial, status: "error", finishedAt: Date.now(),
            error: e instanceof Error ? e.message : "Batch classification failed",
          };
          setBatchJob(err);
          finishJob(err, "/batch");
        }
      },
      error: () => {
        const err: BatchJob = {
          ...initial, status: "error", finishedAt: Date.now(),
          error: "Failed to parse CSV",
        };
        setBatchJob(err);
        finishJob(err, "/batch");
      },
    });
  }, [finishJob]);

  const runAnalyse = useCallback(async (record: EmployeeRecord) => {
    const id = newId();
    const initial: AnalyseJob = {
      id, type: "analyse", status: "running", startedAt: Date.now(),
      input: record,
    };
    setAnalyseJob(initial);
    try {
      const result = await classifyEmployee(record);
      const done: AnalyseJob = {
        ...initial, status: "done", finishedAt: Date.now(), result,
      };
      setAnalyseJob(done);
      finishJob(done, "/analyse");
    } catch (e: unknown) {
      const err: AnalyseJob = {
        ...initial, status: "error", finishedAt: Date.now(),
        error: e instanceof Error ? e.message : "Failed to connect to API. Is FastAPI running?",
      };
      setAnalyseJob(err);
      finishJob(err, "/analyse");
    }
  }, [finishJob]);

  const clearBatch    = useCallback(() => setBatchJob(null), []);
  const clearAnalyse  = useCallback(() => setAnalyseJob(null), []);
  const clearHistory  = useCallback(() => setHistory([]), []);

  return (
    <JobsContext.Provider
      value={{
        batchJob, analyseJob, history, toasts,
        runBatch, runAnalyse,
        clearBatch, clearAnalyse, clearHistory,
        dismissToast,
      }}
    >
      {children}
    </JobsContext.Provider>
  );
}
