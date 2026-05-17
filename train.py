"""
COS720 - AI-Powered Insider Threat Detection System
Random Forest Training Script
University of Pretoria, 2026

Run this file first. It will:
  1. Load and preprocess the dataset
  2. Train the Random Forest model
  3. Evaluate and print all metrics
  4. Save plots to outputs/
  5. Save the trained model to models/

Usage:
  python train.py
"""

import os
import warnings
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
import shap
import joblib
warnings.filterwarnings("ignore")

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, confusion_matrix, classification_report,
    roc_auc_score
)

# ------------------------------------------------------------------
# PATHS  -  edit DATA_PATH to point at your CSV
# ------------------------------------------------------------------
DATA_PATH  = "data/insider_threat_clean_dataset.csv"
MODEL_DIR  = "models/"
OUTPUT_DIR = "outputs/"

os.makedirs(MODEL_DIR,  exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ==================================================================
# STEP 1 - LOAD
# ==================================================================
print("=" * 60)
print("  COS720 - Insider Threat RF Training")
print("=" * 60)

df = pd.read_csv(DATA_PATH)
print(f"\n[1] Loaded  {df.shape[0]:,} rows | {df.shape[1]} columns")
print(f"    Malicious : {df['is_malicious'].sum():,}  ({df['is_malicious'].mean()*100:.2f}%)")
print(f"    Benign    : {(df['is_malicious']==0).sum():,}  ({(1-df['is_malicious'].mean())*100:.2f}%)")

# ==================================================================
# STEP 2 - ENCODE CATEGORICAL COLUMNS
# ==================================================================
CAT_COLS = [
    "employee_department",
    "employee_position",
    "employee_campus",
    "employee_origin_country",
]

label_encoders = {}
for col in CAT_COLS:
    le = LabelEncoder()
    df[col + "_enc"] = le.fit_transform(df[col])
    label_encoders[col] = le

joblib.dump(label_encoders, MODEL_DIR + "label_encoders.pkl")
print(f"\n[2] Categorical columns encoded")
for col in CAT_COLS:
    print(f"    {col}: {df[col].nunique()} unique values -> integers")

# ==================================================================
# STEP 3 - FEATURE SELECTION
# ==================================================================
FEATURES = [
    "employee_department_enc",
    "employee_position_enc",
    "employee_campus_enc",
    "employee_origin_country_enc",
    "num_entries",
    "num_unique_campus",
    "late_exit_flag",
    "entry_during_weekend",
    "total_printed_pages",
    "num_printed_pages_off_hours",
    "total_files_burned",
    "burned_from_other",
    "is_abroad",
    "trip_day_number",
    "hostility_country_level",
    "employee_seniority_years",
    "employee_classification",
    "has_criminal_record",
    "has_medical_history",
    "has_foreign_citizenship",
    "is_contractor",
]

FEAT_LABELS = {
    "employee_position_enc"       : "Job position",
    "employee_department_enc"     : "Department",
    "employee_origin_country_enc" : "Origin country",
    "employee_campus_enc"         : "Campus",
    "num_entries"                 : "Num entries",
    "num_unique_campus"           : "Unique campuses",
    "late_exit_flag"              : "Late exit",
    "entry_during_weekend"        : "Weekend entry",
    "total_printed_pages"         : "Total pages printed",
    "num_printed_pages_off_hours" : "Off-hours pages printed",
    "total_files_burned"          : "Files burned to media",
    "burned_from_other"           : "Burned from other source",
    "is_abroad"                   : "Is abroad",
    "trip_day_number"             : "Trip duration (days)",
    "hostility_country_level"     : "Hostility level",
    "employee_seniority_years"    : "Seniority (years)",
    "employee_classification"     : "Security classification",
    "has_criminal_record"         : "Criminal record",
    "has_medical_history"         : "Medical history",
    "has_foreign_citizenship"     : "Foreign citizenship",
    "is_contractor"               : "Is contractor",
}

TARGET = "is_malicious"
X = df[FEATURES].copy()
y = df[TARGET].copy()
print(f"\n[3] Feature matrix: {X.shape[0]:,} rows x {X.shape[1]} features")

# ==================================================================
# STEP 4 - TRAIN / TEST SPLIT
# ==================================================================
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42, stratify=y
)
print(f"\n[4] Train: {len(X_train):,} | Test: {len(X_test):,}  (stratified 80/20)")

# ==================================================================
# STEP 5 - SCALE FEATURES
# ==================================================================
scaler = StandardScaler()
X_train_sc = pd.DataFrame(scaler.fit_transform(X_train), columns=FEATURES, index=X_train.index)
X_test_sc  = pd.DataFrame(scaler.transform(X_test),      columns=FEATURES, index=X_test.index)
joblib.dump(scaler, MODEL_DIR + "scaler.pkl")
print(f"[5] Scaled. Saved -> {MODEL_DIR}scaler.pkl")

# ==================================================================
# STEP 6 - TRAIN RANDOM FOREST
# ==================================================================
print("\n[6] Training Random Forest (100 trees)...")

rf = RandomForestClassifier(
    n_estimators    = 100,
    min_samples_leaf= 5,
    class_weight    = "balanced",
    max_features    = "sqrt",
    n_jobs          = -1,
    random_state    = 42,
)
rf.fit(X_train_sc, y_train)
joblib.dump(rf, MODEL_DIR + "rf_model.pkl")
print(f"    Saved -> {MODEL_DIR}rf_model.pkl")

# ==================================================================
# STEP 7 - EVALUATE
# ==================================================================
y_pred = rf.predict(X_test_sc)
y_prob = rf.predict_proba(X_test_sc)[:, 1]

acc  = accuracy_score (y_test, y_pred)
prec = precision_score(y_test, y_pred)
rec  = recall_score   (y_test, y_pred)
f1   = f1_score       (y_test, y_pred)
auc  = roc_auc_score  (y_test, y_prob)
cm   = confusion_matrix(y_test, y_pred)
tn, fp, fn, tp = cm.ravel()

print(f"\n[7] Results")
print(f"    Accuracy   : {acc:.4f}")
print(f"    Precision  : {prec:.4f}")
print(f"    Recall     : {rec:.4f}  <- catch rate on real threats")
print(f"    F1-Score   : {f1:.4f}")
print(f"    ROC-AUC    : {auc:.4f}")
print(f"\n    TP (caught)    : {tp:,}")
print(f"    FP (false flag): {fp:,}")
print(f"    FN (missed)    : {fn:,}")
print(f"    TN (clear)     : {tn:,}")
print()
print(classification_report(y_test, y_pred, target_names=["Benign", "Malicious"]))

# ==================================================================
# STEP 8 - 5-FOLD CROSS VALIDATION
# ==================================================================
print("[8] 5-fold cross-validation...")
X_all_sc = pd.DataFrame(scaler.transform(X), columns=FEATURES)
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
cv_f1  = cross_val_score(rf, X_all_sc, y, cv=cv, scoring="f1",     n_jobs=-1)
cv_rec = cross_val_score(rf, X_all_sc, y, cv=cv, scoring="recall", n_jobs=-1)
print(f"    CV F1     : {cv_f1.mean():.4f} +/- {cv_f1.std():.4f}")
print(f"    CV Recall : {cv_rec.mean():.4f} +/- {cv_rec.std():.4f}")

# ==================================================================
# STEP 9 - FEATURE IMPORTANCE PLOT
# ==================================================================
imp = pd.Series(rf.feature_importances_, index=FEATURES)
imp.index = [FEAT_LABELS[f] for f in imp.index]
imp = imp.sort_values()

colors = ["#185FA5" if v > imp.quantile(0.75) else "#B5D4F4" for v in imp]
fig, ax = plt.subplots(figsize=(9, 7))
imp.plot(kind="barh", ax=ax, color=colors)
ax.set_xlabel("Mean Decrease in Impurity", fontsize=11)
ax.set_title("Random Forest - Feature Importances\nCOS720 Insider Threat Detection",
             fontsize=12, fontweight="bold")
ax.spines[["top", "right"]].set_visible(False)
plt.tight_layout()
fig.savefig(OUTPUT_DIR + "feature_importance.png", dpi=150)
plt.close()
print(f"\n[9] Saved -> {OUTPUT_DIR}feature_importance.png")
print("    Top 10:")
for feat, val in imp.sort_values(ascending=False).head(10).items():
    print(f"    {'':2}{feat:<30} {val:.4f}  {'|' * int(val*600)}")

# ==================================================================
# STEP 10 - CONFUSION MATRIX PLOT
# ==================================================================
fig, ax = plt.subplots(figsize=(5, 4))
sns.heatmap(cm, annot=True, fmt="d", cmap="Blues",
            xticklabels=["Benign", "Malicious"],
            yticklabels=["Benign", "Malicious"],
            ax=ax, linewidths=0.5)
ax.set_xlabel("Predicted", fontsize=11)
ax.set_ylabel("Actual",    fontsize=11)
ax.set_title("Confusion Matrix - Random Forest", fontsize=12, fontweight="bold")
plt.tight_layout()
fig.savefig(OUTPUT_DIR + "confusion_matrix.png", dpi=150)
plt.close()
print(f"[10] Saved -> {OUTPUT_DIR}confusion_matrix.png")

# ==================================================================
# STEP 11 - SHAP VALUES
# ==================================================================
print("\n[11] Computing SHAP values (300 records)...")
rng    = np.random.default_rng(42)
idx    = rng.choice(len(X_test_sc), size=300, replace=False)
X_shap_raw = X_test_sc.iloc[idx]
X_shap     = pd.DataFrame(X_shap_raw.values,
                           columns=[FEAT_LABELS[f] for f in FEATURES])

explainer = shap.TreeExplainer(rf)
sv        = explainer.shap_values(X_shap_raw)   # (300, 21, 2)
sv_mal    = sv[:, :, 1]                          # class 1: (300, 21)

# Global summary
plt.figure(figsize=(9, 7))
shap.summary_plot(sv_mal, X_shap, show=False, plot_size=None)
plt.title("SHAP Summary - Contributions toward Malicious Classification",
          fontsize=11, fontweight="bold", pad=12)
plt.tight_layout()
plt.savefig(OUTPUT_DIR + "shap_summary.png", dpi=150, bbox_inches="tight")
plt.close()
print(f"    Saved -> {OUTPUT_DIR}shap_summary.png")

# Waterfall for best TP
tp_mask = (y_test.values == 1) & (y_pred == 1)
best_tp = np.where(tp_mask)[0][np.argmax(y_prob[tp_mask])]
sv_tp   = explainer.shap_values(X_test_sc.iloc[[best_tp]])[:, :, 1][0]
pairs   = sorted(zip([FEAT_LABELS[f] for f in FEATURES], sv_tp),
                 key=lambda x: abs(x[1]), reverse=True)[:10]

fig, ax = plt.subplots(figsize=(9, 5))
ax.barh([p[0] for p in pairs], [p[1] for p in pairs],
        color=["#185FA5" if p[1]>0 else "#E24B4A" for p in pairs], height=0.6)
ax.axvline(0, color="black", linewidth=0.8)
ax.set_xlabel("SHAP value  (positive = evidence of malicious behaviour)")
ax.set_title(f"SHAP Per-Record Explanation - Caught Threat  "
             f"(confidence: {y_prob[best_tp]*100:.1f}%)\n"
             f"Blue = pushed toward Malicious   Red = pulled toward Benign",
             fontsize=10, fontweight="bold")
ax.spines[["top", "right"]].set_visible(False)
ax.invert_yaxis()
plt.tight_layout()
fig.savefig(OUTPUT_DIR + "shap_waterfall_tp.png", dpi=150)
plt.close()
print(f"    Saved -> {OUTPUT_DIR}shap_waterfall_tp.png")

# Waterfall for worst FN
fn_mask  = (y_test.values == 1) & (y_pred == 0)
worst_fn = np.where(fn_mask)[0][np.argmin(y_prob[fn_mask])]
sv_fn    = explainer.shap_values(X_test_sc.iloc[[worst_fn]])[:, :, 1][0]
pairs_fn = sorted(zip([FEAT_LABELS[f] for f in FEATURES], sv_fn),
                  key=lambda x: abs(x[1]), reverse=True)[:10]

fig, ax = plt.subplots(figsize=(9, 5))
ax.barh([p[0] for p in pairs_fn], [p[1] for p in pairs_fn],
        color=["#185FA5" if p[1]>0 else "#E24B4A" for p in pairs_fn], height=0.6)
ax.axvline(0, color="black", linewidth=0.8)
ax.set_xlabel("SHAP value")
ax.set_title(f"SHAP Explanation - Missed Threat (False Negative, "
             f"confidence: {y_prob[worst_fn]*100:.1f}%)\n"
             f"This real insider was not flagged - why?",
             fontsize=10, fontweight="bold")
ax.spines[["top", "right"]].set_visible(False)
ax.invert_yaxis()
plt.tight_layout()
fig.savefig(OUTPUT_DIR + "shap_waterfall_fn.png", dpi=150)
plt.close()
print(f"    Saved -> {OUTPUT_DIR}shap_waterfall_fn.png")

# ==================================================================
# STEP 12 - SAVE PREDICTIONS CSV
# ==================================================================
results = X_test.copy()
results["actual"]     = y_test.values
results["predicted"]  = y_pred
results["confidence"] = (y_prob * 100).round(1)
results.to_csv(OUTPUT_DIR + "test_predictions.csv", index=False)

tp_rows = results[(results["actual"]==1) & (results["predicted"]==1)]
fp_rows = results[(results["actual"]==0) & (results["predicted"]==1)]
fn_rows = results[(results["actual"]==1) & (results["predicted"]==0)]

print(f"\n[12] Saved -> {OUTPUT_DIR}test_predictions.csv")
print(f"     TP: {len(tp_rows):,}  FP: {len(fp_rows):,}  FN: {len(fn_rows):,}")

# ==================================================================
# SUMMARY
# ==================================================================
print("\n" + "=" * 60)
print("  TRAINING COMPLETE")
print("=" * 60)
print(f"  Accuracy  : {acc:.4f}")
print(f"  Precision : {prec:.4f}")
print(f"  Recall    : {rec:.4f}  <- {tp:,} threats caught out of {tp+fn:,}")
print(f"  F1        : {f1:.4f}")
print(f"  ROC-AUC   : {auc:.4f}")
print()
print("  Artefacts saved:")
print(f"    models/rf_model.pkl          <- submit this")
print(f"    models/scaler.pkl            <- needed by app.py")
print(f"    models/label_encoders.pkl    <- needed by app.py")
print(f"    outputs/confusion_matrix.png")
print(f"    outputs/feature_importance.png")
print(f"    outputs/shap_summary.png")
print(f"    outputs/shap_waterfall_tp.png")
print(f"    outputs/shap_waterfall_fn.png")
print(f"    outputs/test_predictions.csv")
print("=" * 60)
