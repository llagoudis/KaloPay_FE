"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { usePayrollExpenses } from "@/hooks/employer/useDashboard";
import type { Period } from "@/lib/api/employer/dashboard";

const periods: { label: string; value: Period }[] = [
  { label: "This month", value: "thisMonth" },
  { label: "Last month", value: "lastMonth" },
  { label: "This year", value: "thisYear" },
  { label: "Last year", value: "lastYear" },
];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const CHART_LINE = "#2862DE";
const CHART_FILL_VAR = "var(--chart-payroll-fill)";
const GRID_STROKE = "rgba(148, 163, 184, 0.22)";

function buildSmoothLinePath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x} ${p2.y}`;
  }
  return d;
}

function buildPath(values: number[], maxY: number) {
  const w = 400;
  const h = 140;
  const safeMax = Math.max(maxY, 1);
  const points = values.map((val, i) => ({
    x: (i / (values.length - 1 || 1)) * w,
    y: h - (val / safeMax) * h,
  }));
  const linePath = buildSmoothLinePath(points);
  if (points.length === 0) return { line: "", area: "", points };
  const last = points[points.length - 1];
  const first = points[0];
  const areaPath = `${linePath} L ${last.x} ${h} L ${first.x} ${h} Z`;
  return { line: linePath, area: areaPath, points };
}

function buildYTicks(maxY: number): { val: number; label: string }[] {
  const step = maxY / 6;
  return Array.from({ length: 7 }, (_, i) => {
    const val = Math.round(maxY - i * step);
    return { val, label: val.toLocaleString("en-US") };
  });
}

export default function PayrollExpensesChart() {
  const [activePeriod, setActivePeriod] = useState(0); // default "This month" (rolling 12 months)
  const period = periods[activePeriod].value;
  const { data, isLoading } = usePayrollExpenses(period);

  const values = data?.dataPoints ?? Array(12).fill(0);
  const maxY = data?.maxY ?? 1;
  const { line, area, points } = buildPath(values, maxY);
  const yTicks = buildYTicks(maxY);
  const highlightIdx = values.indexOf(Math.max(...values));
  const highlight = points[highlightIdx];

  return (
    <div className="monthly-analytics-surface flex h-full min-h-0 w-full flex-col rounded-xl border border-[var(--color-dash-icon-bg)] bg-[#fcfcfc] py-6 pl-4 pr-6">
      <div className="mb-5 flex shrink-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="dash-card-section-title shrink-0 text-dash-primary">Payroll Expenses</h2>
        <div className="overflow-x-auto sm:ml-auto sm:max-w-[480px]">
          <div
            className="inline-flex min-w-max items-center rounded-full border border-[var(--color-dash-icon-bg)] bg-transparent p-1"
            role="tablist"
            aria-label="Chart period"
          >
            {periods.map((p, i) => (
              <button
                key={p.value}
                type="button"
                role="tab"
                aria-selected={i === activePeriod}
                onClick={() => setActivePeriod(i)}
                className={cn(
                  "flex min-h-10 items-center justify-center whitespace-nowrap rounded-full px-2.5 py-2 text-center text-[11px] font-normal leading-[100%] tracking-normal transition-colors [font-family:var(--font-poppins),Poppins,sans-serif] sm:px-4 sm:text-[13px]",
                  i === activePeriod
                    ? "bg-[#2862de] text-white shadow-sm"
                    : "bg-transparent text-[#9EA6B3]"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="flex min-h-0 min-w-[420px] flex-col gap-2">
          <div className="flex min-h-0 flex-1 gap-2">
            <div className="relative w-10 shrink-0">
              {yTicks.map(({ val, label }) => (
                <span
                  key={val}
                  className="absolute right-1 text-right text-xs tabular-nums leading-none text-[#94a3b8]"
                  style={{
                    top: `${((maxY - val) / maxY) * 100}%`,
                    transform: "translateY(-50%)",
                  }}
                >
                  {label}
                </span>
              ))}
            </div>
            <div className="min-h-[300px] min-w-0 flex-1">
              <svg viewBox="0 0 400 140" className="h-full min-h-[300px] w-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="payrollLineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_FILL_VAR} stopOpacity={0.85} />
                    <stop offset="55%" stopColor={CHART_FILL_VAR} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={CHART_FILL_VAR} stopOpacity={0} />
                  </linearGradient>
                </defs>
                {[0, 1, 2, 3, 4].map((i) => (
                  <line
                    key={`h-${i}`}
                    x1={0}
                    y1={(i / 4) * 140}
                    x2={400}
                    y2={(i / 4) * 140}
                    stroke={GRID_STROKE}
                    strokeWidth="0.85"
                    strokeDasharray="2 2"
                    strokeLinecap="round"
                  />
                ))}
                {Array.from({ length: 13 }, (_, i) => (
                  <line
                    key={`v-${i}`}
                    x1={(i / 12) * 400}
                    y1={0}
                    x2={(i / 12) * 400}
                    y2={140}
                    stroke={GRID_STROKE}
                    strokeWidth="0.85"
                    strokeDasharray="2 2"
                    strokeLinecap="round"
                  />
                ))}
                {!isLoading && (
                  <>
                    <path fill="url(#payrollLineGrad)" d={area} />
                    <path d={line} fill="none" stroke={CHART_LINE} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                    {highlight && (
                      <circle cx={highlight.x} cy={highlight.y} r={4.25} fill="#fff" stroke={CHART_LINE} strokeWidth={1.35} />
                    )}
                  </>
                )}
              </svg>
            </div>
          </div>
          <div className="mt-2 grid shrink-0 grid-cols-12 pl-[40px] text-[10px] sm:pl-[48px] sm:text-xs text-[#94a3b8]">
            {months.map((m) => (
              <span key={m} className="text-center">{m}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
