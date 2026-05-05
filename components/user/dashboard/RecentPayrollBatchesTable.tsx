"use client";

import { useState } from "react";
import Link from "next/link";
import { DASHBOARD_ROUTES } from "./routes";
import { cn } from "@/lib/utils/cn";
import PayrollDetailsPopup, { type BatchRow } from "./PayrollDetailsPopup";

const line = "border-[#dedede]";

/** Horizontal rules only; px aligns with card header. No vertical column lines. */
const thCell =
  `border-b ${line} px-4 py-4 text-left align-middle first:pl-0 last:pr-0 text-xs font-medium tracking-wide text-dash-secondary whitespace-nowrap`;
const tdCell = `border-b ${line} px-4 py-4 align-middle first:pl-0 last:pr-0`;

const batches: BatchRow[] = [
  { batchId: "PAYBATCH-JUL24-001", payPeriod: "July 2024 Monthly Payroll", totalAmount: "$8,500.00", paymentDate: "2024-07-01", status: "Completed", employees: 3 },
  { batchId: "PAYBATCH-JUN24-002", payPeriod: "June 2024 Bi-Weekly Run #2", totalAmount: "$8,100.00", paymentDate: "2024-06-28", status: "Completed", employees: 3 },
  { batchId: "PAYBATCH-JUN24-001", payPeriod: "June 2024 Bi-Weekly Run #1", totalAmount: "$7,900.00", paymentDate: "2024-05-14", status: "Processing", employees: 3 },
];

export default function RecentPayrollBatchesTable() {
  const [detailsBatch, setDetailsBatch] = useState<BatchRow | null>(null);

  return (
    <section
      className="recent-payroll-batches-card mt-6 rounded-xl bg-dash-card"
      style={{ backgroundColor: "var(--recent-payroll-batches-bg)" }}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-5 sm:px-6">
        <h2
          className="dash-card-section-title recent-payroll-batches-title shrink-0 whitespace-nowrap"
          style={{ color: "var(--recent-payroll-batches-title)" }}
        >
          Recent Payroll Batches
        </h2>
        <Link href={DASHBOARD_ROUTES.payroll} className="shrink-0 whitespace-nowrap text-sm font-medium text-dash-accent">
          View all
        </Link>
      </div>
      <div className="overflow-x-auto px-6">
        <table className="w-full min-w-[540px] border-collapse text-sm">
          <thead>
            <tr>
              <th className={thCell}>Batch ID</th>
              <th className={thCell}>Pay Period</th>
              <th className={thCell}>Total Amount</th>
              <th className={thCell}>Payment Date</th>
              <th className={thCell}>Status</th>
              <th className={thCell}>Employees</th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child_td]:border-b-0">
            {batches.map((row) => (
              <tr
                key={row.batchId}
                className="cursor-pointer"
                onClick={() => setDetailsBatch(row)}
              >
                <td className={tdCell} onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className="font-medium text-dash-accent"
                    onClick={() => setDetailsBatch(row)}
                  >
                    {row.batchId}
                  </button>
                </td>
                <td className={cn(tdCell, "font-medium text-dash-primary")}>{row.payPeriod}</td>
                <td className={cn(tdCell, "font-medium text-dash-primary")}>{row.totalAmount}</td>
                <td className={cn(tdCell, "text-dash-primary")}>{row.paymentDate}</td>
                <td className={tdCell}>
                  <span
                    className={cn(
                      "inline-flex rounded-full px-3 py-1 text-xs font-medium",
                      (row.status === "Executed" || row.status === "Completed") && "status-pill-completed",
                      row.status === "Processing" && "status-pill-processing",
                      !["Executed", "Processing", "Completed"].includes(row.status) && "bg-dash-icon text-dash-secondary"
                    )}
                  >
                    {row.status}
                  </span>
                </td>
                <td className={cn(tdCell, "text-dash-secondary")}>{row.employees}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detailsBatch && (
        <PayrollDetailsPopup batch={detailsBatch} onClose={() => setDetailsBatch(null)} />
      )}
    </section>
  );
}
