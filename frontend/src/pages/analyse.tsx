import { useState, useEffect } from "react";
import { ShieldAlert, ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import { getMeta, type EmployeeRecord } from "@/lib/api";
import { useJobs } from "@/lib/jobs";
import dynamic from "next/dynamic";

const ShapChart = dynamic(() => import("@/components/ShapChart"), { ssr: false });

const DEFAULT: EmployeeRecord = {
  employee_department: "Engineering Department",
  employee_position: "Design Engineer",
  employee_campus: "Campus A",
  employee_origin_country: "South Africa",
  num_entries: 10,
  num_unique_campus: 1,
  late_exit_flag: 0,
  entry_during_weekend: 0,
  total_printed_pages: 0,
  num_printed_pages_off_hours: 0,
  total_files_burned: 0,
  burned_from_other: 0,
  is_abroad: 0,
  trip_day_number: 0,
  hostility_country_level: 0,
  employee_seniority_years: 5,
  employee_classification: 2,
  has_criminal_record: 0,
  has_medical_history: 0,
  has_foreign_citizenship: 0,
  is_contractor: 0,
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${checked ? "bg-gray-900" : "bg-gray-200"}`}
    >
      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${checked ? "translate-x-4" : "translate-x-1"}`} />
    </button>
  );
}

export default function AnalysePage() {
  const { analyseJob, runAnalyse, clearAnalyse } = useJobs();
  const [form, setForm] = useState<EmployeeRecord>(DEFAULT);
  const [meta, setMeta] = useState<{ departments: string[]; positions: string[]; campuses: string[]; countries: string[] } | null>(null);

  useEffect(() => { getMeta().then(setMeta).catch(() => {}); }, []);

  const set = (k: keyof EmployeeRecord, v: string | number) =>
    setForm((f) => ({ ...f, [k]: v }));

  const loading = analyseJob?.status === "running";
  const result  = analyseJob?.status === "done"  ? analyseJob.result : null;
  const error   = analyseJob?.status === "error" ? analyseJob.error  : null;
  const isMalicious = result?.label === "Malicious";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    runAnalyse(form);
  };

  return (
    <div className="space-y-6">
      <div className="section section-d0 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Analyse employee</h1>
          <p className="text-sm text-gray-500 mt-1">Fill in the employee&apos;s behavioural profile and run the classifier.</p>
        </div>
        {analyseJob && analyseJob.status !== "running" && (
          <button
            type="button"
            onClick={clearAnalyse}
            className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <form onSubmit={submit} className="space-y-6">
        {/* Role & location */}
        <div className="card space-y-4 section section-d1">
          <h2 className="text-sm font-medium text-gray-900">Role &amp; location</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Department">
              <select className="input-field" value={form.employee_department} onChange={(e) => set("employee_department", e.target.value)}>
                {(meta?.departments ?? ["Engineering Department"]).map((d) => <option key={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Position">
              <select className="input-field" value={form.employee_position} onChange={(e) => set("employee_position", e.target.value)}>
                {(meta?.positions ?? ["Design Engineer"]).map((p) => <option key={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Campus">
              <select className="input-field" value={form.employee_campus} onChange={(e) => set("employee_campus", e.target.value)}>
                {(meta?.campuses ?? ["Campus A"]).map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Origin country">
              <select className="input-field" value={form.employee_origin_country} onChange={(e) => set("employee_origin_country", e.target.value)}>
                {(meta?.countries ?? ["South Africa"]).map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Seniority (years)">
              <input type="number" min={0} max={40} className="input-field" value={form.employee_seniority_years}
                onChange={(e) => set("employee_seniority_years", +e.target.value)} />
            </Field>
            <Field label="Security clearance level">
              <input type="number" min={1} max={4} className="input-field" value={form.employee_classification}
                onChange={(e) => set("employee_classification", +e.target.value)} />
              <p className="text-[11px] text-gray-400 mt-1">1 = lowest clearance, 4 = highest</p>
            </Field>
          </div>
          <div className="grid grid-cols-4 gap-4 pt-1">
            {([ ["Is contractor", "is_contractor"], ["Criminal record", "has_criminal_record"],
                ["Foreign citizenship", "has_foreign_citizenship"], ["Medical history", "has_medical_history"] ] as [string, keyof EmployeeRecord][])
              .map(([label, key]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{label}</span>
                  <Toggle checked={form[key] === 1} onChange={(v) => set(key, v ? 1 : 0)} />
                </div>
              ))}
          </div>
        </div>

        {/* Access behaviour */}
        <div className="card space-y-4 section section-d2">
          <h2 className="text-sm font-medium text-gray-900">Access behaviour</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Number of badge entries">
              <input type="number" min={0} className="input-field" value={form.num_entries}
                onChange={(e) => set("num_entries", +e.target.value)} />
            </Field>
            <Field label="Unique campuses visited">
              <input type="number" min={1} max={3} className="input-field" value={form.num_unique_campus}
                onChange={(e) => set("num_unique_campus", +e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {([ ["Late exit (left after hours)", "late_exit_flag"], ["Entered during weekend", "entry_during_weekend"] ] as [string, keyof EmployeeRecord][])
              .map(([label, key]) => (
                <div key={key} className="flex items-center justify-between border border-gray-100 rounded-lg px-3 py-2.5">
                  <span className="text-sm text-gray-600">{label}</span>
                  <Toggle checked={form[key] === 1} onChange={(v) => set(key, v ? 1 : 0)} />
                </div>
              ))}
          </div>
        </div>

        {/* Data handling */}
        <div className="card space-y-4 section section-d3">
          <h2 className="text-sm font-medium text-gray-900">Data handling</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Total pages printed">
              <input type="number" min={0} className="input-field" value={form.total_printed_pages}
                onChange={(e) => set("total_printed_pages", +e.target.value)} />
            </Field>
            <Field label="Pages printed off-hours">
              <input type="number" min={0} className="input-field" value={form.num_printed_pages_off_hours}
                onChange={(e) => set("num_printed_pages_off_hours", +e.target.value)} />
            </Field>
            <Field label="Files burned to removable media">
              <input type="number" min={0} className="input-field" value={form.total_files_burned}
                onChange={(e) => set("total_files_burned", +e.target.value)} />
            </Field>
            <Field label="Files burned from other source">
              <input type="number" min={0} className="input-field" value={form.burned_from_other}
                onChange={(e) => set("burned_from_other", +e.target.value)} />
            </Field>
          </div>
        </div>

        {/* Travel */}
        <div className="card space-y-4 section section-d4">
          <h2 className="text-sm font-medium text-gray-900">Travel</h2>
          <div className="flex items-center justify-between border border-gray-100 rounded-lg px-3 py-2.5">
            <span className="text-sm text-gray-600">Currently abroad</span>
            <Toggle checked={form.is_abroad === 1} onChange={(v) => set("is_abroad", v ? 1 : 0)} />
          </div>
          {form.is_abroad === 1 && (
            <div className="grid grid-cols-2 gap-4">
              <Field label="Trip duration (days)">
                <input type="number" min={0} max={30} className="input-field" value={form.trip_day_number}
                  onChange={(e) => set("trip_day_number", +e.target.value)} />
              </Field>
              <Field label="Destination risk rating">
                <input type="number" min={0} max={3} className="input-field" value={form.hostility_country_level}
                  onChange={(e) => set("hostility_country_level", +e.target.value)} />
                <p className="text-[11px] text-gray-400 mt-1">0 = friendly nation, 3 = hostile state</p>
              </Field>
            </div>
          )}
        </div>

        <div className="flex justify-center section section-d5">
          <button
            type="submit"
            disabled={loading}
            className="group relative overflow-hidden inline-flex items-center gap-2 px-8 py-2.5 rounded-xl night-sky text-white text-sm font-medium transition-opacity hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="relative flex items-center gap-2">
              {loading ? <><Loader2 size={15} className="animate-spin" /> Analysing…</> : "Run classification"}
            </span>
          </button>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2.5 p-4 rounded-xl border border-[#F7C1C1] bg-[#FCEBEB]">
          <AlertCircle size={15} className="mt-0.5 flex-shrink-0 text-[#A32D2D]" />
          <p className="text-sm text-[#791F1F]">{error}</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-4">
          <div className={`card border-l-4 ${isMalicious ? "border-l-[#E24B4A]" : "border-l-[#639922]"}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                {isMalicious
                  ? <ShieldAlert size={20} className="text-[#A32D2D]" />
                  : <ShieldCheck size={20} className="text-[#3B6D11]" />}
                <h2 className="text-base font-semibold text-gray-900">
                  {isMalicious ? "Malicious activity detected" : "Behaviour appears normal"}
                </h2>
              </div>
              <span className={isMalicious ? "badge-malicious" : "badge-benign"}>
                {result.label}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400">Classification</p>
                <p className="text-lg font-semibold text-gray-900 mt-0.5">{result.label}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400">Malicious confidence</p>
                <p className="text-lg font-semibold text-gray-900 mt-0.5">{(result.confidence * 100).toFixed(1)}%</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400">Benign confidence</p>
                <p className="text-lg font-semibold text-gray-900 mt-0.5">{((1 - result.confidence) * 100).toFixed(1)}%</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
              {result.summary}
            </p>
          </div>

          <div className="card">
            <h2 className="text-sm font-medium text-gray-900 mb-1">Top 5 risk drivers</h2>
            <p className="text-xs text-gray-400 mb-4">The behaviours that most influenced this classification. Blue bars pushed toward Malicious · Red bars pulled toward Benign.</p>
            <ShapChart drivers={result.top_drivers} />
            <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
              {result.top_drivers.map((d, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{i + 1}. {d.feature}</span>
                  <span className={`text-xs font-medium ${d.direction === "malicious" ? "text-[#185FA5]" : "text-[#A32D2D]"}`}>
                    {d.shap_value > 0 ? "+" : ""}{d.shap_value.toFixed(3)} influence · toward {d.direction}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
