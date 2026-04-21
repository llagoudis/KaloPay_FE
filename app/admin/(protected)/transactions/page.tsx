"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import { ROUTES } from "@/lib/constants/routes";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import { getTransactions, type AdminTransaction } from "@/lib/api/admin/transactions";

type TransactionRow = {
  createdOn: string;
  sender: string;
  beneficiary: string;
  amount: string;
  currency: string;
  transactionType: string;
  transactionId: string;
  account: string;
  accountBank?: boolean;
  bankDetails?: string;
  iban?: string;
  swiftBic?: string;
  bankName?: string;
  transactionStatus: string;
  paymentType: string;
};

const mockTransactions: TransactionRow[] = [
  {
    createdOn: "14.12.2023 10:22:19 AM",
    sender: "External",
    beneficiary: "Justin Paul",
    amount: "0.01076679",
    currency: "BTC_TEST",
    transactionType: "Outgoing Transfer",
    transactionId: "b21d80-170-dato-dms-b4d84eb0f2",
    account: "IgrRehl7HuckpwWkkmYqoH7oxeD0sTU",
    transactionStatus: "Completed",
    paymentType: "SEPA SCT",
  },
  {
    createdOn: "14.12.2023 10:22:19 AM",
    sender: "External",
    beneficiary: "Justin Paul",
    amount: "0.01076679",
    currency: "Euro",
    transactionType: "Outgoing Transfer",
    transactionId: "b21d80-170-dato-dms-b4d84eb0f2",
    account: "",
    accountBank: true,
    bankDetails: "General Payments Gate LTD",
    iban: "GB50TRWI23148510000949",
    swiftBic: "TRWIGB2LXXX",
    bankName: "My EU Pay Ltd.",
    transactionStatus: "Completed",
    paymentType: "SEPA Instant",
  },
  {
    createdOn: "14.12.2023 10:22:19 AM",
    sender: "External",
    beneficiary: "Justin Paul",
    amount: "0.01076679",
    currency: "BTC_TEST",
    transactionType: "Outgoing Transfer",
    transactionId: "b21d80-170-dato-dms-b4d84eb0f2",
    account: "IgrRehl7HuckpwWkkmYqoH7oxeD0sTU",
    transactionStatus: "Completed",
    paymentType: "SWIFT",
  },
  {
    createdOn: "14.12.2023 10:22:19 AM",
    sender: "External",
    beneficiary: "Justin Paul",
    amount: "0.01076679",
    currency: "Euro",
    transactionType: "Outgoing Transfer",
    transactionId: "b21d80-170-dato-dms-b4d84eb0f2",
    account: "",
    accountBank: true,
    bankDetails: "Payments Gate UK Ltd",
    iban: "GB82WEST12345698765432",
    swiftBic: "WESTGB2LXXX",
    bankName: "Westminster Bank",
    transactionStatus: "Completed",
    paymentType: "SEPA SCT",
  },
  {
    createdOn: "14.12.2023 10:22:19 AM",
    sender: "External",
    beneficiary: "Justin Paul",
    amount: "0.01076679",
    currency: "BTC_TEST",
    transactionType: "Outgoing Transfer",
    transactionId: "b21d80-170-dato-dms-b4d84eb0f2",
    account: "IgrRehl7HuckpwWkkmYqoH7oxeD0sTU",
    transactionStatus: "Completed",
    paymentType: "SEPA Instant",
  },
];

export default function AdminTransactionsPage() {
  const token = useAdminAuthStore((s) => s.token);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await getTransactions(token, { limit: "100" });
      const rows: TransactionRow[] = (res.data ?? []).map((t: AdminTransaction) => ({
        createdOn: t.created_at
          ? new Date(t.created_at).toLocaleString("en-GB", { hour12: true })
          : "",
        sender: "External",
        beneficiary: "—",
        amount: String(t.amount ?? ""),
        currency: t.currency ?? "",
        transactionType: t.transaction_type ?? "",
        transactionId: t.transaction_ref ?? String(t.id),
        account: String(t.account_id ?? ""),
        transactionStatus: t.transaction_status ?? "",
        paymentType: t.payment_type ?? "",
      }));
      setTransactions(rows.length > 0 ? rows : mockTransactions);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
      setTransactions(mockTransactions);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = transactions.filter(
    (t) =>
      t.beneficiary.toLowerCase().includes(search.toLowerCase()) ||
      t.sender.toLowerCase().includes(search.toLowerCase()) ||
      t.transactionId.toLowerCase().includes(search.toLowerCase()) ||
      t.amount.includes(search) ||
      t.currency.toLowerCase().includes(search.toLowerCase()) ||
      t.paymentType.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: "createdOn" as const,
      header: "Created On",
      headerClassName: "whitespace-nowrap",
      render: (v: unknown) => String(v),
    },
    {
      key: "sender" as const,
      header: "Sender",
      headerClassName: "whitespace-nowrap",
      render: (v: unknown) => String(v),
    },
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
    {
      key: "amount" as const,
      header: "Amount",
      headerClassName: "whitespace-nowrap",
      render: (v: unknown) => String(v),
    },
    {
      key: "currency" as const,
      header: "Currency",
      headerClassName: "whitespace-nowrap",
      render: (v: unknown) => String(v),
    },
    {
      key: "transactionType" as const,
      header: "Transaction Type",
      headerClassName: "whitespace-nowrap",
      className: "min-w-[160px]",
      render: (v: unknown) => String(v),
    },
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
    {
      key: "account" as const,
      header: "Account",
      headerClassName: "whitespace-nowrap",
      className: "min-w-[200px]",
      render: (_: unknown, row: TransactionRow) => {
        if (row.accountBank && (row.bankDetails || row.iban || row.swiftBic || row.bankName)) {
          return (
            <div className="text-sm text-gray-700 leading-relaxed">
              {row.bankDetails && <div>Bank Details: {row.bankDetails}</div>}
              {row.iban && <div>IBAN: {row.iban}</div>}
              {row.swiftBic && <div>SWIFT/BIC: {row.swiftBic}</div>}
              {row.bankName && <div>Bank Name: {row.bankName}</div>}
            </div>
          );
        }
        return <span className="break-all">{row.account || "—"}</span>;
      },
    },
    {
      key: "transactionStatus" as const,
      header: "Transaction Status",
      headerClassName: "whitespace-nowrap",
      render: (value: unknown) => <Badge label={String(value)} variant="success" />,
    },
    {
      key: "paymentType" as const,
      header: "Payment Type",
      headerClassName: "whitespace-nowrap",
      render: (v: unknown) => String(v),
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

  const tableData = filtered.map((t) => ({ ...t, actions: null }));

  return (
    <div className="w-full space-y-6">
      <div className="admin-page-title-strip w-full rounded-[10px] bg-white" style={{ padding: "24px" }}>
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

      <div className="admin-page-panel w-full rounded-[10px] bg-white p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search: mobile par full width, desktop par flex-1 */}
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
          {/* Buttons: mobile par side-by-side equal width, desktop par inline */}
          <div className="flex w-full gap-2 sm:w-auto sm:flex-none">
            <button
              type="button"
              onClick={() => setStatusFilter(statusFilter === "Pending" ? "All" : "Pending")}
              className="h-10 flex-1 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:flex-none sm:w-auto"
            >
              {statusFilter}
            </button>
            <Button
              variant="primary"
              size="md"
              className="flex-1 sm:flex-none sm:w-auto"
            >
              + Add new
            </Button>
          </div>
        </div>

        {/* Full table with horizontal scroll — table min-w-max se scrollbar dikhega */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          </div>
        ) : (
          <Table<TransactionRow & { actions: null }>
            columns={columns}
            data={tableData}
            emptyMessage="No transactions found."
            className="admin-list-table mt-6 border-0 border-gray-100"
            tableClassName="min-w-max"
            bordered={false}
            rowDividers
            rowHover={false}
          />
        )}
      </div>
    </div>
  );
}