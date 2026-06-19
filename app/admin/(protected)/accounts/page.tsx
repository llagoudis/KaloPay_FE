"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import { ROUTES } from "@/lib/constants/routes";
import { getAccounts, type AccountRow as ApiAccountRow } from "@/lib/api/admin/accounts";
import { useAdminAuthStore } from "@/store/adminAuthStore";

type AccountRow = ApiAccountRow & { actions: null } & Record<string, unknown>;

export default function AdminAccountsPage() {
  const token = useAdminAuthStore((s) => s.token);
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "accounts"],
    queryFn: () => getAccounts(token!),
    enabled: !!token,
  });

  const [search, setSearch] = useState("");
  const accounts = data?.accounts ?? [];

  const filtered = accounts.filter(
    (a) =>
      a.number?.toLowerCase().includes(search.toLowerCase()) ||
      a.holder?.toLowerCase().includes(search.toLowerCase()) ||
      a.providerName?.toLowerCase().includes(search.toLowerCase()) ||
      a.providerNumber?.toLowerCase().includes(search.toLowerCase()) ||
      a.providerCurrency?.toLowerCase().includes(search.toLowerCase()) ||
      (a.bankDetails?.toLowerCase().includes(search.toLowerCase())) ||
      (a.iban?.toLowerCase().includes(search.toLowerCase())) ||
      (a.swiftBic?.toLowerCase().includes(search.toLowerCase())) ||
      (a.bankName?.toLowerCase().includes(search.toLowerCase())) ||
      String(a.slNo ?? a.id).includes(search)
  );

  const columns = [
    {
      key: "slNo" as const,
      header: "SL NO",
      headerClassName: "whitespace-nowrap",
      render: (value: unknown, row: AccountRow) => String(value ?? row.id ?? "—"),
    },
    {
      key: "number" as const,
      header: "Number",
      render: (value: unknown, row: AccountRow) => (
        <Link
          href={ROUTES.admin.accountDetail(row.number)}
          className="font-medium text-blue-600 hover:underline"
        >
          {String(value)}
        </Link>
      ),
    },
    {
      key: "providerNumber" as const,
      header: "Provider Number",
      headerClassName: "whitespace-nowrap",
      className: "min-w-[220px] align-top",
      render: (value: unknown, row: AccountRow) => {
        if (row.type === "Bank" && (row.bankDetails || row.iban || row.swiftBic || row.bankName)) {
          return (
            <div className="text-sm text-gray-700 leading-relaxed">
              {row.bankDetails && (
                <div>Bank Details: {row.bankDetails}</div>
              )}
              {row.iban && <div>IBAN: {row.iban}</div>}
              {row.swiftBic && <div>SWIFT/BIC: {row.swiftBic}</div>}
              {row.bankName && <div>Bank Name: {row.bankName}</div>}
            </div>
          );
        }
        return (
          <span className="font-mono text-sm text-gray-700 break-all">
            {String(value) || "—"}
          </span>
        );
      },
    },
    { key: "holder" as const, header: "Holder", render: (v: unknown) => String(v ?? "—") },
    { key: "type" as const, header: "Type", render: (v: unknown) => String(v ?? "—") },
    {
      key: "providerCurrency" as const,
      header: "Provider Currency",
      headerClassName: "whitespace-nowrap",
      render: (v: unknown) => String(v ?? "—"),
    },
    {
      key: "status" as const,
      header: "Status",
      render: (value: unknown) => (
        <Badge label={String(value)} variant="success" />
      ),
    },
    {
      key: "providerName" as const,
      header: "Provider Name",
      headerClassName: "whitespace-nowrap",
      render: (v: unknown) => String(v ?? "—"),
    },
    {
      key: "actions" as const,
      header: "",
      className: "w-10",
      render: () => (
        <button
          type="button"
          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label="Actions"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
        </button>
      ),
    },
  ];

  const tableData = filtered.map((a) => ({ ...a, actions: null as null }));

  return (
    <div className="w-full space-y-6">
      <div className="w-full rounded-[10px] bg-white" style={{ padding: "24px" }}>
        <h1
          className="admin-page-heading align-middle font-semibold"
          style={{
            fontFamily: "var(--font-poppins), Poppins, sans-serif",
            fontWeight: 600,
            fontStyle: "normal",
            fontSize: "24px",
            lineHeight: "26px",
            letterSpacing: "0px",
            color: "#0E1620",
          }}
        >
          Accounts
        </h1>
      </div>

      <div className="w-full rounded-xl bg-white p-6">
        <div className="flex items-center gap-3">
          <label className="relative min-w-0 flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="search"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </label>
        </div>
        {error ? (
          <p className="mt-6 text-sm text-red-600">Failed to load accounts: {(error as Error).message}</p>
        ) : isLoading ? (
          <p className="mt-6 text-sm text-gray-500">Loading accounts…</p>
        ) : (
          <Table<AccountRow>
            columns={columns}
            data={tableData}
            emptyMessage="No accounts found."
            className="admin-list-table mt-6 border-0 border-gray-100"
          />
        )}
      </div>
    </div>
  );
}