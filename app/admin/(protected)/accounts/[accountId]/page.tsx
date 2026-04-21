"use client";

import Link from "next/link";
import { use, useState, useEffect } from "react";
import { ROUTES } from "@/lib/constants/routes";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import { getAccount } from "@/lib/api/admin/accounts";

const SECTION_HEADER_STYLE =
  "border-b border-gray-200 px-4 py-3 flex items-center justify-between rounded-t-[16px]";
const SECTION_HEADER_BG = "#DEEEFF";
const SECTION_HEADING_STYLE: React.CSSProperties = {
  fontFamily: "var(--font-poppins), Poppins, sans-serif",
  fontWeight: 500,
  fontSize: "16px",
  lineHeight: "20px",
  letterSpacing: "0%",
  color: "#000000",
};
const SECTION_BORDER = "1px solid #DFDFDF";

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="mb-4 flex flex-col gap-0.5">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}

const MOCK_ACCOUNT = {
  client: "AKSHAY_NET",
  number: "019FNhiA4cV",
  type: "TEX_TEST",
  status: "ACTIVE",
  createdAt: "12 Apr 2025 11:39:02 PM",
  holder: "AKSHAY_NET",
  name: "-",
  primary: "-",
  statusChangedBy: "-",
  providerName: "Provider Name",
  accountNumber: "-",
  bic: "-",
  currency: "-",
  balances: {
    currency: "TEX_TEST",
    current: "193138.32000000002",
    reserved: "-",
    available: "-",
  },
};

type TransactionRow = {
  id: string;
  amount: string;
  description: string;
  type: string;
  status: string;
  date: string;
};

const MOCK_TRANSACTIONS: TransactionRow[] = Array.from({ length: 5 }, () => ({
  id: "2983",
  amount: "+500000000",
  description: "Test Description",
  type: "Outgoing Transfer",
  status: "Completed",
  date: "07-01-2025 11:58:43 AM",
}));

export default function AdminAccountDetailPage({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = use(params);
  const token = useAdminAuthStore((s) => s.token);
  const [showMicroTransaction, setShowMicroTransaction] = useState(false);
  const [accountData, setAccountData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (!token) return;
    getAccount(token, accountId)
      .then((res) => setAccountData(res.account as unknown as Record<string, unknown>))
      .catch((err) => console.error("Failed to fetch account:", err));
  }, [token, accountId]);

  const a = {
    ...MOCK_ACCOUNT,
    ...(accountData
      ? {
          client: (accountData.holder as string) ?? MOCK_ACCOUNT.client,
          number: (accountData.number as string) ?? MOCK_ACCOUNT.number,
          type: (accountData.type as string) ?? MOCK_ACCOUNT.type,
          status: (accountData.status as string) ?? MOCK_ACCOUNT.status,
          createdAt: accountData.created_at
            ? new Date(accountData.created_at as string).toLocaleString("en-GB")
            : MOCK_ACCOUNT.createdAt,
          holder: (accountData.holder as string) ?? MOCK_ACCOUNT.holder,
          providerName: (accountData.provider_name as string) ?? MOCK_ACCOUNT.providerName,
          accountNumber:
            (accountData.iban as string) ?? (accountData.wallet_address as string) ?? MOCK_ACCOUNT.accountNumber,
          bic: (accountData.swift_bic as string) ?? MOCK_ACCOUNT.bic,
          currency: (accountData.provider_currency as string) ?? MOCK_ACCOUNT.currency,
          balances: {
            ...MOCK_ACCOUNT.balances,
            currency: (accountData.provider_currency as string) ?? MOCK_ACCOUNT.balances.currency,
            current: String(accountData.current_balance ?? MOCK_ACCOUNT.balances.current),
          },
        }
      : {}),
  };

  const transactionColumns = [
    { key: "id" as const, header: "ID", render: (v: unknown) => String(v) },
    { key: "amount" as const, header: "Amount", render: (v: unknown) => String(v) },
    { key: "description" as const, header: "Description", render: (v: unknown) => String(v) },
    { key: "type" as const, header: "Type", render: (v: unknown) => String(v) },
    {
      key: "status" as const,
      header: "Status",
      render: (v: unknown) => <Badge label={String(v)} variant="success" />,
    },
    { key: "date" as const, header: "Date", render: (v: unknown) => String(v) },
  ];

  return (
    <div className="view-account-detail-page w-full space-y-6">
      {/* View Accounts — title row (light: white card; dark: navy strip via globals) */}
      <div className="view-account-page-title-card rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm sm:px-6 sm:py-5">
        <h1
          className="admin-page-heading font-semibold text-gray-900"
          style={{
            fontFamily: "var(--font-poppins), Poppins, sans-serif",
            fontSize: "22px",
            lineHeight: "28px",
            color: "#0E1620",
          }}
        >
          View Accounts
        </h1>
      </div>

      {/* Main bordered container — iske andar Details, Provider, Balances, Transactions */}
      <div
        className="view-account-detail-shell space-y-6"
        style={{
          borderRadius: "16px",
          padding: 0,
          overflow: "hidden",
        }}
      >
        <div className="px-4 pb-8 pt-5 sm:px-5 sm:pb-10 sm:pt-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_auto] lg:gap-6">
          {/* Details */}
        <div
          className="view-account-details-section overflow-hidden bg-white shadow-sm"
          style={{ borderRadius: "16px", border: SECTION_BORDER }}
        >
          <div
            className={SECTION_HEADER_STYLE}
            style={{ backgroundColor: SECTION_HEADER_BG }}
          >
            <span style={SECTION_HEADING_STYLE}>Details</span>
          </div>
          <div className="view-account-section-body grid gap-x-8 gap-y-4 px-4 pb-5 pt-5 sm:grid-cols-2 sm:p-5">
            <div>
              <DetailRow
                label="Client"
                value={
                  <Link
                    href={ROUTES.admin.accounts}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {a.client}
                  </Link>
                }
              />
              <DetailRow label="Number" value={a.number} />
              <DetailRow label="Type" value={a.type} />
              <DetailRow
                label="Status"
                value={<span className="text-green-600 font-medium">{a.status}</span>}
              />
              <DetailRow label="Created at" value={a.createdAt} />
            </div>
            <div>
              <DetailRow label="Holder" value={a.holder} />
              <DetailRow label="Name" value={a.name} />
              <DetailRow label="Primary" value={a.primary} />
              <DetailRow label="Status changed by" value={a.statusChangedBy} />
            </div>
          </div>
        </div>

        {/* Right column: Provider account number + Balances */}
        <div className="flex min-w-0 w-full max-w-none flex-col gap-8 lg:min-w-[280px] lg:max-w-[360px] lg:w-[320px] lg:gap-6">
          <div
            className="view-account-details-section overflow-hidden bg-white shadow-sm"
            style={{ borderRadius: "16px", border: SECTION_BORDER }}
          >
            <div
              className={SECTION_HEADER_STYLE}
              style={{ backgroundColor: SECTION_HEADER_BG }}
            >
              <span style={SECTION_HEADING_STYLE}>Provider account number</span>
            </div>
            <div className="view-account-section-body grid grid-cols-1 gap-x-6 gap-y-5 px-4 pb-5 pt-5 sm:grid-cols-2 sm:gap-4 sm:p-5">
              <div className="min-w-0 flex flex-col gap-0.5">
                <span className="text-sm text-gray-500">Provider Name</span>
                <span className="break-words text-sm font-medium text-gray-900">{a.providerName}</span>
              </div>
              <div className="min-w-0 flex flex-col gap-0.5">
                <span className="text-sm text-gray-500">Account number</span>
                <span className="break-words text-sm font-medium text-gray-900">{a.accountNumber}</span>
              </div>
              <div className="min-w-0 flex flex-col gap-0.5">
                <span className="text-sm text-gray-500">BIC</span>
                <span className="break-words text-sm font-medium text-gray-900">{a.bic}</span>
              </div>
              <div className="min-w-0 flex flex-col gap-0.5">
                <span className="text-sm text-gray-500">Currency</span>
                <span className="break-words text-sm font-medium text-gray-900">{a.currency}</span>
              </div>
            </div>
          </div>

          <div
            className="view-account-details-section overflow-hidden bg-white shadow-sm"
            style={{ borderRadius: "16px", border: SECTION_BORDER }}
          >
            <div
              className={SECTION_HEADER_STYLE}
              style={{ backgroundColor: SECTION_HEADER_BG }}
            >
              <span style={SECTION_HEADING_STYLE}>Balances</span>
            </div>
            <div className="view-account-section-body grid grid-cols-1 gap-x-6 gap-y-5 px-4 pb-5 pt-5 sm:grid-cols-2 sm:gap-4 sm:p-5">
              <div className="min-w-0 flex flex-col gap-0.5">
                <span className="text-sm text-gray-500">Currency</span>
                <span className="break-words text-sm font-medium text-gray-900">{a.balances.currency}</span>
              </div>
              <div className="min-w-0 flex flex-col gap-0.5">
                <span className="text-sm text-gray-500">Current</span>
                <span className="break-words text-sm font-medium text-gray-900">{a.balances.current}</span>
              </div>
              <div className="min-w-0 flex flex-col gap-0.5">
                <span className="text-sm text-gray-500">Reserved</span>
                <span className="break-words text-sm font-medium text-gray-900">{a.balances.reserved}</span>
              </div>
              <div className="min-w-0 flex flex-col gap-0.5">
                <span className="text-sm text-gray-500">Available</span>
                <span className="break-words text-sm font-medium text-gray-900">{a.balances.available}</span>
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* Transactions — heading + checkbox + table */}
        <div className="view-account-transactions-block mt-8 space-y-5 px-0 pb-6 pt-2 sm:mt-10 sm:pt-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2
              className="view-account-transactions-title font-semibold"
              style={{
                fontFamily: "var(--font-poppins), Poppins, sans-serif",
                fontSize: "16px",
                lineHeight: "20px",
              }}
            >
              Transactions
            </h2>
            <label className="view-account-transactions-checkbox-label flex cursor-pointer items-center gap-2 text-sm font-normal">
              <input
                type="checkbox"
                checked={showMicroTransaction}
                onChange={(e) => setShowMicroTransaction(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Show micro transaction
            </label>
          </div>
          <div className="view-account-section-body view-account-transactions-table-wrap overflow-hidden rounded-lg p-5 sm:p-6">
            <Table<TransactionRow>
              columns={transactionColumns}
              data={MOCK_TRANSACTIONS}
              emptyMessage="No transactions found."
              bordered={false}
              className="view-account-transactions-table"
            />
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}