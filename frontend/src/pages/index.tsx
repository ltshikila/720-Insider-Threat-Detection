import Link from "next/link";
import { Search, Upload, BarChart2, ArrowRight, ShieldAlert, ShieldCheck } from "lucide-react";
import { CountUp } from "@/lib/useCountUp";

const metrics = [
  {
    label: "Accuracy",  value: 96.87, decimals: 2, suffix: "%", sub: "Overall",
    explain: "Share of all predictions (benign and malicious combined) that were correct.",
  },
  {
    label: "Recall",    value: 89.27, decimals: 2, suffix: "%", sub: "Threat catch rate", highlight: true,
    explain: "Of all real malicious cases, how many the model caught. High recall means few missed threats.",
  },
  {
    label: "Precision", value: 65.29, decimals: 2, suffix: "%", sub: "Alert precision",
    explain: "When the model flags an employee as malicious, how often it is right. High precision means few false alarms.",
  },
  {
    label: "ROC-AUC",   value: 98.37, decimals: 2, suffix: "%", sub: "Discrimination",
    explain: "Probability the model ranks a random malicious case above a random benign one. 1.00 is perfect; 0.50 is random.",
  },
];

const features = [
  { group: "Access patterns",  items: ["Entry frequency", "Weekend access", "Late exits", "Multi-campus visits"] },
  { group: "Data handling",    items: ["Files burned to media", "Off-hours printing", "Unusual file sources", "Total print volume"] },
  { group: "Travel & abroad",  items: ["Active travel flag", "Trip duration", "Hostility level", "Country of origin"] },
  { group: "Background",       items: ["Security classification", "Criminal record", "Foreign citizenship", "Contractor status"] },
];

const actions = [
  { href: "/analyse", label: "Analyse employee",  sub: "Manual profile entry",    icon: Search,    variant: "primary"   as const },
  { href: "/batch",   label: "Batch CSV upload",  sub: "Classify many records",   icon: Upload,    variant: "secondary" as const },
  { href: "/model",   label: "Model performance", sub: "Metrics & SHAP analysis", icon: BarChart2, variant: "secondary" as const },
];

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div className="section section-d0">
        <h1 className="text-2xl font-semibold text-gray-900">Insider Threat Detection</h1>
        <p className="text-sm text-gray-500 mt-1">
          AI-powered behavioural classification · University of Pretoria COS720 · 2026
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-4 gap-3 section section-d1">
        {metrics.map(({ label, value, decimals, suffix, sub, highlight, explain }) => (
          <div key={label} className={`card relative group cursor-help ${highlight ? "border-gray-900" : ""}`}>
            <p className="text-xs text-gray-400">{label}</p>
            <p className={`text-2xl font-semibold mt-1 ${highlight ? "text-gray-900" : "text-gray-700"}`}>
              <CountUp value={value} decimals={decimals} suffix={suffix} />
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>

            {/* Tooltip */}
            <div className="pointer-events-none absolute z-50 left-1/2 -translate-x-1/2 top-full mt-2 w-64 px-3 py-2 rounded-lg bg-gray-900 text-white text-xs leading-relaxed text-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-lg">
              {explain}
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
            </div>
          </div>
        ))}
      </div>

      {/* What it does */}
      <div className="card section section-d2">
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
          . For every classification, it produces a confidence score, a ranked list of the top 5 behavioural signals
          that drove the decision, and a plain-language summary designed to support a non-technical security manager.
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3 section section-d3">
        {actions.map(({ href, label, sub, icon: Icon, variant }) => {
          const isPrimary = variant === "primary";
          return (
            <Link
              key={href}
              href={href}
              className={`group relative overflow-hidden flex flex-col gap-3 p-4 rounded-xl transition-all border ${
                isPrimary
                  ? "night-sky text-white border-transparent"
                  : "bg-gray-100 text-gray-900 border-transparent hover:border-gray-200"
              }`}
            >
              {/* Top row: icon left, arrow right */}
              <div className="relative flex items-start justify-between">
                <Icon size={18} strokeWidth={1.75} className={isPrimary ? "text-white" : "text-gray-700"} />
                <ArrowRight
                  size={14}
                  className={`opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all ${
                    isPrimary ? "text-white" : "text-gray-700"
                  }`}
                />
              </div>
              {/* Label / sub */}
              <div className="relative">
                <p className="text-sm font-medium">{label}</p>
                <p className={`text-xs mt-0.5 ${isPrimary ? "text-gray-300" : "text-gray-500"}`}>{sub}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Monitored features */}
      <div className="card section section-d4">
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
