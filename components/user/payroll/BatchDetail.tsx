"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils/cn";
import type { Batch, Payment } from "@/lib/api/employer/dashboard";
import PayslipEditor, { derivePayslipEmployee, type PayslipEmployee } from "./PayslipEditor";

function money(n: number, currency = "EUR"): string {
  void currency;
  return n.toLocaleString("en-US", { style: "currency", currency: "EUR", maximumFractionDigits: 2 });
}

/** Map a real Payment row into the editor-friendly employee shape. */
function paymentToEmployee(p: Payment, index: number): PayslipEmployee {
  return derivePayslipEmployee(
    { id: p.id, name: p.employee, department: "—", salary: p.amount, currency: p.currency },
    index,
  );
}

export type BatchDetailProps = {
  batch: Batch;
  payments: Payment[];
  /** Executes the batch (already-confirmed). Returns a promise so the button can show a pending state. */
  onExecute: () => Promise<void>;
  executing: boolean;
  onBack: () => void;
};

/**
 * Batch detail table — Employee / Employee ID / Department / Gross / Deductions / Net / Status,
 * with a totals row, a live "X / Y locked" progress banner, per-row lock toggle, auto-lock,
 * Download CSV, and an Execute-confirm flow. Clicking a row opens the {@link PayslipEditor}.
 */
export default function BatchDetail({ batch, payments, onExecute, executing, onBack }: BatchDetailProps) {
  const paid = batch.status === "completed";
  const lockKey = `kp-cpr-locks-${batch.batchRef}`;

  const lines = useMemo(() => payments.map((p, i) => ({ payment: p, emp: paymentToEmployee(p, i) })), [payments]);
  const employees = useMemo(() => lines.map((l) => l.emp), [lines]);

  // Lock state persisted per batch.
  const [locks, setLocks] = useState<Set<number>>(() => {
    if (typeof window === "undefined") return new Set();
    try { return new Set<number>(JSON.parse(localStorage.getItem(lockKey) || "[]")); } catch { return new Set(); }
  });
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem(lockKey, JSON.stringify([...locks]));
  }, [locks, lockKey]);

  const toggleLock = (id: number) =>
    setLocks((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  const [openEmpId, setOpenEmpId] = useState<number | null>(() =>
    typeof window !== "undefined" && localStorage.getItem("kp-cpr-emp")
      ? Number(localStorage.getItem("kp-cpr-emp")) : null
  );
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (openEmpId != null) localStorage.setItem("kp-cpr-emp", String(openEmpId));
    else localStorage.removeItem("kp-cpr-emp");
  }, [openEmpId]);

  const [confirmExec, setConfirmExec] = useState(false);

  const totalGross = lines.reduce((s, l) => s + l.emp.gross, 0);
  const totalDeductions = lines.reduce((s, l) => s + l.emp.deductions, 0);
  const totalNet = lines.reduce((s, l) => s + l.emp.net, 0);
  const lockedCount = lines.filter((l) => locks.has(l.emp.id)).length;
  const allLocked = lines.length > 0 && lockedCount === lines.length;
  const batchLocked = paid || allLocked;

  function downloadBatchCsv() {
    const headers = ["Employee", "Employee ID", "Department", "Gross", "Deductions", "Net", "Status"];
    const rows = lines.map((l) => [
      l.emp.name, `EMP-${1000 + Number(l.emp.id || 0)}`, l.emp.department,
      l.emp.gross.toFixed(2), l.emp.deductions.toFixed(2), l.emp.net.toFixed(2),
      paid ? "Paid" : (locks.has(l.emp.id) ? "Locked" : "Open"),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${batch.batchRef}-payroll.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  }

  // Payslip editor view for a selected employee.
  if (openEmpId != null) {
    const line = lines.find((l) => l.emp.id === openEmpId);
    if (line) {
      return (
        <PayslipEditor
          key={line.emp.id}
          employee={line.emp}
          employees={employees}
          batchRef={batch.batchRef}
          onSelect={(emp) => setOpenEmpId(emp.id)}
          onBack={() => setOpenEmpId(null)}
          locked={locks.has(line.emp.id)}
          onToggleLock={paid ? undefined : () => toggleLock(line.emp.id)}
        />
      );
    }
  }

  return (
    <section className="mt-5 overflow-hidden rounded-xl bg-[var(--dash-card,#fff)] shadow-sm ring-1 ring-gray-100">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3.5 border-b border-gray-100 px-6 py-5">
        <div className="flex items-center gap-3.5">
          <button
            type="button" onClick={onBack} aria-label="Back to batches"
            className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></svg>
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-[19px] font-bold text-[#0E1620]">{batch.batchRef}</h2>
              <span className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold",
                paid || batchLocked ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
              )}>
                {!paid && batchLocked && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                )}
                {paid ? "Completed" : (batchLocked ? "Locked" : "Processing")}
              </span>
            </div>
            <p className="mt-0.5 text-[13px] text-gray-500">{batch.payPeriod} · {batch.employeeCount} employees</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-7">
          {!paid && (
            <div>
              <div className="text-[11.5px] text-gray-400">Locked</div>
              <div className={cn("text-base font-bold", allLocked ? "text-emerald-600" : "text-[#0E1620]")}>{lockedCount} / {lines.length}</div>
            </div>
          )}
          <div>
            <div className="text-[11.5px] text-gray-400">Employees</div>
            <div className="text-base font-bold text-[#0E1620]">{lines.length}</div>
          </div>
          <div>
            <div className="text-[11.5px] text-gray-400">Total net</div>
            <div className="font-mono text-base font-bold text-[#0E1620]">{money(totalNet, batch.currency)}</div>
          </div>
          <button
            type="button" onClick={downloadBatchCsv} disabled={!batchLocked}
            title={batchLocked ? "Download payroll CSV" : "Lock all employees to enable download"}
            className={cn(
              "inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold",
              batchLocked ? "bg-[#0F50DB] text-white hover:bg-blue-700" : "cursor-not-allowed bg-gray-100 text-gray-400"
            )}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            Download CSV
          </button>
          {!paid && (
            <button
              type="button" onClick={() => setConfirmExec(true)} disabled={!allLocked}
              title={allLocked ? "Execute this batch" : "Lock all employees before executing"}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-lg px-5 text-sm font-semibold",
                allLocked ? "bg-emerald-600 text-white hover:bg-emerald-700" : "cursor-not-allowed bg-gray-100 text-gray-400"
              )}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              Execute batch
            </button>
          )}
        </div>
      </div>

      {/* Progress banner */}
      {!paid && (
        <div className={cn(
          "flex flex-wrap items-center gap-3 border-b border-gray-100 px-6 py-3",
          allLocked ? "bg-emerald-50" : "bg-gray-50"
        )}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={allLocked ? "#059669" : "#9CA3AF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
          <span className={cn("text-[13px] font-medium", allLocked ? "text-emerald-700" : "text-gray-500")}>
            {allLocked
              ? "All employees locked — batch is locked and ready. You can download the payroll CSV."
              : `Lock each employee as you finish reviewing. The batch locks automatically once all ${lines.length} are locked (${lockedCount} done).`}
          </span>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr>
              {["Employee", "Employee ID", "Department", "Gross", "Deductions", "Net", "Status"].map((h, i) => (
                <th key={h} className={cn(
                  "whitespace-nowrap border-b border-gray-100 px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-400",
                  i >= 3 && i <= 5 ? "text-right" : i === 6 ? "text-center" : "text-left"
                )}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lines.length === 0 ? (
              <tr><td colSpan={7} className="border-b border-gray-100 px-4 py-8 text-center text-sm text-gray-400">No employee data for this batch.</td></tr>
            ) : lines.map((l) => (
              <tr key={l.emp.id} onClick={() => setOpenEmpId(l.emp.id)} className="cursor-pointer hover:bg-gray-50">
                <td className="whitespace-nowrap border-b border-gray-100 px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <span style={{ background: l.emp.color }} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white">{l.emp.avatar}</span>
                    <span className="font-semibold text-[#0F50DB]">{l.emp.name}</span>
                  </div>
                </td>
                <td className="whitespace-nowrap border-b border-gray-100 px-4 py-3.5 font-mono text-[13px] text-gray-500">EMP-{1000 + Number(l.emp.id || 0)}</td>
                <td className="whitespace-nowrap border-b border-gray-100 px-4 py-3.5 text-[13px] text-gray-500">{l.emp.department}</td>
                <td className="whitespace-nowrap border-b border-gray-100 px-4 py-3.5 text-right font-mono text-[13px] text-[#0E1620]">{money(l.emp.gross, batch.currency)}</td>
                <td className="whitespace-nowrap border-b border-gray-100 px-4 py-3.5 text-right font-mono text-[13px] text-red-600">-{money(l.emp.deductions, batch.currency).replace(/^[^\d-]*/, "")}</td>
                <td className="whitespace-nowrap border-b border-gray-100 px-4 py-3.5 text-right font-mono text-[13px] font-semibold text-[#0E1620]">{money(l.emp.net, batch.currency)}</td>
                <td className="border-b border-gray-100 px-4 py-3.5 text-center" onClick={(ev) => ev.stopPropagation()}>
                  {paid ? (
                    <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11.5px] font-semibold text-emerald-700">Paid</span>
                  ) : (
                    <button
                      type="button" onClick={() => toggleLock(l.emp.id)}
                      title={locks.has(l.emp.id) ? "Click to unlock" : "Lock this employee"}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11.5px] font-semibold",
                        locks.has(l.emp.id) ? "bg-emerald-100 text-emerald-700" : "border border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                      )}
                    >
                      {locks.has(l.emp.id) ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" /></svg>
                      )}
                      {locks.has(l.emp.id) ? "Locked" : "Lock"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {lines.length > 0 && (
              <tr className="bg-gray-50">
                <td className="border-b border-gray-100 px-4 py-3.5 font-bold text-[#0E1620]" colSpan={3}>Totals</td>
                <td className="border-b border-gray-100 px-4 py-3.5 text-right font-mono font-bold text-[#0E1620]">{money(totalGross, batch.currency)}</td>
                <td className="border-b border-gray-100 px-4 py-3.5 text-right font-mono font-bold text-red-600">-{money(totalDeductions, batch.currency).replace(/^[^\d-]*/, "")}</td>
                <td className="border-b border-gray-100 px-4 py-3.5 text-right font-mono font-bold text-[#0F50DB]">{money(totalNet, batch.currency)}</td>
                <td className="border-b border-gray-100" />
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Execute confirm */}
      {confirmExec && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5" onClick={() => setConfirmExec(false)}>
          <div className="w-full max-w-[420px] rounded-xl bg-white p-6 shadow-xl" onClick={(ev) => ev.stopPropagation()}>
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </span>
              <h3 className="text-[17px] font-bold text-[#0E1620]">Execute {batch.batchRef}?</h3>
            </div>
            <p className="mb-5 text-[13.5px] leading-relaxed text-gray-500">
              All {lines.length} employees are locked. Executing pays out {money(totalNet, batch.currency)} and moves this batch to <strong>Completed</strong>. This can&apos;t be undone.
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                type="button" onClick={() => setConfirmExec(false)}
                className="h-10 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >Cancel</button>
              <button
                type="button" disabled={executing}
                onClick={async () => { await onExecute(); setConfirmExec(false); }}
                className="h-10 rounded-lg bg-emerald-600 px-5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >{executing ? "Executing…" : "Execute batch"}</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
