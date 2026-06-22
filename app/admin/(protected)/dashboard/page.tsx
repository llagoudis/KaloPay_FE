"use client";

import { useState, useMemo } from "react";
import { useAdminDashboard } from "@/hooks/admin/useDashboard";

const MOCK_CLIENTS = [
  { company: "TechCorp Ltd", employees: 128, payroll: 128400, baseFee: 250, perEmp: 4 },
  { company: "Helios Trading", employees: 64, payroll: 92300, baseFee: 250, perEmp: 4 },
  { company: "NordBuild AS", employees: 86, payroll: 118640, baseFee: 250, perEmp: 4 },
  { company: "BlueWave Media", employees: 38, payroll: 54120, baseFee: 150, perEmp: 4 },
  { company: "Acme Robotics", employees: 26, payroll: 38900, baseFee: 150, perEmp: 4 },
].map((c) => ({ ...c, charge: c.baseFee + c.employees * c.perEmp }));

const MOCK_CURRENCIES = [
  { code: "USDC", label: "USD Coin", amount: 152000, color: "#2f6fed" },
  { code: "USDT", label: "Tether", amount: 96500, color: "#1f9d57" },
  { code: "EUR", label: "Euro", amount: 286420, color: "#6366f1" },
  { code: "BTC", label: "Bitcoin", amount: 18900, color: "#f59e0b" },
];

const MOCK_TREND = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  gross: [310000, 325000, 318000, 342000, 360000, 371000, 355000, 380000, 395000, 410000, 402000, 432360],
  net:   [248000, 260000, 254000, 274000, 288000, 297000, 284000, 304000, 316000, 328000, 322000, 345888],
};

function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function fmtEur(n: number) {
  return `€${fmt(n)}`;
}

type Period = "month" | "last" | "year";

function PayrollLineChart({ labels, gross, net }: { labels: string[]; gross: number[]; net: number[] }) {
  const W = 480, H = 200, PAD = { top: 12, right: 12, bottom: 28, left: 52 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const allVals = [...gross, ...net];
  const minV = Math.min(...allVals) * 0.9;
  const maxV = Math.max(...allVals) * 1.05;
  const xOf = (i: number) => PAD.left + (i / (labels.length - 1)) * chartW;
  const yOf = (v: number) => PAD.top + chartH - ((v - minV) / (maxV - minV)) * chartH;
  const pts = (arr: number[]) => arr.map((v, i) => `${xOf(i)},${yOf(v)}`).join(" ");
  const ticks = [minV, (minV + maxV) / 2, maxV];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={PAD.left} x2={W - PAD.right} y1={yOf(t)} y2={yOf(t)} stroke="#f0f0f0" strokeWidth={1} />
          <text x={PAD.left - 4} y={yOf(t) + 4} textAnchor="end" fontSize={9} fill="#9ca3af">
            {(t / 1000).toFixed(0)}k
          </text>
        </g>
      ))}
      <polyline points={pts(gross)} fill="none" stroke="#3b82f6" strokeWidth={2} strokeLinejoin="round" />
      <polyline points={pts(net)} fill="none" stroke="#10b981" strokeWidth={2} strokeLinejoin="round" strokeDasharray="4 2" />
      {labels.map((l, i) => (
        <text key={l} x={xOf(i)} y={H - 4} textAnchor="middle" fontSize={9} fill="#9ca3af">{l}</text>
      ))}
    </svg>
  );
}

function DonutChart({ currencies }: { currencies: typeof MOCK_CURRENCIES }) {
  const total = currencies.reduce((s, c) => s + c.amount, 0);
  const CX = 70, CY = 70, R = 54, INNER = 30;
  let angle = -Math.PI / 2;
  const slices = currencies.map((c) => {
    const sweep = (c.amount / total) * 2 * Math.PI;
    const x1 = CX + R * Math.cos(angle);
    const y1 = CY + R * Math.sin(angle);
    angle += sweep;
    const x2 = CX + R * Math.cos(angle);
    const y2 = CY + R * Math.sin(angle);
    const xi1 = CX + INNER * Math.cos(angle - sweep);
    const yi1 = CY + INNER * Math.sin(angle - sweep);
    const xi2 = CX + INNER * Math.cos(angle);
    const yi2 = CY + INNER * Math.sin(angle);
    const large = sweep > Math.PI ? 1 : 0;
    return { ...c, d: `M${x1},${y1} A${R},${R} 0 ${large} 1 ${x2},${y2} L${xi2},${yi2} A${INNER},${INNER} 0 ${large} 0 ${xi1},${yi1} Z` };
  });

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 140 140" className="w-36 h-36 flex-shrink-0">
        {slices.map((s) => <path key={s.code} d={s.d} fill={s.color} />)}
        <text x={CX} y={CY - 6} textAnchor="middle" fontSize={10} fill="#6b7280">Total</text>
        <text x={CX} y={CY + 8} textAnchor="middle" fontSize={9} fill="#111827" fontWeight="600">
          {fmtEur(total)}
        </text>
      </svg>
      <div className="space-y-2 flex-1">
        {currencies.map((c) => (
          <div key={c.code} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.color }} />
            <span className="text-xs text-gray-500 w-10">{c.code}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-1.5">
              <div className="h-1.5 rounded-full" style={{ width: `${(c.amount / currencies.reduce((s, x) => s + x.amount, 0)) * 100}%`, background: c.color }} />
            </div>
            <span className="text-xs font-mono text-gray-700 w-20 text-right">{fmtEur(c.amount)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data } = useAdminDashboard();
  const [period, setPeriod] = useState<Period>("month");

  const clients = data?.clients ?? MOCK_CLIENTS;
  const currencies = data?.balances ?? MOCK_CURRENCIES;
  const trend = data?.payrollTrend ?? MOCK_TREND;

  const totals = useMemo(() => ({
    employees: clients.reduce((s, c) => s + c.employees, 0),
    payroll: clients.reduce((s, c) => s + c.payroll, 0),
    baseFee: clients.reduce((s, c) => s + c.baseFee, 0),
    perEmp: clients.reduce((s, c) => s + c.perEmp * c.employees, 0),
    charge: clients.reduce((s, c) => s + c.charge, 0),
  }), [clients]);

  const totalCompanies = data?.totalCompanies ?? clients.length;
  const totalEmployees = data?.totalEmployees ?? totals.employees;
  const ytdPayroll = data?.ytdPayroll ?? clients.reduce((s, c) => s + c.payroll, 0) * 12;
  const nextMonthPayroll = data?.nextMonthPayroll ?? clients.reduce((s, c) => s + c.payroll, 0);
  const baseFeeTotal = data?.baseFeeTotal ?? totals.baseFee;
  const perEmpTotal = data?.perEmpTotal ?? totals.perEmp;
  const monthlyRevenue = data?.monthlyRevenue ?? (baseFeeTotal + perEmpTotal);

  const PERIODS: { key: Period; label: string }[] = [
    { key: "month", label: "This month" },
    { key: "last", label: "Last month" },
    { key: "year", label: "This year" },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Platform overview — clients, payroll, revenue</p>
        </div>
        <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 gap-1">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${period === p.key ? "bg-blue-600 text-white" : "text-gray-500 hover:text-gray-700"}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Revenue card */}
      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
        <p className="text-sm font-medium text-gray-500 mb-4">Monthly Revenue Breakdown</p>
        <div className="grid grid-cols-3 gap-6">
          {[
            { label: "Base Fees Total", value: fmtEur(baseFeeTotal), sub: "All client base fees" },
            { label: "Per-Employee Total", value: fmtEur(perEmpTotal), sub: "Fee × employees" },
            { label: "Total Monthly Revenue", value: fmtEur(monthlyRevenue), sub: "Base + per-employee", highlight: true },
          ].map((t) => (
            <div key={t.label} className={`rounded-lg p-4 ${t.highlight ? "bg-blue-50 border border-blue-100" : "bg-gray-50"}`}>
              <p className="text-xs text-gray-500">{t.label}</p>
              <p className={`text-xl font-semibold tabular-nums mt-1 ${t.highlight ? "text-blue-700" : "text-gray-900"}`}>{t.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{t.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Company Clients", value: totalCompanies, icon: "🏢", color: "blue" },
          { label: "Total Employees", value: fmt(totalEmployees), icon: "👥", color: "indigo" },
          { label: "Payroll Paid (YTD)", value: fmtEur(ytdPayroll), icon: "💳", color: "green" },
          { label: "Next Month Payroll", value: fmtEur(nextMonthPayroll), icon: "📅", color: "purple" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[10px] bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className="text-lg font-semibold tabular-nums text-gray-900">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-700">Payroll Trend</p>
            <div className="flex gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-500 inline-block" /> Gross</span>
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-emerald-500 inline-block border-t border-dashed border-emerald-500" /> Net</span>
            </div>
          </div>
          <PayrollLineChart labels={trend.labels} gross={trend.gross} net={trend.net} />
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-700 mb-4">Currency Balances</p>
          <DonutChart currencies={currencies} />
        </div>
      </div>

      {/* Clients table */}
      <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <p className="text-sm font-medium text-gray-700">Clients Overview</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3 text-left">Company</th>
                <th className="px-4 py-3 text-right">Employees</th>
                <th className="px-4 py-3 text-right">Monthly Payroll</th>
                <th className="px-4 py-3 text-right">Base Fee</th>
                <th className="px-4 py-3 text-right">Per-Employee</th>
                <th className="px-4 py-3 text-right">Est. Charge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {clients.map((c) => (
                <tr key={c.company} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">{c.company}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-600">{c.employees}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-600">{fmtEur(c.payroll)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-600">{fmtEur(c.baseFee)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-600">{fmtEur(c.employees * c.perEmp)}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold text-blue-700">{fmtEur(c.charge)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-semibold text-gray-800 border-t border-gray-200">
                <td className="px-4 py-3">Totals</td>
                <td className="px-4 py-3 text-right tabular-nums">{totals.employees}</td>
                <td className="px-4 py-3 text-right tabular-nums">{fmtEur(totals.payroll)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{fmtEur(totals.baseFee)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{fmtEur(totals.perEmp)}</td>
                <td className="px-4 py-3 text-right tabular-nums text-blue-700">{fmtEur(totals.charge)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
