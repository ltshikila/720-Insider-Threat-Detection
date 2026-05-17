const API = "http://localhost:8000";

export interface EmployeeRecord {
  employee_department: string;
  employee_position: string;
  employee_campus: string;
  employee_origin_country: string;
  num_entries: number;
  num_unique_campus: number;
  late_exit_flag: number;
  entry_during_weekend: number;
  total_printed_pages: number;
  num_printed_pages_off_hours: number;
  total_files_burned: number;
  burned_from_other: number;
  is_abroad: number;
  trip_day_number: number;
  hostility_country_level: number;
  employee_seniority_years: number;
  employee_classification: number;
  has_criminal_record: number;
  has_medical_history: number;
  has_foreign_citizenship: number;
  is_contractor: number;
}

export interface ShapDriver {
  feature: string;
  shap_value: number;
  direction: "malicious" | "benign";
}

export interface ClassificationResult {
  label: "Malicious" | "Benign";
  confidence: number;
  top_drivers: ShapDriver[];
  summary: string;
}

export async function classifyEmployee(
  record: EmployeeRecord
): Promise<ClassificationResult> {
  const res = await fetch(`${API}/classify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(record),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? "Classification failed");
  }
  return res.json();
}

export async function classifyBatch(
  records: EmployeeRecord[]
): Promise<ClassificationResult[]> {
  const res = await fetch(`${API}/classify/batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(records),
  });
  if (!res.ok) throw new Error("Batch classification failed");
  return res.json();
}

export async function getMeta() {
  const [depts, positions, campuses, countries] = await Promise.all([
    fetch(`${API}/meta/departments`).then((r) => r.json()),
    fetch(`${API}/meta/positions`).then((r) => r.json()),
    fetch(`${API}/meta/campuses`).then((r) => r.json()),
    fetch(`${API}/meta/countries`).then((r) => r.json()),
  ]);
  return {
    departments: depts.values as string[],
    positions:   positions.values as string[],
    campuses:    campuses.values as string[],
    countries:   countries.values as string[],
  };
}

export async function checkHealth() {
  const res = await fetch(`${API}/health`);
  return res.ok;
}
