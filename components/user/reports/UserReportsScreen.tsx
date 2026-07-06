"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { usePayrollSummary, useTaxBreakdown, useRegulatory } from "@/hooks/employer/useReports";

type ReportsTab = "payroll" | "monthly" | "period" | "annual" | "custom";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtMoney(n: number | undefined | null, currency = "EUR") {
  const num = n ?? 0;
  return num.toLocaleString("en-US", { style: "currency", currency, maximumFractionDigits: 0 });
}

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const escape = (v: string | number | null | undefined) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = rows.map((r) => r.map(escape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Tab nav ──────────────────────────────────────────────────────────────────

const TABS: { key: ReportsTab; label: string }[] = [
  { key: "payroll", label: "Payroll Reports" },
  { key: "monthly", label: "Monthly Reports" },
  { key: "period", label: "Period Reports" },
  { key: "annual", label: "Annual Reports" },
  { key: "custom", label: "Custom Export" },
];

// ─── Payroll Reports ──────────────────────────────────────────────────────────

function PayrollReports() {
  const { data } = usePayrollSummary();
  const rows = data?.rows ?? [];
  const metrics = data?.metrics;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total Payroll", value: fmtMoney(metrics?.totalPayroll) },
          { label: "Active Employees", value: String(metrics?.activeEmployees ?? "—") },
          { label: "Total Taxes", value: fmtMoney(metrics?.totalTaxes) },
          { label: "Employer Cost", value: fmtMoney(metrics?.employerCost) },
        ].map((c) => (
          <div key={c.label} className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-400">{c.label}</p>
            <p className="mt-1 text-lg font-bold text-[#0E1620]">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#0E1620]">Payroll Summary</h3>
          <button type="button" onClick={() => downloadCsv("payroll-summary.csv", [["Employee","Department","Gross","Tax","Net","Currency"], ...rows.map((r) => [r.employee ?? "", r.department ?? "", r.grossPay ?? 0, r.taxDeductions ?? 0, r.netPay ?? 0, r.currency ?? ""])])} className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-200">
            Download CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-medium text-gray-400">
                {["Employee", "Department", "Period", "Gross", "Tax", "Net"].map((h) => <th key={h} className="py-3 pr-4">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-gray-400">No payroll data available.</td></tr>
              ) : rows.map((r, i) => (
                <tr key={i}>
                  <td className="py-3 pr-4 font-medium text-[#0E1620]">{r.employee ?? "—"}</td>
                  <td className="py-3 pr-4 text-gray-500">{r.department ?? "—"}</td>
                  <td className="py-3 pr-4 text-gray-500">{r.currency ?? "—"}</td>
                  <td className="py-3 pr-4 font-medium">{fmtMoney(r.grossPay)}</td>
                  <td className="py-3 pr-4 text-red-600">{fmtMoney(r.taxDeductions)}</td>
                  <td className="py-3 pr-4 font-semibold text-emerald-600">{fmtMoney(r.netPay)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Monthly Reports ──────────────────────────────────────────────────────────

const MONTHLY_REPORTS = [
  { id: "si", title: "Social Insurance Contributions", desc: "Monthly employer and employee social insurance contributions report." },
  { id: "td7", title: "Tax – TD7", desc: "Monthly tax withholding declaration (TD7 form)." },
  { id: "td61", title: "Tax – TD61", desc: "Monthly payroll tax summary (TD61 form)." },
  { id: "bipf", title: "Building Industry Provident Fund", desc: "Monthly provident fund contributions for the building industry." },
];

function MonthlyReports() {
  const { data } = useRegulatory();
  const monthly = data?.monthly ?? [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {MONTHLY_REPORTS.map((r) => (
          <div key={r.id} className="flex items-start justify-between rounded-xl bg-white p-5 shadow-sm">
            <div>
              <p className="text-sm font-semibold text-[#0E1620]">{r.title}</p>
              <p className="mt-1 text-xs text-gray-400">{r.desc}</p>
            </div>
            <button type="button" onClick={() => downloadCsv(`${r.id}-${new Date().toISOString().slice(0,7)}.csv`, [["Report", "Period"], [r.title, new Date().toISOString().slice(0,7)]])} className="ml-3 shrink-0 rounded-lg bg-[#0F50DB] px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">
              Generate
            </button>
          </div>
        ))}
      </div>

      {monthly.length > 0 && (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-[#0E1620]">Recent Monthly Reports</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-medium text-gray-400">
                  <th className="py-3 pr-4">Period</th>
                  <th className="py-3 pr-4">Type</th>
                  <th className="py-3 pr-4">Amount</th>
                  <th className="py-3 pr-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {monthly.map((r, i) => (
                  <tr key={i}>
                    <td className="py-3 pr-4 text-gray-500">{r.period ?? "—"}</td>
                    <td className="py-3 pr-4 font-medium text-[#0E1620]">{r.formName ?? r.formType ?? "—"}</td>
                    <td className="py-3 pr-4 font-medium">{fmtMoney(r.amount)}</td>
                    <td className="py-3 pr-4">
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">{r.status ?? "—"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Period Reports ───────────────────────────────────────────────────────────

function PeriodReports() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const { data } = useTaxBreakdown();
  const rows = data?.rows ?? [];

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-[#0E1620]">Select Period</h3>
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">From</label>
            <input type="month" value={from} onChange={(e) => setFrom(e.target.value)} className="h-9 rounded-lg border border-gray-200 px-3 text-sm text-gray-700 focus:border-[#0F50DB] focus:outline-none focus:ring-1 focus:ring-[#0F50DB]"/>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">To</label>
            <input type="month" value={to} onChange={(e) => setTo(e.target.value)} className="h-9 rounded-lg border border-gray-200 px-3 text-sm text-gray-700 focus:border-[#0F50DB] focus:outline-none focus:ring-1 focus:ring-[#0F50DB]"/>
          </div>
          <button type="button" className="mt-5 rounded-lg bg-[#0F50DB] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Generate Report</button>
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-[#0E1620]">Tax Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-medium text-gray-400">
                {["Payment Ref", "Employee", "Department", "Social Insurance", "Health Fund", "Income Tax", "Total Deductions", "Currency"].map((h) => (
                  <th key={h} className="py-3 pr-4 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.length === 0 ? (
                <tr><td colSpan={8} className="py-8 text-center text-gray-400">No tax breakdown data available.</td></tr>
              ) : rows.map((r, i) => (
                <tr key={i}>
                  <td className="py-3 pr-4 font-mono text-xs text-gray-500">{r.paymentRef ?? "—"}</td>
                  <td className="py-3 pr-4 font-medium text-[#0E1620]">{r.employee ?? "—"}</td>
                  <td className="py-3 pr-4 text-gray-500">{r.department ?? "—"}</td>
                  <td className="py-3 pr-4 text-gray-600">{fmtMoney(r.socialInsurance)}</td>
                  <td className="py-3 pr-4 text-gray-600">{fmtMoney(r.healthFund)}</td>
                  <td className="py-3 pr-4 text-gray-600">{fmtMoney(r.incomeTax)}</td>
                  <td className="py-3 pr-4 font-semibold">{fmtMoney(r.totalDeductions)}</td>
                  <td className="py-3 pr-4 text-gray-400">{r.currency ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Annual Reports ───────────────────────────────────────────────────────────

const ANNUAL_REPORTS = [
  { id: "td7", title: "TD7 (Annual)", desc: "Annual payroll tax declaration form." },
  { id: "td63", title: "TD63", desc: "Annual certificate of emoluments for employees." },
  { id: "td59", title: "TD59", desc: "Annual income tax return — employee-level breakdown." },
  { id: "pf", title: "Provident Fund", desc: "Annual provident fund contribution statement." },
];

function AnnualReports() {
  const [year, setYear] = useState(new Date().getFullYear());

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="text-xs font-medium text-gray-500">Tax Year</label>
        <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="h-8 rounded-lg border border-gray-200 px-2 text-sm text-gray-700 focus:outline-none">
          {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {ANNUAL_REPORTS.map((r) => (
          <div key={r.id} className="flex items-start justify-between rounded-xl bg-white p-5 shadow-sm">
            <div>
              <p className="text-sm font-semibold text-[#0E1620]">{r.title}</p>
              <p className="mt-1 text-xs text-gray-400">{r.desc}</p>
            </div>
            <button type="button" onClick={() => downloadCsv(`${r.id}-${year}.csv`, [["Report","Year"],[r.title,year]])} className="ml-3 shrink-0 rounded-lg bg-[#0F50DB] px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">
              Generate {year}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Custom Export ────────────────────────────────────────────────────────────

type FieldGroup = {
  key: string;
  label: string;
  fields: { key: string; label: string }[];
};

const FIELD_GROUPS: FieldGroup[] = [
  {
    key: "employee",
    label: "Employee",
    fields: [
      { key: "emp_name", label: "Full Name" },
      { key: "emp_no", label: "Employee No" },
      { key: "emp_email", label: "Email" },
      { key: "emp_dept", label: "Department" },
      { key: "emp_position", label: "Position" },
      { key: "emp_start", label: "Start Date" },
      { key: "emp_country", label: "Country" },
    ],
  },
  {
    key: "earnings",
    label: "Earnings",
    fields: [
      { key: "earn_salary", label: "Base Salary" },
      { key: "earn_cola", label: "COLA" },
      { key: "earn_overtime", label: "Overtime" },
      { key: "earn_13th", label: "13th Salary" },
      { key: "earn_bonus", label: "Bonus" },
    ],
  },
  {
    key: "deductions",
    label: "Deductions",
    fields: [
      { key: "ded_si", label: "Social Insurance" },
      { key: "ded_tax", label: "Income Tax" },
      { key: "ded_ghs", label: "GHS" },
      { key: "ded_pf", label: "Provident Fund" },
      { key: "ded_union", label: "Union Subscription" },
    ],
  },
  {
    key: "contributions",
    label: "Employer Contributions",
    fields: [
      { key: "cont_si", label: "Social Insurance (Employer)" },
      { key: "cont_soc", label: "Social Cohesion Fund" },
      { key: "cont_it", label: "Industrial Training" },
      { key: "cont_rf", label: "Redundancy Fund" },
      { key: "cont_ghs", label: "GHS (Employer)" },
    ],
  },
  {
    key: "other",
    label: "Other",
    fields: [
      { key: "other_note", label: "Payslip Note" },
      { key: "other_net", label: "Net Pay" },
      { key: "other_gross", label: "Gross Pay" },
      { key: "other_cost", label: "Total Employer Cost" },
    ],
  },
  {
    key: "vacations",
    label: "Vacations",
    fields: [
      { key: "vac_annual", label: "Annual Leave Hours" },
      { key: "vac_sick", label: "Sick Leave Hours" },
      { key: "vac_parental", label: "Parental Leave Hours" },
    ],
  },
];

function CustomExport() {
  const [selected, setSelected] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem("kp-custom-export") ?? "[]")); } catch { return new Set(); }
  });
  const [format, setFormat] = useState<"XLSX" | "CSV" | "PDF">("CSV");
  const [scope, setScope] = useState("all");

  function toggle(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      localStorage.setItem("kp-custom-export", JSON.stringify([...next]));
      return next;
    });
  }

  function toggleGroup(group: FieldGroup) {
    const allIn = group.fields.every((f) => selected.has(f.key));
    setSelected((prev) => {
      const next = new Set(prev);
      if (allIn) group.fields.forEach((f) => next.delete(f.key));
      else group.fields.forEach((f) => next.add(f.key));
      localStorage.setItem("kp-custom-export", JSON.stringify([...next]));
      return next;
    });
  }

  function clearAll() {
    setSelected(new Set());
    localStorage.setItem("kp-custom-export", "[]");
  }

  function handleExport() {
    if (selected.size === 0) return;
    const allFields = FIELD_GROUPS.flatMap((g) => g.fields.filter((f) => selected.has(f.key)));
    const header = allFields.map((f) => f.label);
    downloadCsv(`custom-export-${new Date().toISOString().slice(0,10)}.csv`, [header, Array(header.length).fill("—")]);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-[#0E1620]">
            Field Picker
            {selected.size > 0 && (
              <span className="ml-2 rounded-full bg-[#0F50DB] px-2 py-0.5 text-xs font-semibold text-white">{selected.size} fields selected</span>
            )}
          </h3>
          <button type="button" onClick={clearAll} className="text-xs text-gray-400 hover:underline">Clear all</button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FIELD_GROUPS.map((group) => {
            const groupSelected = group.fields.filter((f) => selected.has(f.key)).length;
            const allIn = groupSelected === group.fields.length;
            return (
              <div key={group.key} className="rounded-lg border border-gray-100 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <input type="checkbox" id={`group-${group.key}`} checked={allIn} onChange={() => toggleGroup(group)} className="h-4 w-4 rounded border-gray-300 accent-[#0F50DB]"/>
                  <label htmlFor={`group-${group.key}`} className="text-xs font-semibold text-gray-600 cursor-pointer">
                    {group.label}
                    <span className="ml-1.5 text-gray-400 font-normal">{groupSelected}/{group.fields.length}</span>
                  </label>
                </div>
                <div className="space-y-2">
                  {group.fields.map((f) => (
                    <label key={f.key} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={selected.has(f.key)} onChange={() => toggle(f.key)} className="h-3.5 w-3.5 rounded border-gray-300 accent-[#0F50DB]"/>
                      <span className="text-xs text-gray-500">{f.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl bg-white p-5 shadow-sm flex flex-wrap items-center gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Employees Scope</label>
          <select value={scope} onChange={(e) => setScope(e.target.value)} className="h-9 rounded-lg border border-gray-200 px-3 text-sm text-gray-700 focus:outline-none">
            <option value="all">All Employees</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Format</label>
          <div className="flex gap-2">
            {(["XLSX", "CSV", "PDF"] as const).map((f) => (
              <button key={f} type="button" onClick={() => setFormat(f)} className={cn("rounded-lg px-3 py-2 text-xs font-semibold", format === f ? "bg-[#0F50DB] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <button type="button" onClick={handleExport} disabled={selected.size === 0} className="ml-auto rounded-lg bg-[#0F50DB] px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed">
          Export Report
        </button>
      </div>
    </div>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function UserReportsScreen() {
  const [tab, setTab] = useState<ReportsTab>("payroll");

  return (
    <div className="min-h-full w-full bg-dash-page" data-dashboard-theme data-page="reports">
      <div className="dash-shell w-full">
        <main className="pb-8 pt-8 md:pt-10 space-y-4">
          {/* Header */}
          <section className="mx-auto max-w-[1245px] rounded-xl bg-white px-6 py-5 shadow-sm">
            <h1 className="text-xl font-semibold text-[#0E1620]" style={{ fontFamily: "var(--font-poppins), Poppins, sans-serif" }}>
              Generate Reports
            </h1>
          </section>

          {/* Tab nav */}
          <div className="mx-auto max-w-[1245px] overflow-x-auto">
            <div className="inline-flex min-w-max gap-2">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={cn(
                    "rounded-full px-5 py-2 text-sm font-semibold outline-none",
                    tab === t.key ? "bg-[#0F50DB] text-white shadow-sm" : "text-gray-500 hover:bg-gray-100"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className="mx-auto max-w-[1245px]">
            {tab === "payroll" && <PayrollReports />}
            {tab === "monthly" && <MonthlyReports />}
            {tab === "period" && <PeriodReports />}
            {tab === "annual" && <AnnualReports />}
            {tab === "custom" && <CustomExport />}
          </div>
        </main>
      </div>
    </div>
  );
}
