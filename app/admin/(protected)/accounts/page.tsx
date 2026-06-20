"use client";

import { useMemo, useState } from "react";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import { useAccounts } from "@/hooks/admin/useAccounts";
import type { AdminAccount } from "@/lib/api/admin/accounts";

type AccountRow = AdminAccount & Record<string, unknown>;

export default function AdminAccountsPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading, error } = useAccounts();

  const accounts = useMemo(() => {
    const rows = data?.data ?? [];
    if (!search) return rows;
    const q = search.toLowerCase();
    return rows.filter(
      (a) =>
        a.account_number.toLowerCase().includes(q) ||
        (a.company_name ?? "").toLowerCase().includes(q) ||
        a.account_type.toLowerCase().includes(q) ||
        a.currency.toLowerCase().includes(q) ||
        a.status.toLowerCase().includes(q) ||
        (a.provider ?? "").toLowerCase().includes(q)
    );
  }, [data, search]);

  const columns = [
    {
      key: "account_number" as const,
      header: "Account Number",
      render: (v: unknown) => (
        <span className="font-mono text-sm font-medium text-blue-600">{String(v)}</span>
      ),
    },
    {
      key: "company_name" as const,
      header: "Company",
      render: (v: unknown) => String(v ?? "—"),
    },
    {
      key: "account_type" as const,
      header: "Type",
      render: (v: unknown) => String(v ?? "—"),
    },
    {
      key: "currency" as const,
      header: "Currency",
      render: (v: unknown) => String(v ?? "—"),
    },
    {
      key: "balance" as const,
      header: "Balance",
      render: (v: unknown) => String(v ?? "0.00"),
    },
    {
      key: "status" as const,
      header: "Status",
      render: (v: unknown) => {
        const s = String(v).toLowerCase();
        const variant: "success" | "warning" | "danger" | "default" =
          s === "active" ? "success" : s === "suspended" ? "danger" : s === "pending" ? "warning" : "default";
        return <Badge label={String(v)} variant={variant} />;
      },
    },
    {
      key: "provider" as const,
      header: "Provider",
      render: (v: unknown) => String(v ?? "—"),
    },
  ];

  return (
    <div className="w-full space-y-6">
      <div className="w-full rounded-[10px] bg-white p-6">
        <h1 className="text-2xl font-semibold text-[#0E1620]">Accounts</h1>
      </div>

      <div className="w-full rounded-xl bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <label className="relative min-w-0 flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="search"
              placeholder="Search accounts…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </label>
        </div>

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            Failed to load accounts: {(error as Error).message}
          </div>
        )}

        <Table<AccountRow>
          columns={columns}
          data={accounts as AccountRow[]}
          emptyMessage={isLoading ? "Loading accounts…" : "No accounts found."}
          className="admin-list-table mt-6 border-0"
        />
      </div>
    </div>
  );
}
