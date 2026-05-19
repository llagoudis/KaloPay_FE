"use client";

import { useState } from "react";
import SearchBar from "@/components/shared/SearchBar";
import { formatDate } from "@/lib/utils/formatDate";
import { cn } from "@/lib/utils/cn";
import { usePayments } from "@/hooks/employer/useUserPanel";

type Tab = "all" | "due" | "executed";

function fmtMoney(amount: number, currency: string) {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 2,
  });
}

function statusLabel(s: string) {
  if (s === "completed") return "executed";
  if (s === "processing") return "due";
  return s;
}

export default function EmployerPaymentsPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<Tab>("all");

  const { data, isLoading } = usePayments({ status: tab, search: search || undefined });
  const payments = data?.payments ?? [];

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
          <p className="mt-1 text-sm text-dash-secondary">Due and executed payments.</p>
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
                      : "border border-[var(--color-dash-icon-bg)] text-dash-primary hover:border-[var(--color-dash-accent)]/50"
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
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-dash-secondary">
                      Loading…
                    </td>
                  </tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-dash-secondary">
                      No payments found.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => {
                    const status = statusLabel(p.status);
                    return (
                      <tr key={p.id} className="hover:bg-white/5">
                        <td className="px-6 py-4">
                          <span className="font-medium text-[var(--color-dash-accent)]">{p.paymentRef}</span>
                        </td>
                        <td className="px-6 py-4 font-medium text-dash-primary">{p.recipient}</td>
                        <td className="px-6 py-4 font-medium text-dash-primary">
                          {fmtMoney(p.amount, p.currency)}
                        </td>
                        <td className="px-6 py-4 text-dash-secondary">{p.period}</td>
                        <td className="px-6 py-4">
                          <span
                            className={cn(
                              "inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize",
                              status === "executed" && "bg-[#dcfce7] text-[#166534]",
                              status === "due" && "bg-[#fef9c3] text-[#854d0e]",
                              !["executed", "due"].includes(status) && "bg-dash-icon text-dash-secondary"
                            )}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-dash-secondary">{formatDate(p.date)}</td>
                        <td className="px-6 py-4">
                          <button
                            type="button"
                            className="mr-3 text-sm font-medium text-[var(--color-dash-accent)] hover:underline"
                          >
                            View
                          </button>
                          {status === "due" && (
                            <button
                              type="button"
                              className="text-sm font-medium text-[var(--color-dash-accent)] hover:underline"
                            >
                              Pay
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
