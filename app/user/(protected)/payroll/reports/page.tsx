"use client";

import React, { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { DASHBOARD_ROUTES } from "@/components/user/dashboard/routes";

type ReportMainTab = "payroll" | "regulatory";
type ReportSubTab = "summary" | "breakdown" | "tax" | "employer" | "audit";

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

const METRIC_CARDS = [
  { title: "Total Payroll", value: "$142,384.00", icon: "dollar", change: "12% vs last month" },
  { title: "Active Employees of selected Period", value: "48", icon: "people", change: "12% vs last month" },
  { title: "Total Taxes", value: "$32,450.20", icon: "doc", change: "12% vs last month" },
  { title: "Employer Cost", value: "$18,240.50", icon: "bolt", change: "12% vs last month" },
];

const PAYSHEET_ROWS = [
  { name: "John Doe", role: "Senior Dev", department: "Accountant", grossPay: "$5361.27", taxDeductions: "$1174.01", netPay: "$5090.82", status: "PENDING" as const },
  { name: "Lucy", role: "Junior Specialist", department: "HR", grossPay: "$3363.27", taxDeductions: "$1174.90", netPay: "$5993.82", status: "PAID" as const },
  { name: "Alexa", role: "Senior Specialist", department: "HR", grossPay: "$5363.27", taxDeductions: "$104.90", netPay: "$5903.82", status: "PENDING" as const },
];

const BREAKDOWN_BY_DEPARTMENT = [
  { name: "Engineering", amount: "$40,000", employees: 12 },
  { name: "Sales", amount: "$40,000", employees: 12 },
  { name: "Marketing", amount: "$40,000", employees: 12 },
  { name: "HR", amount: "$40,000", employees: 12 },
];

const TAX_CONTRIBUTIONS_ROWS = [
  { name: "John Doe", role: "Senior Dev", department: "HR", grossPay: "$5,361.27", socialInsurance: "$420.00", healthFund: "$180.00", incomeTax: "$574.01", totalDeductions: "$1,174.01" },
  { name: "Lucy", role: "Junior Specialist", department: "HR", grossPay: "$3,363.27", socialInsurance: "$265.00", healthFund: "$112.00", incomeTax: "$797.90", totalDeductions: "$1,174.90" },
  { name: "Alena", role: "Senior Specialist", department: "HR", grossPay: "$5,363.27", socialInsurance: "$420.00", healthFund: "$180.00", incomeTax: "$104.90", totalDeductions: "$704.90" },
];

const EMPLOYER_COST_ROWS = [
  { department: "Engineering", grossPay: "$5,363.27", employerSocialIns: "$124.50", benefitsBonuses: "$85.20", totalCost: "$49,700.00" },
  { department: "Sales", grossPay: "$5,363.27", employerSocialIns: "$124.50", benefitsBonuses: "$85.20", totalCost: "$49,700.00" },
  { department: "Marketing", grossPay: "$5,363.27", employerSocialIns: "$124.50", benefitsBonuses: "$85.20", totalCost: "$49,700.00" },
];

const AUDIT_LOGS_ROWS = [
  { timestamp: "2023-10-25 12:30 AM", name: "John Doe", role: "Admin user", action: "Payroll Run", details: "Executed monthly payroll batch" },
  { timestamp: "2023-10-28 09:15 AM", name: "Lucy", role: "Finance Manager", action: "Tax export", details: "Downloaded 80 form" },
  { timestamp: "2023-10-27 02:45 PM", name: "Alex", role: "HR specialist", action: "Employee update", details: "Updated salary for Employee 12" },
];

const REGULATORY_FORMS_ROWS = [
  { form: "R7", description: "Employer's Return", period: "2023", dueDate: "2024-04-30", status: "Pending" as const },
  { form: "R83", description: "Employee Certificate", period: "2023", dueDate: "2024-02-28", status: "Submitted" as const },
  { form: "R59", description: "Deduction Certificate", period: "Oct 2024", dueDate: "2023-8-30", status: "Overdue" as const },
];

export default function PayrollReportsPage() {
  const [mainTab, setMainTab] = useState<ReportMainTab>("payroll");
  const [subTab, setSubTab] = useState<ReportSubTab>("summary");

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
                  type="text"
                  readOnly
                  value="Select Date"
                  className="payroll-select-date h-11 min-w-[160px] rounded-lg border border-[#e5e7eb] bg-white pl-3 pr-10 text-sm text-[#6b7280]"
                  style={poppins}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </span>
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
            {METRIC_CARDS.map((card) => (
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
                  {PAYSHEET_ROWS.map((row) => (
                    <tr key={row.name} className="payroll-table-row">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0F4FDB] text-white">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                            </svg>
                          </span>
                          <span className="payroll-table-cell" style={employeeNameStyle}>{row.name}</span>
                        </div>
                      </td>
                      <td className="payroll-table-cell py-3 pr-4 align-middle" style={tableCellTextStyle}>{row.role}</td>
                      <td className="payroll-table-cell py-3 pr-4 align-middle" style={tableCellTextStyle}>{row.department}</td>
                      <td className="payroll-table-cell py-3 pr-4 align-middle" style={tableCellTextStyle}>{row.grossPay}</td>
                      <td className="payroll-table-cell py-3 pr-4 align-middle" style={tableCellTextStyle}>{row.taxDeductions}</td>
                      <td className="payroll-table-cell py-3 pr-4 align-middle" style={tableCellTextStyle}>{row.netPay}</td>
                      <td className="py-3 align-middle">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase leading-tight tracking-wide text-white",
                            row.status === "PAID"
                              ? "bg-[#16A34A]"
                              : "bg-[#F59E0B]"
                          )}
                          style={{ ...poppins, fontSize: "11px", lineHeight: "14px" }}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
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
                  {BREAKDOWN_BY_DEPARTMENT.map((row) => (
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
              <button type="button" className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#0F4FDB] px-2.5 py-2 text-[11px] text-white shadow-sm transition hover:opacity-90 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-[14px]" style={{ ...poppins, fontWeight: 500 }}>
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
                  {TAX_CONTRIBUTIONS_ROWS.map((row) => (
                    <tr key={row.name} className="payroll-table-row">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0F4FDB] text-white">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                          </span>
                          <span className="payroll-table-cell" style={employeeNameStyle}>{row.name}</span>
                        </div>
                      </td>
                      <td className="payroll-table-cell py-3 pr-4 align-middle" style={tableCellTextStyle}>{row.role}</td>
                      <td className="payroll-table-cell py-3 pr-4 align-middle" style={tableCellTextStyle}>{row.department}</td>
                      <td className="payroll-table-cell py-3 pr-4 align-middle" style={tableCellTextStyle}>{row.grossPay}</td>
                      <td className="payroll-table-cell py-3 pr-4 align-middle" style={tableCellTextStyle}>{row.socialInsurance}</td>
                      <td className="payroll-table-cell py-3 pr-4 align-middle" style={tableCellTextStyle}>{row.healthFund}</td>
                      <td className="payroll-table-cell py-3 pr-4 align-middle" style={tableCellTextStyle}>{row.incomeTax}</td>
                      <td className="payroll-table-cell py-3 align-middle" style={tableCellTextStyle}>{row.totalDeductions}</td>
                    </tr>
                  ))}
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
              <button type="button" className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#0F4FDB] px-2.5 py-2 text-[11px] text-white shadow-sm transition hover:opacity-90 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-[14px]" style={{ ...poppins, fontWeight: 500 }}>
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
                  {EMPLOYER_COST_ROWS.map((row) => (
                    <tr key={row.department} className="payroll-table-row">
                      <td className="payroll-table-cell py-4 pr-4 align-middle" style={tableCellTextStyle}>{row.department}</td>
                      <td className="payroll-table-cell py-4 pr-4 align-middle" style={tableCellTextStyle}>{row.grossPay}</td>
                      <td className="payroll-table-cell py-4 pr-4 align-middle" style={tableCellTextStyle}>{row.employerSocialIns}</td>
                      <td className="payroll-table-cell py-4 pr-4 align-middle" style={tableCellTextStyle}>{row.benefitsBonuses}</td>
                      <td className="payroll-table-cell py-4 align-middle" style={tableCellTextStyle}>{row.totalCost}</td>
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
              <button type="button" className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#0F4FDB] px-2.5 py-2 text-[11px] text-white shadow-sm transition hover:opacity-90 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-[14px]" style={{ ...poppins, fontWeight: 500 }}>
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
                  {AUDIT_LOGS_ROWS.map((row) => (
                    <tr key={`${row.timestamp}-${row.name}`} className="payroll-table-row">
                      <td className="payroll-table-cell py-3 pr-4 align-middle" style={tableCellTextStyle}>{row.timestamp}</td>
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
                      <h4 className="reg-card-title text-[13px] sm:text-[17px]" style={{ ...poppins, fontWeight: 600 }}>PAYE Form</h4>
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#FDE68A] bg-[#FEF9C3] px-1.5 py-0.5 text-[9px] font-medium text-[#854D0E] sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-xs" style={poppins}>
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#EAB308]" aria-hidden /> Pending
                      </span>
                    </div>
                    <p className="mt-1 reg-card-subtitle text-[12px] sm:text-[14px]" style={poppins}>Monthly Income Tax Report</p>
                  </div>
                  <div className="mt-8 space-y-4">
                    <div className="reg-stat-row flex items-center justify-between" style={regulatoryStatStyle}>
                      <span>Total Income Tax</span>
                      <span className="tabular-nums">$12,450.00</span>
                    </div>
                    <div className="reg-stat-row flex items-center justify-between" style={regulatoryStatStyle}>
                      <span>Employees</span>
                      <span className="tabular-nums">48</span>
                    </div>
                    <div className="reg-stat-row flex items-center justify-between" style={regulatoryStatStyle}>
                      <span>Due Date</span>
                      <span className="tabular-nums text-[#EF4444]">Oct 30, 2023</span>
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
                      <h4 className="reg-card-title text-[13px] sm:text-[17px]" style={{ ...poppins, fontWeight: 600 }}>Social Insurance Contributions</h4>
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#86efac] bg-[#DCFCE7] px-1.5 py-0.5 text-[9px] font-medium text-[#166534] sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-xs" style={poppins}>
                        <span className="h-1.5 w-1.5 rounded-full bg-[#166534]" /> Submitted
                      </span>
                    </div>
                    <p className="mt-1 reg-card-subtitle text-[12px] sm:text-[14px]" style={poppins}>Contributions Report</p>
                  </div>
                  <div className="mt-8 space-y-4">
                    <div className="reg-stat-row flex items-center justify-between" style={regulatoryStatStyle}>
                      <span>Total Contributions</span>
                      <span className="tabular-nums">$8,240.50</span>
                    </div>
                    <div className="reg-stat-row flex items-center justify-between" style={regulatoryStatStyle}>
                      <span>Employer Share</span>
                      <span className="tabular-nums">$4,120.25</span>
                    </div>
                    <div className="reg-stat-row flex items-center justify-between" style={regulatoryStatStyle}>
                      <span>Submitted On</span>
                      <span className="tabular-nums text-[#16a34a]">Oct 25, 2023</span>
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
                    {REGULATORY_FORMS_ROWS.map((row) => (
                      <tr key={row.form} className="payroll-table-row">
                        <td className="payroll-table-cell py-3 pr-4 align-middle" style={tableCellTextStyle}>
                          <span className="inline-flex items-center gap-2">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
                            {row.form}
                          </span>
                        </td>
                        <td className="payroll-table-cell py-3 pr-4 align-middle" style={tableCellTextStyle}>{row.description}</td>
                        <td className="payroll-table-cell py-3 pr-4 align-middle" style={tableCellTextStyle}>{row.period}</td>
                        <td className="payroll-table-cell py-3 pr-4 align-middle" style={tableCellTextStyle}>{row.dueDate}</td>
                        <td className="py-3 align-middle">
                          <span
                            className={cn(
                              "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium",
                              row.status === "Submitted" && "border-[#86efac] bg-[#DCFCE7] text-[#166534]",
                              row.status === "Pending" && "border-[#FDE68A] bg-[#FEF9C3] text-[#854D0E]",
                              row.status === "Overdue" && "border-[#fecaca] bg-[#FEE2E2] text-[#b91c1c]"
                            )}
                            style={poppins}
                          >
                            <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", row.status === "Submitted" && "bg-[#166534]", row.status === "Pending" && "bg-[#EAB308]", row.status === "Overdue" && "bg-[#b91c1c]")} />
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
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
