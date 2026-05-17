# COS720 – AI-Powered Insider Threat Detection System
**University of Pretoria | 2026**

## Project structure

```
cos720_aitds/
├── data/
│   └── insider_threat_clean_dataset.csv   ← put the Kaggle CSV here
├── models/                                ← created by train.py
│   ├── rf_model.pkl
│   ├── scaler.pkl
│   └── label_encoders.pkl
├── outputs/                               ← created by train.py
│   ├── confusion_matrix.png
│   ├── feature_importance.png
│   ├── shap_summary.png
│   ├── shap_waterfall_tp.png
│   ├── shap_waterfall_fn.png
│   └── test_predictions.csv
├── train.py       ← STEP 1: run this first
├── app.py         ← STEP 2: run this after training
├── requirements.txt
└── README.md
```

## Setup

```bash
# 1. Create and activate a virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # macOS / Linux

# 2. Install dependencies
pip install -r requirements.txt

# 3. Put the dataset in the data/ folder
#    Download from:
#    https://www.kaggle.com/datasets/ahmeduzaki/insider-threat-dataset-for-corporate-environments

# 4. Train the model
python train.py

# 5. Run the prototype app
streamlit run app.py
```

## What train.py does
1. Loads the dataset (118,614 rows)
2. Encodes categorical columns (department, position, campus, country)
3. Selects 21 behavioural features
4. Splits data 80/20 (stratified to preserve class ratio)
5. Scales features with StandardScaler
6. Trains Random Forest (100 trees, class_weight=balanced)
7. Evaluates: Accuracy, Precision, Recall, F1, ROC-AUC, Confusion Matrix
8. Runs 5-fold cross-validation
9. Generates feature importance and SHAP plots
10. Saves all artefacts to models/ and outputs/

## Expected results (test set, 23,723 records)
| Metric    | Score  |
|-----------|--------|
| Accuracy  | 96.87% |
| Precision | 65.29% |
| Recall    | 89.27% |
| F1        | 75.42% |
| ROC-AUC   | 98.37% |

Recall is the most important metric here — the model catches ~89% of
real insider threats while keeping false positives manageable.
