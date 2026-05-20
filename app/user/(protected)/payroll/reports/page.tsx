"use client";

import React, { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { DASHBOARD_ROUTES } from "@/components/user/dashboard/routes";
import {
  usePayrollSummary,
  useTaxBreakdown,
  useEmployerCost,
  useAuditLogs,
  useRegulatory,
} from "@/hooks/employer/useReports";

function downloadCsv(filename: string, rows: (string | number | null | undefined)[][]) {
  if (rows.length === 0) return;
  const escape = (v: string | number | null | undefined) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = rows.map((r) => r.map(escape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

type ReportMainTab = "payroll" | "regulatory";
type ReportSubTab = "summary" | "breakdown" | "tax" | "employer" | "audit";

function fmtMoneyC(n: number, currency = "USD") {
  return n.toLocaleString("en-US", { style: "currency", currency, maximumFractionDigits: 2 });
}
function statusBadge(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}
function fmtDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}
function currentPeriod() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const poppins = { fontFamily: "var(--font-poppins)" as const };
const labelStyle: React.CSSProperties = {
  fontFamily: "Poppins, var(--font-poppins)",
  fontWeight: 500,
  fontSize: "16px",
  lineHeight: "20px",
  letterSpacing: "0%",
  color: "#1F2937",
};
const tableHeaderStyle: React.CSSProperties = {
  fontFamily: "Poppins, var(--font-poppins)",
  fontWeight: 400,
  fontSize: "14px",
  lineHeight: "16px",
  letterSpacing: "0%",
  color: "#6B7280",
  verticalAlign: "middle",
};
const employeeNameStyle: React.CSSProperties = {
  fontFamily: "Poppins, var(--font-poppins)",
  fontWeight: 600,
  fontSize: "14px",
  lineHeight: "20px",
  letterSpacing: "0%",
  verticalAlign: "middle",
};
const tableCellTextStyle: React.CSSProperties = {
  fontFamily: "Poppins, var(--font-poppins)",
  fontWeight: 400,
  fontSize: "14px",
  lineHeight: "20px",
  letterSpacing: "0%",
  verticalAlign: "middle",
};
const breakdownLabelStyle: React.CSSProperties = {
  fontFamily: "Poppins, var(--font-poppins)",
  fontWeight: 600,
  fontSize: "14px",
  lineHeight: "20px",
  letterSpacing: "0%",
  color: "#1F2937",
  verticalAlign: "middle",
};
const breakdownByLabelStyle: React.CSSProperties = {
  fontFamily: "Poppins, var(--font-poppins)",
  fontWeight: 400,
  fontSize: "14px",
  lineHeight: "20px",
  letterSpacing: "0%",
  color: "#1F2937",
  verticalAlign: "middle",
};

/** Regulatory export cards - stat rows (matches Figma: regular weight, slate blue-gray body) */
const regulatoryStatStyle: React.CSSProperties = {
  fontFamily: "Poppins, var(--font-poppins)",
  fontWeight: 400,
  fontSize: "14px",
  lineHeight: "22px",
  letterSpacing: "0%",
  color: "#334155",
};

function PayrollReportsSecondaryNav() {
  return (
    <section className="mt-4 mb-6 overflow-x-auto">
      <div className="inline-flex min-w-max gap-2 text-xs font-medium text-[#878787] md:text-sm">
        <Link
          href={DASHBOARD_ROUTES.payroll}
          className="inline-flex items-center gap-2 rounded-full border-0 px-6 py-2 text-xs font-medium outline-none focus:outline-none focus:ring-0 md:text-sm bg-transparent text-[#878787] shadow-none hover:bg-slate-100"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="5" width="18" height="14" rx="2" /><path d="M7 9h4" /><path d="M7 13h2" />
          </svg>
          Payments
        </Link>
        <Link
          href={DASHBOARD_ROUTES.bulkPayouts}
          className="inline-flex items-center gap-2 rounded-full border-0 px-6 py-2 text-xs font-medium outline-none focus:outline-none focus:ring-0 md:text-sm bg-transparent text-[#878787] shadow-none hover:bg-slate-100"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 7h14l-4-4" /><path d="M17 17H3l4 4" /><path d="M7 17l10-10" />
          </svg>
          Bulk Payouts
        </Link>
        <Link
          href={DASHBOARD_ROUTES.transfers}
          className="inline-flex items-center gap-2 rounded-full border-0 px-6 py-2 text-xs font-medium outline-none focus:outline-none focus:ring-0 md:text-sm bg-transparent text-[#878787] shadow-none hover:bg-slate-100"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 10h18" /><path d="M8 14h3v3H8z" />
          </svg>
          Transfers
        </Link>
        <span className="inline-flex items-center gap-2 rounded-full border-0 px-6 py-2 text-xs font-medium md:text-sm bg-[#0F4FDB] text-white shadow-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 7h8" /><path d="M8 11h8" /><path d="M8 15h5" />
          </svg>
          Payroll Reports
        </span>
      </div>
    </section>
  );
}

export default function PayrollReportsPage() {
  const [mainTab, setMainTab] = useState<ReportMainTab>("payroll");
  const [subTab, setSubTab] = useState<ReportSubTab>("summary");
  const [period, setPeriod] = useState<string>(currentPeriod());

  const { data: summary } = usePayrollSummary(period);
  const { data: tax } = useTaxBreakdown(period);
  const { data: cost } = useEmployerCost(period);
  const { data: audit } = useAuditLogs(50);
  const { data: regulatory } = useRegulatory();

  const metricCards = [
    { title: "Total Payroll", value: fmtMoneyC(summary?.metrics.totalPayroll ?? 0), icon: "dollar", change: summary?.period ?? "" },
    { title: "Active Employees of selected Period", value: String(summary?.metrics.activeEmployees ?? 0), icon: "people", change: summary?.period ?? "" },
    { title: "Total Taxes", value: fmtMoneyC(summary?.metrics.totalTaxes ?? 0), icon: "doc", change: summary?.period ?? "" },
    { title: "Employer Cost", value: fmtMoneyC(summary?.metrics.employerCost ?? 0), icon: "bolt", change: summary?.period ?? "" },
  ];

  const breakdownRows = (cost?.rows ?? []).map((r) => ({
    name: r.department,
    amount: fmtMoneyC(r.totalCost),
    employees: r.employees,
  }));

  const payeForm = regulatory?.monthly.find((m) => m.formType === "PAYE");
  const siForm = regulatory?.monthly.find((m) => m.formType === "SI");

  return (
    <div className="min-h-screen w-full bg-dash-page" data-dashboard-theme data-page="payroll-reports">
      <main className="dash-shell pb-10 pt-6">
          <PayrollReportsSecondaryNav />

          {/* Top bar: Payroll Reports heading, Select Date, Payroll Reports | Regulatory Exports */}
          <div className="payroll-reports-outer-card mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-[#f7f7fa] px-6 py-5 md:px-8">
            <h2 className="dash-card-section-title" style={{ color: "var(--color-dash-text-primary)" }}>Payroll Reports</h2>
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative">
                <input
                  type="month"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="payroll-select-date h-11 min-w-[160px] rounded-lg border border-[#e5e7eb] bg-white pl-3 pr-10 text-sm text-[#1f2937]"
                  style={poppins}
                />
              </div>
              <div className="inline-flex rounded-full border border-gray-200 bg-[#f3f4f6] p-1">
                <button
                  type="button"
                  onClick={() => setMainTab("payroll")}
                  className={cn(
                    "rounded-full px-2 py-1.5 text-[10px] font-medium transition-all whitespace-nowrap sm:px-4 sm:py-2 sm:text-sm",
                    mainTab === "payroll" ? "bg-[#0F4FDB] text-white shadow-sm" : "bg-transparent text-[#6b7280] hover:text-[#374151]"
                  )}
                  style={poppins}
                >
                  Payroll Reports
                </button>
                <button
                  type="button"
                  onClick={() => setMainTab("regulatory")}
                  className={cn(
                    "rounded-full px-2 py-1.5 text-[10px] font-medium transition-all whitespace-nowrap sm:px-4 sm:py-2 sm:text-sm",
                    mainTab === "regulatory" ? "bg-[#0F4FDB] text-white shadow-sm" : "bg-transparent text-[#6b7280] hover:text-[#374151]"
                  )}
                  style={poppins}
                >
                  Regulatory Reports
                </button>
              </div>
            </div>
          </div>

          {/* Payroll Reports: one main panel - tabs + metrics + tab body (fixes layout / scroll grouping) */}
          {mainTab === "payroll" && (
          <div className="payroll-reports-outer-card w-full overflow-hidden rounded-xl bg-[#f7f7fa]">
          {/* Tabs: Payroll Summary | Dynamic Breakdown | Tax & Contributions | Employer Cost | Audit Logs */}
          <div className="overflow-x-auto border-b px-6 pt-6 pb-4 md:px-8" style={{ borderColor: "rgba(255,255,255,0.15)" }}>
            <nav className="flex min-w-max gap-6">
              {[
                { id: "summary" as const, label: "Payroll Summary" },
                { id: "breakdown" as const, label: "Dynamic Breakdown" },
                { id: "tax" as const, label: "Tax & Contributions" },
                { id: "employer" as const, label: "Employer Cost" },
                { id: "audit" as const, label: "Audit Logs" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSubTab(t.id)}
                  className={cn(
                    "border-b-2 pb-3 text-sm font-medium transition-colors",
                    subTab === t.id ? "border-[#0F4FDB] text-[#0F4FDB]" : "border-transparent payroll-report-tab-inactive"
                  )}
                  style={poppins}
                >
                  {t.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Metric cards - hidden on Audit Logs */}
          {subTab !== "audit" && (
          <div className="grid grid-cols-1 gap-4 px-6 py-6 sm:grid-cols-2 lg:grid-cols-4 md:px-8">
            {metricCards.map((card) => (
              <div
                key={card.title}
                className="payroll-metric-card min-w-0 rounded-xl border bg-white p-5 text-left"
              >
                <p
                  className="payroll-metric-title m-0 text-left text-[12px] leading-snug sm:text-[13px] lg:text-sm"
                  style={poppins}
                >
                  {card.title}
                </p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <p className="m-0 min-w-0 text-left text-xl font-semibold" style={{ ...poppins, fontSize: "20px", color: "var(--color-dash-text-primary)" }}>{card.value}</p>
                  <span className="flex shrink-0 items-center justify-center text-[#9CA3AF]">
                    {card.icon === "dollar" && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                    )}
                    {card.icon === "people" && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    )}
                    {card.icon === "doc" && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                      </svg>
                    )}
                    {card.icon === "bolt" && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                      </svg>
                    )}
                  </span>
                </div>
                <p className="m-0 mt-2 flex items-center gap-1 text-left text-xs text-[#16a34a]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" aria-hidden>
                    {/* Diagonal up-right trend line + corner arrowhead (matches Figma-style growth) */}
                    <path d="M7 17L17 7" />
                    <path d="M13 7h4v4" />
                  </svg>
                  <span>{card.change}</span>
                </p>
              </div>
            ))}
          </div>
          )}

          {/* Paysheet Summary - Payroll Summary tab */}
          {subTab === "summary" && (
          <div className="px-6 py-6 md:px-8">
            <h3 className="mb-4" style={{ ...labelStyle, fontWeight: 600, fontSize: "18px", color: "var(--color-dash-text-primary)" }}>
              Paysheet Summary
            </h3>
            <div className="mb-4 flex w-full items-center gap-3">
              <div className="relative min-w-0 flex-1">
                <input
                  type="text"
                  placeholder="Search"
                  className="payroll-reports-search h-11 w-full rounded-lg border border-[#e5e7eb] bg-white pl-10 pr-3 text-sm text-[#1f2937] placeholder:text-[#9ca3af]"
                  style={poppins}
                />
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </span>
              </div>
              <button
                type="button"
                className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-[#0F4FDB] px-4 py-2.5 text-white shadow-sm transition hover:opacity-90"
                style={{ ...poppins, fontWeight: 500, fontSize: "14px" }}
                onClick={() => {
                  const rows = summary?.rows ?? [];
                  downloadCsv(
                    `payroll-summary-${period || currentPeriod()}.csv`,
                    [
                      ["Employee", "Role", "Department", "Gross Pay", "Tax Deductions", "Net Pay", "Status", "Currency"],
                      ...rows.map((r) => [r.employee, r.role, r.department, r.grossPay, r.taxDeductions, r.netPay, r.status, r.currency]),
                    ]
                  );
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export .os
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse text-left text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.15)" }}>
                    <th className="py-3 pr-4 align-middle" style={tableHeaderStyle}>Employees</th>
                    <th className="py-3 pr-4 align-middle" style={tableHeaderStyle}>Role</th>
                    <th className="py-3 pr-4 align-middle" style={tableHeaderStyle}>Department</th>
                    <th className="py-3 pr-4 align-middle" style={tableHeaderStyle}>Gross Pay</th>
                    <th className="py-3 pr-4 align-middle" style={tableHeaderStyle}>Tax Deductions</th>
                    <th className="py-3 pr-4 align-middle" style={tableHeaderStyle}>Net Pay</th>
                    <th className="py-3 align-middle" style={tableHeaderStyle}>Payment status</th>
                  </tr>
                </thead>
                <tbody>
                  {(summary?.rows ?? []).length === 0 && (
                    <tr><td colSpan={7} className="py-6 text-center text-[#9ca3af]" style={tableCellTextStyle}>No payroll for this period.</td></tr>
                  )}
                  {(summary?.rows ?? []).map((row) => {
                    const status = statusBadge(row.status);
                    const isPaid = status === "Completed";
                    return (
                      <tr key={row.paymentRef} className="payroll-table-row">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0F4FDB] text-white">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                              </svg>
                            </span>
                            <span className="payroll-table-cell" style={employeeNameStyle}>{row.employee}</span>
                          </div>
                        </td>
                        <td className="payroll-table-cell py-3 pr-4 align-middle" style={tableCellTextStyle}>{row.role}</td>
                        <td className="payroll-table-cell py-3 pr-4 align-middle" style={tableCellTextStyle}>{row.department}</td>
                        <td className="payroll-table-cell py-3 pr-4 align-middle" style={tableCellTextStyle}>{fmtMoneyC(row.grossPay, row.currency)}</td>
                        <td className="payroll-table-cell py-3 pr-4 align-middle" style={tableCellTextStyle}>{fmtMoneyC(row.taxDeductions, row.currency)}</td>
                        <td className="payroll-table-cell py-3 pr-4 align-middle" style={tableCellTextStyle}>{fmtMoneyC(row.netPay, row.currency)}</td>
                        <td className="py-3 align-middle">
                          <span
                            className={cn(
                              "inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase leading-tight tracking-wide text-white",
                              isPaid ? "bg-[#16A34A]" : "bg-[#F59E0B]"
                            )}
                            style={{ ...poppins, fontSize: "11px", lineHeight: "14px" }}
                          >
                            {isPaid ? "PAID" : status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          )}

          {/* Dynamic Breakdown tab */}
          {subTab === "breakdown" && (
          <div className="px-4 py-6 sm:px-6 md:px-8">
            <h3 className="mb-4" style={{ ...labelStyle, fontWeight: 600, fontSize: "18px", color: "var(--color-dash-text-primary)" }}>
              Paysheet Summary
            </h3>
            <div className="payroll-breakdown-by-row mb-6 flex w-full flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span style={{ ...breakdownByLabelStyle, color: "var(--color-dash-text-primary)" }}>Breakdown By:</span>
                <div className="relative min-w-[110px]">
                  <select
                    className="payroll-breakdown-select h-11 w-full appearance-none rounded-lg border pl-3 pr-10 outline-none focus:ring-0"
                    style={{ fontFamily: "Poppins, var(--font-poppins)", fontWeight: 600, fontSize: "14px", lineHeight: "20px", borderColor: "var(--color-border-subtle)" }}
                  >
                    <option>Department</option>
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af]">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg bg-[#0F4FDB] px-4 py-2.5 text-white shadow-sm transition hover:opacity-90"
                style={{ ...poppins, fontWeight: 500, fontSize: "14px" }}
                onClick={() => {
                  const rows = cost?.rows ?? [];
                  downloadCsv(
                    `breakdown-${period}.csv`,
                    [
                      ["Department", "Employees", "Gross Payroll", "Social Insurance", "Benefits/Bonuses", "Total Cost"],
                      ...rows.map((r) => [r.department, r.employees, r.grossPayroll, r.employerSocialInsurance, r.benefitsAndBonuses, r.totalCost]),
                    ]
                  );
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export Breakdown
              </button>
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="payroll-breakdown-card flex flex-col rounded-xl overflow-hidden">
                <p className="payroll-breakdown-heading px-5 py-4 text-left font-semibold" style={{ ...poppins, fontSize: "16px" }}>
                  Distribution Chart
                </p>
                <div className="p-4">
                  <div className="payroll-breakdown-chart-inner flex min-h-[320px] flex-1 items-center justify-center rounded-lg border-2 border-dashed p-8">
                    <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" className="shrink-0">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 12v-10M12 12l8.66-5" />
                      </svg>
                      <p className="m-0 text-sm font-normal text-[#9ca3af]" style={poppins}>Chart Visualization Placeholder</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="payroll-breakdown-card flex flex-col rounded-xl overflow-hidden">
                <p className="payroll-breakdown-heading px-5 py-4 text-left font-semibold" style={{ ...poppins, fontSize: "16px" }}>
                  Detailed Stats
                </p>
                <ul className="flex flex-col gap-2 p-3">
                  {breakdownRows.length === 0 && (
                    <li className="px-5 py-4 text-center text-sm text-[#9ca3af]" style={poppins}>No data for this period.</li>
                  )}
                  {breakdownRows.map((row) => (
                    <li
                      key={row.name}
                      className="payroll-breakdown-item flex items-center justify-between gap-4 rounded-lg px-5 py-4"
                    >
                      <p className="payroll-table-cell m-0" style={tableCellTextStyle}>{row.name}</p>
                      <div className="text-right">
                        <p className="m-0 font-semibold" style={{ ...poppins, fontSize: "14px", lineHeight: "20px", color: "var(--color-dash-text-primary)" }}>{row.amount}</p>
                        <p className="m-0 mt-1 text-xs font-normal text-[#6b7280]" style={poppins}>{row.employees} Employees</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          )}

          {/* Tax & Contributions tab */}
          {subTab === "tax" && (
          <div className="px-6 py-6 md:px-8">
            <div className="mb-6 flex items-center justify-between gap-2">
              <h3 className="text-[13px] sm:text-[18px]" style={{ fontFamily: "Poppins, var(--font-poppins)", fontWeight: 600, color: "var(--color-dash-text-primary)" }}>Tax Contributions</h3>
              <button
                type="button"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#0F4FDB] px-2.5 py-2 text-[11px] text-white shadow-sm transition hover:opacity-90 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-[14px]"
                style={{ ...poppins, fontWeight: 500 }}
                onClick={() => {
                  const rows = (tax?.rows ?? []) as Array<Record<string, unknown>>;
                  downloadCsv(
                    `tax-report-${period}.csv`,
                    [
                      ["Employee", "Tax ID", "Gross", "Income Tax", "Social Ins.", "Other", "Net", "Currency"],
                      ...rows.map((r) => [
                        String(r.employee ?? ""),
                        String(r.taxId ?? r.tax_id ?? ""),
                        Number(r.grossPay ?? r.gross_pay ?? 0),
                        Number(r.incomeTax ?? r.income_tax ?? 0),
                        Number(r.socialInsurance ?? r.social_insurance ?? 0),
                        Number(r.otherDeductions ?? r.other_deductions ?? 0),
                        Number(r.netPay ?? r.net_pay ?? 0),
                        String(r.currency ?? "USD"),
                      ]),
                    ]
                  );
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                Download Tax Report
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] border-collapse text-left text-sm">
                <thead>
                  <tr className="payroll-table-row">
                    <th className="payroll-table-header py-3 pr-4 align-middle" style={tableHeaderStyle}>Employees</th>
                    <th className="payroll-table-header py-3 pr-4 align-middle" style={tableHeaderStyle}>Role</th>
                    <th className="payroll-table-header py-3 pr-4 align-middle" style={tableHeaderStyle}>Department</th>
                    <th className="payroll-table-header py-3 pr-4 align-middle" style={tableHeaderStyle}>Gross Pay</th>
                    <th className="payroll-table-header py-3 pr-4 align-middle" style={tableHeaderStyle}>Social Insurance</th>
                    <th className="payroll-table-header py-3 pr-4 align-middle" style={tableHeaderStyle}>Health Fund</th>
                    <th className="payroll-table-header py-3 pr-4 align-middle" style={tableHeaderStyle}>Income Tax</th>
                    <th className="payroll-table-header py-3 align-middle" style={tableHeaderStyle}>Total Deductions</th>
                  </tr>
                </thead>
                <tbody>
                  {(tax?.rows ?? []).length === 0 && (
                    <tr><td colSpan={8} className="py-6 text-center text-[#9ca3af]" style={tableCellTextStyle}>No tax data for this period.</td></tr>
                  )}
                  {(tax?.rows ?? []).map((row) => {
                    const grossFromSummary = summary?.rows.find((s) => s.paymentRef === row.paymentRef);
                    return (
                      <tr key={row.paymentRef} className="payroll-table-row">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0F4FDB] text-white">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                            </span>
                            <span className="payroll-table-cell" style={employeeNameStyle}>{row.employee}</span>
                          </div>
                        </td>
                        <td className="payroll-table-cell py-3 pr-4 align-middle" style={tableCellTextStyle}>{grossFromSummary?.role ?? "—"}</td>
                        <td className="payroll-table-cell py-3 pr-4 align-middle" style={tableCellTextStyle}>{row.department}</td>
                        <td className="payroll-table-cell py-3 pr-4 align-middle" style={tableCellTextStyle}>{fmtMoneyC(grossFromSummary?.grossPay ?? 0, row.currency)}</td>
                        <td className="payroll-table-cell py-3 pr-4 align-middle" style={tableCellTextStyle}>{fmtMoneyC(row.socialInsurance, row.currency)}</td>
                        <td className="payroll-table-cell py-3 pr-4 align-middle" style={tableCellTextStyle}>{fmtMoneyC(row.healthFund, row.currency)}</td>
                        <td className="payroll-table-cell py-3 pr-4 align-middle" style={tableCellTextStyle}>{fmtMoneyC(row.incomeTax, row.currency)}</td>
                        <td className="payroll-table-cell py-3 align-middle" style={tableCellTextStyle}>{fmtMoneyC(row.totalDeductions, row.currency)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          )}

          {/* Employer Cost tab */}
          {subTab === "employer" && (
          <div className="px-6 py-6 md:px-8">
            <div className="mb-6 flex items-center justify-between gap-2">
              <h3 className="text-[13px] sm:text-[18px]" style={{ fontFamily: "Poppins, var(--font-poppins)", fontWeight: 600, color: "var(--color-dash-text-primary)" }}>Total Employer Cost</h3>
              <button
                type="button"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#0F4FDB] px-2.5 py-2 text-[11px] text-white shadow-sm transition hover:opacity-90 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-[14px]"
                style={{ ...poppins, fontWeight: 500 }}
                onClick={() => {
                  const rows = cost?.rows ?? [];
                  downloadCsv(
                    `employer-cost-${period}.csv`,
                    [
                      ["Department", "Employees", "Gross Payroll", "Social Insurance", "Benefits/Bonuses", "Total Cost"],
                      ...rows.map((r) => [r.department, r.employees, r.grossPayroll, r.employerSocialInsurance, r.benefitsAndBonuses, r.totalCost]),
                    ]
                  );
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                Export EXCEL
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] border-collapse text-left text-sm">
                <thead>
                  <tr className="payroll-table-row">
                    <th className="payroll-table-header py-4 pr-4 align-middle" style={tableHeaderStyle}>Department</th>
                    <th className="payroll-table-header py-4 pr-4 align-middle" style={tableHeaderStyle}>Gross Pay</th>
                    <th className="payroll-table-header py-4 pr-4 align-middle whitespace-nowrap" style={tableHeaderStyle}>Employer Social Ins.</th>
                    <th className="payroll-table-header py-4 pr-4 align-middle whitespace-nowrap" style={tableHeaderStyle}>Benefits & Bonuses</th>
                    <th className="payroll-table-header py-4 align-middle whitespace-nowrap" style={tableHeaderStyle}>Total Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {(cost?.rows ?? []).length === 0 && (
                    <tr><td colSpan={5} className="py-6 text-center text-[#9ca3af]" style={tableCellTextStyle}>No data for this period.</td></tr>
                  )}
                  {(cost?.rows ?? []).map((row) => (
                    <tr key={row.department} className="payroll-table-row">
                      <td className="payroll-table-cell py-4 pr-4 align-middle" style={tableCellTextStyle}>{row.department}</td>
                      <td className="payroll-table-cell py-4 pr-4 align-middle" style={tableCellTextStyle}>{fmtMoneyC(row.grossPayroll)}</td>
                      <td className="payroll-table-cell py-4 pr-4 align-middle" style={tableCellTextStyle}>{fmtMoneyC(row.employerSocialInsurance)}</td>
                      <td className="payroll-table-cell py-4 pr-4 align-middle" style={tableCellTextStyle}>{fmtMoneyC(row.benefitsAndBonuses)}</td>
                      <td className="payroll-table-cell py-4 align-middle" style={tableCellTextStyle}>{fmtMoneyC(row.totalCost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          )}

          {/* Audit Logs tab */}
          {subTab === "audit" && (
          <div className="px-6 pt-3 pb-6 md:px-8">
            <div className="mb-6 flex items-center justify-between gap-2">
              <h3 className="text-[13px] sm:text-[18px]" style={{ fontFamily: "Poppins, var(--font-poppins)", fontWeight: 600, color: "var(--color-dash-text-primary)" }}>System Audit Logs</h3>
              <button
                type="button"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#0F4FDB] px-2.5 py-2 text-[11px] text-white shadow-sm transition hover:opacity-90 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-[14px]"
                style={{ ...poppins, fontWeight: 500 }}
                onClick={() => {
                  const logs = audit?.rows ?? [];
                  downloadCsv(
                    `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`,
                    [
                      ["Timestamp", "User", "Role", "Action", "IP", "Details"],
                      ...logs.map((r) => [r.timestamp, r.name, r.role, r.action, r.ipAddress, r.details]),
                    ]
                  );
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                Export Logs
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] border-collapse text-left text-sm">
                <thead>
                  <tr className="payroll-audit-thead-row">
                    <th className="payroll-table-header py-3 pr-4 align-middle" style={tableHeaderStyle}>Timestamp</th>
                    <th className="payroll-table-header py-3 pr-4 align-middle" style={tableHeaderStyle}>Name</th>
                    <th className="payroll-table-header py-3 pr-4 align-middle" style={tableHeaderStyle}>Role</th>
                    <th className="payroll-table-header py-3 pr-4 align-middle" style={tableHeaderStyle}>Action</th>
                    <th className="payroll-table-header py-3 align-middle" style={tableHeaderStyle}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {(audit?.rows ?? []).length === 0 && (
                    <tr><td colSpan={5} className="py-6 text-center text-[#9ca3af]" style={tableCellTextStyle}>No audit logs.</td></tr>
                  )}
                  {(audit?.rows ?? []).map((row) => (
                    <tr key={row.id} className="payroll-table-row">
                      <td className="payroll-table-cell py-3 pr-4 align-middle" style={tableCellTextStyle}>{new Date(row.timestamp).toLocaleString("en-US")}</td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0F4FDB] text-white">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                          </span>
                          <span className="payroll-table-cell" style={employeeNameStyle}>{row.name}</span>
                        </div>
                      </td>
                      <td className="payroll-table-cell py-3 pr-4 align-middle" style={tableCellTextStyle}>{row.role}</td>
                      <td className="payroll-table-cell py-3 pr-4 align-middle" style={tableCellTextStyle}>{row.action}</td>
                      <td className="payroll-table-cell py-3 align-middle" style={tableCellTextStyle}>{row.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          )}
          </div>
          )}

          {/* Regulatory Reports */}
          {mainTab === "regulatory" && (
          <div>
            <div className="payroll-reports-outer-card reg-section-card rounded-xl bg-[#f7f7fa] px-6 py-6 md:px-8">
              <h3 className="mb-6 reg-section-heading text-[14px] sm:text-[18px]" style={{ fontFamily: "Poppins, var(--font-poppins)", fontWeight: 600 }}>Monthly Tax Authority Exports</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="reg-inner-card rounded-lg p-4 sm:p-6 md:p-8">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="reg-card-title text-[13px] sm:text-[17px]" style={{ ...poppins, fontWeight: 600 }}>{payeForm?.formName ?? "PAYE Form"}</h4>
                      {payeForm && (
                        <span
                          className={cn(
                            "inline-flex shrink-0 items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px] font-medium sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-xs",
                            payeForm.status === "submitted" && "border-[#86efac] bg-[#DCFCE7] text-[#166534]",
                            payeForm.status === "pending" && "border-[#FDE68A] bg-[#FEF9C3] text-[#854D0E]",
                            payeForm.status === "overdue" && "border-[#fecaca] bg-[#FEE2E2] text-[#b91c1c]"
                          )}
                          style={poppins}
                        >
                          <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", payeForm.status === "submitted" && "bg-[#166534]", payeForm.status === "pending" && "bg-[#EAB308]", payeForm.status === "overdue" && "bg-[#b91c1c]")} aria-hidden />
                          {statusBadge(payeForm.status)}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 reg-card-subtitle text-[12px] sm:text-[14px]" style={poppins}>{payeForm?.description ?? "Monthly Income Tax Report"}</p>
                  </div>
                  <div className="mt-8 space-y-4">
                    <div className="reg-stat-row flex items-center justify-between" style={regulatoryStatStyle}>
                      <span>Total Income Tax</span>
                      <span className="tabular-nums">{payeForm?.amount != null ? fmtMoneyC(payeForm.amount, payeForm.currency ?? "USD") : "—"}</span>
                    </div>
                    <div className="reg-stat-row flex items-center justify-between" style={regulatoryStatStyle}>
                      <span>Employees</span>
                      <span className="tabular-nums">{payeForm?.employeeCount ?? "—"}</span>
                    </div>
                    <div className="reg-stat-row flex items-center justify-between" style={regulatoryStatStyle}>
                      <span>Due Date</span>
                      <span className={cn("tabular-nums", payeForm?.status === "overdue" && "text-[#EF4444]")}>{payeForm ? fmtDate(payeForm.dueDate) : "—"}</span>
                    </div>
                  </div>
                  <div className="mt-8">
                    <button type="button" className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0F4FDB] px-4 py-2.5 text-[12px] text-white shadow-sm sm:text-[14px]" style={{ ...poppins, fontWeight: 500 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                      Download PAYE Report
                    </button>
                  </div>
                </div>
                <div className="reg-inner-card rounded-lg p-4 sm:p-6 md:p-8">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="reg-card-title text-[13px] sm:text-[17px]" style={{ ...poppins, fontWeight: 600 }}>{siForm?.formName ?? "Social Insurance Contributions"}</h4>
                      {siForm && (
                        <span
                          className={cn(
                            "inline-flex shrink-0 items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px] font-medium sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-xs",
                            siForm.status === "submitted" && "border-[#86efac] bg-[#DCFCE7] text-[#166534]",
                            siForm.status === "pending" && "border-[#FDE68A] bg-[#FEF9C3] text-[#854D0E]",
                            siForm.status === "overdue" && "border-[#fecaca] bg-[#FEE2E2] text-[#b91c1c]"
                          )}
                          style={poppins}
                        >
                          <span className={cn("h-1.5 w-1.5 rounded-full", siForm.status === "submitted" && "bg-[#166534]", siForm.status === "pending" && "bg-[#EAB308]", siForm.status === "overdue" && "bg-[#b91c1c]")} />
                          {statusBadge(siForm.status)}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 reg-card-subtitle text-[12px] sm:text-[14px]" style={poppins}>{siForm?.description ?? "Contributions Report"}</p>
                  </div>
                  <div className="mt-8 space-y-4">
                    <div className="reg-stat-row flex items-center justify-between" style={regulatoryStatStyle}>
                      <span>Total Contributions</span>
                      <span className="tabular-nums">{siForm?.amount != null ? fmtMoneyC(siForm.amount, siForm.currency ?? "USD") : "—"}</span>
                    </div>
                    <div className="reg-stat-row flex items-center justify-between" style={regulatoryStatStyle}>
                      <span>Employer Share</span>
                      <span className="tabular-nums">{siForm?.amount != null ? fmtMoneyC(siForm.amount / 2, siForm.currency ?? "USD") : "—"}</span>
                    </div>
                    <div className="reg-stat-row flex items-center justify-between" style={regulatoryStatStyle}>
                      <span>{siForm?.submittedDate ? "Submitted On" : "Due Date"}</span>
                      <span className={cn("tabular-nums", siForm?.status === "submitted" && "text-[#16a34a]")}>
                        {siForm ? fmtDate(siForm.submittedDate ?? siForm.dueDate) : "—"}
                      </span>
                    </div>
                  </div>
                  <div className="mt-8">
                    <button type="button" className="reg-outline-btn flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[12px] sm:text-[14px]" style={{ ...poppins, fontWeight: 500 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                      Download Contribution File
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-8">
              <h3 className="mb-4 reg-section-heading text-[13px] sm:text-[18px]" style={{ fontFamily: "Poppins, var(--font-poppins)", fontWeight: 600 }}>Regulatory Declarations & Forms</h3>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="payroll-audit-thead-row">
                      <th className="payroll-table-header py-3 pr-4 align-middle" style={tableHeaderStyle}>Form</th>
                      <th className="payroll-table-header py-3 pr-4 align-middle" style={tableHeaderStyle}>Description</th>
                      <th className="payroll-table-header py-3 pr-4 align-middle" style={tableHeaderStyle}>Period</th>
                      <th className="payroll-table-header py-3 pr-4 align-middle" style={tableHeaderStyle}>Due Date</th>
                      <th className="payroll-table-header py-3 align-middle" style={tableHeaderStyle}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(regulatory?.declarations ?? []).length === 0 && (
                      <tr><td colSpan={5} className="py-6 text-center text-[#9ca3af]" style={tableCellTextStyle}>No declarations yet.</td></tr>
                    )}
                    {(regulatory?.declarations ?? []).map((row) => {
                      const status = statusBadge(row.status);
                      return (
                        <tr key={row.id} className="payroll-table-row">
                          <td className="payroll-table-cell py-3 pr-4 align-middle" style={tableCellTextStyle}>
                            <span className="inline-flex items-center gap-2">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
                              {row.formType}
                            </span>
                          </td>
                          <td className="payroll-table-cell py-3 pr-4 align-middle" style={tableCellTextStyle}>{row.description ?? row.formName}</td>
                          <td className="payroll-table-cell py-3 pr-4 align-middle" style={tableCellTextStyle}>{row.period}</td>
                          <td className="payroll-table-cell py-3 pr-4 align-middle" style={tableCellTextStyle}>{fmtDate(row.dueDate)}</td>
                          <td className="py-3 align-middle">
                            <span
                              className={cn(
                                "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium",
                                status === "Submitted" && "border-[#86efac] bg-[#DCFCE7] text-[#166534]",
                                status === "Pending" && "border-[#FDE68A] bg-[#FEF9C3] text-[#854D0E]",
                                status === "Overdue" && "border-[#fecaca] bg-[#FEE2E2] text-[#b91c1c]"
                              )}
                              style={poppins}
                            >
                              <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", status === "Submitted" && "bg-[#166534]", status === "Pending" && "bg-[#EAB308]", status === "Overdue" && "bg-[#b91c1c]")} />
                              {status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              </div>
            </div>
          </div>
          )}
        </main>
    </div>
  );
}
