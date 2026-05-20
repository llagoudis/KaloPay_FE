"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import { ROUTES } from "@/lib/constants/routes";
import { useAdminTransactions } from "@/hooks/admin/useTransactions";
import AddTransactionModal from "@/components/admin/transactions/AddTransactionModal";
import type { AdminTransaction } from "@/lib/api/admin/transactions";

type TransactionRow = {
  createdOn: string;
  sender: string;
  beneficiary: string;
  amount: string;
  currency: string;
  transactionType: string;
  transactionId: string;
  account: string;
  transactionStatus: string;
  paymentType: string;
};

function toRow(t: AdminTransaction): TransactionRow {
  const created = t.created_at ? new Date(t.created_at).toLocaleString() : "—";
  const extra = t as unknown as Record<string, unknown>;
  return {
    createdOn: created,
    sender: (extra.sender as string) ?? "External",
    beneficiary: (extra.beneficiary as string) ?? "—",
    amount: String(t.amount ?? "0"),
    currency: t.currency ?? "—",
    transactionType: t.transactionType ?? t.transaction_type ?? "—",
    transactionId: t.transactionId ?? t.transaction_ref ?? String(t.id),
    account: t.account_id != null ? String(t.account_id) : "—",
    transactionStatus: t.transactionStatus ?? t.transaction_status ?? "pending",
    paymentType: t.paymentType ?? t.payment_type ?? "—",
  };
}

export default function AdminTransactionsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Pending" | "Completed">("All");
  const [addOpen, setAddOpen] = useState(false);

  const params: Record<string, string> = {};
  if (search) params.search = search;
  if (statusFilter !== "All") params.status = statusFilter.toLowerCase();

  const { data, isLoading, error } = useAdminTransactions(params);
  const rows = useMemo(() => (data?.data ?? []).map(toRow), [data]);

  const columns = [
    { key: "createdOn" as const, header: "Created On", headerClassName: "whitespace-nowrap", render: (v: unknown) => String(v) },
    { key: "sender" as const, header: "Sender", headerClassName: "whitespace-nowrap", render: (v: unknown) => String(v) },
    {
      key: "beneficiary" as const,
      header: "Beneficiary",
      headerClassName: "whitespace-nowrap",
      render: (value: unknown, row: TransactionRow) => (
        <Link
          href={ROUTES.admin.transactionDetail(row.transactionId)}
          className="font-medium text-blue-600 hover:underline"
        >
          {String(value)}
        </Link>
      ),
    },
    { key: "amount" as const, header: "Amount", headerClassName: "whitespace-nowrap", render: (v: unknown) => String(v) },
    { key: "currency" as const, header: "Currency", headerClassName: "whitespace-nowrap", render: (v: unknown) => String(v) },
    { key: "transactionType" as const, header: "Transaction Type", headerClassName: "whitespace-nowrap", className: "min-w-[160px]", render: (v: unknown) => String(v) },
    {
      key: "transactionId" as const,
      header: "Transaction ID",
      headerClassName: "whitespace-nowrap",
      className: "min-w-[180px]",
      render: (value: unknown, row: TransactionRow) => (
        <Link
          href={ROUTES.admin.transactionDetail(row.transactionId)}
          className="font-medium text-blue-600 hover:underline break-all"
        >
          {String(value)}
        </Link>
      ),
    },
    { key: "account" as const, header: "Account", headerClassName: "whitespace-nowrap", className: "min-w-[120px]", render: (v: unknown) => <span className="break-all">{String(v)}</span> },
    {
      key: "transactionStatus" as const,
      header: "Transaction Status",
      headerClassName: "whitespace-nowrap",
      render: (value: unknown) => {
        const v = String(value).toLowerCase();
        const variant: "success" | "warning" | "danger" =
          v === "completed" ? "success" :
          v === "failed" || v === "cancelled" ? "danger" :
          "warning";
        return <Badge label={String(value)} variant={variant} />;
      },
    },
    { key: "paymentType" as const, header: "Payment Type", headerClassName: "whitespace-nowrap", render: (v: unknown) => String(v) },
  ];

  return (
    <div className="w-full space-y-6">
      <div className="w-full rounded-[10px] bg-white" style={{ padding: "24px" }}>
        <h1
          className="admin-page-heading align-middle font-semibold"
          style={{
            fontFamily: "var(--font-poppins), Poppins, sans-serif",
            fontWeight: 600,
            fontSize: "24px",
            lineHeight: "26px",
            letterSpacing: "0px",
            color: "#0E1620",
          }}
        >
          Transaction
        </h1>
      </div>

      <div className="w-full rounded-[10px] bg-white p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative w-full sm:min-w-0 sm:flex-1">
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
          <div className="flex w-full gap-2 sm:w-auto sm:flex-none">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="h-10 flex-1 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:flex-none sm:w-auto"
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
            </select>
            <Button
              variant="primary"
              size="md"
              className="flex-1 sm:flex-none sm:w-auto"
              onClick={() => setAddOpen(true)}
            >
              + Add new
            </Button>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            Failed to load transactions: {(error as Error).message}
          </div>
        ) : null}

        <Table<TransactionRow>
          columns={columns}
          data={rows}
          emptyMessage={isLoading ? "Loading transactions…" : "No transactions found."}
          className="mt-6"
          tableClassName="min-w-max"
          bordered={false}
        />
      </div>

      <AddTransactionModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
