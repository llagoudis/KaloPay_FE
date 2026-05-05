"use client";

import { useState } from "react";
import SearchBar from "@/components/shared/SearchBar";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { formatDate } from "@/lib/utils/formatDate";
import { cn } from "@/lib/utils/cn";

const mockPayments = [
  { id: "PAY-001", recipient: "Alice Johnson", amount: 8500, period: "Feb 2026", status: "executed", date: "2026-03-01" },
  { id: "PAY-002", recipient: "Bob Smith", amount: 7200, period: "Feb 2026", status: "executed", date: "2026-03-01" },
  { id: "PAY-003", recipient: "Carol White", amount: 6100, period: "Feb 2026", status: "executed", date: "2026-03-01" },
  { id: "PAY-004", recipient: "David Brown", amount: 5500, period: "Mar 2026", status: "due", date: "2026-03-15" },
  { id: "PAY-005", recipient: "Eva Green", amount: 5000, period: "Mar 2026", status: "due", date: "2026-03-15" },
];

type Tab = "all" | "due" | "executed";

/** Payments page – Figma Payroll (node 337-4807). Due & Executed. Dashboard design system. */
export default function EmployerPaymentsPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<Tab>("all");
  const [page, setPage] = useState(1);
  const totalPages = 2;

  const filtered = mockPayments.filter((p) => {
    const matchSearch =
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.recipient.toLowerCase().includes(search.toLowerCase()) ||
      p.period.toLowerCase().includes(search.toLowerCase());
    const matchTab =
      tab === "all" ||
      (tab === "due" && p.status === "due") ||
      (tab === "executed" && p.status === "executed");
    return matchSearch && matchTab;
  });

  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "due", label: "Due" },
    { key: "executed", label: "Executed" },
  ];

  return (
    <div className="min-h-full w-full bg-dash-page" data-dashboard-theme data-page="payments">
      <div className="dash-shell pb-8 pt-6">
      <div className="mb-6">
          <h1 className="payments-page-title bg-transparent text-2xl font-semibold leading-8 tracking-normal [font-family:var(--font-poppins),Poppins,sans-serif]">
            Payments
          </h1>
          <p className="mt-1 text-sm text-dash-secondary">
            Due and executed payments.
          </p>
        </div>

        <section className="rounded-xl bg-dash-card">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-dash-icon-bg)] px-6 py-4">
            <div className="flex gap-2">
              {tabs.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  className={cn(
                    "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                    tab === key
                      ? "bg-[var(--color-dash-accent)] text-white"
                      : "border border-[var(--color-dash-icon-bg)] text-white hover:border-[var(--color-dash-accent)]/50"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <SearchBar
              placeholder="Search by ID, recipient or period..."
              onSearch={setSearch}
              className="max-w-sm"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-dash-icon-bg)] text-left text-xs font-medium uppercase tracking-wide text-dash-secondary">
                  <th className="px-6 py-4">Payment ID</th>
                  <th className="px-6 py-4">Recipient</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Period</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-dash-icon-bg)]">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-dash-secondary">
                      No payments found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((payment) => (
                    <tr key={payment.id} className="hover:bg-white/5">
                      <td className="px-6 py-4">
                        <span className="font-medium text-[var(--color-dash-accent)]">{payment.id}</span>
                      </td>
                      <td className="px-6 py-4 font-medium text-white">{payment.recipient}</td>
                      <td className="px-6 py-4 font-medium text-white">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-6 py-4 text-dash-secondary">{payment.period}</td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize",
                            payment.status === "executed" && "bg-[#14532d] text-[#4ade80]",
                            payment.status === "due" && "bg-[#451a03] text-[#f59e0b]",
                            !["executed", "due"].includes(payment.status) &&
                              "bg-dash-icon text-dash-secondary"
                          )}
                        >
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-dash-secondary">
                        {formatDate(payment.date)}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          className="mr-3 text-sm font-medium text-[var(--color-dash-accent)] hover:underline"
                        >
                          View
                        </button>
                        {payment.status === "due" && (
                          <button
                            type="button"
                            className="text-sm font-medium text-[var(--color-dash-accent)] hover:underline"
                          >
                            Pay
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-[var(--color-dash-icon-bg)] px-6 py-4">
            <span className="text-sm text-dash-secondary">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-lg border border-[var(--color-dash-icon-bg)] px-3 py-1.5 text-sm font-medium text-white hover:bg-white/5 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded-lg border border-[var(--color-dash-icon-bg)] px-3 py-1.5 text-sm font-medium text-white hover:bg-white/5 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </section>
    </div>
  );
}
