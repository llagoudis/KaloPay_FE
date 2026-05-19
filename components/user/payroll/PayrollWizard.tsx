"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DASHBOARD_ROUTES } from "@/components/user/dashboard/routes";
import { cn } from "@/lib/utils/cn";
import { usePayrollEmployees, useFundingStatus, useRunPayroll } from "@/hooks/employer/useUserPanel";

// Tax/cost rates (mirror backend so summary matches what the server will compute on submit)
const RATE_INCOME_TAX = 0.20;
const RATE_SOCIAL = 0.08;
const RATE_HEALTH = 0.02;
const RATE_EMPLOYER_SOCIAL = 0.115;
const RATE_EMPLOYER_BENEFITS = 0.05;

const AVATAR_PALETTE = ["#F97316", "#3B82F6", "#8B5CF6", "#EC4899", "#14B8A6", "#6366F1", "#22C55E", "#F59E0B"];

function downloadBlob(content: string, filename: string, mime = "text/csv") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function csvLine(...values: (string | number)[]): string {
  return values
    .map((v) => {
      const s = String(v ?? "");
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    })
    .join(",");
}

// ── Step definitions ───────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Create Run" },
  { id: 2, label: "Calculation" },
  { id: 3, label: "Review" },
  { id: 4, label: "Execution" },
  { id: 5, label: "Files" },
];

// ── Data types ────────────────────────────────────────────────
type Employee = {
  id: string; name: string; dept: string; avatar: string; avatarColor: string;
  salary: number; overtime: number; bonuses: number; commissions: number; expenses: number; unpaidDays: number;
};

type CalcEmployee = {
  id: string; name: string; dept: string; avatar: string; avatarColor: string;
  gross: number; deductions: number; employerContrib: number; netSalary: number; employerCost: number;
  highNow?: boolean;
};

type ReviewEmployee = {
  id: string; name: string; role: string; avatar: string; avatarColor: string;
  total: number; changePct: string; changePositive: boolean;
  earnings?: { baseSalary: number; overtime: number; bonuses: number };
  deductions?: { incomeTax: number; socialInsurance: number; gesy: number };
};

// Mock arrays removed — wizard now derives all data from the API.

// ── Sub-components ────────────────────────────────────────────
function SpinnerInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="payroll-spinner-wrap inline-flex items-center overflow-hidden rounded-lg border border-[#E5E7EB] bg-[#F9FAFB]" style={{ minWidth: 76 }}>
      <span className="payroll-spinner-val flex-1 px-2 py-1.5 text-center text-[13px] font-medium text-[#374151]">{value}</span>
      <div className="payroll-spinner-divider flex flex-col border-l border-[#E5E7EB]">
        <button type="button" onClick={() => onChange(value + 1)} className="payroll-spinner-btn flex h-[18px] w-6 items-center justify-center border-b border-[#E5E7EB] text-[#9CA3AF] transition hover:text-[#374151]">
          <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 7L5 4L8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
        </button>
        <button type="button" onClick={() => onChange(Math.max(0, value - 1))} className="payroll-spinner-btn flex h-[18px] w-6 items-center justify-center text-[#9CA3AF] transition hover:text-[#374151]">
          <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 4L5 7L8 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
        </button>
      </div>
    </div>
  );
}

function AvatarGroup({ avatars }: { avatars: { avatar: string; avatarColor: string }[] }) {
  return (
    <div className="flex items-center">
      {avatars.slice(0, 3).map((a, i) => (
        <div key={i} className="payroll-avatar-border flex h-9 w-9 items-center justify-center rounded-full border-2 text-[11px] font-bold text-white" style={{ backgroundColor: a.avatarColor, marginLeft: i > 0 ? -10 : 0, zIndex: 3 - i }}>
          {a.avatar}
        </div>
      ))}
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function CardHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 px-4 py-4 sm:px-6 sm:py-5">
      <div>
        <h2 className="payroll-create-card-title text-[17px] font-semibold [font-family:var(--font-poppins),Poppins,sans-serif]">{title}</h2>
        {subtitle && <p className="payroll-create-card-sub mt-0.5 text-[13px]">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

function BackNextRow({ onBack, onNext, nextLabel = "Next", nextDisabled = false }: { onBack?: () => void; onNext?: () => void; nextLabel?: string; nextDisabled?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-4 sm:px-6 sm:py-5">
      {onBack
        ? <button type="button" onClick={onBack} className="payroll-create-back-step-btn rounded-lg border px-5 py-2.5 text-[14px] font-medium transition">Back</button>
        : <span />
      }
      {onNext && (
        <button type="button" onClick={onNext} disabled={nextDisabled} className="rounded-lg bg-[#0F50DB] px-6 py-2.5 text-[14px] font-medium text-white transition hover:opacity-90 disabled:opacity-40 [font-family:var(--font-poppins),Poppins,sans-serif]">
          {nextLabel}
        </button>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
export default function PayrollWizard() {
  const [step, setStep] = useState(1);

  // Live employees from backend
  const { data: empData, isLoading: empLoading } = usePayrollEmployees();

  // Step 1: editable per-employee inputs (keyed by string id from API)
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [hasInitialized, setHasInitialized] = useState(false);

  // Initialize from API once loaded
  if (!hasInitialized && empData?.employees) {
    const init: Employee[] = empData.employees.map((e, i) => ({
      id: String(e.id),
      name: e.name,
      dept: e.department,
      avatar: e.name.charAt(0).toUpperCase(),
      avatarColor: AVATAR_PALETTE[i % AVATAR_PALETTE.length],
      salary: e.monthlyGross,
      overtime: 0,
      bonuses: 0,
      commissions: 0,
      expenses: 0,
      unpaidDays: 0,
    }));
    setEmployees(init);
    setSelectedIds(new Set(init.map((e) => e.id)));
    setHasInitialized(true);
  }

  const missingBank = (empData?.employees ?? []).filter((e) => !e.hasBank).length;

  // Step 2 / 3 / 4 computed lines (server will recompute the same way)
  const calcLines = useMemo(() => {
    return employees
      .filter((e) => selectedIds.has(e.id))
      .map((e) => {
        const dailyRate = e.salary / 22;
        const unpaidDeduction = dailyRate * (e.unpaidDays || 0);
        const gross = Math.max(0, e.salary + e.overtime + e.bonuses + e.commissions + e.expenses - unpaidDeduction);
        const incomeTax = gross * RATE_INCOME_TAX;
        const social = gross * RATE_SOCIAL;
        const health = gross * RATE_HEALTH;
        const deductions = incomeTax + social + health;
        const net = gross - deductions;
        const employerContrib = gross * (RATE_EMPLOYER_SOCIAL + RATE_EMPLOYER_BENEFITS);
        const employerCost = gross + employerContrib;
        return {
          id: e.id,
          name: e.name,
          dept: e.dept,
          avatar: e.avatar,
          avatarColor: e.avatarColor,
          baseSalary: e.salary,
          overtime: e.overtime,
          bonuses: e.bonuses,
          gross,
          deductions,
          incomeTax,
          social,
          health,
          employerContrib,
          net,
          employerCost,
        };
      });
  }, [employees, selectedIds]);

  const totals = useMemo(() => ({
    gross: calcLines.reduce((s, l) => s + l.gross, 0),
    deductions: calcLines.reduce((s, l) => s + l.deductions, 0),
    employerContrib: calcLines.reduce((s, l) => s + l.employerContrib, 0),
    net: calcLines.reduce((s, l) => s + l.net, 0),
    employerCost: calcLines.reduce((s, l) => s + l.employerCost, 0),
  }), [calcLines]);

  // Step 2: explicit "Calculate" trigger (client-side; values are already memo-computed,
  // but we gate the table render on this flag so the user clicks through)
  const [calculated, setCalculated] = useState(false);

  // Step 3
  const [expandedReview, setExpandedReview] = useState<string | null>(null);
  const [reviewComments, setReviewComments] = useState("");
  const [showSendReview, setShowSendReview] = useState(false);

  // Step 4
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [paymentDesc, setPaymentDesc] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [runResult, setRunResult] = useState<{ batchRef: string; totalNet: number; employeeCount: number } | null>(null);
  const [runError, setRunError] = useState<string | null>(null);

  const fundingQuery = useFundingStatus(Math.ceil(totals.employerCost), step >= 4);
  const runMutation = useRunPayroll();

  // Step 5
  const [payslipsGenerated, setPayslipsGenerated] = useState(false);
  const [bankFileGenerated, setBankFileGenerated] = useState(false);

  function updateEmployee(id: string, field: keyof Employee, value: number) {
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  }
  function toggleEmployee(id: string) {
    setSelectedIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function toggleAll() {
    setSelectedIds(selectedIds.size === employees.length ? new Set() : new Set(employees.map((e) => e.id)));
  }

  const next = () => setStep((s) => Math.min(s + 1, 5));
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  async function handleSubmitPayroll() {
    setRunError(null);
    try {
      const result = await runMutation.mutateAsync({
        period: paymentDesc || `Payroll ${new Date(paymentDate).toLocaleString("en-US", { month: "long", year: "numeric" })}`,
        paymentDate,
        description: paymentDesc,
        execute: true,
        employees: employees
          .filter((e) => selectedIds.has(e.id))
          .map((e) => ({
            id: Number(e.id),
            gross: e.salary,
            overtime: e.overtime,
            bonuses: e.bonuses,
            commissions: e.commissions,
            expenses: e.expenses,
            unpaidDays: e.unpaidDays,
          })),
      });
      setRunResult({
        batchRef: result.batchRef,
        totalNet: result.summary.totalGross - (result.lines.reduce((s, l) => s + l.deductions, 0)),
        employeeCount: result.summary.employeeCount,
      });
      setShowSendReview(false);
      setShowSuccess(true);
    } catch (e) {
      setRunError((e as Error).message ?? "Payroll execution failed");
    }
  }

  function handleDownloadPayslips() {
    const header = ["paymentRef","employee","department","baseSalary","overtime","bonuses","gross","incomeTax","socialInsurance","healthFund","totalDeductions","netPay"];
    const rows = calcLines.map((l, i) =>
      csvLine(`PAY-${i + 1}`, l.name, l.dept, l.baseSalary.toFixed(2), l.overtime, l.bonuses, l.gross.toFixed(2), l.incomeTax.toFixed(2), l.social.toFixed(2), l.health.toFixed(2), l.deductions.toFixed(2), l.net.toFixed(2))
    );
    downloadBlob([header.join(","), ...rows].join("\n"), `payslips-${Date.now()}.csv`);
    setPayslipsGenerated(true);
  }

  function handleDownloadBankFile() {
    // Minimal SEPA-style XML for batch transfers
    const xmlRows = calcLines.map((l, i) => `
    <CdtTrfTxInf>
      <PmtId><EndToEndId>PAY-${i + 1}</EndToEndId></PmtId>
      <Amt><InstdAmt Ccy="USD">${l.net.toFixed(2)}</InstdAmt></Amt>
      <CdtrAcct><Id><Othr><Id>EMP-${l.id}</Id></Othr></Id></CdtrAcct>
      <Cdtr><Nm>${l.name}</Nm></Cdtr>
    </CdtTrfTxInf>`).join("");
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.03">
  <CstmrCdtTrfInitn>
    <PmtInf>
      <PmtMtd>TRF</PmtMtd>
      <ReqdExctnDt>${paymentDate}</ReqdExctnDt>${xmlRows}
    </PmtInf>
  </CstmrCdtTrfInitn>
</Document>`;
    downloadBlob(xml, `bank-transfer-${Date.now()}.xml`, "application/xml");
    setBankFileGenerated(true);
  }

  function handleDownloadGov(label: string) {
    const header = ["employee","gross","incomeTax","socialInsurance","healthFund","totalDeductions","net"];
    const rows = calcLines.map((l) =>
      csvLine(l.name, l.gross.toFixed(2), l.incomeTax.toFixed(2), l.social.toFixed(2), l.health.toFixed(2), l.deductions.toFixed(2), l.net.toFixed(2))
    );
    downloadBlob([header.join(","), ...rows].join("\n"), `${label.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.csv`);
  }

  return (
    <div className="min-h-full w-full bg-dash-page" data-dashboard-theme data-page="payroll-create">
      <div className="dash-shell w-full pb-10 pt-6">

        {/* ── Header card ── */}
        <div className="payroll-create-header-card mb-6 rounded-xl px-6 py-5">
          <div className="flex items-center gap-3">
            <Link href={DASHBOARD_ROUTES.payroll} className="payroll-create-back-btn inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition" aria-label="Back">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></svg>
            </Link>
            <h1 className="payroll-create-title text-[24px] font-semibold [font-family:var(--font-poppins),Poppins,sans-serif]">Create Payroll Run</h1>
          </div>
        </div>

        {/* ── Stepper ── */}
        <div className="payroll-create-stepper-card mb-6 overflow-x-auto rounded-xl p-6">
          {/* Row 1 — circles + connectors */}
          <div className="flex min-w-[580px] w-full items-center">
            {STEPS.map((s, i) => {
              const done = step > s.id;
              const active = step === s.id;
              const pending = step < s.id;
              return (
                <div key={s.id} className="flex flex-1 min-w-0 items-center">
                  {i === 0 ? (
                    <div className="flex-1 min-w-0 shrink" />
                  ) : (
                    <div className={cn("payroll-stepper-connector h-1 flex-1 min-w-[8px] shrink", step >= s.id ? "payroll-stepper-connector--done" : "payroll-stepper-connector--pending")} />
                  )}
                  <div className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                    active && "border-[5.33px] border-white bg-[#2563eb] text-white shadow-[0_0_0_1px_#1e40af,0_2px_8px_rgba(37,99,235,0.35)]",
                    done && "bg-[#2563eb] text-white",
                    pending && "payroll-step-circle-pending border-[5.33px] border-[#CCCCCC] bg-transparent text-[#d4d4d4]"
                  )}>
                    {done
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      : s.id}
                  </div>
                  {i < STEPS.length - 1 ? (
                    <div className={cn("payroll-stepper-connector h-1 flex-1 min-w-[8px] shrink", step > s.id ? "payroll-stepper-connector--done" : "payroll-stepper-connector--pending")} />
                  ) : (
                    <div className="flex-1 min-w-0 shrink" />
                  )}
                </div>
              );
            })}
          </div>
          {/* Row 2 — labels + badges */}
          <div className="mt-3 flex min-w-[580px] w-full">
            {STEPS.map((s) => {
              const done = step > s.id;
              const active = step === s.id;
              return (
                <div key={s.id} className="flex min-w-0 flex-1 flex-col items-center gap-[10px]">
                  <span className="payroll-step-label min-w-0 text-center text-[14px] font-medium leading-[100%] tracking-normal [font-family:var(--font-poppins),Poppins,sans-serif]">
                    {s.label}
                  </span>
                  <span className={cn(
                    "inline-flex items-center justify-center rounded-[8px] px-4 py-1 text-[12px] font-medium leading-[100%] tracking-normal [font-family:var(--font-poppins),Poppins,sans-serif]",
                    active ? "payroll-step-badge-active h-[26px] min-w-[103px]" : done ? "payroll-step-badge-done h-[26px] min-w-[101px]" : "payroll-step-badge-pending h-[26px] min-w-[81px] border border-solid"
                  )}>
                    {active ? "In-Progress" : done ? "Completed" : "Pending"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ══════════════════════════════════════
            STEP 1 — Create Run
        ══════════════════════════════════════ */}
        {step === 1 && (
          <div className="payroll-create-card">
            <CardHeader
              title="Create Payroll Run"
              subtitle="Select period and verify employee data"
              right={
                <div className="flex w-[180px] cursor-pointer items-center justify-between gap-2 rounded-lg border px-3 py-2 payroll-create-date-input">
                  <span className="payroll-create-date-text text-[13px]">Select Date</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="payroll-create-date-icon shrink-0">
                    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
              }
            />
            {/* Warning */}
            {missingBank > 0 && (
              <div className="payroll-create-warning-banner mx-3 mt-5 flex items-start gap-3 rounded-lg border px-3 py-3 sm:mx-6 sm:px-4">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <div>
                  <p className="text-[13px] font-semibold text-[#92400E]">Missing Information</p>
                  <p className="text-[12px] text-[#78350F]">{missingBank} employee{missingBank === 1 ? "" : "s"} missing bank details. Update their profiles before execution.</p>
                </div>
              </div>
            )}
            {empLoading && employees.length === 0 && (
              <p className="px-6 py-6 text-sm text-dash-secondary">Loading employees…</p>
            )}
            {!empLoading && employees.length === 0 && (
              <p className="px-6 py-6 text-sm text-dash-secondary">No active employees found.</p>
            )}
            {/* Employees header */}
            <div className="mt-5 flex items-center gap-2 px-3 sm:px-6">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="payroll-create-section-icon shrink-0">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <h3 className="payroll-create-section-title text-[14px] font-semibold [font-family:var(--font-poppins),Poppins,sans-serif]">Active Employees ({employees.length})</h3>
            </div>
            {/* Table */}
            <div className="mt-3 overflow-x-auto px-3 sm:px-6">
              <table className="w-full min-w-[680px]">
                <thead>
                  <tr className="payroll-create-table-head">
                    <th className="pb-3 pr-3 w-8">
                      <input type="checkbox" checked={selectedIds.size === employees.length} onChange={toggleAll} className="h-4 w-4 cursor-pointer rounded border-[#d1d5db] accent-[#0F50DB]" />
                    </th>
                    <th className="pb-3 pr-4 text-left text-[11px] font-medium uppercase tracking-wide">
                      Employees
                    </th>
                    {["Gross Salary", "Overtime", "Bonuses", "Commissions", "Expenses", "Unpaid Days"].map((h) => (
                      <th key={h} className="pb-3 px-3 text-center text-[11px] font-medium uppercase tracking-wide first:text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id} className="payroll-create-table-row">
                      <td className="py-3 pr-3 w-8">
                        <input type="checkbox" checked={selectedIds.has(emp.id)} onChange={() => toggleEmployee(emp.id)} className="h-4 w-4 cursor-pointer rounded border-[#d1d5db] accent-[#0F50DB]" />
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white" style={{ backgroundColor: emp.avatarColor }}>{emp.avatar}</div>
                          <div>
                            <p className="payroll-create-emp-name text-[13px] font-semibold">{emp.name}</p>
                            <p className="payroll-create-emp-dept text-[11px]">{emp.dept}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center"><span className="payroll-create-salary text-[13px] font-medium">${emp.salary.toLocaleString()}</span></td>
                      <td className="py-3 px-3 text-center"><SpinnerInput value={emp.overtime} onChange={(v) => updateEmployee(emp.id, "overtime", v)} /></td>
                      <td className="py-3 px-3 text-center"><SpinnerInput value={emp.bonuses} onChange={(v) => updateEmployee(emp.id, "bonuses", v)} /></td>
                      <td className="py-3 px-3 text-center"><SpinnerInput value={emp.commissions} onChange={(v) => updateEmployee(emp.id, "commissions", v)} /></td>
                      <td className="py-3 px-3 text-center"><SpinnerInput value={emp.expenses} onChange={(v) => updateEmployee(emp.id, "expenses", v)} /></td>
                      <td className="py-3 px-3 text-center"><SpinnerInput value={emp.unpaidDays} onChange={(v) => updateEmployee(emp.id, "unpaidDays", v)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <BackNextRow onNext={next} />
          </div>
        )}

        {/* ══════════════════════════════════════
            STEP 2 — Calculation
        ══════════════════════════════════════ */}
        {step === 2 && (
          <div className="payroll-create-card">
            <CardHeader
              title="Payroll Calculation"
              subtitle="Calculate gross, net, and contributions"
            />
            {!calculated ? (
              <div className="px-6 py-6">
                <div className="payroll-calc-placeholder flex flex-col items-center justify-center rounded-xl py-14">
                  <div className="payroll-create-card-header-border mb-5 flex h-16 w-16 items-center justify-center rounded-xl border">
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="payroll-create-section-icon">
                      <rect x="2" y="3" width="20" height="18" rx="2" /><line x1="8" y1="9" x2="16" y2="9" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="12" y2="17" />
                    </svg>
                  </div>
                  <h3 className="payroll-create-card-title mb-2 text-[16px] font-semibold [font-family:var(--font-poppins),Poppins,sans-serif]">Ready to Calculate</h3>
                  <p className="payroll-create-card-sub mb-6 max-w-[320px] text-center text-[13px]">
                    The system will apply Cyprus tax rules, social insurance contributions, and GESY rates automatically.
                  </p>
                  <button type="button" onClick={() => setCalculated(true)} className="rounded-lg bg-[#0F50DB] px-6 py-2.5 text-[14px] font-medium text-white transition hover:opacity-90 [font-family:var(--font-poppins),Poppins,sans-serif]">
                    Calculate Payroll
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto px-3 pt-4 sm:px-6">
                <table className="w-full min-w-[680px]">
                  <thead>
                    <tr className="payroll-create-table-head">
                      {["Employees", "Gross Salary", "Total Deductions", "Employer Contrib.", "Net Salary", "Employer Cost"].map((h) => (
                        <th key={h} className="pb-3 pr-3 text-left text-[11px] font-medium uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {calcLines.map((emp) => (
                      <tr key={emp.id} className="payroll-create-table-row">
                        <td className="py-3 pr-3">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ backgroundColor: emp.avatarColor }}>{emp.avatar}</div>
                            <div>
                              <p className="payroll-create-emp-name text-[13px] font-medium">{emp.name}</p>
                              <div className="flex items-center gap-1.5">
                                <p className="payroll-create-emp-dept text-[11px]">{emp.dept}</p>
                                {emp.gross > 8000 && <span className="payroll-high-now-badge whitespace-nowrap rounded px-1 py-0.5 text-[7px] font-semibold">High Value</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 pr-3"><span className="payroll-create-salary text-[13px] font-medium">${emp.gross.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></td>
                        <td className="py-3 pr-3"><span className="text-[13px] font-medium text-[#DC2626]">-${emp.deductions.toFixed(2)}</span></td>
                        <td className="py-3 pr-3"><span className="payroll-create-salary text-[13px]">${emp.employerContrib.toFixed(2)}</span></td>
                        <td className="py-3 pr-3"><span className="payroll-create-salary text-[13px] font-medium">${emp.net.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></td>
                        <td className="py-3 pr-3"><span className="payroll-create-salary text-[13px]">${emp.employerCost.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></td>
                      </tr>
                    ))}
                    <tr className="payroll-create-totals-row">
                      <td className="py-3 pr-3"><span className="payroll-create-card-title text-[12px] font-bold uppercase tracking-wide">TOTALS</span></td>
                      <td className="py-3 pr-3"><span className="payroll-create-salary text-[13px] font-bold">${totals.gross.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></td>
                      <td className="py-3 pr-3"><span className="text-[13px] font-bold text-[#DC2626]">-${totals.deductions.toFixed(2)}</span></td>
                      <td className="py-3 pr-3"><span className="payroll-create-salary text-[13px] font-bold">${totals.employerContrib.toFixed(2)}</span></td>
                      <td className="py-3 pr-3"><span className="text-[13px] font-bold text-[#0F50DB]">${totals.net.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></td>
                      <td className="py-3 pr-3"><span className="payroll-create-salary text-[13px] font-bold">${totals.employerCost.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
            <BackNextRow onBack={prev} onNext={calculated ? next : undefined} />
          </div>
        )}

        {/* ══════════════════════════════════════
            STEP 3 — Review & Approval
        ══════════════════════════════════════ */}
        {step === 3 && (
          <div className="payroll-create-card">
            <CardHeader title="Review & Approval" subtitle="Review employee breakdown and submit for approval" />
            <div className="px-3 py-4 sm:px-6 sm:py-5">
              <div className="payroll-review-row overflow-hidden rounded-xl border">
                {calcLines.length === 0 && (
                  <p className="px-5 py-8 text-center text-sm text-dash-secondary">No employees selected.</p>
                )}
                {calcLines.map((emp, idx) => {
                  const expanded = expandedReview === emp.id;
                  return (
                    <div key={emp.id}>
                      {idx > 0 && <div className="payroll-create-card-header-border border-t" />}
                      <button type="button" onClick={() => setExpandedReview(expanded ? null : emp.id)} className="flex w-full items-center gap-3 px-3 py-4 text-left transition hover:bg-black/[0.02] sm:gap-4 sm:px-5">
                        <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition", expanded && "payroll-review-arrow-open")}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={cn("transition-transform", expanded ? "text-[#2563eb] rotate-90" : "payroll-create-section-icon")}><polyline points="9 18 15 12 9 6" /></svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="payroll-create-emp-name truncate text-[13px] font-semibold">{emp.name}</p>
                          <p className="payroll-create-emp-dept truncate text-[11px]">{emp.dept}</p>
                        </div>
                        <div className="text-right">
                          <p className="payroll-create-salary text-[14px] font-semibold">${emp.net.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                          <p className="text-[11px] font-medium text-[#16A34A]">Net</p>
                        </div>
                      </button>
                      {expanded && (
                        <div className="payroll-review-expand border-t px-5 py-5 payroll-create-card-header-border">
                          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                              <h4 className="payroll-create-section-title mb-3 text-[11px] font-semibold uppercase tracking-wide">Earnings</h4>
                              <div className="space-y-2">
                                {[["Base Salary", `$${emp.baseSalary.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`], ["Overtime", `$${emp.overtime.toFixed(2)}`], ["Bonuses", `$${emp.bonuses.toFixed(2)}`]].map(([k, v]) => (
                                  <div key={k} className="flex justify-between text-[13px]">
                                    <span className="payroll-create-emp-dept">{k}</span>
                                    <span className="payroll-create-salary font-medium">{v}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="payroll-create-section-title mb-3 text-[11px] font-semibold uppercase tracking-wide">Deductions</h4>
                              <div className="space-y-2">
                                {[["Income Tax (20%)", emp.incomeTax], ["Social Insurance (8%)", emp.social], ["Health Fund (2%)", emp.health]].map(([k, v]) => (
                                  <div key={String(k)} className="flex justify-between text-[13px]">
                                    <span className="payroll-create-emp-dept">{k}</span>
                                    <span className="font-medium text-[#DC2626]">-${Number(v).toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="payroll-create-card-header-border mt-5 border-t pt-4">
                            <input type="text" placeholder="Add Comments" value={reviewComments} onChange={(e) => setReviewComments(e.target.value)} className="payroll-create-comment-input w-full rounded-lg border px-4 py-2.5 text-[13px] outline-none" />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <BackNextRow onBack={prev} onNext={next} nextLabel="Next" />
          </div>
        )}

        {/* ══════════════════════════════════════
            STEP 4 — Execution
        ══════════════════════════════════════ */}
        {step === 4 && (
          <div className="payroll-create-card">
            <div className="px-6 py-5 text-center">
              <h2 className="payroll-create-card-title text-[17px] font-semibold [font-family:var(--font-poppins),Poppins,sans-serif]">Payment Execution</h2>
              <p className="payroll-create-card-sub mt-0.5 text-[13px]">Verify funding and execute payments</p>
            </div>
            <div className="px-4 py-4 sm:px-6 sm:py-6">
              <div className="mx-auto max-w-[520px] space-y-4">
                {/* Funding Status (live) */}
                {(() => {
                  const sufficient = fundingQuery.data?.sufficient ?? false;
                  return (
                    <div className="payroll-exec-funding-card rounded-xl border px-3 py-3 sm:px-5 sm:py-4">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", sufficient ? "bg-[#DCFCE7]" : "bg-[#FEE2E2]")}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={sufficient ? "#16A34A" : "#DC2626"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 3H8l-4 4h16l-4-4Z" />
                            </svg>
                          </div>
                          <div>
                            <p className="payroll-create-card-title text-[13px] font-semibold">Funding Status</p>
                            <p className={cn("mt-0.5 flex items-center gap-1 text-[12px] font-medium", sufficient ? "text-[#16A34A]" : "text-[#DC2626]")}>
                              {fundingQuery.isLoading ? "Checking…" : sufficient ? "Sufficient Funds" : "Insufficient Funds"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="payroll-create-emp-dept text-[12px]">Required Amount</p>
                          <p className="payroll-create-salary text-[20px] font-bold">${totals.employerCost.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                      </div>
                      <div className="mt-3 border-t pt-3 payroll-create-card-header-border">
                        <p className="payroll-create-emp-dept mb-0.5 text-[12px]">Available Balance</p>
                        <p className="payroll-create-salary text-[22px] font-bold">${(fundingQuery.data?.available ?? 0).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                  );
                })()}
                {/* Payment Details */}
                <div className="rounded-xl border px-3 py-3 sm:px-5 sm:py-4 payroll-create-card-header-border">
                  <h3 className="payroll-create-section-title mb-3 text-[14px] font-semibold [font-family:var(--font-poppins),Poppins,sans-serif]">Payment Details</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="payroll-create-emp-dept mb-1.5 block text-[12px] font-medium">Payment Date</label>
                      <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="payroll-create-comment-input w-full rounded-lg border px-4 py-2.5 text-[13px] outline-none" />
                    </div>
                    <div>
                      <label className="payroll-create-emp-dept mb-1.5 block text-[12px] font-medium">Total Recipients</label>
                      <div className="payroll-create-comment-input flex items-center rounded-lg border px-4 py-2.5 text-[13px]">
                        <span className="payroll-create-emp-dept">{calcLines.length} Employee{calcLines.length === 1 ? "" : "s"}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Payment Description */}
                <div className="rounded-xl border px-3 py-3 sm:px-5 sm:py-4 payroll-create-card-header-border">
                  <h3 className="payroll-create-section-title mb-3 text-[14px] font-semibold [font-family:var(--font-poppins),Poppins,sans-serif]">Payment Description</h3>
                  <textarea value={paymentDesc} onChange={(e) => setPaymentDesc(e.target.value)} rows={3} className="payroll-create-comment-input w-full resize-none rounded-lg border px-4 py-2.5 text-[13px] outline-none" />
                </div>
              </div>
            </div>
            {/* Footer — Back | Execute */}
            <div className="flex items-center justify-between px-4 py-4 sm:px-6 sm:py-5">
              <button type="button" onClick={prev} className="payroll-create-back-step-btn rounded-lg border px-5 py-2.5 text-[14px] font-medium transition">Back</button>
              <button type="button" onClick={() => setShowSendReview(true)} className="rounded-lg bg-[#0F50DB] px-6 py-2.5 text-[14px] font-medium text-white transition hover:opacity-90 [font-family:var(--font-poppins),Poppins,sans-serif]">Execute</button>
            </div>

            {/* ── Send For Review modal ── */}
            {showSendReview && (
              <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: "rgba(130,150,173,0.65)" }}>
                <div className="payroll-modal-card w-full max-w-[360px] rounded-2xl p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <h3 className="payroll-create-card-title text-[15px] font-semibold [font-family:var(--font-poppins),Poppins,sans-serif]">Send For Review</h3>
                    <button type="button" onClick={() => setShowSendReview(false)} className="payroll-create-back-btn flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[20px] leading-none" aria-label="Close">×</button>
                  </div>
                  <div className="mb-4 flex justify-center">
                    <div className="payroll-send-review-icon-bg flex h-12 w-12 items-center justify-center rounded-full">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                    </div>
                  </div>
                  <p className="payroll-create-card-sub mb-5 text-center text-[13px]">
                    CFO or HR will see review your payroll and will take action on your request
                  </p>
                  <div className="space-y-2.5 text-[13px]">
                    {[
                      ["Total Amount:", `$${totals.employerCost.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
                      ["Recipients", String(calcLines.length)],
                      ["Date:", paymentDate],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="payroll-create-emp-dept">{k}</span>
                        <span className="payroll-create-salary font-semibold">{v}</span>
                      </div>
                    ))}
                  </div>
                  {runError && (
                    <p className="mt-3 rounded-lg bg-[#fee2e2] px-3 py-2 text-[12px] text-[#991b1b]">{runError}</p>
                  )}
                  <div className="mt-6 flex gap-3">
                    <button type="button" onClick={() => setShowSendReview(false)} className="payroll-create-back-step-btn flex-1 rounded-lg border px-4 py-2.5 text-[13px] font-medium transition">Cancel</button>
                    <button
                      type="button"
                      onClick={handleSubmitPayroll}
                      disabled={runMutation.isPending || calcLines.length === 0}
                      className="flex-1 rounded-lg bg-[#0F50DB] px-4 py-2.5 text-[13px] font-medium text-white transition hover:opacity-90 disabled:opacity-50 [font-family:var(--font-poppins),Poppins,sans-serif]"
                    >
                      {runMutation.isPending ? "Submitting…" : "Send & Execute"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Success modal ── */}
            {showSuccess && (
              <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: "rgba(130,150,173,0.65)" }}>
                <div className="payroll-modal-card w-full max-w-[380px] rounded-2xl p-8 text-center">
                  <div className="mb-5 flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#DCFCE7]">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                  </div>
                  <h3 className="payroll-create-card-title mb-2 text-[18px] font-bold [font-family:var(--font-poppins),Poppins,sans-serif]">Payroll Executed Successfully!</h3>
                  <p className="payroll-create-emp-dept mb-2 text-[13px]">
                    {runResult ? `${runResult.employeeCount} employee${runResult.employeeCount === 1 ? "" : "s"} paid a net total of $${runResult.totalNet.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.` : ""}
                  </p>
                  {runResult && <p className="mb-6 text-[11px] text-dash-secondary">Batch: {runResult.batchRef}</p>}
                  <button type="button" onClick={() => { setShowSuccess(false); next(); }} className="inline-flex items-center gap-2 rounded-lg bg-[#0F50DB] px-4 py-2.5 text-[13px] font-medium text-white transition hover:opacity-90 whitespace-nowrap [font-family:var(--font-poppins),Poppins,sans-serif]">
                    Proceed to File Generation
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════
            STEP 5 — File Generation
        ══════════════════════════════════════ */}
        {step === 5 && (
          <div className="payroll-create-card" style={{ border: 'none' }}>
            <CardHeader title="File Generation" subtitle="Generate PDF payslips for all employees. Includes breakdown of earnings, deductions, and contributions." />
            <div className="space-y-6 px-6 py-6">
              {/* Two file cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Employee Payslips */}
                <div className="payroll-file-card rounded-xl border p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF]">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                      </svg>
                    </div>
                    <h3 className="payroll-create-card-title text-[14px] font-semibold">Employee Payslips</h3>
                  </div>
                  <p className="payroll-create-emp-dept mb-4 text-[12px]">Generate PDF payslips for all employees. Includes breakdown of earnings, deductions, and contributions.</p>
                  <div className="mt-4">
                    {payslipsGenerated ? (
                      <>
                        <p className="mb-2 flex items-center gap-1.5 text-[12px] font-medium text-[#16A34A]">
                          <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[#16A34A]">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                          </span>
                          Payslips Generated
                        </p>
                        <button type="button" onClick={handleDownloadPayslips} className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#0F50DB] px-4 py-2.5 text-[13px] font-medium text-[#0F50DB] transition hover:bg-[#EFF6FF]">
                          <DownloadIcon /> Download CSV
                        </button>
                      </>
                    ) : (
                      <button type="button" onClick={handleDownloadPayslips} className="w-full rounded-lg bg-[#0F50DB] px-4 py-2.5 text-[13px] font-medium text-white transition hover:opacity-90">
                        Generate Payslips
                      </button>
                    )}
                  </div>
                </div>
                {/* Bank Transfer File */}
                <div className="payroll-file-card rounded-xl border p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EDE9FE]">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="13" y2="17" />
                      </svg>
                    </div>
                    <h3 className="payroll-create-card-title text-[14px] font-semibold">Bank Transfer File</h3>
                  </div>
                  <p className="payroll-create-emp-dept mb-4 text-[12px]">Generate SEPA XML (ISO 20022) file for batch bank transfer upload.</p>
                  <div className="mt-4">
                    {bankFileGenerated ? (
                      <>
                        <p className="mb-2 flex items-center gap-1.5 text-[12px] font-medium text-[#16A34A]">
                          <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[#16A34A]">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                          </span>
                          XML file is ready to download
                        </p>
                        <button type="button" onClick={handleDownloadBankFile} className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#0F50DB] px-4 py-2.5 text-[13px] font-medium text-[#0F50DB] transition hover:bg-[#EFF6FF]">
                          <DownloadIcon /> Download XML
                        </button>
                      </>
                    ) : (
                      <button type="button" onClick={handleDownloadBankFile} className="w-full rounded-lg bg-[#0F50DB] px-4 py-2.5 text-[13px] font-medium text-white transition hover:opacity-90">
                        Generate Bank File
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Government Reporting */}
              <div>
                <h3 className="payroll-create-section-title mb-4 text-[15px] font-semibold [font-family:var(--font-poppins),Poppins,sans-serif]">Government Reporting (Cyprus)</h3>
                <div className="payroll-gov-row overflow-hidden rounded-xl border">
                  {/* Tax Department */}
                  <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                    <div className="min-w-0">
                      <p className="payroll-create-card-title text-[13px] font-semibold">Tax Department (TaxisNet)</p>
                      <p className="payroll-create-emp-dept mt-0.5 text-[11px] sm:text-[12px]">Generate XML for PAYE and Special Contribution returns.</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {["PAYE XML", "DAC4 Report"].map((label) => (
                        <button key={label} type="button" onClick={() => handleDownloadGov(label)} className="payroll-gov-btn flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-[11px] font-medium transition whitespace-nowrap sm:px-3 sm:text-[12px]">
                          <DownloadIcon /> {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Indented separator */}
                  <div className="mx-5 border-t payroll-create-card-header-border" />
                  {/* Social Insurance */}
                  <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                    <div className="min-w-0">
                      <p className="payroll-create-card-title text-[13px] font-semibold">Social Insurance (SIS)</p>
                      <p className="payroll-create-emp-dept mt-0.5 text-[11px] sm:text-[12px]">Generate file for SIS/eAICS/smart submission.</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {["YKA 2-002 Form", "SIS XML"].map((label) => (
                        <button key={label} type="button" onClick={() => handleDownloadGov(label)} className="payroll-gov-btn flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-[11px] font-medium transition whitespace-nowrap sm:px-3 sm:text-[12px]">
                          <DownloadIcon /> {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <BackNextRow onBack={prev} />
          </div>
        )}

      </div>
    </div>
  );
}
