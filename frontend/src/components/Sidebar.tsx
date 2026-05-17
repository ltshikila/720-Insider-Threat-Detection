"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Search, Upload, BarChart2, Activity } from "lucide-react";
import clsx from "clsx";

const nav = [
  { href: "/",        label: "Overview",        icon: Activity  },
  { href: "/analyse", label: "Analyse employee", icon: Search    },
  { href: "/batch",   label: "Batch upload",     icon: Upload    },
  { href: "/model",   label: "Model info",       icon: BarChart2 },
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside className="fixed left-0 top-0 h-full w-56 bg-white border-r border-gray-200 flex flex-col py-6 px-4">
      <div className="flex items-center gap-2.5 mb-8 px-1">
        <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center flex-shrink-0">
          <ShieldCheck size={14} color="white" strokeWidth={2} />
        </div>
        <div>
          <p className="text-sm font-medium leading-none text-gray-900">Threat Detect</p>
          <p className="text-[11px] text-gray-400 mt-0.5">COS720 · UP 2026</p>
        </div>
      </div>

      <nav className="flex flex-col gap-0.5 flex-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                active
                  ? "bg-gray-100 text-gray-900 font-medium"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon size={15} strokeWidth={1.75} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-1 pt-4 border-t border-gray-100">
        <p className="text-[11px] text-gray-400 leading-relaxed">
          Random Forest · 21 features<br />
          Recall 89.3% · AUC 98.4%
        </p>
      </div>
    </aside>
  );
}
