"""
COS720 - AI-Powered Insider Threat Detection System
FastAPI Backend
University of Pretoria, 2026

Usage:
    uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import pandas as pd
import numpy as np
import joblib
import shap
import warnings
warnings.filterwarnings("ignore")

app = FastAPI(title="COS720 Insider Threat Detection API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load models once at startup ─────────────────────────────────
rf        = joblib.load("models/rf_model.pkl")
scaler    = joblib.load("models/scaler.pkl")
encoders  = joblib.load("models/label_encoders.pkl")
explainer = shap.TreeExplainer(rf)

FEATURES = [
    "employee_department_enc", "employee_position_enc",
    "employee_campus_enc",     "employee_origin_country_enc",
    "num_entries",             "num_unique_campus",
    "late_exit_flag",          "entry_during_weekend",
    "total_printed_pages",     "num_printed_pages_off_hours",
    "total_files_burned",      "burned_from_other",
    "is_abroad",               "trip_day_number",
    "hostility_country_level", "employee_seniority_years",
    "employee_classification", "has_criminal_record",
    "has_medical_history",     "has_foreign_citizenship",
    "is_contractor",
]

FEAT_LABELS = {
    "employee_department_enc"     : "Department",
    "employee_position_enc"       : "Job position",
    "employee_campus_enc"         : "Campus",
    "employee_origin_country_enc" : "Origin country",
    "num_entries"                 : "Number of entries",
    "num_unique_campus"           : "Unique campuses visited",
    "late_exit_flag"              : "Late exit flag",
    "entry_during_weekend"        : "Weekend entry",
    "total_printed_pages"         : "Total pages printed",
    "num_printed_pages_off_hours" : "Off-hours pages printed",
    "total_files_burned"          : "Files burned to media",
    "burned_from_other"           : "Burned from other source",
    "is_abroad"                   : "Currently abroad",
    "trip_day_number"             : "Trip duration (days)",
    "hostility_country_level"     : "Destination hostility level",
    "employee_seniority_years"    : "Seniority (years)",
    "employee_classification"     : "Security classification",
    "has_criminal_record"         : "Has criminal record",
    "has_medical_history"         : "Has medical history",
    "has_foreign_citizenship"     : "Has foreign citizenship",
    "is_contractor"               : "Is contractor",
}

# ── Schemas ──────────────────────────────────────────────────────

class EmployeeRecord(BaseModel):
    employee_department: str
    employee_position: str
    employee_campus: str
    employee_origin_country: str
    num_entries: int
    num_unique_campus: int
    late_exit_flag: int
    entry_during_weekend: int
    total_printed_pages: int
    num_printed_pages_off_hours: int
    total_files_burned: int
    burned_from_other: int
    is_abroad: int
    trip_day_number: float
    hostility_country_level: int
    employee_seniority_years: int
    employee_classification: int
    has_criminal_record: int
    has_medical_history: int
    has_foreign_citizenship: int
    is_contractor: int

class ShapDriver(BaseModel):
    feature: str
    shap_value: float
    direction: str

class ClassificationResult(BaseModel):
    label: str
    confidence: float
    top_drivers: List[ShapDriver]
    summary: str

# ── Core classify ────────────────────────────────────────────────

def classify(record: EmployeeRecord) -> ClassificationResult:
    row = record.model_dump()
    for col in ["employee_department", "employee_position",
                "employee_campus", "employee_origin_country"]:
        try:
            row[col + "_enc"] = int(encoders[col].transform([row.pop(col)])[0])
        except ValueError:
            raise HTTPException(
                status_code=422,
                detail=f"Unknown value for {col}: {row.get(col)}"
            )

    X    = pd.DataFrame([row])[FEATURES]
    X_sc = pd.DataFrame(scaler.transform(X), columns=FEATURES)

    label_int  = int(rf.predict(X_sc)[0])
    confidence = float(rf.predict_proba(X_sc)[0][1])
    label      = "Malicious" if label_int == 1 else "Benign"

    sv     = explainer.shap_values(X_sc)
    sv_row = sv[0, :, 1]

    top_drivers = [
        ShapDriver(
            feature=FEAT_LABELS[feat],
            shap_value=round(float(val), 4),
            direction="malicious" if val > 0 else "benign",
        )
        for feat, val in sorted(
            zip(FEATURES, sv_row), key=lambda x: abs(x[1]), reverse=True
        )[:5]
    ]

    top_name = top_drivers[0].feature if top_drivers else "behaviour"
    if label == "Malicious":
        summary = (
            f"This employee has been classified as potentially malicious with "
            f"{confidence*100:.1f}% confidence. The primary risk indicator is "
            f'"{top_name}", which deviated significantly from expected norms. '
            f"Immediate review by a security analyst is recommended."
        )
    else:
        summary = (
            f"This employee's behaviour appears normal "
            f"(benign confidence: {(1-confidence)*100:.1f}%). "
            f"No immediate action is required. Routine monitoring should continue."
        )

    return ClassificationResult(
        label=label,
        confidence=round(confidence, 4),
        top_drivers=top_drivers,
        summary=summary,
    )

# ── Routes ───────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "model": "RandomForest", "features": len(FEATURES)}

@app.post("/classify", response_model=ClassificationResult)
def classify_employee(record: EmployeeRecord):
    return classify(record)

@app.post("/classify/batch", response_model=List[ClassificationResult])
def classify_batch(records: List[EmployeeRecord]):
    if len(records) > 500:
        raise HTTPException(status_code=400, detail="Max 500 records per batch")
    return [classify(r) for r in records]

@app.get("/meta/departments")
def get_departments():
    return {"values": list(encoders["employee_department"].classes_)}

@app.get("/meta/positions")
def get_positions():
    return {"values": list(encoders["employee_position"].classes_)}

@app.get("/meta/campuses")
def get_campuses():
    return {"values": list(encoders["employee_campus"].classes_)}

@app.get("/meta/countries")
def get_countries():
    return {"values": list(encoders["employee_origin_country"].classes_)}
