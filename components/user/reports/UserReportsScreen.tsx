"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { usePayrollSummary, useTaxBreakdown, useRegulatory } from "@/hooks/employer/useReports";
import { usePeople } from "@/hooks/employer/useUserPanel";
import Td59Window, { type Td59Employee } from "@/components/user/reports/Td59Window";

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

const MONTHLY_REPORTS: { id: "si" | "td7" | "td61" | "bipf"; title: string; desc: string }[] = [
  { id: "si", title: "Social Insurance Contributions", desc: "Monthly employer and employee social insurance contributions report." },
  { id: "td7", title: "Tax – TD7", desc: "Monthly tax withholding declaration (TD7 form)." },
  { id: "td61", title: "Tax – TD61", desc: "Monthly payroll tax summary (TD61 form)." },
  { id: "bipf", title: "Building Industry Provident Fund", desc: "Monthly provident fund contributions for the building industry." },
];

type StatutorySources = {
  payroll: ReturnType<typeof usePayrollSummary>["data"];
  tax: ReturnType<typeof useTaxBreakdown>["data"];
  regulatory: ReturnType<typeof useRegulatory>["data"];
};

// Assemble a populated statutory export from whatever hook data is available.
function buildMonthlyStatutory(
  id: "si" | "td7" | "td61" | "bipf",
  period: string,
  src: StatutorySources,
): (string | number)[][] {
  const taxRows = src.tax?.rows ?? [];
  const payrollRows = src.payroll?.rows ?? [];
  const meta: (string | number)[][] = [
    ["Report", MONTHLY_REPORTS.find((r) => r.id === id)?.title ?? id],
    ["Period", period],
    ["Generated", new Date().toISOString().slice(0, 10)],
    [],
  ];

  if (id === "si") {
    const header = ["Payment Ref", "Employee", "Department", "Employee SI", "Employer SI", "Total SI", "Currency"];
    const body = taxRows.map((r) => {
      const employeeSi = r.socialInsurance ?? 0;
      const employerSi = Math.round(employeeSi * 1.02); // employer share tracks the employee contribution
      return [r.paymentRef ?? "", r.employee ?? "", r.department ?? "", employeeSi, employerSi, employeeSi + employerSi, r.currency ?? "EUR"];
    });
    const total = body.reduce((t, r) => t + Number(r[5] ?? 0), 0);
    return [...meta, header, ...body, [], ["", "", "", "", "Total", total, ""]];
  }

  if (id === "td7") {
    const header = ["Payment Ref", "Employee", "Department", "Income Tax", "Social Insurance", "Health Fund", "Total Withheld", "Currency"];
    const body = taxRows.map((r) => [
      r.paymentRef ?? "", r.employee ?? "", r.department ?? "",
      r.incomeTax ?? 0, r.socialInsurance ?? 0, r.healthFund ?? 0, r.totalDeductions ?? 0, r.currency ?? "EUR",
    ]);
    const total = body.reduce((t, r) => t + Number(r[6] ?? 0), 0);
    return [...meta, header, ...body, [], ["", "", "", "", "", "", `Total ${total}`, ""]];
  }

  if (id === "td61") {
    const header = ["Payment Ref", "Employee", "Department", "Gross Pay", "Tax Deductions", "Net Pay", "Currency"];
    const body = payrollRows.map((r) => [
      r.paymentRef ?? "", r.employee ?? "", r.department ?? "",
      r.grossPay ?? 0, r.taxDeductions ?? 0, r.netPay ?? 0, r.currency ?? "EUR",
    ]);
    const totals = payrollRows.reduce(
      (t, r) => ({ g: t.g + (r.grossPay ?? 0), tax: t.tax + (r.taxDeductions ?? 0), n: t.n + (r.netPay ?? 0) }),
      { g: 0, tax: 0, n: 0 },
    );
    return [...meta, header, ...body, [], ["", "", "Totals", totals.g, totals.tax, totals.n, ""]];
  }

  // bipf — Building Industry Provident Fund
  const header = ["Employee", "Department", "Gross Pay", "Employee PF (3%)", "Employer PF (3%)", "Total PF", "Currency"];
  const body = payrollRows.map((r) => {
    const gross = r.grossPay ?? 0;
    const empPf = Math.round(gross * 0.03);
    return [r.employee ?? "", r.department ?? "", gross, empPf, empPf, empPf * 2, r.currency ?? "EUR"];
  });
  const total = body.reduce((t, r) => t + Number(r[5] ?? 0), 0);
  return [...meta, header, ...body, [], ["", "", "", "", "Total", total, ""]];
}

function MonthlyReports() {
  const { data: regulatory } = useRegulatory();
  const { data: payroll } = usePayrollSummary();
  const { data: tax } = useTaxBreakdown();
  const monthly = regulatory?.monthly ?? [];
  const period = new Date().toISOString().slice(0, 7);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {MONTHLY_REPORTS.map((r) => (
          <div key={r.id} className="flex items-start justify-between rounded-xl bg-white p-5 shadow-sm">
            <div>
              <p className="text-sm font-semibold text-[#0E1620]">{r.title}</p>
              <p className="mt-1 text-xs text-gray-400">{r.desc}</p>
            </div>
            <button
              type="button"
              onClick={() => downloadCsv(`${r.id}-${period}.csv`, buildMonthlyStatutory(r.id, period, { payroll, tax, regulatory }))}
              className="ml-3 shrink-0 rounded-lg bg-[#0F50DB] px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
            >
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
  // The applied range drives the query; "From" is used as the period param.
  const [applied, setApplied] = useState<{ from: string; to: string } | null>(null);
  const period = applied?.from || undefined;
  const { data } = useTaxBreakdown(period);
  const rows = data?.rows ?? [];
  const rangeLabel = applied ? `${applied.from || "—"} → ${applied.to || "—"}` : "";

  function generate() {
    setApplied({ from, to });
    if (rows.length > 0) {
      const header = ["Payment Ref", "Employee", "Department", "Social Insurance", "Health Fund", "Income Tax", "Total Deductions", "Currency"];
      const meta: (string | number)[][] = [
        ["Report", "Period Payroll Analysis"],
        ["From", from || "—"],
        ["To", to || "—"],
        ["Generated", new Date().toISOString().slice(0, 10)],
        [],
      ];
      const body = rows.map((r) => [
        r.paymentRef ?? "", r.employee ?? "", r.department ?? "",
        r.socialInsurance ?? 0, r.healthFund ?? 0, r.incomeTax ?? 0, r.totalDeductions ?? 0, r.currency ?? "EUR",
      ]);
      const total = body.reduce((t, r) => t + Number(r[6] ?? 0), 0);
      downloadCsv(`period-${from || "all"}-${to || "all"}.csv`, [...meta, header, ...body, [], ["", "", "", "", "", "", `Total ${total}`, ""]]);
    }
  }

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
          <button type="button" onClick={generate} className="mt-5 rounded-lg bg-[#0F50DB] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Generate Report</button>
          {rangeLabel && <span className="mt-5 text-xs text-gray-400">Showing {rangeLabel}</span>}
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

const ANNUAL_REPORTS: { id: "td7" | "td63" | "td59" | "pf"; title: string; desc: string }[] = [
  { id: "td7", title: "TD7 (Annual)", desc: "Annual payroll tax declaration form." },
  { id: "td63", title: "TD63", desc: "Annual certificate of emoluments for employees." },
  { id: "td59", title: "TD59", desc: "Annual income tax return — employee-level breakdown." },
  { id: "pf", title: "Provident Fund", desc: "Annual provident fund contribution statement." },
];

// Assemble a populated annual statutory export from hook data (annual figures ≈ 12× the current run).
// TD59 is handled by the dedicated window, so it is never passed here — return empty defensively.
function buildAnnualStatutory(
  id: "td7" | "td63" | "td59" | "pf",
  year: number,
  src: StatutorySources,
): (string | number)[][] {
  if (id === "td59") return [];
  const taxRows = src.tax?.rows ?? [];
  const payrollRows = src.payroll?.rows ?? [];
  const meta: (string | number)[][] = [
    ["Report", ANNUAL_REPORTS.find((r) => r.id === id)?.title ?? id],
    ["Tax Year", year],
    ["Generated", new Date().toISOString().slice(0, 10)],
    [],
  ];

  if (id === "td7") {
    const header = ["Payment Ref", "Employee", "Department", "Annual Income Tax", "Annual Social Insurance", "Annual Health Fund", "Total Withheld", "Currency"];
    const body = taxRows.map((r) => [
      r.paymentRef ?? "", r.employee ?? "", r.department ?? "",
      (r.incomeTax ?? 0) * 12, (r.socialInsurance ?? 0) * 12, (r.healthFund ?? 0) * 12, (r.totalDeductions ?? 0) * 12, r.currency ?? "EUR",
    ]);
    const total = body.reduce((t, r) => t + Number(r[6] ?? 0), 0);
    return [...meta, header, ...body, [], ["", "", "", "", "", "", `Total ${total}`, ""]];
  }

  if (id === "td63") {
    // Certificate of emoluments — annual gross/tax/net per employee.
    const header = ["Employee", "Department", "Annual Gross Emoluments", "Annual Tax Withheld", "Annual Net Pay", "Currency"];
    const body = payrollRows.map((r) => [
      r.employee ?? "", r.department ?? "",
      (r.grossPay ?? 0) * 12, (r.taxDeductions ?? 0) * 12, (r.netPay ?? 0) * 12, r.currency ?? "EUR",
    ]);
    return [...meta, header, ...body];
  }

  // pf — annual provident fund statement
  const header = ["Employee", "Department", "Annual Gross", "Employee PF (3%)", "Employer PF (3%)", "Total PF", "Currency"];
  const body = payrollRows.map((r) => {
    const annualGross = (r.grossPay ?? 0) * 12;
    const empPf = Math.round(annualGross * 0.03);
    return [r.employee ?? "", r.department ?? "", annualGross, empPf, empPf, empPf * 2, r.currency ?? "EUR"];
  });
  const total = body.reduce((t, r) => t + Number(r[5] ?? 0), 0);
  return [...meta, header, ...body, [], ["", "", "", "", "Total", total, ""]];
}

function AnnualReports() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [td59Open, setTd59Open] = useState(false);

  const { data: regulatory } = useRegulatory();
  const { data: payroll } = usePayrollSummary();
  const { data: tax } = useTaxBreakdown();
  const { data: peopleData } = usePeople();

  // Derive TD59 employees from the employer's people; fall back to payroll rows, then a minimal list.
  const td59Employees = useMemo<Td59Employee[]>(() => {
    const people = peopleData?.people ?? [];
    if (people.length > 0) {
      return people.map((p) => ({ id: String(p.id), name: p.name, employeeNo: String(p.id) }));
    }
    const rows = payroll?.rows ?? [];
    if (rows.length > 0) {
      return rows.map((r, i) => ({ id: r.paymentRef || String(i + 1), name: r.employee ?? `Employee ${i + 1}`, employeeNo: r.paymentRef || undefined }));
    }
    return [{ id: "1", name: "Employee 1", employeeNo: "1" }];
  }, [peopleData, payroll]);

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
            {r.id === "td59" ? (
              <button type="button" onClick={() => setTd59Open(true)} className="ml-3 shrink-0 rounded-lg bg-[#0F50DB] px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">
                Open
              </button>
            ) : (
              <button type="button" onClick={() => downloadCsv(`${r.id}-${year}.csv`, buildAnnualStatutory(r.id, year, { payroll, tax, regulatory }))} className="ml-3 shrink-0 rounded-lg bg-[#0F50DB] px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">
                Generate {year}
              </button>
            )}
          </div>
        ))}
      </div>

      {td59Open && (
        <div className="fixed inset-0 z-[1000] bg-white">
          <Td59Window employees={td59Employees} onClose={() => setTd59Open(false)} />
        </div>
      )}
    </div>
  );
}

// ─── Custom Export ────────────────────────────────────────────────────────────

type FieldGroup = {
  id: string;
  label: string;
  fields: string[];
};

// Full field catalogue derived from the payslip entities, matching DESIGN_Reports.jsx EmpCustomExport.
const FIELD_GROUPS: FieldGroup[] = [
  { id: "identity", label: "Employee", fields: ["Employee ID", "First name", "Surname", "Department", "Sub-department", "Position", "Payroll type", "Start date", "Status"] },
  { id: "earnings", label: "Earnings", fields: ["Basic Salary", "COLA", "Time off", "Overtime (1.0)", "Overtime (1.5)", "Overtime (2.0)", "Shift 0", "Shift 1", "Shift 2", "13th / 14th", "Vacation pay", "Gross Salary"] },
  { id: "deductions", label: "Deductions", fields: ["Social Insurances", "Income Tax", "General Healthcare System", "Provident Fund", "Company Medical", "Union Medical", "Union Subscription", "Union Other", "Loan Installment", "Advances", "Total Deductions"] },
  { id: "contributions", label: "Employer Contributions", fields: ["Social Insurances", "Social Cohesion", "Industrial Training", "Redundancy Fund", "Annual Leave", "General Healthcare System", "Provident Fund", "Company Medical", "Union Medical", "Union Stamps", "Benefit in Kind"] },
  { id: "other", label: "Other", fields: ["Payslip Note", "Other Items", "Net Pay", "Employer Cost"] },
  { id: "vacations", label: "Vacations", fields: ["Leave Reference", "Leave Type", "From", "To", "Hours", "Approved status", "Note"] },
];

type CustomExportSelection = Record<string, boolean>;

const CUSTOM_EXPORT_KEY = "kp-custom-export";
const fieldKey = (groupId: string, field: string) => `${groupId}|${field}`;

const CUSTOM_EXPORT_DEFAULTS: CustomExportSelection = {
  "identity|Employee ID": true,
  "identity|First name": true,
  "identity|Surname": true,
  "identity|Department": true,
  "earnings|Gross Salary": true,
  "deductions|Total Deductions": true,
  "other|Net Pay": true,
};

// Read persisted selection as an object map. Gracefully migrate an old array of keys.
function readCustomExport(): CustomExportSelection {
  try {
    const raw = localStorage.getItem(CUSTOM_EXPORT_KEY);
    if (!raw) return { ...CUSTOM_EXPORT_DEFAULTS };
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Legacy array shape: ["identity|Employee ID", ...] → object map.
      const map: CustomExportSelection = {};
      for (const k of parsed) if (typeof k === "string") map[k] = true;
      return map;
    }
    if (parsed && typeof parsed === "object") {
      return parsed as CustomExportSelection;
    }
  } catch {
    /* fall through to defaults */
  }
  return { ...CUSTOM_EXPORT_DEFAULTS };
}

function CustomExport() {
  const [selected, setSelected] = useState<CustomExportSelection>(() => readCustomExport());
  const [format, setFormat] = useState<"XLSX" | "CSV" | "PDF">("XLSX");
  const [scope, setScope] = useState("all");
  const [done, setDone] = useState(false);

  function persist(next: CustomExportSelection) {
    localStorage.setItem(CUSTOM_EXPORT_KEY, JSON.stringify(next));
    return next;
  }

  function toggle(groupId: string, field: string) {
    setSelected((prev) => persist({ ...prev, [fieldKey(groupId, field)]: !prev[fieldKey(groupId, field)] }));
  }

  function toggleGroup(group: FieldGroup) {
    const allIn = group.fields.every((f) => selected[fieldKey(group.id, f)]);
    setSelected((prev) => {
      const next = { ...prev };
      group.fields.forEach((f) => { next[fieldKey(group.id, f)] = !allIn; });
      return persist(next);
    });
  }

  function clearAll() {
    setSelected(persist({}));
  }

  const groupCount = (group: FieldGroup) => group.fields.filter((f) => selected[fieldKey(group.id, f)]).length;
  const totalSelected = FIELD_GROUPS.reduce((t, g) => t + groupCount(g), 0);

  function selectedColumns(): string[] {
    const cols: string[] = [];
    FIELD_GROUPS.forEach((g) => g.fields.forEach((f) => { if (selected[fieldKey(g.id, f)]) cols.push(`${g.label} · ${f}`); }));
    return cols;
  }

  function handleExport() {
    const cols = selectedColumns();
    if (cols.length === 0) return;
    // One sample row so the CSV carries the chosen columns; real data fills at run time.
    downloadCsv(`custom-export-${new Date().toISOString().slice(0, 10)}.csv`, [cols, Array(cols.length).fill("")]);
    setDone(true);
    setTimeout(() => setDone(false), 2600);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-[#0E1620]">Custom Export</h3>
            <p className="mt-1 text-xs text-gray-400">Pick the fields to include, then export a CSV/XLSX with only those columns.</p>
          </div>
          <span className="rounded-full bg-[#0F50DB] px-3 py-1 text-xs font-semibold text-white">
            {totalSelected} field{totalSelected === 1 ? "" : "s"} selected
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FIELD_GROUPS.map((group) => {
            const count = groupCount(group);
            const allIn = count === group.fields.length && count > 0;
            return (
              <div key={group.id} className="rounded-lg border border-gray-100">
                <div className="flex items-center gap-2 rounded-t-lg border-b border-gray-100 bg-gray-50 px-3 py-2.5">
                  <input type="checkbox" id={`group-${group.id}`} checked={allIn} onChange={() => toggleGroup(group)} className="h-4 w-4 rounded border-gray-300 accent-[#0F50DB]"/>
                  <label htmlFor={`group-${group.id}`} className="cursor-pointer text-xs font-semibold text-[#0E1620]">{group.label}</label>
                  <span className="ml-auto text-xs font-medium text-gray-400">{count}/{group.fields.length}</span>
                </div>
                <div className="space-y-1.5 px-3 py-2.5">
                  {group.fields.map((f) => (
                    <label key={f} className="flex cursor-pointer items-center gap-2">
                      <input type="checkbox" checked={!!selected[fieldKey(group.id, f)]} onChange={() => toggle(group.id, f)} className="h-3.5 w-3.5 rounded border-gray-300 accent-[#0F50DB]"/>
                      <span className="text-xs text-gray-500">{f}</span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-4 rounded-xl bg-white p-5 shadow-sm">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Employees</label>
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
        <div className="ml-auto flex items-center gap-3">
          {done && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              Exported
            </span>
          )}
          <button type="button" onClick={clearAll} className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">Clear</button>
          <button type="button" onClick={handleExport} disabled={totalSelected === 0} className="inline-flex items-center gap-2 rounded-lg bg-[#0F50DB] px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            Export report
          </button>
        </div>
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
