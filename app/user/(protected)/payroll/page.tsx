"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { usePayrollBatches, useBatchDetails } from "@/hooks/employer/useDashboard";
import { usePayrollEmployees, useRunPayroll } from "@/hooks/employer/useUserPanel";
import WalletCards from "@/components/user/dashboard/WalletCards";

// ─── Types ──────────────────────────────────────────────────────────────────

type PayrollSubTab = "create" | "backup" | "configurations" | "accounting";
type ExecutionTab = "due" | "executed";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtMoney(n: number | string, currency = "EUR") {
  const num = typeof n === "string" ? parseFloat(n) : n;
  if (isNaN(num)) return "—";
  return num.toLocaleString("en-US", { style: "currency", currency: currency || "EUR", maximumFractionDigits: 2 });
}

function fmtDate(s: string) {
  if (!s) return "—";
  try { return new Date(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); } catch { return s; }
}

function statusBadge(status: string) {
  const s = status?.toLowerCase();
  const cls =
    s === "completed" ? "bg-emerald-100 text-emerald-700" :
    s === "processing" || s === "pending" ? "bg-blue-100 text-blue-700" :
    s === "failed" ? "bg-red-100 text-red-700" :
    "bg-gray-100 text-gray-600";
  return (
    <span className={cn("inline-block rounded-full px-3 py-0.5 text-xs font-semibold capitalize", cls)}>
      {status}
    </span>
  );
}

// ─── Sub-tab pill nav ─────────────────────────────────────────────────────────

const SUB_TABS: { key: PayrollSubTab; label: string; icon: React.ReactNode }[] = [
  {
    key: "create",
    label: "Create Payroll Run",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    key: "backup",
    label: "Payroll Data Backup",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    key: "configurations",
    label: "Payroll Configurations",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeLinecap="round"/><circle cx="12" cy="12" r="3"/>
      </svg>
    ),
  },
  {
    key: "accounting",
    label: "Link with Accounting",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" strokeLinecap="round"/>
      </svg>
    ),
  },
];

// ─── Create Payroll Run ───────────────────────────────────────────────────────

function CreatePayrollRun() {
  const [execTab, setExecTab] = useState<ExecutionTab>("due");
  const [openBatchId, setOpenBatchId] = useState<number | null>(null);
  const [openEmpId, setOpenEmpId] = useState<number | null>(null);
  const [lockedEmps, setLockedEmps] = useState<Set<number>>(new Set());
  const [confirmExecute, setConfirmExecute] = useState(false);

  const { data: batchesData, isLoading } = usePayrollBatches(50);
  const { data: batchDetail } = useBatchDetails(openBatchId);
  const { mutateAsync: runPayroll, isPending: executing } = useRunPayroll();

  const allBatches = batchesData?.batches ?? [];
  const dueBatches = allBatches.filter((b) => b.status === "processing" || b.status === "pending");
  const executedBatches = allBatches.filter((b) => b.status === "completed");

  const batchPayments = batchDetail?.payments ?? [];
  const openBatch = allBatches.find((b) => b.id === openBatchId);
  const allLocked = batchPayments.length > 0 && batchPayments.every((p) => lockedEmps.has(p.id));

  function toggleLock(id: number) {
    setLockedEmps((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function handleExecuteBatch() {
    if (!openBatch) return;
    try {
      await runPayroll({
        period: openBatch.payPeriod,
        paymentDate: openBatch.paymentDate,
        execute: true,
        employees: batchPayments.map((p) => ({ id: p.id, gross: p.amount })),
      });
      setOpenBatchId(null);
      setLockedEmps(new Set());
      setConfirmExecute(false);
    } catch { /* error handled by hook */ }
  }

  function exportBatchCsv() {
    if (!batchDetail) return;
    const header = ["Employee", "Amount", "Currency", "Status", "Payment Date", "Reference"];
    const rows = batchPayments.map((p) =>
      [p.employee, p.amount, p.currency, p.status, p.paymentDate, p.paymentRef].join(",")
    );
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `batch-${openBatch?.batchRef ?? "export"}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  }

  // Payslip form view
  if (openEmpId !== null && openBatchId !== null) {
    const emp = batchPayments.find((p) => p.id === openEmpId);
    return (
      <PayslipForm
        emp={emp}
        onBack={() => setOpenEmpId(null)}
        batchRef={openBatch?.batchRef ?? ""}
      />
    );
  }

  // Batch detail view
  if (openBatchId !== null && openBatch) {
    const isCompleted = openBatch.status === "completed";
    return (
      <div className="space-y-4">
        <button type="button" onClick={() => setOpenBatchId(null)} className="flex items-center gap-1 text-sm text-[#0F50DB] hover:underline">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Back to Payroll Batches
        </button>
        <div className="rounded-xl bg-[var(--dash-card,#fff)] p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-[#0E1620]">Batch: {openBatch.batchRef}</h3>
              <p className="text-sm text-gray-500">Pay Period: {openBatch.payPeriod} · {openBatch.employeeCount} employees</p>
            </div>
            <div className="flex gap-2">
              {isCompleted && (
                <button type="button" onClick={exportBatchCsv} className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Export CSV
                </button>
              )}
              {!isCompleted && allLocked && (
                <>
                  <button type="button" onClick={exportBatchCsv} className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
                    Download CSV
                  </button>
                  <button type="button" onClick={() => setConfirmExecute(true)} className="rounded-lg bg-[#0F50DB] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                    Execute Batch
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-400 font-medium">
                  <th className="py-3 pr-4">Employee</th>
                  <th className="py-3 pr-4">Reference</th>
                  <th className="py-3 pr-4">Amount</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-4">Payment Date</th>
                  {!isCompleted && <th className="py-3">Lock</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {batchPayments.length === 0 ? (
                  <tr><td colSpan={6} className="py-8 text-center text-gray-400">No employee data for this batch.</td></tr>
                ) : batchPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setOpenEmpId(p.id)}>
                    <td className="py-3 pr-4 font-medium text-[#0E1620]">{p.employee}</td>
                    <td className="py-3 pr-4 font-mono text-xs text-gray-500">{p.paymentRef}</td>
                    <td className="py-3 pr-4 font-medium">{fmtMoney(p.amount, p.currency)}</td>
                    <td className="py-3 pr-4">{statusBadge(p.status)}</td>
                    <td className="py-3 pr-4 text-gray-500">{fmtDate(p.paymentDate)}</td>
                    {!isCompleted && (
                      <td className="py-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => toggleLock(p.id)}
                          className={cn(
                            "rounded-lg px-3 py-1 text-xs font-semibold",
                            lockedEmps.has(p.id)
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          )}
                        >
                          {lockedEmps.has(p.id) ? "Locked" : "Lock"}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {confirmExecute && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="rounded-xl bg-white p-6 shadow-xl w-[360px]">
              <h3 className="mb-2 text-base font-semibold text-[#0E1620]">Execute Batch?</h3>
              <p className="mb-6 text-sm text-gray-500">This will process payroll for all locked employees. This action cannot be undone.</p>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setConfirmExecute(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
                <button type="button" onClick={handleExecuteBatch} disabled={executing} className="rounded-lg bg-[#0F50DB] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                  {executing ? "Executing…" : "Confirm Execute"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wallet balance cards */}
      <WalletCards />

      {/* Due / Executed tabs */}
      <div className="rounded-xl bg-[var(--dash-card,#fff)] p-6 shadow-sm">
        <div className="mb-4 flex gap-2">
          {(["due", "executed"] as ExecutionTab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setExecTab(t)}
              className={cn(
                "rounded-full px-5 py-2 text-sm font-semibold",
                execTab === t ? "bg-[#0F50DB] text-white shadow-sm" : "text-gray-500 hover:bg-gray-100"
              )}
            >
              {t === "due" ? "Due for Execution" : "Payroll Executed"}
            </button>
          ))}
        </div>

        {isLoading ? (
          <p className="py-8 text-center text-sm text-gray-400">Loading payroll batches…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-400 font-medium">
                  <th className="py-3 pr-4">Batch ID</th>
                  <th className="py-3 pr-4">Pay Period</th>
                  <th className="py-3 pr-4">Total Amount</th>
                  <th className="py-3 pr-4">Payment Date</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-4">Employees</th>
                  <th className="py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(execTab === "due" ? dueBatches : executedBatches).length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-400">
                      {execTab === "due" ? "No payroll batches due for execution." : "No completed payroll batches."}
                    </td>
                  </tr>
                ) : (execTab === "due" ? dueBatches : executedBatches).map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="py-3 pr-4 font-mono text-xs text-gray-500">{b.batchRef}</td>
                    <td className="py-3 pr-4 font-medium text-[#0E1620]">{b.payPeriod}</td>
                    <td className="py-3 pr-4 font-medium">{fmtMoney(b.totalAmount, b.currency)}</td>
                    <td className="py-3 pr-4 text-gray-500">{fmtDate(b.paymentDate)}</td>
                    <td className="py-3 pr-4">{statusBadge(b.status)}</td>
                    <td className="py-3 pr-4 text-gray-600">{b.employeeCount}</td>
                    <td className="py-3">
                      <button
                        type="button"
                        onClick={() => setOpenBatchId(b.id)}
                        className={cn(
                          "rounded-lg px-4 py-1.5 text-xs font-semibold",
                          execTab === "due"
                            ? "bg-[#0F50DB] text-white hover:bg-blue-700"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                      >
                        {execTab === "due" ? "Pay" : "View"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Payslip Form ─────────────────────────────────────────────────────────────

type PayslipTab = "earnings" | "deductions" | "contributions" | "other" | "vacations";

function PayslipForm({ emp, onBack, batchRef }: { emp: { employee: string; amount: number; currency: string } | undefined; onBack: () => void; batchRef: string }) {
  const [tab, setTab] = useState<PayslipTab>("earnings");

  const TABS: { key: PayslipTab; label: string }[] = [
    { key: "earnings", label: "Earnings" },
    { key: "deductions", label: "Deductions" },
    { key: "contributions", label: "Contributions" },
    { key: "other", label: "Other" },
    { key: "vacations", label: "Vacations" },
  ];

  return (
    <div className="space-y-4">
      <button type="button" onClick={onBack} className="flex items-center gap-1 text-sm text-[#0F50DB] hover:underline">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Back to Batch
      </button>

      <div className="rounded-xl bg-[var(--dash-card,#fff)] p-6 shadow-sm">
        <h3 className="mb-1 text-base font-semibold text-[#0E1620]">{emp?.employee ?? "Employee"} — Payslip</h3>
        <p className="mb-4 text-sm text-gray-400">Batch: {batchRef} · Currency: {emp?.currency}</p>

        {/* Summary cells */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {[
            { label: "Gross Earnings", value: fmtMoney(emp?.amount ?? 0, emp?.currency) },
            { label: "Deductions", value: "—" },
            { label: "Contributions", value: "—" },
            { label: "Employer Cost", value: "—" },
            { label: "Net Pay", value: fmtMoney(emp?.amount ?? 0, emp?.currency) },
          ].map((c) => (
            <div key={c.label} className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-400">{c.label}</p>
              <p className="mt-1 text-sm font-semibold text-[#0E1620]">{c.value}</p>
            </div>
          ))}
        </div>

        {/* Tab strip */}
        <div className="mb-4 flex gap-1 overflow-x-auto border-b border-gray-100 pb-0">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                "shrink-0 px-4 py-2 text-sm font-medium border-b-2 -mb-[2px]",
                tab === t.key ? "border-[#0F50DB] text-[#0F50DB]" : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "earnings" && (
          <div className="space-y-3 text-sm text-gray-700">
            {[
              { label: "Base Salary", value: fmtMoney(emp?.amount ?? 0, emp?.currency) },
              { label: "COLA", value: "—" },
              { label: "Overtime", value: "—" },
              { label: "13th Salary", value: "—" },
              { label: "Bonus / Ex-gratia", value: "—" },
            ].map((r) => (
              <div key={r.label} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2">
                <span className="text-gray-500">{r.label}</span>
                <span className="font-medium text-[#0E1620]">{r.value}</span>
              </div>
            ))}
          </div>
        )}
        {tab === "deductions" && (
          <div className="space-y-3 text-sm text-gray-700">
            {[
              { label: "Social Insurance (Employee)", value: "—" },
              { label: "Income Tax", value: "—" },
              { label: "General Healthcare System (GHS)", value: "—" },
              { label: "Provident Fund", value: "—" },
              { label: "Union Subscription", value: "—" },
            ].map((r) => (
              <div key={r.label} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2">
                <span className="text-gray-500">{r.label}</span>
                <span className="font-medium text-[#0E1620]">{r.value}</span>
              </div>
            ))}
          </div>
        )}
        {tab === "contributions" && (
          <div className="space-y-3 text-sm text-gray-700">
            {[
              { label: "Social Insurance (Employer)", value: "—" },
              { label: "Social Cohesion Fund", value: "—" },
              { label: "Industrial Training", value: "—" },
              { label: "Redundancy Fund", value: "—" },
              { label: "Annual Leave Fund", value: "—" },
              { label: "GHS (Employer)", value: "—" },
              { label: "Provident Fund (Employer)", value: "—" },
            ].map((r) => (
              <div key={r.label} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2">
                <span className="text-gray-500">{r.label}</span>
                <span className="font-medium text-[#0E1620]">{r.value}</span>
              </div>
            ))}
          </div>
        )}
        {tab === "other" && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-medium text-gray-400">Payslip Note</p>
              <textarea
                className="h-40 w-full rounded-lg border border-gray-200 p-3 text-sm text-gray-700 focus:border-[#0F50DB] focus:outline-none focus:ring-1 focus:ring-[#0F50DB]"
                placeholder="Add a note to this payslip…"
              />
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-gray-400">Additional Items</p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>No additional items.</p>
              </div>
            </div>
          </div>
        )}
        {tab === "vacations" && (
          <div className="text-sm text-gray-500 py-4">
            <p>No vacation records found for this employee.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Payroll Data Backup ──────────────────────────────────────────────────────

function PayrollDataBackup() {
  const savedBatch = typeof window !== "undefined" ? localStorage.getItem("kp-cpr-batch") : null;

  return (
    <div className="rounded-xl bg-[var(--dash-card,#fff)] p-6 shadow-sm">
      <h3 className="mb-1 text-base font-semibold text-[#0E1620]">Payroll Data Backup</h3>
      <p className="mb-6 text-sm text-gray-400">Resume payroll work where you left off.</p>

      {savedBatch ? (
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
          <p className="mb-1 text-sm font-semibold text-[#0F50DB]">In-progress batch found</p>
          <p className="mb-3 text-xs text-gray-500">Batch: {savedBatch}</p>
          <button
            type="button"
            className="rounded-lg bg-[#0F50DB] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Resume Payroll Run
          </button>
        </div>
      ) : (
        <p className="text-sm text-gray-400">No in-progress payroll run found.</p>
      )}
    </div>
  );
}

// ─── Payroll Configurations ───────────────────────────────────────────────────

function PayrollConfigurations() {
  const { data } = usePayrollEmployees();
  const employees = data?.employees ?? [];
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = employees.find((e) => e.id === selectedId);

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-[var(--dash-card,#fff)] p-6 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-[#0E1620]">Payroll Configurations</h3>
        <div className="mb-4">
          <label className="mb-1 block text-xs font-medium text-gray-500">Select Employee</label>
          <select
            className="h-10 w-full max-w-xs rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 focus:border-[#0F50DB] focus:outline-none focus:ring-1 focus:ring-[#0F50DB]"
            value={selectedId ?? ""}
            onChange={(e) => setSelectedId(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">Select employee…</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </div>

        {selected ? (
          <div className="rounded-lg border border-gray-100 p-4 text-sm text-gray-600">
            <p><span className="font-medium text-[#0E1620]">{selected.name}</span> — {selected.jobTitle ?? "—"} · {selected.department ?? "—"}</p>
            <p className="mt-1 text-xs text-gray-400">Monthly Gross: {fmtMoney(selected.monthlyGross ?? 0, selected.currency)}</p>
            <p className="mt-3 text-xs text-gray-400 italic">Full payslip configuration editor coming in next release.</p>
          </div>
        ) : (
          <p className="text-sm text-gray-400">Select an employee to configure their payslip defaults.</p>
        )}
      </div>
    </div>
  );
}

// ─── Link with Accounting ─────────────────────────────────────────────────────

const ACCOUNTING_FIRMS = ["eSoft", "Eurosoft", "Exact", "Intelisoft", "SAP", "Simplisis"];

function LinkWithAccounting() {
  const [selectedFirm, setSelectedFirm] = useState<string | null>(null);

  return (
    <div className="rounded-xl bg-[var(--dash-card,#fff)] p-6 shadow-sm">
      <h3 className="mb-1 text-base font-semibold text-[#0E1620]">Link with Accounting</h3>
      <p className="mb-6 text-sm text-gray-400">Connect your payroll to an accounting firm&apos;s software.</p>

      {!selectedFirm ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {ACCOUNTING_FIRMS.map((firm) => (
            <button
              key={firm}
              type="button"
              onClick={() => setSelectedFirm(firm)}
              className="rounded-xl border border-gray-200 px-4 py-6 text-sm font-semibold text-gray-700 hover:border-[#0F50DB] hover:text-[#0F50DB] transition-colors"
            >
              {firm}
            </button>
          ))}
        </div>
      ) : (
        <div>
          <div className="mb-4 flex items-center gap-3">
            <span className="text-sm font-semibold text-[#0E1620]">{selectedFirm}</span>
            <button type="button" onClick={() => setSelectedFirm(null)} className="text-xs text-gray-400 hover:underline">Change</button>
          </div>
          <div className="overflow-x-auto rounded-lg border border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-400 font-medium">
                  <th className="py-3 px-4">Year</th>
                  <th className="py-3 px-4">Month</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  { year: 2026, month: "June", status: "OPEN" },
                  { year: 2026, month: "May", status: "Ledgered" },
                  { year: 2026, month: "April", status: "Ledgered" },
                ].map((row) => (
                  <tr key={`${row.year}-${row.month}`}>
                    <td className="py-3 px-4 text-gray-500">{row.year}</td>
                    <td className="py-3 px-4 font-medium text-[#0E1620]">{row.month}</td>
                    <td className="py-3 px-4">
                      <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", row.status === "OPEN" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500")}>{row.status}</span>
                    </td>
                    <td className="py-3 px-4">
                      {row.status === "OPEN" ? (
                        <button type="button" className="rounded-lg bg-[#0F50DB] px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700">Execute</button>
                      ) : (
                        <button type="button" className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">Reverse</button>
                      )}
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

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function EmployerPayrollPage() {
  const [subTab, setSubTab] = useState<PayrollSubTab>("create");

  return (
    <div className="min-h-screen w-full bg-dash-page" data-dashboard-theme data-page="payroll">
      <main className="dash-shell pb-10 pt-6">
        {/* Secondary nav pill tabs */}
        <section className="mb-6 overflow-x-auto">
          <div className="inline-flex min-w-max gap-2">
            {SUB_TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setSubTab(t.key)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold outline-none",
                  subTab === t.key ? "bg-[#0F50DB] text-white shadow-sm" : "text-gray-500 hover:bg-gray-100"
                )}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
        </section>

        {subTab === "create" && <CreatePayrollRun />}
        {subTab === "backup" && <PayrollDataBackup />}
        {subTab === "configurations" && <PayrollConfigurations />}
        {subTab === "accounting" && <LinkWithAccounting />}
      </main>
    </div>
  );
}
