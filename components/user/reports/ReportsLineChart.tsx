"use client";

import { useId } from "react";

/**
 * Simple line chart for Reports – blue or green fill, title, optional value.
 * Figma node 130-8359: dotted grid, Y-axis %, smooth spline through points, highlight dot.
 */
interface ReportsLineChartProps {
  title: string;
  value?: string;
  color: "blue" | "green";
  data?: number[];
  className?: string;
  /** Month index (0–11) to show white circle highlight, e.g. 5 = June */
  highlightMonthIndex?: number;
  /** Show Y-axis as 0, 20%, 40%, 60%, 80%, 100% */
  showPercentYAxis?: boolean;
  /** Show Y-axis as 0, 20$, 40$, 60$, 80$, 100$ (Figma 130-8549) */
  showDollarYAxis?: boolean;
}

const defaultData = [40, 30, 50, 45, 60, 55, 70, 65, 80, 75, 90, 100];

/** Catmull-Rom → cubic Bézier (smooth spline through monthly points, like Figma / area charts). */
function buildSmoothLinePath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

function buildPath(
  values: number[],
  max = 100,
  highlightIndex = 5
): { line: string; area: string; highlightX?: number; highlightY?: number } {
  const paddingLeft = 48;
  const w = 360;
  const h = 200;
  const n = values.length;
  const denom = Math.max(n - 1, 1);
  const points = values.map((val, i) => ({
    x: paddingLeft + (i / denom) * w,
    y: h - (val / max) * h,
  }));
  if (points.length === 0) {
    return { line: "", area: "" };
  }
  const linePath = buildSmoothLinePath(points);
  const last = points[points.length - 1]!;
  const first = points[0]!;
  const areaPath = `${linePath} L ${last.x} ${h} L ${first.x} ${h} Z`;
  const pt = highlightIndex >= 0 && highlightIndex < points.length ? points[highlightIndex] : undefined;
  return {
    line: linePath,
    area: areaPath,
    highlightX: pt?.x,
    highlightY: pt?.y,
  };
}

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function ReportsLineChart({
  title,
  value,
  color,
  data = defaultData,
  className = "",
  highlightMonthIndex,
  showPercentYAxis = false,
  showDollarYAxis = false,
}: ReportsLineChartProps) {
  const id = useId();
  const max = Math.max(...data, 1);
  const { line, area, highlightX, highlightY } = buildPath(
    data,
    max,
    highlightMonthIndex ?? -1
  );
  const isBlue = color === "blue";
  const lineColor = isBlue ? "#3B82F6" : "#22c55e";
  const gradientId = `reports-chart-${color}-${id.replace(/:/g, "")}`;
  const yLabels = showPercentYAxis
    ? ["100%", "80%", "60%", "40%", "20%", "0"]
    : showDollarYAxis
      ? ["100$", "80$", "60$", "40$", "20$", "0"]
      : [max, Math.round((max * 4) / 5), Math.round((max * 3) / 5), Math.round((max * 2) / 5), Math.round(max / 5), 0];

  return (
    <div className={className}>
      <div className="mb-4 flex flex-col">
        <h3 className="rp-chart-title text-sm font-medium">{title}</h3>
        {value != null && (
          <span
            className="rp-chart-value mt-1 inline-block"
            style={{
              fontFamily: "var(--font-poppins), Poppins, sans-serif",
              fontWeight: 600,
              fontSize: "32px",
              lineHeight: 1,
              minWidth: "80px",
              verticalAlign: "middle",
            }}
          >
            {value}
          </span>
        )}
      </div>
      <div className="flex gap-2">
        <div className="flex w-12 shrink-0 flex-col justify-between py-1 text-right text-xs text-[#9ca3af]">
          {yLabels.map((l) => (
            <span key={String(l)}>{l}</span>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <div className="w-full" style={{ aspectRatio: "428 / 200" }}>
            <svg viewBox="0 0 428 200" className="block h-full w-full" preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={lineColor} stopOpacity="0.18" />
                  <stop offset="100%" stopColor={lineColor} stopOpacity="0.02" />
                </linearGradient>
              </defs>
              {/* Dotted grid */}
              {[1, 2, 3, 4].map((i) => (
                <line
                  key={`h-${i}`}
                  x1={48}
                  y1={(i / 5) * 200}
                  x2={408}
                  y2={(i / 5) * 200}
                  stroke="#e9eaec"
                  strokeWidth="0.8"
                  strokeDasharray="3 3"
                />
              ))}
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <line
                  key={`v-${i}`}
                  x1={48 + (i / 11) * 360}
                  y1={0}
                  x2={48 + (i / 11) * 360}
                  y2={200}
                  stroke="#e9eaec"
                  strokeWidth="0.8"
                  strokeDasharray="3 3"
                />
              ))}
              <path fill={`url(#${gradientId})`} d={area} />
              <path
                d={line}
                fill="none"
                stroke={lineColor}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {highlightX != null && highlightY != null && (
                <circle
                  cx={highlightX}
                  cy={highlightY}
                  r="6"
                  fill="white"
                  stroke={lineColor}
                  strokeWidth="2"
                />
              )}
            </svg>
          </div>
        </div>
      </div>
      <div className="mt-0.5 flex gap-2">
        <div className="w-12 shrink-0" aria-hidden />
        <div className="grid min-w-0 flex-1 grid-cols-12 text-[10px] leading-tight text-[#9ca3af] sm:text-xs">
          {months.map((m) => (
            <span key={m} className="text-center">
              {m}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
