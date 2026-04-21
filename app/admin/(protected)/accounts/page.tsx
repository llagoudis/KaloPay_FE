"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import { ROUTES } from "@/lib/constants/routes";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import { getAccounts, deleteAccount, type Account } from "@/lib/api/admin/accounts";

type AccountType = "Crypto" | "Bank";

type AccountRow = {
  id: number;
  slNo: number;
  number: string;
  providerNumber: string;
  holder: string;
  type: AccountType;
  providerCurrency: string;
  status: string;
  providerName: string;
  bankDetails?: string;
  iban?: string;
  swiftBic?: string;
  bankName?: string;
};

function statusVariant(s: string): "success" | "warning" | "danger" | "info" {
  const v = (s ?? "").toLowerCase();
  if (v === "active" || v === "approved") return "success";
  if (v === "frozen" || v === "inactive") return "danger";
  if (v === "pending") return "warning";
  return "info";
}

export default function AdminAccountsPage() {
  const token = useAdminAuthStore((s) => s.token);
  const [search, setSearch] = useState("");
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await getAccounts(token, { limit: "100" });
      const rows: AccountRow[] = (res.data ?? []).map((a: Account, i: number) => ({
        id: a.id,
        slNo: a.slNo ?? i + 1,
        number: a.number ?? "",
        providerNumber: a.providerNumber ?? a.wallet_address ?? a.iban ?? "",
        holder: a.holder ?? a.company_name ?? "—",
        type: (a.type as AccountType) ?? "Bank",
        providerCurrency: a.provider_currency ?? "",
        status: a.status ?? "Active",
        providerName: a.provider_name ?? "",
        bankDetails: a.bank_details,
        iban: a.iban,
        swiftBic: a.swift_bic,
        bankName: a.bank_name,
      }));
      setAccounts(rows);
    } catch (err) {
      console.error("Failed to fetch accounts:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id: number) => {
    if (!token) return;
    if (!confirm("Delete this account?")) return;
    try {
      await deleteAccount(token, String(id));
      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete account");
    }
  };

  const filtered = accounts.filter(
    (a) =>
      a.number.toLowerCase().includes(search.toLowerCase()) ||
      a.holder.toLowerCase().includes(search.toLowerCase()) ||
      a.providerName.toLowerCase().includes(search.toLowerCase()) ||
      a.providerNumber.toLowerCase().includes(search.toLowerCase()) ||
      a.providerCurrency.toLowerCase().includes(search.toLowerCase()) ||
      (a.bankDetails?.toLowerCase().includes(search.toLowerCase())) ||
      (a.iban?.toLowerCase().includes(search.toLowerCase())) ||
      (a.swiftBic?.toLowerCase().includes(search.toLowerCase())) ||
      (a.bankName?.toLowerCase().includes(search.toLowerCase())) ||
      String(a.slNo).includes(search)
  );

  const columns = [
    {
      key: "slNo" as const,
      header: "SL NO",
      headerClassName: "whitespace-nowrap",
      render: (value: unknown) => String(value),
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
              {row.bankDetails && <div>Bank Details: {row.bankDetails}</div>}
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
        <Badge label={String(value)} variant={statusVariant(String(value))} />
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
      render: (_: unknown, row: AccountRow) => (
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenMenuId(openMenuId === row.id ? null : row.id)}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Actions"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </button>
          {openMenuId === row.id && (
            <div className="absolute right-0 z-10 mt-1 w-32 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
              <Link
                href={ROUTES.admin.accountDetail(row.number)}
                className="block px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setOpenMenuId(null)}
              >
                View
              </Link>
              <button
                type="button"
                onClick={() => { setOpenMenuId(null); handleDelete(row.id); }}
                className="block w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-gray-100"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  const tableData = filtered.map((a) => ({ ...a, actions: null }));

  return (
    <div className="w-full space-y-6">
      <div className="admin-page-title-strip w-full rounded-[10px] bg-white" style={{ padding: "24px" }}>
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

      <div className="admin-page-panel w-full rounded-[10px] bg-white p-6">
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
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          </div>
        ) : (
          <Table<AccountRow & { actions: null }>
            columns={columns}
            data={tableData}
            emptyMessage="No accounts found."
            className="admin-list-table mt-6 border-0 border-gray-100"
            bordered={false}
            rowDividers
            rowHover={false}
          />
        )}
      </div>
    </div>
  );
}
