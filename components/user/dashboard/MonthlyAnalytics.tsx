"use client";

import PayrollExpensesChart from "./PayrollExpensesChart";
import LoremEpsumChart from "./LoremEpsumChart";

/** Four capsule bars: light–dark–light–light heights per analytics reference */
function TotalPaymentsBarIcon() {
  const w = 5;
  const rx = w / 2;
  const gap = 8;
  const H = 56;
  const light = "#60A5FA";
  const dark = "#2563EB";
  const bars: { x: number; h: number; fill: string }[] = [
    { x: 0, h: 20, fill: light },
    { x: w + gap, h: 44, fill: dark },
    { x: 2 * (w + gap), h: 37, fill: light },
    { x: 3 * (w + gap), h: 56, fill: light },
  ];
  const vbW = 4 * w + 3 * gap;
  return (
    <svg
      width={vbW}
      height={H}
      viewBox={`0 0 ${vbW} ${H}`}
      className="shrink-0"
      aria-hidden
    >
      {bars.map((b) => (
        <rect
          key={b.x}
          x={b.x}
          y={H - b.h}
          width={w}
          height={b.h}
          rx={rx}
          ry={rx}
          fill={b.fill}
        />
      ))}
    </svg>
  );
}

/** Two overlapping people + bottom-left sparkle — matches Active Employees reference icon */
function ActiveEmployeesIllustration() {
  return (
    <svg
      width={88}
      height={64}
      viewBox="0 0 88 64"
      fill="none"
      className="shrink-0"
      aria-hidden
    >
      {/* Back person: smaller, behind, offset right */}
      <ellipse cx={54} cy={42} rx={14} ry={11} fill="#93C5FD" fillOpacity={0.5} />
      <circle cx={52} cy={22} r={7} fill="#0F50DB" />
      {/* Front person: larger, left */}
      <ellipse cx={30} cy={44} rx={20} ry={14} fill="#93C5FD" fillOpacity={0.55} />
      <circle cx={28} cy={20} r={10} fill="#0F50DB" />
      {/* Solid four-point sparkle on lower-left of front torso */}
      <path
        fill="#0F50DB"
        d="M10.5 36.2 12.2 40.8 17.2 42.2 12.8 44.1 14.2 49.2 10.5 46.4 6.8 49.2 8.2 44.1 3.8 42.2 8.8 40.8Z"
      />
    </svg>
  );
}

const cardClass =
  "monthly-analytics-surface flex w-full items-center rounded-xl border border-[var(--color-dash-icon-bg)] bg-[#fcfcfc] p-4 sm:p-6";

export default function MonthlyAnalytics() {
  return (
    <div
      className="monthly-analytics-shell mb-10 rounded-2xl border border-[var(--color-dash-icon-bg)] bg-dash-card py-5 pr-4 pl-3 sm:pr-5 sm:pl-4 md:py-6 md:pr-5 md:pl-4 lg:py-8 lg:pr-6 lg:pl-5"
      style={{ backgroundColor: "var(--monthly-analytics-shell-bg)" }}
    >
      <h2
        id="monthly-analytics-heading"
        className="dash-card-section-title mb-5 text-dash-primary"
      >
        Monthly Analytics
      </h2>
      <div
        className="monthly-analytics-main grid w-full grid-cols-1 gap-5 sm:grid-cols-2"
        aria-labelledby="monthly-analytics-heading"
        role="region"
      >
        <div className={cardClass}>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-normal text-[#94a3b8]">Total Payments</p>
            <p className="mt-2 text-2xl font-bold text-dash-primary">$245,670</p>
            <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-[#22c55e]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
              +12.5% vs last month
            </p>
          </div>
          <div className="ml-4 flex h-[56px] shrink-0 items-end justify-center" aria-hidden>
            <TotalPaymentsBarIcon />
          </div>
        </div>
        <div className={`${cardClass} justify-between`}>
          <div className="min-w-0 flex-1 pr-4">
            <p className="text-sm font-normal text-[#94a3b8]">Active Employees</p>
            <p className="mt-2 text-2xl font-bold text-dash-primary">156</p>
            <p className="mt-2 text-sm font-medium text-[#22c55e]">+5 employees vs last month</p>
          </div>
          <div className="flex shrink-0 items-center justify-center" aria-hidden>
            <ActiveEmployeesIllustration />
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-stretch lg:gap-5">
        <div className="flex h-full min-h-0 min-w-0">
          <PayrollExpensesChart />
        </div>
        <div className="flex h-full min-h-0 min-w-0 w-full lg:w-[500px] lg:shrink-0">
          <LoremEpsumChart />
        </div>
      </div>
    </div>
  );
}
