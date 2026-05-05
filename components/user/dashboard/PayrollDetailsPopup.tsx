"use client";

import { Fragment, type ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";

export type BatchRow = {
  batchId: string;
  payPeriod: string;
  totalAmount: string;
  paymentDate: string;
  status: string;
  employees: number;
};

const MOCK_PAYMENTS: Record<string, { paymentId: string; employee: string; amount: string; status: string; date: string }[]> = {
  "PAYBATCH-JUL24-001": [
    { paymentId: "PAY-001", employee: "John Smith", amount: "$3,200", status: "Completed", date: "2024-07-01" },
    { paymentId: "PAY-002", employee: "Sarah Johnson", amount: "$2,800", status: "Completed", date: "2024-07-01" },
    { paymentId: "PAY-003", employee: "Mike Davis", amount: "$3,500", status: "Processing", date: "2024-07-01" },
  ],
  "PAYBATCH-JUN24-002": [
    { paymentId: "PAY-004", employee: "John Smith", amount: "$3,200", status: "Completed", date: "2024-06-28" },
    { paymentId: "PAY-005", employee: "Sarah Johnson", amount: "$2,800", status: "Completed", date: "2024-06-28" },
    { paymentId: "PAY-006", employee: "Mike Davis", amount: "$3,100", status: "Completed", date: "2024-06-28" },
  ],
  "PAYBATCH-JUN24-001": [
    { paymentId: "PAY-007", employee: "John Smith", amount: "$2,633", status: "Completed", date: "2024-06-14" },
    { paymentId: "PAY-008", employee: "Sarah Johnson", amount: "$2,634", status: "Completed", date: "2024-06-14" },
    { paymentId: "PAY-009", employee: "Mike Davis", amount: "$2,633", status: "Processing", date: "2024-06-14" },
  ],
};

/** Payments table column headers — Poppins 14 / 400 / #6B7280 / lh 16 */
const payrollPaymentsThClass =
  "px-4 py-3 text-left align-middle text-[14px] font-normal leading-4 tracking-normal text-[#8c919c] [font-family:var(--font-poppins),Poppins,sans-serif]";

/** Employee name cell — olive/gold; light #827A1B, dark #8a832c via CSS var */
const payrollPaymentsEmployeeClass =
  "px-4 py-3 align-middle text-[14px] font-normal leading-5 tracking-normal text-[color:var(--payroll-details-employee-name)] [font-family:var(--font-poppins),Poppins,sans-serif]";

/** Batch summary value text — Poppins 16 / 400 / #1F2937 / lh 20 */
const payrollSummaryValueClass =
  "align-middle text-[16px] font-normal leading-5 tracking-normal text-dash-primary [font-family:var(--font-poppins),Poppins,sans-serif]";

/** Modal title — Poppins 24 / 600 / #1F2937 / lh 32 */
const payrollDetailsTitleClass =
  "min-w-0 flex-1 pr-4 text-2xl font-semibold leading-8 tracking-normal text-dash-primary [font-family:var(--font-poppins),Poppins,sans-serif]";

interface PayrollDetailsPopupProps {
  batch: BatchRow | null;
  onClose: () => void;
}

const exportMenuItems = ["CSV", "PDF", "Excel"] as const;

export default function PayrollDetailsPopup({ batch, onClose }: PayrollDetailsPopupProps) {
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const exportSplitRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!exportMenuOpen) return;
    function handleDown(e: MouseEvent) {
      if (exportSplitRef.current && !exportSplitRef.current.contains(e.target as Node)) {
        setExportMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleDown);
    return () => document.removeEventListener("mousedown", handleDown);
  }, [exportMenuOpen]);

  if (!batch) return null;

  const payments = MOCK_PAYMENTS[batch.batchId] ?? [];
  const displayStatus = batch.status === "Executed" ? "Completed" : batch.status;

  function handleExportChoice(_format: (typeof exportMenuItems)[number]) {
    setExportMenuOpen(false);
    // Wire to real export when API exists
  }

  const summarySections: { label: string; content: ReactNode }[] = [
    { label: "Batch ID", content: batch.batchId },
    { label: "Pay Period", content: batch.payPeriod },
    { label: "Total Amount", content: batch.totalAmount },
    { label: "Payment Date", content: batch.paymentDate },
    {
      label: "Batch Status",
      content: (
        <span
          className={cn(
            "inline-flex rounded-full px-3 py-1 text-xs font-medium [font-family:var(--font-inter),Inter,sans-serif]",
            (displayStatus === "Completed" || displayStatus === "Executed") && "status-pill-completed",
            displayStatus === "Processing" && "status-pill-processing"
          )}
        >
          {displayStatus}
        </span>
      ),
    },
  ];

  return (
    <>
      {/* Backdrop — #8095ad rgb(128,149,173) */}
      <div
        className="fixed inset-0 z-50 bg-[rgba(128,149,173,0.65)]"
        aria-hidden
        onClick={onClose}
      />
      <div
        className="payroll-details-modal payroll-details-surface fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100vw-1rem)] max-w-[1260px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl shadow-xl sm:w-full"
        style={{ backgroundColor: "var(--payroll-details-modal-bg)" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="payroll-details-title"
      >
        {/* Title + Export + Close – always light theme */}
        <div
          className="payroll-details-modal-header sticky top-0 z-10 flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-5"
          style={{
            backgroundColor: "var(--payroll-details-modal-bg)",
            borderBottomColor: "var(--payroll-details-modal-divider)",
          }}
        >
          <h2
            id="payroll-details-title"
            className="min-w-0 break-words text-[16px] font-semibold leading-[24px] tracking-normal text-dash-primary [font-family:var(--font-poppins),Poppins,sans-serif] sm:text-2xl sm:leading-8"
            style={{ color: "var(--payroll-details-modal-title)" }}
          >
            Details for: {batch.payPeriod} ({batch.batchId})
          </h2>
          <div className="flex shrink-0 items-center gap-2">
            <div ref={exportSplitRef} className="relative inline-flex">
              <div className="inline-flex items-center overflow-hidden rounded-[10px] bg-[#0f50db] text-white shadow-sm ring-1 ring-black/5">
                <button
                  type="button"
                  className="inline-flex h-11 items-center gap-2.5 py-0 pl-4 pr-2 text-sm font-medium leading-none tracking-normal hover:bg-white/10 active:bg-black/10 [font-family:var(--font-poppins),Poppins,sans-serif]"
                  onClick={() => handleExportChoice("CSV")}
                >
                  <svg
                    className="shrink-0"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span>Export as</span>
                </button>
                <div className="flex h-11 shrink-0 items-center px-1.5" aria-hidden>
                  <div className="h-5 w-px bg-white/90" />
                </div>
                <button
                  type="button"
                  className="inline-flex h-11 min-w-[2.75rem] items-center justify-center py-0 pl-2 pr-4 hover:bg-white/10 active:bg-black/10"
                  aria-expanded={exportMenuOpen}
                  aria-haspopup="menu"
                  aria-label="Export format options"
                  onClick={() => setExportMenuOpen((o) => !o)}
                >
                  <svg
                    className="shrink-0"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              </div>
              {exportMenuOpen && (
                <ul
                  className="absolute right-0 top-full z-20 mt-1 min-w-[11rem] rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
                  role="menu"
                >
                  {exportMenuItems.map((label) => (
                    <li key={label} role="none">
                      <button
                        type="button"
                        role="menuitem"
                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 [font-family:var(--font-poppins),Poppins,sans-serif]"
                        onClick={() => handleExportChoice(label)}
                      >
                        Export as {label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
              aria-label="Close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-3 py-4 sm:px-6 sm:py-5">
          {/* Batch summary — label over value; short vertical dividers (not full height) */}
          <div
            className="payroll-details-summary w-full overflow-x-auto rounded-2xl bg-[#edf4fc]"
            style={{ backgroundColor: "var(--payroll-details-summary-bg)" }}
          >
            <div
              className="grid min-w-[540px] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-0 px-5 py-3"
              role="group"
              aria-label="Batch summary"
            >
              {summarySections.flatMap((section, i) => {
                const cell = (
                  <div
                    key={section.label}
                    className="flex min-w-0 flex-col justify-center gap-1.5 px-2 text-left sm:px-3"
                  >
                    <span className="text-xs font-medium text-[#8c919c] [font-family:var(--font-inter),Inter,sans-serif]">
                      {section.label}
                    </span>
                    {typeof section.content === "string" ? (
                      <span className={payrollSummaryValueClass}>
                        {section.content}
                      </span>
                    ) : (
                      <div className="flex items-center align-middle">{section.content}</div>
                    )}
                  </div>
                );
                if (i < summarySections.length - 1) {
                  return [
                    cell,
                    <div
                      key={`sep-${section.label}`}
                      className="flex min-h-[4.5rem] items-center justify-center self-stretch px-0.5"
                      aria-hidden
                    >
                      <div className="h-20 w-px sm:h-24" style={{ backgroundColor: "var(--payroll-details-modal-divider)" }} />
                    </div>,
                  ];
                }
                return [cell];
              })}
            </div>
          </div>

          {/* Individual payments table – always light theme */}
          <div className="mt-6">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[400px] text-sm">
                <thead>
                  <tr>
                    <th className={payrollPaymentsThClass}>Payment ID</th>
                    <th className={payrollPaymentsThClass}>Employee</th>
                    <th className={payrollPaymentsThClass}>Amount</th>
                    <th className={payrollPaymentsThClass}>Status</th>
                    <th className={payrollPaymentsThClass}>Date</th>
                  </tr>
                  <tr aria-hidden>
                    <th colSpan={5} className="p-0 font-normal">
                      <div className="mx-3 h-px sm:mx-4" style={{ backgroundColor: "var(--payroll-details-modal-divider)" }} />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p, i) => (
                    <Fragment key={p.paymentId}>
                      <tr>
                        <td className="px-4 py-3 font-medium text-dash-primary">{p.paymentId}</td>
                        <td className={payrollPaymentsEmployeeClass}>{p.employee}</td>
                        <td className="px-4 py-3 font-medium text-dash-primary">{p.amount}</td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                              (p.status === "Completed" || p.status === "Executed") && "status-pill-completed",
                              p.status === "Processing" && "status-pill-processing"
                            )}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#8c919c]">{p.date}</td>
                      </tr>
                      {i < payments.length - 1 && (
                        <tr aria-hidden>
                          <td colSpan={5} className="p-0">
                            <div className="mx-3 h-px sm:mx-4" style={{ backgroundColor: "var(--payroll-details-modal-divider)" }} />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
