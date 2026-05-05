"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";

const reportTabs = [
  { id: "payroll", label: "Payroll Reports" },
  { id: "tax", label: "Tax Report" },
  { id: "compliance", label: "Compliance" },
];

/** Figma Payroll (node 425-2050) – Reports section */
export default function ReportsTabs() {
  const [activeTab, setActiveTab] = useState("payroll");

  return (
    <div className="border-b border-[var(--color-dash-icon-bg)]">
      <nav className="flex gap-1 px-6" aria-label="Report types">
        {reportTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "border-b-2 px-4 py-4 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "border-[var(--color-dash-accent)] text-[var(--color-dash-accent)]"
                : "border-transparent text-dash-secondary"
            )}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
