"use client";

import { useState } from "react";
import Link from "next/link";
import { DASHBOARD_ROUTES } from "./routes";
import { cn } from "@/lib/utils/cn";
import PayrollDetailsPopup from "./PayrollDetailsPopup";
import { usePayrollBatches } from "@/hooks/employer/useDashboard";

const line = "border-[#dedede]";

const thCell =
  `border-b ${line} px-4 py-4 text-left align-middle first:pl-0 last:pr-0 text-xs font-medium tracking-wide text-dash-secondary whitespace-nowrap`;
const tdCell = `border-b ${line} px-4 py-4 align-middle first:pl-0 last:pr-0`;

function formatAmount(amount: number, currency: string) {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 2,
  });
}

function statusLabel(status: string) {
  if (!status) return status;
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

export default function RecentPayrollBatchesTable() {
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);
  const { data, isLoading } = usePayrollBatches(3);
  const batches = data?.batches ?? [];

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
            {isLoading && (
              <tr><td colSpan={6} className={cn(tdCell, "text-center text-dash-secondary")}>Loading…</td></tr>
            )}
            {!isLoading && batches.length === 0 && (
              <tr><td colSpan={6} className={cn(tdCell, "text-center text-dash-secondary")}>No payroll batches yet.</td></tr>
            )}
            {batches.map((row) => {
              const status = statusLabel(row.status);
              return (
                <tr
                  key={row.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedBatchId(row.id)}
                >
                  <td className={tdCell} onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="font-medium text-dash-accent"
                      onClick={() => setSelectedBatchId(row.id)}
                    >
                      {row.batchRef}
                    </button>
                  </td>
                  <td className={cn(tdCell, "font-medium text-dash-primary")}>{row.payPeriod}</td>
                  <td className={cn(tdCell, "font-medium text-dash-primary")}>{formatAmount(row.totalAmount, row.currency)}</td>
                  <td className={cn(tdCell, "text-dash-primary")}>{row.paymentDate}</td>
                  <td className={tdCell}>
                    <span
                      className={cn(
                        "inline-flex rounded-full px-3 py-1 text-xs font-medium",
                        status === "Completed" && "status-pill-completed",
                        status === "Processing" && "status-pill-processing",
                        !["Completed", "Processing"].includes(status) && "bg-dash-icon text-dash-secondary"
                      )}
                    >
                      {status}
                    </span>
                  </td>
                  <td className={cn(tdCell, "text-dash-secondary")}>{row.employeeCount}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedBatchId !== null && (
        <PayrollDetailsPopup batchId={selectedBatchId} onClose={() => setSelectedBatchId(null)} />
      )}
    </section>
  );
}
