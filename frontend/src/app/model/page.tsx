export default function ModelPage() {
  const metrics = [
    { label: "Accuracy",   value: "96.87%", note: "Overall" },
    { label: "Precision",  value: "65.29%", note: "Alert precision" },
    { label: "Recall",     value: "89.27%", note: "Threat catch rate", highlight: true },
    { label: "F1-Score",   value: "75.42%", note: "Balanced" },
    { label: "ROC-AUC",    value: "98.37%", note: "Discrimination" },
  ];

  const cv = [
    { label: "CV F1",     value: "0.7542", std: "±0.008" },
    { label: "CV Recall", value: "0.8927", std: "±0.007" },
  ];

  const features = [
    ["Job position",            "0.142"],
    ["Files burned to media",   "0.138"],
    ["Origin country",          "0.121"],
    ["Department",              "0.098"],
    ["Off-hours pages printed", "0.087"],
    ["Security classification", "0.074"],
    ["Number of entries",       "0.061"],
    ["Seniority (years)",       "0.058"],
    ["Is abroad",               "0.049"],
    ["Trip duration (days)",    "0.041"],
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Model performance</h1>
        <p className="text-sm text-gray-500 mt-1">Random Forest · 100 trees · class_weight=balanced · test set: 23,723 records</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-5 gap-3">
        {metrics.map(({ label, value, note, highlight }) => (
          <div key={label} className={`card ${highlight ? "border-gray-900" : ""}`}>
            <p className="text-xs text-gray-400">{label}</p>
            <p className={`text-xl font-semibold mt-1 ${highlight ? "text-gray-900" : "text-gray-700"}`}>{value}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{note}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Confusion matrix */}
        <div className="card">
          <h2 className="text-sm font-medium text-gray-900 mb-4">Confusion matrix</h2>
          <div className="space-y-1 text-sm">
            <div className="grid grid-cols-3 gap-1 text-xs text-gray-400 mb-1">
              <div />
              <div className="text-center">Predicted benign</div>
              <div className="text-center">Predicted malicious</div>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <div className="text-xs text-gray-400 flex items-center">Actual benign</div>
              <div className="bg-[#EAF3DE] rounded-lg p-3 text-center">
                <p className="text-lg font-semibold text-[#27500A]">21,840</p>
                <p className="text-[11px] text-[#3B6D11]">TN</p>
              </div>
              <div className="bg-[#FAEEDA] rounded-lg p-3 text-center">
                <p className="text-lg font-semibold text-[#633806]">606</p>
                <p className="text-[11px] text-[#854F0B]">FP · false alarm</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <div className="text-xs text-gray-400 flex items-center">Actual malicious</div>
              <div className="bg-[#FCEBEB] rounded-lg p-3 text-center">
                <p className="text-lg font-semibold text-[#791F1F]">137</p>
                <p className="text-[11px] text-[#A32D2D]">FN · missed threat</p>
              </div>
              <div className="bg-[#EAF3DE] rounded-lg p-3 text-center">
                <p className="text-lg font-semibold text-[#27500A]">1,140</p>
                <p className="text-[11px] text-[#3B6D11]">TP · caught</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">Malicious: 1,277 · Benign: 22,446</p>
        </div>

        {/* CV + config */}
        <div className="space-y-4">
          <div className="card">
            <h2 className="text-sm font-medium text-gray-900 mb-3">5-fold cross-validation</h2>
            <div className="space-y-2">
              {cv.map(({ label, value, std }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{label}</span>
                  <span className="text-sm font-mono text-gray-900">{value} <span className="text-gray-400 font-sans text-xs">{std}</span></span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <h2 className="text-sm font-medium text-gray-900 mb-3">Model configuration</h2>
            <div className="bg-gray-50 rounded-lg p-3 font-mono text-xs text-gray-700 space-y-0.5">
              <p>n_estimators    = 100</p>
              <p>min_samples_leaf= 5</p>
              <p>class_weight    = &quot;balanced&quot;</p>
              <p>max_features    = &quot;sqrt&quot;</p>
              <p>random_state    = 42</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature importance */}
      <div className="card">
        <h2 className="text-sm font-medium text-gray-900 mb-1">Feature importances</h2>
        <p className="text-xs text-gray-400 mb-4">Mean decrease in impurity across all 100 trees · top 10 of 21 features</p>
        <div className="space-y-2">
          {features.map(([name, val], i) => (
            <div key={name} className="flex items-center gap-3">
              <span className="text-xs text-gray-400 w-4 text-right">{i + 1}</span>
              <span className="text-sm text-gray-700 w-52 flex-shrink-0">{name}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-1.5 rounded-full bg-gray-900"
                  style={{ width: `${(parseFloat(val) / 0.142) * 100}%` }}
                />
              </div>
              <span className="text-xs font-mono text-gray-500 w-10 text-right">{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SHAP explanation */}
      <div className="card">
        <h2 className="text-sm font-medium text-gray-900 mb-3">About SHAP explanations</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Every classification in this system is accompanied by a SHAP (SHapley Additive exPlanations) breakdown.
          For each individual record, SHAP calculates how much each feature pushed the risk score toward
          Malicious or toward Benign. A positive SHAP value means that feature increased the malicious probability;
          a negative value means it reduced it. This allows a security analyst to see not just <em>that</em> an
          employee was flagged, but specifically <em>which behaviour</em> drove the decision — enabling informed
          and proportionate responses rather than black-box alerts.
        </p>
      </div>
    </div>
  );
}
