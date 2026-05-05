"use client";

import { cn } from "@/lib/utils/cn";

const subtitleClass =
  "shrink-0 whitespace-nowrap text-right text-[13px] font-normal leading-none tracking-normal text-[#9EA6B3] sm:text-[14px] [font-family:var(--font-poppins),Poppins,sans-serif]";
const barLabelClass =
  "text-center align-middle text-[14px] font-medium leading-[11.73px] tracking-normal text-dash-primary [font-family:var(--font-inter),Inter,sans-serif]";

const topColors = {
  blue: "#ebf2fa",
  orange: "#faebe1",
};

const bottomGradients = {
  blue: "linear-gradient(180deg, #6b82f5 0%, #3355eb 50%, #2050e0 100%)",
  orange:
    "linear-gradient(180deg, #f88038 0%, #f77020 50%, rgba(249, 115, 22, 0.94) 100%)",
};

function BarStripes({ fade = false }: { fade?: boolean }) {
  const lineW = 1;
  const gap = 3;
  const period = lineW + gap;
  const lineColor = "rgba(255,255,255,0.28)";

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[1]"
      aria-hidden
      style={{
        backgroundImage: `repeating-linear-gradient(
          90deg,
          ${lineColor} 0px,
          ${lineColor} ${lineW}px,
          transparent ${lineW}px,
          transparent ${period}px
        )`,
        ...(fade && {
          WebkitMaskImage: "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, transparent 80%)",
          maskImage: "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, transparent 80%)",
        }),
      }}
    />
  );
}

function ComparisonBar({
  variant,
  label,
}: {
  variant: "blue" | "orange";
  label: string;
}) {
  return (
    <div className="flex h-full flex-col gap-3">
      {/* Outer container clips overall shape to rounded-2xl */}
      <div className="relative flex-1 min-h-[120px] overflow-hidden rounded-lg flex flex-col" style={{ background: topColors[variant] }}>
        {/* Light striped top section */}
        <div
          className="relative shrink-0"
          style={{ height: "40%", background: topColors[variant] }}
        >
          <BarStripes />
        </div>

        {/* Solid bottom section — rounded-t-2xl gives its own top corners;
            fading stripe shadow bleeds in from the top */}
        <div
          className="relative flex-1 overflow-hidden rounded-t-lg"
          style={{ background: bottomGradients[variant] }}
        >
          <BarStripes fade />
        </div>
      </div>

      <span className={barLabelClass}>{label}</span>
    </div>
  );
}

export default function LoremEpsumChart() {
  return (
    <div className="monthly-analytics-surface flex h-full min-h-[220px] min-w-0 w-full flex-col overflow-hidden rounded-xl border border-[var(--color-dash-icon-bg)] bg-[#fcfcfc] px-4 py-5 sm:px-5 sm:py-6">
      <div className="mb-5 flex min-w-0 shrink-0 flex-wrap items-center justify-between gap-1 sm:mb-6 sm:flex-nowrap sm:gap-3">
        <h2 className="dash-card-section-title shrink-0 whitespace-nowrap text-dash-primary">
          Lorem Ipsum
        </h2>
        <p className="shrink-0 text-right text-[10px] font-normal leading-none tracking-normal text-[#9EA6B3] sm:text-[13px] [font-family:var(--font-poppins),Poppins,sans-serif]">
          This month vs last month
        </p>
      </div>

      <div className="grid flex-1 min-h-0 grid-cols-1 gap-3 pb-0.5 sm:grid-cols-2 sm:gap-4">
        <ComparisonBar variant="blue" label="Last month" />
        <ComparisonBar variant="orange" label="This month" />
      </div>
    </div>
  );
}