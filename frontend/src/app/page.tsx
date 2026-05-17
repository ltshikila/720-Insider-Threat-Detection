import Link from "next/link";
import { Search, Upload, BarChart2, ArrowRight, ShieldAlert, ShieldCheck } from "lucide-react";

const metrics = [
  { label: "Accuracy",  value: "96.87%", sub: "Overall" },
  { label: "Recall",    value: "89.27%", sub: "Threat catch rate", highlight: true },
  { label: "Precision", value: "65.29%", sub: "Alert precision" },
  { label: "ROC-AUC",   value: "98.37%", sub: "Discrimination" },
];

const features = [
  { group: "Access patterns",  items: ["Entry frequency", "Weekend access", "Late exits", "Multi-campus visits"] },
  { group: "Data handling",    items: ["Files burned to media", "Off-hours printing", "Unusual file sources", "Total print volume"] },
  { group: "Travel & abroad",  items: ["Active travel flag", "Trip duration", "Hostility level", "Country of origin"] },
  { group: "Background",       items: ["Security classification", "Criminal record", "Foreign citizenship", "Contractor status"] },
];

const actions = [
  { href: "/analyse", label: "Analyse employee",    sub: "Manual profile entry",    icon: Search,   color: "bg-gray-900 text-white" },
  { href: "/batch",   label: "Batch CSV upload",    sub: "Classify many records",   icon: Upload,   color: "bg-gray-100 text-gray-900" },
  { href: "/model",   label: "Model performance",   sub: "Metrics & SHAP analysis", icon: BarChart2,color: "bg-gray-100 text-gray-900" },
];

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Insider Threat Detection</h1>
        <p className="text-sm text-gray-500 mt-1">
          AI-powered behavioural classification · University of Pretoria COS720 · 2026
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-4 gap-3">
        {metrics.map(({ label, value, sub, highlight }) => (
          <div key={label} className={`card ${highlight ? "border-gray-900" : ""}`}>
            <p className="text-xs text-gray-400">{label}</p>
            <p className={`text-2xl font-semibold mt-1 ${highlight ? "text-gray-900" : "text-gray-700"}`}>
              {value}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* What it does */}
      <div className="card">
        <h2 className="text-sm font-medium text-gray-900 mb-3">What this system does</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          This prototype analyses employee behavioural log data and classifies each record as either{" "}
          <span className="inline-flex items-center gap-1 font-medium text-[#791F1F] bg-[#FCEBEB] px-1.5 py-0.5 rounded text-xs">
            <ShieldAlert size={11} /> Malicious
          </span>{" "}
          or{" "}
          <span className="inline-flex items-center gap-1 font-medium text-[#27500A] bg-[#EAF3DE] px-1.5 py-0.5 rounded text-xs">
            <ShieldCheck size={11} /> Benign
          </span>
          . For every classification, it produces a confidence score, a ranked list of the top 5 SHAP-derived
          risk drivers, and a plain-language summary designed to support a non-technical security manager.
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3">
        {actions.map(({ href, label, sub, icon: Icon, color }) => (
          <Link
            key={href}
            href={href}
            className={`group flex flex-col gap-2 p-4 rounded-xl transition-all border border-transparent hover:border-gray-200 ${color}`}
          >
            <Icon size={18} strokeWidth={1.75} />
            <div>
              <p className="text-sm font-medium">{label}</p>
              <p className={`text-xs mt-0.5 ${color.includes("900") ? "text-gray-400" : "text-gray-500"}`}>{sub}</p>
            </div>
            <ArrowRight size={14} className="mt-auto opacity-50 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>

      {/* Monitored features */}
      <div className="card">
        <h2 className="text-sm font-medium text-gray-900 mb-4">Behavioural indicators monitored</h2>
        <div className="grid grid-cols-4 gap-4">
          {features.map(({ group, items }) => (
            <div key={group}>
              <p className="text-xs font-medium text-gray-500 mb-2">{group}</p>
              <ul className="space-y-1">
                {items.map((item) => (
                  <li key={item} className="text-xs text-gray-600 flex items-start gap-1.5">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-300 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
