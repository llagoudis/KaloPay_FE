"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { usePayrollBatches, useBatchDetails } from "@/hooks/employer/useDashboard";
import { useRunPayroll } from "@/hooks/employer/useUserPanel";
import WalletCards from "@/components/user/dashboard/WalletCards";
import BatchDetail from "@/components/user/payroll/BatchDetail";
import PayrollConfigurations from "@/components/user/payroll/PayrollConfigurations";
import LinkWithAccounting from "@/components/user/payroll/LinkWithAccounting";
import PayrollDataBackup from "@/components/user/payroll/PayrollDataBackup";

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

function CreatePayrollRun({ initialBatchRef }: { initialBatchRef?: string | null }) {
  const [execTab, setExecTab] = useState<ExecutionTab>("due");
  const [openBatchId, setOpenBatchId] = useState<number | null>(null);

  const { data: batchesData, isLoading } = usePayrollBatches(50);
  const { data: batchDetail } = useBatchDetails(openBatchId);
  const { mutateAsync: runPayroll, isPending: executing } = useRunPayroll();

  const allBatches = batchesData?.batches ?? [];
  const dueBatches = allBatches.filter((b) => b.status === "processing" || b.status === "pending");
  const executedBatches = allBatches.filter((b) => b.status === "completed");

  const batchPayments = batchDetail?.payments ?? [];
  const openBatch = allBatches.find((b) => b.id === openBatchId);

  // Resume: if a new batchRef was requested (from Data Backup), open that batch
  // once it loads. Uses the "adjust state when a prop changes" render-phase
  // pattern (previous value tracked in state) — no effect, no cascade.
  const [handledResume, setHandledResume] = useState<string | null>(null);
  if (initialBatchRef && initialBatchRef !== handledResume && allBatches.length > 0) {
    const match = allBatches.find((b) => b.batchRef === initialBatchRef);
    if (match) {
      setHandledResume(initialBatchRef);
      setExecTab(match.status === "completed" ? "executed" : "due");
      setOpenBatchId(match.id);
    }
  }

  // Persist the open batch pointer so Data Backup can resume it.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (openBatch) {
      localStorage.setItem("kp-cpr-batch", openBatch.batchRef);
      localStorage.setItem("kp-cpr-step", "4");
    } else {
      localStorage.removeItem("kp-cpr-batch");
      localStorage.removeItem("kp-cpr-emp");
    }
  }, [openBatch]);

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
    } catch { /* error handled by hook */ }
  }

  // Batch detail (also hosts the payslip editor internally).
  if (openBatchId !== null && openBatch) {
    return (
      <BatchDetail
        batch={openBatch}
        payments={batchPayments}
        onExecute={handleExecuteBatch}
        executing={executing}
        onBack={() => setOpenBatchId(null)}
      />
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

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function EmployerPayrollPage() {
  const [subTab, setSubTab] = useState<PayrollSubTab>("create");
  // When Data Backup resumes a session, we jump to Create and open the batch.
  const [resumeBatchRef, setResumeBatchRef] = useState<string | null>(null);

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

        {subTab === "create" && <CreatePayrollRun initialBatchRef={resumeBatchRef} />}
        {subTab === "backup" && (
          <PayrollDataBackup
            onResume={({ batchRef }) => { setResumeBatchRef(batchRef); setSubTab("create"); }}
          />
        )}
        {subTab === "configurations" && <PayrollConfigurations />}
        {subTab === "accounting" && <LinkWithAccounting />}
      </main>
    </div>
  );
}
