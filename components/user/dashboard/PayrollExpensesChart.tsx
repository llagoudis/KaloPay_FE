"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";

const periods = ["This month", "Last month", "This year", "Last year"];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Approximate values 0–6000 per image: Jan ~4800, Feb ~3000, Apr peak ~5800, June ~4200, Jul ~1400, Nov ~5700, Dec ~5000
const dataValues = [4800, 3000, 4000, 5800, 5000, 4200, 1400, 2500, 4000, 5000, 5700, 5000];
const maxY = 6000;
const highlightIndex = 5; // June – marker on curve

const CHART_LINE = "#2862DE";
const CHART_FILL_VAR = "var(--chart-payroll-fill)";
/** Lighter than #E2E6EE so dashed grid boxes stay subtle on white */
// Subtle grid for dark charts (lower contrast)
const GRID_STROKE = "rgba(148, 163, 184, 0.22)";

/** Smooth cubic curve through points (Catmull-Rom–style control points) */
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

function buildPath(): { line: string; area: string; highlightX: number; highlightY: number } {
  const paddingLeft = 0;
  const w = 400;
  const h = 140;
  const points = dataValues.map((val, i) => ({
    x: paddingLeft + (i / 11) * w,
    y: h - (val / maxY) * h,
  }));
  const linePath = buildSmoothLinePath(points);
  const last = points[points.length - 1];
  const first = points[0];
  const areaPath = `${linePath} L ${last.x} ${h} L ${first.x} ${h} Z`;
  return {
    line: linePath,
    area: areaPath,
    highlightX: points[highlightIndex].x,
    highlightY: points[highlightIndex].y,
  };
}

const { line, area, highlightX, highlightY } = buildPath();

export default function PayrollExpensesChart() {
  const [activePeriod, setActivePeriod] = useState(0);

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
            {periods.map((label, i) => (
              <button
                key={label}
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
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
      <div className="flex min-h-0 min-w-[420px] flex-col gap-2">
        <div className="flex min-h-0 flex-1 gap-2">
        {/* Y-axis — all labels absolutely positioned at their chart value */}
        <div className="relative w-10 shrink-0">
          {([
            { val: 6000, label: "6,000" },
            { val: 5000, label: "5,000" },
            { val: 4000, label: "4,000" },
            { val: 3000, label: "3,000" },
            { val: 2000, label: "2,000" },
            { val: 1000, label: "1,000" },
            { val: 0,    label: "0"     },
          ]).map(({ val, label }) => (
            <span
              key={val}
              className="absolute right-1 text-right text-xs tabular-nums leading-none text-[#94a3b8]"
              style={{
                top: `${((6000 - val) / 6000) * 100}%`,
                transform: "translateY(-50%)",
              }}
            >
              {label}
            </span>
          ))}
        </div>
        {/* Chart */}
        <div className="min-h-[300px] min-w-0 flex-1">
          <svg
            viewBox="0 0 400 140"
            className="h-full min-h-[300px] w-full"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="payrollLineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_FILL_VAR} stopOpacity={0.85} />
                <stop offset="55%" stopColor={CHART_FILL_VAR} stopOpacity={0.4} />
                <stop offset="100%" stopColor={CHART_FILL_VAR} stopOpacity={0} />
              </linearGradient>
            </defs>
            {/* 5 equally spaced horizontal grid lines */}
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
            {/* Area fill */}
            <path fill="url(#payrollLineGrad)" d={area} />
            {/* Line — thin smooth stroke */}
            <path
              d={line}
              fill="none"
              stroke={CHART_LINE}
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Highlight: white fill + blue ring */}
            <circle
              cx={highlightX}
              cy={highlightY}
              r={4.25}
              fill="#fff"
              stroke={CHART_LINE}
              strokeWidth={1.35}
            />
          </svg>
        </div>
        </div>
      {/* X-axis */}
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
