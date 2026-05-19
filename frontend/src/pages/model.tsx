import { useEffect, useState } from "react";
import { CountUp } from "@/lib/useCountUp";

type Metric = {
  label: string;
  value: number;
  decimals: number;
  suffix: string;
  note: string;
  explain: string;
  highlight?: boolean;
};

const metrics: Metric[] = [
  {
    label: "Accuracy", value: 96.87, decimals: 2, suffix: "%", note: "Overall",
    explain: "Share of all predictions (benign and malicious combined) that were correct.",
  },
  {
    label: "Precision", value: 65.29, decimals: 2, suffix: "%", note: "Alert precision",
    explain: "When the model flags an employee as malicious, how often it is right. High precision means few false alarms.",
  },
  {
    label: "Recall", value: 89.27, decimals: 2, suffix: "%", note: "Threat catch rate", highlight: true,
    explain: "Of all real malicious cases, how many the model caught. High recall means few missed threats.",
  },
  {
    label: "F1-Score", value: 75.42, decimals: 2, suffix: "%", note: "Balanced",
    explain: "Harmonic mean of precision and recall. Useful as a single score when the two classes are imbalanced.",
  },
  {
    label: "ROC-AUC", value: 98.37, decimals: 2, suffix: "%", note: "Discrimination",
    explain: "Probability the model ranks a random malicious case above a random benign one. 1.00 is perfect; 0.50 is random.",
  },
];

const cv = [
  { label: "Average F1",     value: 0.7542, std: "±0.008" },
  { label: "Average Recall", value: 0.8927, std: "±0.007" },
];

const features: [string, number][] = [
  ["Job position",            0.142],
  ["Files burned to media",   0.138],
  ["Origin country",          0.121],
  ["Department",              0.098],
  ["Off-hours pages printed", 0.087],
  ["Security classification", 0.074],
  ["Number of entries",       0.061],
  ["Seniority (years)",       0.058],
  ["Is abroad",               0.049],
  ["Trip duration (days)",    0.041],
];

const MAX_IMPORTANCE = 0.142;

function MetricCard({ m }: { m: Metric }) {
  return (
    <div className={`card relative group cursor-help ${m.highlight ? "border-gray-900" : ""}`}>
      <p className="text-xs text-gray-400">{m.label}</p>
      <p className={`text-xl font-semibold mt-1 ${m.highlight ? "text-gray-900" : "text-gray-700"}`}>
        <CountUp value={m.value} decimals={m.decimals} suffix={m.suffix} />
      </p>
      <p className="text-[11px] text-gray-400 mt-0.5">{m.note}</p>

      {/* Tooltip */}
      <div className="pointer-events-none absolute z-50 left-1/2 -translate-x-1/2 top-full mt-2 w-64 px-3 py-2 rounded-lg bg-gray-900 text-white text-xs leading-relaxed text-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-lg">
        {m.explain}
        <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
      </div>
    </div>
  );
}

export default function ModelPage() {
  const [barsReady, setBarsReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setBarsReady(true), 250);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-6">
      <div className="section section-d0">
        <h1 className="text-2xl font-semibold text-gray-900">Model performance</h1>
        <p className="text-sm text-gray-500 mt-1">Random Forest with 100 decision trees · evaluated on 23,723 held-out employee records</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-5 gap-3 section section-d1">
        {metrics.map((m) => <MetricCard key={m.label} m={m} />)}
      </div>

      <div className="grid grid-cols-2 gap-4 section section-d2">
        {/* Confusion matrix */}
        <div className="card">
          <h2 className="text-sm font-medium text-gray-900 mb-1">Outcomes on the test set</h2>
          <p className="text-xs text-gray-400 mb-4">How the model classified each of the 23,723 held-out employees against their true label.</p>
          <div className="space-y-1 text-sm">
            <div className="grid grid-cols-3 gap-1 text-xs text-gray-400 mb-1">
              <div />
              <div className="text-center">Predicted benign</div>
              <div className="text-center">Predicted malicious</div>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <div className="text-xs text-gray-400 flex items-center">Actual benign</div>
              <div className="bg-[#EAF3DE] rounded-lg p-3 text-center">
                <p className="text-lg font-semibold text-[#27500A]"><CountUp value={21840} format="integer" /></p>
                <p className="text-[11px] text-[#3B6D11]">Correctly cleared</p>
              </div>
              <div className="bg-[#FAEEDA] rounded-lg p-3 text-center">
                <p className="text-lg font-semibold text-[#633806]"><CountUp value={606} format="integer" /></p>
                <p className="text-[11px] text-[#854F0B]">False alarm</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <div className="text-xs text-gray-400 flex items-center">Actual malicious</div>
              <div className="bg-[#FCEBEB] rounded-lg p-3 text-center">
                <p className="text-lg font-semibold text-[#791F1F]"><CountUp value={137} format="integer" /></p>
                <p className="text-[11px] text-[#A32D2D]">Missed threat</p>
              </div>
              <div className="bg-[#EAF3DE] rounded-lg p-3 text-center">
                <p className="text-lg font-semibold text-[#27500A]"><CountUp value={1140} format="integer" /></p>
                <p className="text-[11px] text-[#3B6D11]">Threat caught</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">Test set totals: 1,277 malicious, 22,446 benign.</p>
        </div>

        {/* CV + config */}
        <div className="space-y-4">
          <div className="card">
            <h2 className="text-sm font-medium text-gray-900 mb-1">Stability check</h2>
            <p className="text-xs text-gray-400 mb-3">
              The training data was split into 5 different train/test slices and the model was re-evaluated on each.
              A small ± means the result is consistent, not a fluke of one lucky split.
            </p>
            <div className="space-y-2">
              {cv.map(({ label, value, std }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{label}</span>
                  <span className="text-sm font-mono text-gray-900">
                    <CountUp value={value} decimals={4} />
                    {" "}
                    <span className="text-gray-400 font-sans text-xs">{std}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <h2 className="text-sm font-medium text-gray-900 mb-1">Training settings</h2>
            <p className="text-xs text-gray-400 mb-3">Exact configuration used when training the model, recorded for reproducibility.</p>
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
      <div className="card section section-d3">
        <h2 className="text-sm font-medium text-gray-900 mb-1">Feature importances</h2>
        <p className="text-xs text-gray-400 mb-4">Which behavioural signals the model relied on most when classifying employees · top 10 of 21 features</p>
        <div className="space-y-2">
          {features.map(([name, val], i) => (
            <div key={name} className="flex items-center gap-3">
              <span className="text-xs text-gray-400 w-4 text-right">{i + 1}</span>
              <span className="text-sm text-gray-700 w-52 flex-shrink-0">{name}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-1.5 rounded-full bg-gray-900"
                  style={{
                    width: barsReady ? `${(val / MAX_IMPORTANCE) * 100}%` : "0%",
                    transition: `width 1.1s cubic-bezier(0.22, 1, 0.36, 1) ${i * 60}ms`,
                  }}
                />
              </div>
              <span className="text-xs font-mono text-gray-500 w-10 text-right">{val.toFixed(3)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SHAP explanation */}
      <div className="card section section-d4">
        <h2 className="text-sm font-medium text-gray-900 mb-3">About SHAP explanations</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Every classification in this system is accompanied by a SHAP (SHapley Additive exPlanations) breakdown.
          For each individual record, SHAP calculates how much each feature pushed the risk score toward
          Malicious or toward Benign. A positive SHAP value means that feature increased the malicious probability;
          a negative value means it reduced it. This allows a security analyst to see not just <em>that</em> an
          employee was flagged, but specifically <em>which behaviour</em> drove the decision, enabling informed
          and proportionate responses rather than black-box alerts.
        </p>
      </div>
    </div>
  );
}
