"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import WalletCards from "@/components/user/dashboard/WalletCards";
import { cn } from "@/lib/utils/cn";
import { DASHBOARD_ROUTES } from "@/components/user/dashboard/routes";

type ExecutionTab = "due" | "executed";
type TopNavTab = "payments" | "bulk" | "transfers" | "reports";
type BulkSubTab = "upload" | "history";

type BulkPayoutRow = {
  id: string;
  fileName: string;
  status: "Completed" | "Processing" | "Failed";
  completedCount: number;
  totalCount: number;
  uploadTime: string;
  payouts: { slNo: number; asset: string; address: string; status: "COMPLETED" | "PENDING" | "FAILED" }[];
};

const BULK_PAYOUT_ACTIVITY: BulkPayoutRow[] = [
  {
    id: "1",
    fileName: "Bulk_Payout_Template_USDC_Pol.csv",
    status: "Completed",
    completedCount: 3,
    totalCount: 3,
    uploadTime: "30-09-2024 2:35 PM",
    payouts: [
      { slNo: 1, asset: "USDC_POLYGON", address: "0x072fed956279944ec103e8463e1f5d9a008784190", status: "COMPLETED" },
      { slNo: 2, asset: "USDC_POLYGON", address: "0xff316812Ce9aa56868e0B4a58c0606345e8863a9d", status: "COMPLETED" },
      { slNo: 3, asset: "USDC_POLYGON", address: "0x08Daa7AF3027525042d9e972fb851b88570BD0B", status: "COMPLETED" },
    ],
  },
];

type PayrollBatch = {
  id: string;
  invoiceType: string;
  entity: string;
  dueDate: string;
  amount: string;
  status: "Pending" | "Hold" | "Executed";
  tab: ExecutionTab;
};

const PAYROLL_BATCHES: PayrollBatch[] = [
  {
    id: "PAYBATCH-JUL24-001",
    invoiceType: "July 2024 Monthly Payroll",
    entity: "Xchange-360 inc",
    dueDate: "2024-07-01",
    amount: "$240.00 USD",
    status: "Pending",
    tab: "due",
  },
  {
    id: "PAYBATCH-JUN24-001",
    invoiceType: "June 2024 Monthly Payroll",
    entity: "Xchange-360 inc",
    dueDate: "2024-07-01",
    amount: "$240.00 USD",
    status: "Pending",
    tab: "due",
  },
  {
    id: "PAYBATCH-MAY24-001",
    invoiceType: "May 2024 Monthly Payroll",
    entity: "Xchange-360 inc",
    dueDate: "2024-07-01",
    amount: "$240.00 USD",
    status: "Pending",
    tab: "due",
  },
  {
    id: "PAYBATCH-APR24-001",
    invoiceType: "April 2024 Monthly Payroll",
    entity: "Xchange-360 inc",
    dueDate: "2024-07-01",
    amount: "$240.00 USD",
    status: "Pending",
    tab: "due",
  },
];

type ExecutedPayment = {
  id: string;
  name: string;
  role: string;
  paymentMethod: string;
  invoices: string;
  dateOfPayment: string;
  batchId: string;
  amountFiat: string;
  amount: string;
};

/** Table header cell style – Poppins 400, 14px, line-height 16px, #6B7280 */
const TABLE_HEADER_STYLE: React.CSSProperties = {
  fontFamily: "Poppins, var(--font-poppins)",
  fontWeight: 400,
  fontStyle: "normal",
  fontSize: "14px",
  lineHeight: "16px",
  letterSpacing: "0%",
  verticalAlign: "middle",
  opacity: 1,
  color: "#6B7280",
};

const EXECUTED_PAYMENTS: ExecutedPayment[] = [
  {
    id: "1",
    name: "John Doe",
    role: "Accountant",
    paymentMethod: "EOR Employee",
    invoices: "Xchange-360 inc",
    dateOfPayment: "2024-07-01",
    batchId: "Testing Batch",
    amountFiat: "$240.00 USD",
    amount: "$240.00 USD",
  },
  {
    id: "2",
    name: "Lucy",
    role: "Finance",
    paymentMethod: "EOR Employee",
    invoices: "Xchange-360 inc",
    dateOfPayment: "2024-07-01",
    batchId: "Testing Batch",
    amountFiat: "$240.00 USD",
    amount: "240.00 USDC",
  },
  {
    id: "3",
    name: "Alex",
    role: "HR",
    paymentMethod: "EOR Employee",
    invoices: "Xchange-360 inc",
    dateOfPayment: "2024-07-01",
    batchId: "Testing Batch",
    amountFiat: "$240.00 USD",
    amount: "240.00 USDC",
  },
];

type BulkPayoutActivityRow = {
  id: string;
  fileName: string;
  status: "Completed" | "Processing" | "Failed";
  completedCount: number;
  totalCount: number;
  uploadTime: string;
  payouts: { slNo: number; asset: string; address: string; status: "COMPLETED" | "PENDING" | "FAILED" }[];
};

const MOCK_BULK_ACTIVITY: BulkPayoutActivityRow[] = [
  {
    id: "1",
    fileName: "Bulk_Payout_Template_USDC_Pol.csv",
    status: "Completed",
    completedCount: 3,
    totalCount: 3,
    uploadTime: "30-09-2024 2:35 PM",
    payouts: [
      { slNo: 1, asset: "USDC_POLYGON", address: "0x072fed956279944ec103e8463e1f5d9a008784190", status: "COMPLETED" },
      { slNo: 2, asset: "USDC_POLYGON", address: "0xff316812Ce9aa56868e0B4a58c0606345e8863a9d", status: "COMPLETED" },
      { slNo: 3, asset: "USDC_POLYGON", address: "0x08Daa7AF3027525042d9e972fb851b88570BD0B", status: "COMPLETED" },
    ],
  },
];

export default function EmployerPayrollPage() {
  const [executionTab, setExecutionTab] = useState<ExecutionTab>("due");
  const [topTab, setTopTab] = useState<TopNavTab>("payments");
  const [bulkSubTab, setBulkSubTab] = useState<BulkSubTab>("history");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [expandedBulkId, setExpandedBulkId] = useState<string | null>(MOCK_BULK_ACTIVITY[0]?.id ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredBatches = PAYROLL_BATCHES.filter((b) => b.tab === executionTab);

  const handleBulkDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file?.name.endsWith(".csv")) setSelectedFile(file);
  };

  return (
    <div
      className="min-h-screen w-full bg-dash-page"
      data-dashboard-theme
      data-page="payroll"
    >
      <main className="dash-shell pb-10 pt-6">
        {/* Secondary nav just under main navbar – Payments / Bulk Payouts / Transfers / Payroll Reports */}
        <section className="mt-4 mb-6 overflow-x-auto">
          <div className="inline-flex min-w-max gap-2 text-xs font-medium text-[#878787] md:text-sm">
            <button
              type="button"
              onClick={() => setTopTab("payments")}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border-0 px-6 py-2 text-xs font-semibold outline-none focus:outline-none focus:ring-0 md:text-sm",
                topTab === "payments" ? "bg-[#0F50DB] text-white shadow-sm" : "bg-transparent text-[#878787] shadow-none"
              )}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M7 9h4" />
                <path d="M7 13h2" />
              </svg>
              Payments
            </button>
            <button
              type="button"
              onClick={() => setTopTab("bulk")}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border-0 px-6 py-2 text-xs font-medium outline-none focus:outline-none focus:ring-0 md:text-sm",
                topTab === "bulk" ? "bg-[#0F50DB] text-white shadow-sm" : "bg-transparent text-[#878787] shadow-none"
              )}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 7H3" />
                <path d="M18 4l3 3-3 3" />
                <path d="M3 17h18" />
                <path d="M6 20l-3-3 3-3" />
              </svg>
              Bulk Payouts
            </button>
            <Link
              href={DASHBOARD_ROUTES.transfers}
              className="inline-flex items-center gap-2 rounded-full border-0 px-6 py-2 text-xs font-medium outline-none focus:outline-none focus:ring-0 md:text-sm bg-transparent text-[#878787] shadow-none hover:bg-slate-200/60 hover:text-slate-700"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
              Transfers
            </Link>
            <Link
              href={DASHBOARD_ROUTES.payrollReports}
              className="inline-flex items-center gap-2 rounded-full border-0 px-6 py-2 text-xs font-medium outline-none focus:outline-none focus:ring-0 md:text-sm bg-transparent text-[#878787] shadow-none hover:bg-slate-200/60 hover:text-slate-700"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="4" y="3" width="16" height="18" rx="2" />
                <path d="M8 7h8" />
                <path d="M8 11h8" />
                <path d="M8 15h5" />
              </svg>
              Payroll Reports
            </Link>
          </div>
        </section>

        {topTab === "payments" && (
          <>
            {/* Alag card – sirf "Payments" heading (Figma 251-4146) */}
            <section className="payroll-payments-heading-card mb-6 rounded-xl bg-[#f7f7fa] px-6 py-5 md:px-8">
              <h2 className="payroll-payments-heading dash-card-section-title">Payments</h2>
            </section>

            {/* Main div – Payments k nichy, andar sari cheezein (Due + Executed screens) */}
            <div className="payroll-payments-main-card rounded-xl bg-[#f7f7fa] px-4 py-6 sm:px-6 md:px-8">
              {/* Tabs: Due for Execution / Payroll Executed – Poppins 400, 16px, line-height 20px, #1F2937 */}
              <div className="payroll-execution-tabs-row mb-6">
              <div className="flex gap-3 border-b border-[#e5e7eb] pb-2 sm:gap-6">
                <button
                  type="button"
                  onClick={() => setExecutionTab("due")}
                  className={cn(
                    "payroll-execution-tab whitespace-nowrap border-b-2 pb-2 text-[13px] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F50DB]/40 sm:text-[16px]",
                    executionTab === "due"
                      ? "payroll-execution-tab--active border-[#0F50DB] text-[#0F50DB]"
                      : "payroll-execution-tab--inactive border-transparent"
                  )}
                  style={{
                    fontFamily: "Poppins, var(--font-poppins)",
                    fontWeight: 400,
                    fontStyle: "normal",
                    lineHeight: "20px",
                    letterSpacing: "0%",
                    verticalAlign: "middle",
                  }}
                >
                  Due for Execution
                </button>
                <button
                  type="button"
                  onClick={() => setExecutionTab("executed")}
                  className={cn(
                    "payroll-execution-tab whitespace-nowrap border-b-2 pb-2 text-[13px] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F50DB]/40 sm:text-[16px]",
                    executionTab === "executed"
                      ? "payroll-execution-tab--active border-[#0F50DB] text-[#0F50DB]"
                      : "payroll-execution-tab--inactive border-transparent"
                  )}
                  style={{
                    fontFamily: "Poppins, var(--font-poppins)",
                    fontWeight: 400,
                    fontStyle: "normal",
                    lineHeight: "20px",
                    letterSpacing: "0%",
                    verticalAlign: "middle",
                  }}
                >
                  Payroll Executed
                </button>
              </div>
              </div>

              {executionTab === "due" ? (
                <>
                  {/* 4 wallet cards – only for Due for Execution screen */}
                  <WalletCards />

                  {/* Search + Export bar */}
                  <section className="mb-6 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <div className="relative flex min-w-0 flex-1 items-center">
                        <span className="pointer-events-none absolute left-3 flex h-5 w-5 items-center justify-center text-[#878787]">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                          </svg>
                        </span>
                        <input
                          type="search"
                          placeholder="Search"
                          className="w-full rounded-lg border border-[#e5e7eb] bg-transparent py-2.5 pl-10 pr-4 text-sm text-[#1f2937] placeholder-[#9ca3af] focus:border-[#0F50DB] focus:outline-none focus:ring-1 focus:ring-[#0F50DB]"
                          onChange={(e) => { }}
                        />
                      </div>
                      <button
                        type="button"
                        className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#0F50DB] px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0D46C3] sm:px-4"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Export
                      </button>
                    </div>
                  </section>

                  {/* Due for Execution table – batches */}
                  <div className="overflow-x-auto">
                    <table className="payroll-due-batches-table w-full min-w-[900px] text-sm" style={{ tableLayout: "auto", borderCollapse: "collapse" }}>
                      <thead>
                        <tr className="payroll-due-batches-thead border-b border-[#e5e7eb] text-left text-[#6B7280]">
                          <th
                            className="w-10 whitespace-nowrap px-4 py-3 align-middle"
                            style={{ fontFamily: "var(--font-poppins)", fontWeight: 400, fontSize: "14px", lineHeight: "16px", letterSpacing: "0%" }}
                          >
                            <input type="checkbox" aria-label="Select all batches" />
                          </th>
                          <th className="whitespace-nowrap px-4 py-3 align-middle" style={{ fontFamily: "var(--font-poppins)", fontWeight: 400, fontSize: "14px", lineHeight: "16px", letterSpacing: "0%" }}>Batch ID</th>
                          <th className="whitespace-nowrap px-4 py-3 align-middle" style={{ fontFamily: "var(--font-poppins)", fontWeight: 400, fontSize: "14px", lineHeight: "16px", letterSpacing: "0%" }}>Invoice type</th>
                          <th className="whitespace-nowrap px-4 py-3 align-middle" style={{ fontFamily: "var(--font-poppins)", fontWeight: 400, fontSize: "14px", lineHeight: "16px", letterSpacing: "0%" }}>Entity</th>
                          <th className="whitespace-nowrap px-4 py-3 align-middle" style={{ fontFamily: "var(--font-poppins)", fontWeight: 400, fontSize: "14px", lineHeight: "16px", letterSpacing: "0%" }}>Due date</th>
                          <th className="whitespace-nowrap px-4 py-3 align-middle" style={{ fontFamily: "var(--font-poppins)", fontWeight: 400, fontSize: "14px", lineHeight: "16px", letterSpacing: "0%" }}>Amount due</th>
                          <th className="whitespace-nowrap px-4 py-3 align-middle" style={{ fontFamily: "var(--font-poppins)", fontWeight: 400, fontSize: "14px", lineHeight: "16px", letterSpacing: "0%" }}>Payment status</th>
                          <th className="whitespace-nowrap px-4 py-3 text-center align-middle" style={{ fontFamily: "var(--font-poppins)", fontWeight: 400, fontSize: "14px", lineHeight: "16px", letterSpacing: "0%" }}>View</th>
                          <th className="whitespace-nowrap px-4 py-3 text-right align-middle" style={{ fontFamily: "var(--font-poppins)", fontWeight: 400, fontSize: "14px", lineHeight: "16px", letterSpacing: "0%" }}>Execute</th>
                        </tr>
                      </thead>
                      <tbody className="payroll-batches-tbody">
                        {filteredBatches.map((batch) => (
                          <tr key={batch.id} className="align-middle">
                            <td className="w-10 whitespace-nowrap px-4 py-3 align-middle">
                              <input type="checkbox" aria-label={`Select ${batch.id}`} />
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 align-middle">
                              <button
                                type="button"
                                className="whitespace-nowrap text-[#0F50DB]"
                                style={{
                                  fontFamily: "var(--font-poppins)",
                                  fontWeight: 400,
                                  fontSize: "14px",
                                  lineHeight: "20px",
                                  letterSpacing: "0%",
                                }}
                              >
                                {batch.id}
                              </button>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 align-middle">
                              <span
                                className="payroll-due-table-muted whitespace-nowrap"
                                style={{
                                  fontFamily: "var(--font-poppins)",
                                  fontWeight: 400,
                                  fontSize: "14px",
                                  lineHeight: "20px",
                                  letterSpacing: "0%",
                                }}
                              >
                                {batch.invoiceType}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 align-middle">
                              <span
                                className="payroll-due-table-muted whitespace-nowrap"
                                style={{
                                  fontFamily: "var(--font-poppins)",
                                  fontWeight: 400,
                                  fontSize: "14px",
                                  lineHeight: "20px",
                                  letterSpacing: "0%",
                                }}
                              >
                                {batch.entity}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 align-middle">
                              <span
                                className="payroll-due-table-muted whitespace-nowrap"
                                style={{
                                  fontFamily: "var(--font-poppins)",
                                  fontWeight: 400,
                                  fontSize: "14px",
                                  lineHeight: "20px",
                                  letterSpacing: "0%",
                                }}
                              >
                                {batch.dueDate}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 align-middle">
                              <span
                                className="payroll-due-table-muted whitespace-nowrap"
                                style={{
                                  fontFamily: "var(--font-poppins)",
                                  fontWeight: 400,
                                  fontSize: "14px",
                                  lineHeight: "20px",
                                  letterSpacing: "0%",
                                }}
                              >
                                {batch.amount}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 align-middle">
                              <span
                                className={cn(
                                  "inline-flex items-center rounded-full px-3 py-1 align-middle",
                                  batch.status === "Executed" && "bg-[#E6FAE6] text-[#388E3C]",
                                  batch.status === "Pending" && "bg-[#FEF9C3] text-[#854D0E]",
                                  batch.status === "Hold" && "bg-[#f3e8ff] text-[#7c3aed]"
                                )}
                                style={
                                  batch.status === "Pending"
                                    ? {
                                      fontFamily: "var(--font-inter), Inter, sans-serif",
                                      fontWeight: 500,
                                      fontSize: "10.2px",
                                      lineHeight: "16px",
                                      letterSpacing: "0%",
                                    }
                                    : undefined
                                }
                              >
                                {batch.status}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-center align-middle">
                              <button
                                type="button"
                                className="payroll-view-icon-btn inline-flex h-8 w-8 items-center justify-center rounded-md"
                                aria-label="View"
                              >
                                <svg
                                  width="18"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                  <circle cx="12" cy="12" r="3" />
                                </svg>
                              </button>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-right align-middle">
                              {batch.status === "Executed" ? (
                                <button
                                  type="button"
                                  disabled
                                  className="inline-flex items-center justify-center rounded-[8px] bg-[#B8B8B8] text-white"
                                  style={{
                                    width: 96,
                                    height: 32,
                                    paddingTop: 8,
                                    paddingRight: 16,
                                    paddingBottom: 8,
                                    paddingLeft: 16,
                                    fontFamily: "var(--font-poppins)",
                                    fontWeight: 500,
                                    fontSize: "14px",
                                    lineHeight: "100%",
                                    letterSpacing: "0%",
                                  }}
                                >
                                  Executed
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="inline-flex items-center justify-center rounded-[8px] bg-[#0F50DB] text-white shadow-sm transition hover:bg-[#0D46C3]"
                                  style={{
                                    width: 72,
                                    height: 32,
                                    paddingTop: 8,
                                    paddingRight: 16,
                                    paddingBottom: 8,
                                    paddingLeft: 16,
                                    fontFamily: "var(--font-poppins)",
                                    fontWeight: 500,
                                    fontSize: "14px",
                                    lineHeight: "100%",
                                    letterSpacing: "0%",
                                  }}
                                >
                                  Pay
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <>
                  {/* Payroll Executed screen – executed payments list (Figma 251-5230) */}
                  {/* Filters row: Search (takes most width) + Department, Group, Search data dropdowns + Export as split button */}
                  <section className="payroll-executed-filters mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                    <div className="relative flex h-10 w-full items-center sm:flex-1">
                      <span className="payroll-executed-search-icon pointer-events-none absolute left-3 flex h-5 w-5 items-center justify-center text-[#9ca3af]">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8" />
                          <path d="m21 21-4.35-4.35" />
                        </svg>
                      </span>
                      <input
                        type="search"
                        placeholder="Search"
                        className="payroll-executed-search-input h-full w-full rounded-lg border border-[#e5e7eb] bg-transparent pl-10 pr-4 text-sm text-[#1f2937] placeholder-[#9ca3af] focus:border-[#0F50DB] focus:outline-none focus:ring-1 focus:ring-[#0F50DB]"
                        style={{ fontFamily: "Poppins, var(--font-poppins)", fontWeight: 400, fontSize: 14, lineHeight: 20 }}
                        onChange={(e) => { }}
                      />
                    </div>
                    <div className="overflow-x-auto">
                    <div className="inline-flex min-w-max items-center gap-2">
                    <div className="relative h-[28px] min-w-[110px] shrink-0">
                      <select
                        className="payroll-executed-filter-select h-full w-full appearance-none rounded-lg border border-[#e5e7eb] bg-transparent pl-3 pr-8 text-sm text-[#6b7280] focus:border-[#0F50DB] focus:outline-none focus:ring-1 focus:ring-[#0F50DB]"
                        style={{ fontFamily: "Poppins, var(--font-poppins)", fontWeight: 400, fontSize: 14 }}
                      >
                        <option>Department</option>
                      </select>
                      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af]">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                      </span>
                    </div>
                    <div className="relative h-[28px] min-w-[110px] shrink-0">
                      <select
                        className="payroll-executed-filter-select h-full w-full appearance-none rounded-lg border border-[#e5e7eb] bg-transparent pl-3 pr-8 text-sm text-[#6b7280] focus:border-[#0F50DB] focus:outline-none focus:ring-1 focus:ring-[#0F50DB]"
                        style={{ fontFamily: "Poppins, var(--font-poppins)", fontWeight: 400, fontSize: 14 }}
                      >
                        <option>Group</option>
                      </select>
                      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af]">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                      </span>
                    </div>
                    <div className="relative h-[28px] min-w-[110px] shrink-0">
                      <select
                        className="payroll-executed-filter-select h-full w-full appearance-none rounded-lg border border-[#e5e7eb] bg-transparent pl-3 pr-8 text-sm text-[#6b7280] focus:border-[#0F50DB] focus:outline-none focus:ring-1 focus:ring-[#0F50DB]"
                        style={{ fontFamily: "Poppins, var(--font-poppins)", fontWeight: 400, fontSize: 14 }}
                      >
                        <option>Search data</option>
                      </select>
                      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af]">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                      </span>
                    </div>
                    <div className="flex h-10 shrink-0 overflow-hidden rounded-lg shadow-sm">
                      <button
                        type="button"
                        className="inline-flex h-full items-center gap-2 rounded-l-lg bg-[#0F50DB] pl-4 pr-3 text-sm font-medium text-white transition hover:bg-[#0D46C3]"
                        style={{ fontFamily: "Poppins, var(--font-poppins)", fontWeight: 500, fontSize: 14 }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Export as
                      </button>
                      <button
                        type="button"
                        className="flex h-10 w-9 items-center justify-center rounded-r-lg border-l border-[#2563eb] bg-[#0F50DB] text-white transition hover:bg-[#0D46C3]"
                        aria-label="Export options"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </button>
                    </div>
                    </div>
                    </div>
                  </section>

                  {/* Executed payments table – consistent cell spacing */}
                  <div className="overflow-x-auto">
                    <table className="payroll-executed-payments-table w-full min-w-[960px] text-sm" style={{ tableLayout: "auto", borderCollapse: "collapse" }}>
                      <thead>
                        <tr className="payroll-executed-thead border-b border-[#e5e7eb] text-left">
                          <th className="whitespace-nowrap align-middle" style={{ ...TABLE_HEADER_STYLE, padding: "12px 16px" }}>Statement</th>
                          <th className="whitespace-nowrap align-middle" style={{ ...TABLE_HEADER_STYLE, padding: "12px 16px" }}>Payment Method</th>
                          <th className="whitespace-nowrap align-middle" style={{ ...TABLE_HEADER_STYLE, padding: "12px 16px" }}>Invoices</th>
                          <th className="whitespace-nowrap align-middle" style={{ ...TABLE_HEADER_STYLE, padding: "12px 16px" }}>Date of Payment</th>
                          <th className="whitespace-nowrap align-middle" style={{ ...TABLE_HEADER_STYLE, padding: "12px 16px" }}>Batch ID</th>
                          <th className="whitespace-nowrap align-middle" style={{ ...TABLE_HEADER_STYLE, padding: "12px 16px" }}>Payment Status</th>
                          <th className="whitespace-nowrap align-middle" style={{ ...TABLE_HEADER_STYLE, padding: "12px 16px" }}>Amount (Fiat)</th>
                          <th className="whitespace-nowrap text-right align-middle" style={{ ...TABLE_HEADER_STYLE, padding: "12px 16px" }}>Amount (Crypto)</th>
                        </tr>
                      </thead>
                      <tbody className="payroll-batches-tbody">
                        {EXECUTED_PAYMENTS.map((item) => (
                          <tr key={item.id} className="align-middle">
                            <td className="whitespace-nowrap align-middle" style={{ padding: "14px 16px" }}>
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0F50DB] text-sm font-semibold text-white">
                                  {item.name.charAt(0)}
                                </div>
                                <div className="min-w-0 space-y-0.5">
                                  <p className="payroll-executed-statement-name truncate text-sm font-semibold leading-tight" style={{ fontFamily: "var(--font-poppins)" }}>
                                    {item.name}
                                  </p>
                                  <p className="truncate text-xs leading-tight text-[#6b7280]" style={{ fontFamily: "var(--font-poppins)" }}>
                                    {item.role}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="payroll-due-table-muted whitespace-nowrap align-middle" style={{ fontFamily: "var(--font-poppins)", fontSize: "14px", padding: "14px 16px" }}>
                              {item.paymentMethod}
                            </td>
                            <td className="payroll-due-table-muted whitespace-nowrap align-middle" style={{ fontFamily: "var(--font-poppins)", fontSize: "14px", padding: "14px 16px" }}>
                              {item.invoices}
                            </td>
                            <td className="payroll-due-table-muted whitespace-nowrap align-middle" style={{ fontFamily: "var(--font-poppins)", fontSize: "14px", padding: "14px 16px" }}>
                              {item.dateOfPayment}
                            </td>
                            <td className="payroll-due-table-muted whitespace-nowrap align-middle" style={{ fontFamily: "var(--font-poppins)", fontSize: "14px", padding: "14px 16px" }}>
                              {item.batchId}
                            </td>
                            <td className="whitespace-nowrap align-middle" style={{ padding: "14px 16px" }}>
                              <span className="inline-flex items-center rounded-full bg-[#E6FAE6] px-3 py-1.5 text-xs font-medium leading-none text-[#16A34A]">
                                EXECUTED
                              </span>
                            </td>
                            <td className="payroll-due-table-muted whitespace-nowrap align-middle" style={{ fontFamily: "var(--font-poppins)", fontSize: "14px", padding: "14px 16px" }}>
                              {item.amountFiat}
                            </td>
                            <td className="payroll-due-table-muted whitespace-nowrap text-right align-middle" style={{ fontFamily: "var(--font-poppins)", fontSize: "14px", padding: "14px 16px" }}>
                              {item.amount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {topTab === "bulk" && (
          <>
            {/* Alag card – sirf "Bulk Payout" heading (Payment jaisa) */}
            <section className="payroll-payments-heading-card mb-6 rounded-xl bg-[#f7f7fa] px-4 py-5 sm:px-6 md:px-8">
              <h2 className="bulk-payout-section-heading payroll-payments-heading dash-card-section-title">Bulk Payout</h2>
            </section>

            {/* Main div – Bulk Payout k niche, andar tabs + Download CSV + upload/history content */}
            <div className="payroll-payments-main-card rounded-xl bg-[#f7f7fa] px-4 py-6 sm:px-6 md:px-8">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="bulk-payout-subtab-bar inline-flex items-center rounded-lg border border-gray-200 bg-[#f3f4f6] p-1">
                  <button
                    type="button"
                    className={cn(
                      "whitespace-nowrap rounded-full px-3 py-2 text-[11px] transition-all sm:px-5 sm:py-2.5 sm:text-[14px]",
                      bulkSubTab === "upload"
                        ? "bg-[#0F50DB] text-white shadow-sm"
                        : "bg-transparent text-[#9ca3af] hover:text-[#6b7280]"
                    )}
                    style={{
                      fontFamily: "Poppins, var(--font-poppins)",
                      fontWeight: 500,
                      fontStyle: "normal",
                      lineHeight: "100%",
                      letterSpacing: "0%",
                      verticalAlign: "middle",
                    }}
                    onClick={() => setBulkSubTab("upload")}
                  >
                    Upload CSV
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "whitespace-nowrap rounded-full px-3 py-2 text-[11px] transition-all sm:px-5 sm:py-2.5 sm:text-[14px]",
                      bulkSubTab === "history"
                        ? "bg-[#0F50DB] text-white shadow-sm"
                        : "bg-transparent text-[#9ca3af] hover:text-[#6b7280]"
                    )}
                    style={{
                      fontFamily: "Poppins, var(--font-poppins)",
                      fontWeight: 500,
                      fontStyle: "normal",
                      lineHeight: "100%",
                      letterSpacing: "0%",
                      verticalAlign: "middle",
                    }}
                    onClick={() => setBulkSubTab("history")}
                  >
                    Payment History
                  </button>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#0F50DB] px-4 py-2.5 text-white shadow-sm transition hover:bg-[#0D46C3]"
                  style={{
                    fontFamily: "Poppins, var(--font-poppins)",
                    fontWeight: 500,
                    fontStyle: "normal",
                    fontSize: "14px",
                    lineHeight: "100%",
                    letterSpacing: "0%",
                    verticalAlign: "middle",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download CSV Template
                </button>
              </div>
              {bulkSubTab === "upload" && (
                <div className="bulk-upload-form-card mx-auto mt-8 w-full max-w-[672px] rounded-2xl border border-[#E5E7EB] p-6 sm:p-8">
                  <div className="mb-5">
                    <label className="bulk-upload-label mb-2 block text-sm font-medium text-[#374151]" style={{ fontFamily: "var(--font-poppins)" }}>
                      Select currency
                    </label>
                    <select
                      className="bulk-upload-select h-10 w-full rounded-lg border border-[#e5e7eb] bg-white px-4 text-sm text-[#6b7280] focus:border-[#0F50DB] focus:outline-none focus:ring-1 focus:ring-[#0F50DB]"
                      style={{ fontFamily: "var(--font-poppins)" }}
                    >
                      <option value="">Select</option>
                      <option value="usd">USD</option>
                      <option value="usdc">USDC</option>
                    </select>
                  </div>
                  <div className="mb-6">
                    <label className="bulk-upload-label mb-2 block text-sm font-medium text-[#374151]" style={{ fontFamily: "var(--font-poppins)" }}>
                      Upload Files
                    </label>
                    <div
                      className="bulk-upload-dropzone flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#C7D2FE] bg-white px-6 py-12 text-center shadow-[inset_0_0_0_1px_rgba(199,210,254,0.15)]"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleBulkDrop}
                    >
                      <span
                        className="mb-3 flex h-16 w-16 items-center justify-center rounded-full shadow-sm ring-1 ring-[#E5E7EB]"
                        style={{ background: "radial-gradient(circle at 35% 30%, #FFFFFF 0%, #F3F4F6 55%, #EEF2F7 100%)" }}
                      >
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                          {/* cloud */}
                          <path d="M20 17.5a4.5 4.5 0 0 0-1-8.9A6 6 0 0 0 6.2 10.2 3.8 3.8 0 0 0 6 17.5h14z" />
                          {/* upload arrow */}
                          <polyline points="12 16 12 12 10.5 13.5" />
                          <polyline points="12 12 13.5 13.5" />
                          <line x1="12" y1="12" x2="12" y2="19" />
                        </svg>
                      </span>
                      <p className="bulk-upload-dropzone-title mb-1 text-sm font-semibold text-[#111827]" style={{ fontFamily: "var(--font-poppins)" }}>
                        Choose a file or drag & drop it here
                      </p>
                      <p className="mb-4 text-xs text-[#9ca3af]" style={{ fontFamily: "var(--font-poppins)" }}>
                        Please upload only one CSV file (max 5MB)
                      </p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bulk-upload-browse-btn rounded-lg border border-[#CBD5E1] bg-white px-6 py-2.5 text-center shadow-sm transition hover:bg-[#f8fafc]"
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 500,
                          fontStyle: "normal",
                          fontSize: "13.6px",
                          lineHeight: "24px",
                          letterSpacing: "0%",
                          color: "#334155",
                          verticalAlign: "middle",
                        }}
                      >
                        Browse Files
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) setSelectedFile(f);
                        }}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    className="w-full rounded-lg bg-gradient-to-r from-[#0F4FDB] to-[#0F50DB] py-3 text-white shadow-sm transition hover:opacity-95"
                    style={{
                      fontFamily: "Poppins, var(--font-poppins)",
                      fontWeight: 500,
                      fontStyle: "normal",
                      fontSize: "14px",
                      lineHeight: "100%",
                      letterSpacing: "0%",
                      verticalAlign: "middle",
                    }}
                  >
                    Start Bulk Payout
                  </button>
                </div>
              )}
              {bulkSubTab === "history" && (
                <>
                  <h3
                    className="bulk-payout-recent-activity-heading mb-4"
                    style={{ fontFamily: "Poppins, var(--font-poppins)", fontWeight: 600, fontSize: "20px", lineHeight: "100%" }}
                  >
                    Recent Activity
                  </h3>
                  <div className="bulk-payout-activity-table-wrap overflow-x-auto rounded-lg border border-[#e5e7eb]">
                    <table className="w-full min-w-[560px] border-collapse" style={{ fontFamily: "var(--font-poppins)" }}>
                      <thead>
                        <tr className="bulk-payout-activity-thead-row bg-[#f9fafb]">
                          <th className="text-left" style={{ ...TABLE_HEADER_STYLE, padding: "14px 16px" }}>File Name</th>
                          <th className="text-left" style={{ ...TABLE_HEADER_STYLE, padding: "14px 16px" }}>Status</th>
                          <th className="text-left" style={{ ...TABLE_HEADER_STYLE, padding: "14px 16px" }}>Upload Time</th>
                          <th className="w-12" style={{ ...TABLE_HEADER_STYLE, padding: "14px 16px" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {MOCK_BULK_ACTIVITY.map((row) => (
                          <React.Fragment key={row.id}>
                            <tr className="bulk-payout-activity-data-row border-t border-[#e5e7eb] bg-white hover:bg-[#f9fafb]">
                              <td className="bulk-payout-activity-cell-text py-3 pl-4 pr-4" style={{ fontSize: "14px", color: "#1f2937" }}>
                                <span className="inline-flex items-center gap-2">
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="16" y1="13" x2="8" y2="13" />
                                    <line x1="16" y1="17" x2="8" y2="17" />
                                    <polyline points="10 9 9 9 8 9" />
                                  </svg>
                                  {row.fileName}
                                </span>
                              </td>
                              <td className="py-3 pl-4 pr-4">
                                <span
                                  className="inline-flex items-center rounded-full px-2 py-1 text-[10px] font-medium leading-none"
                                  style={{
                                    backgroundColor: row.status === "Completed" ? "#E6FAE6" : row.status === "Failed" ? "#FEE2E2" : "#FEF3C7",
                                    color: row.status === "Completed" ? "#16A34A" : row.status === "Failed" ? "#DC2626" : "#D97706",
                                  }}
                                >
                                  {row.status} - {row.completedCount}/{row.totalCount}
                                </span>
                              </td>
                              <td className="bulk-payout-activity-cell-text py-3 pl-4 pr-4" style={{ fontSize: "14px", color: "#1f2937" }}>
                                {row.uploadTime}
                              </td>
                              <td className="py-3 pl-4 pr-4">
                                <button
                                  type="button"
                                  onClick={() => setExpandedBulkId(expandedBulkId === row.id ? null : row.id)}
                                  className="bulk-payout-activity-expand-btn flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#CBD5E1] bg-[#F1F5F9] text-[#1E293B] transition-colors hover:border-[#94A3B8] hover:bg-[#E2E8F0]"
                                  aria-label={expandedBulkId === row.id ? "Collapse" : "Expand"}
                                >
                                  <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.25"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className={cn("transition-transform", expandedBulkId === row.id && "rotate-180")}
                                  >
                                    <polyline points="18 15 12 9 6 15" />
                                  </svg>
                                </button>
                              </td>
                            </tr>
                            {expandedBulkId === row.id && (
                              <tr className="bulk-payout-activity-expanded bg-[#f9fafb]">
                                <td colSpan={4} className="p-0">
                                  <div className="bulk-payout-activity-nested-inner overflow-x-auto border-t border-[#e5e7eb] px-4 py-3">
                                    <table className="w-full min-w-[480px] border-collapse text-sm">
                                      <thead>
                                        <tr>
                                          <th className="bulk-payout-nested-th text-left font-normal text-[#6B7280]" style={{ padding: "8px 12px" }}>SL No</th>
                                          <th className="bulk-payout-nested-th text-left font-normal text-[#6B7280]" style={{ padding: "8px 12px" }}>Asset</th>
                                          <th className="bulk-payout-nested-th text-left font-normal text-[#6B7280]" style={{ padding: "8px 12px" }}>Address</th>
                                          <th className="bulk-payout-nested-th text-left font-normal text-[#6B7280]" style={{ padding: "8px 12px" }}>Status</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {row.payouts.map((p) => (
                                          <tr key={p.slNo} className="bulk-payout-nested-row border-t border-[#e5e7eb]/60">
                                            <td className="bulk-payout-nested-td" style={{ padding: "10px 12px", color: "#1f2937" }}>{p.slNo}</td>
                                            <td className="bulk-payout-nested-td" style={{ padding: "10px 12px", color: "#1f2937" }}>
                                              <span className="inline-flex items-center gap-2">
                                                <span className="bulk-payout-asset-badge flex h-6 w-6 items-center justify-center rounded-full bg-[#E0E7FF] text-xs font-medium text-[#3730A3]">U</span>
                                                {p.asset}
                                              </span>
                                            </td>
                                            <td
                                              className="bulk-payout-nested-td-address"
                                              style={{
                                                padding: "10px 12px",
                                                color: "#475569",
                                                fontFamily: "Poppins, var(--font-poppins)",
                                                fontWeight: 400,
                                                fontStyle: "normal",
                                                fontSize: "11.9px",
                                                lineHeight: "20px",
                                                letterSpacing: "0%",
                                                verticalAlign: "middle",
                                              }}
                                            >
                                              {p.address}
                                            </td>
                                            <td style={{ padding: "10px 12px" }}>
                                              <span className="inline-flex items-center rounded-full bg-[#E6FAE6] px-3 py-1 text-xs font-medium text-[#16A34A]">
                                                {p.status}
                                              </span>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
