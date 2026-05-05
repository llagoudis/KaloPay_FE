"use client";

import React, { Suspense, useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { DASHBOARD_ROUTES } from "@/components/user/dashboard/routes";

type BulkSubTab = "upload" | "history";

type BulkPayoutRow = {
  id: string;
  fileName: string;
  status: "Completed" | "Processing" | "Failed";
  completedCount: number;
  totalCount: number;
  uploadTime: string;
  payouts: {
    slNo: number;
    asset: string;
    address: string;
    status: "COMPLETED" | "PENDING" | "FAILED";
  }[];
};

const TABLE_HEADER_STYLE: React.CSSProperties = {
  fontFamily: "Poppins, var(--font-poppins)",
  fontWeight: 400,
  fontSize: "14px",
  lineHeight: "16px",
  color: "#6B7280",
};

const MOCK_ACTIVITY: BulkPayoutRow[] = [
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

function SecondaryNav() {
  return (
    <section className="mt-4 mb-6 overflow-x-auto">
      <div className="inline-flex min-w-max gap-2 text-xs font-medium text-[#878787] md:text-sm">
        <Link
          href={DASHBOARD_ROUTES.payroll}
          className="inline-flex items-center gap-2 rounded-full border-0 px-6 py-2 text-xs font-semibold outline-none focus:outline-none focus:ring-0 md:text-sm bg-transparent text-[#878787] shadow-none hover:bg-slate-100"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-transparent text-[#878787]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M7 9h4" />
              <path d="M7 13h2" />
            </svg>
          </span>
          Payments
        </Link>
        <span className="inline-flex items-center gap-2 rounded-full border-0 px-6 py-2 text-xs font-medium md:text-sm bg-[#0F50DB] text-white shadow-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 7h14l-4-4" />
            <path d="M17 17H3l4 4" />
            <path d="M7 17l10-10" />
          </svg>
          Bulk Payouts
        </span>
        <Link
          href={DASHBOARD_ROUTES.transfers}
          className="inline-flex items-center gap-2 rounded-full border-0 px-6 py-2 text-xs font-medium outline-none focus:outline-none focus:ring-0 md:text-sm bg-transparent text-[#878787] shadow-none hover:bg-slate-100"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M3 10h18" />
            <path d="M8 14h3v3H8z" />
          </svg>
          Transfers
        </Link>
        <Link
          href={DASHBOARD_ROUTES.payrollReports}
          className="inline-flex items-center gap-2 rounded-full border-0 px-6 py-2 text-xs font-medium outline-none focus:outline-none focus:ring-0 md:text-sm bg-transparent text-[#878787] shadow-none hover:bg-slate-100"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="3" width="16" height="18" rx="2" />
            <path d="M8 7h8" />
            <path d="M8 11h8" />
            <path d="M8 15h5" />
          </svg>
          Payroll Reports
        </Link>
      </div>
    </section>
  );
}

function BulkPayoutsContent() {
  const searchParams = useSearchParams();
  const [bulkSubTab, setBulkSubTab] = useState<BulkSubTab>("history");
  const [expandedId, setExpandedId] = useState<string | null>(MOCK_ACTIVITY[0]?.id ?? null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync tab with URL so Upload CSV / Payment History screen matches link
  useEffect(() => {
    const t = searchParams.get("tab");
    if (t === "upload") setBulkSubTab("upload");
    else if (t === "history" || t === null) setBulkSubTab("history");
  }, [searchParams]);

  const switchTab = (tab: BulkSubTab) => {
    setBulkSubTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.replaceState({}, "", url.pathname + url.search);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file?.name.endsWith(".csv")) setSelectedFile(file);
  };

  return (
    <div className="min-h-screen w-full bg-dash-page" data-dashboard-theme data-page="bulk-payouts">
      <main className="dash-shell pb-10 pt-6">
        <SecondaryNav />

        {/* Bulk Payout heading */}
        <section className="bulk-payout-outer-card mb-6 rounded-xl px-3 py-5 sm:px-6 md:px-8">
          <h2 className="bulk-payout-section-heading dash-card-section-title">Bulk Payout</h2>
        </section>

        {/* Tabs + Download CSV + content */}
        <div className="bulk-payout-outer-card rounded-xl px-3 py-6 sm:px-6 md:px-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="bulk-payout-tab-bar inline-flex items-center rounded-full border border-gray-200 p-1 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <button
                type="button"
                className={cn(
                  "rounded-full px-5 py-2.5 transition-all",
                  bulkSubTab === "upload" ? "bg-[#0F50DB] text-white shadow-sm" : "bg-transparent text-[#9ca3af] hover:text-[#6b7280]"
                )}
                style={{ fontFamily: "Poppins, var(--font-poppins)", fontWeight: 500, fontSize: "14px", lineHeight: "100%" }}
                onClick={() => switchTab("upload")}
              >
                Upload CSV
              </button>
              <button
                type="button"
                className={cn(
                  "rounded-full px-5 py-2.5 transition-all",
                  bulkSubTab === "history" ? "bg-[#0F50DB] text-white shadow-sm" : "bg-transparent text-[#9ca3af] hover:text-[#6b7280]"
                )}
                style={{ fontFamily: "Poppins, var(--font-poppins)", fontWeight: 500, fontSize: "14px", lineHeight: "100%" }}
                onClick={() => switchTab("history")}
              >
                Payment History
              </button>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-[#0F50DB] px-4 py-2.5 text-white shadow-sm transition hover:bg-[#0D46C3]"
              style={{ fontFamily: "Poppins, var(--font-poppins)", fontWeight: 500, fontSize: "14px", lineHeight: "100%" }}
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
            <div className="bulk-payout-upload-container mx-auto mt-8 w-full max-w-[640px] rounded-2xl border p-6 sm:p-8">
              <div className="mb-5">
                <label className="bulk-payout-label mb-2 block text-sm font-medium" style={{ fontFamily: "var(--font-poppins)" }}>
                  Select currency
                </label>
                <select
                  className="bulk-payout-select h-10 w-full max-w-xs rounded-lg border px-3 text-sm focus:border-[#0F50DB] focus:outline-none focus:ring-1 focus:ring-[#0F50DB]"
                  style={{ fontFamily: "var(--font-poppins)" }}
                >
                  <option value="">Select</option>
                  <option value="usd">USD</option>
                  <option value="usdc">USDC</option>
                </select>
              </div>
              <div className="mb-6">
                <label className="bulk-payout-label mb-2 block text-sm font-medium" style={{ fontFamily: "var(--font-poppins)" }}>
                  Upload Files
                </label>
                <div
                  className="bulk-payout-dropzone flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-12 px-6"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                >
                  <span className="bulk-payout-dropzone-icon mb-3 flex h-14 w-14 items-center justify-center rounded-full">
                    <svg className="bulk-payout-dropzone-icon-svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </span>
                  <p className="bulk-payout-dropzone-text mb-1 text-sm font-medium" style={{ fontFamily: "var(--font-poppins)" }}>
                    Choose a file or drag & drop it here
                  </p>
                  <p className="mb-4 text-xs text-[#9ca3af]" style={{ fontFamily: "var(--font-poppins)" }}>
                    Please upload only one CSV file (max 5MB)
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bulk-payout-browse-btn rounded-lg border px-4 py-2 text-center transition"
                    style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "13.6px", lineHeight: "24px" }}
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
                className="w-full rounded-lg bg-[#0F50DB] py-3 text-white shadow-sm transition hover:bg-[#0D46C3]"
                style={{ fontFamily: "Poppins, var(--font-poppins)", fontWeight: 500, fontSize: "14px", lineHeight: "100%" }}
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
                    {MOCK_ACTIVITY.map((row) => (
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
                              className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium leading-none"
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
                              onClick={() => setExpandedId(expandedId === row.id ? null : row.id)}
                              className="bulk-payout-activity-expand-btn flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#CBD5E1] bg-[#F1F5F9] text-[#1E293B] transition-colors hover:border-[#94A3B8] hover:bg-[#E2E8F0]"
                              aria-label={expandedId === row.id ? "Collapse" : "Expand"}
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
                                className={cn("transition-transform", expandedId === row.id && "rotate-180")}
                              >
                                <polyline points="18 15 12 9 6 15" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                        {expandedId === row.id && (
                          <tr key={`${row.id}-expanded`} className="bulk-payout-activity-expanded bg-[#f9fafb]">
                            <td colSpan={4} className="p-0">
                              <div className="bulk-payout-activity-nested-inner overflow-x-auto border-t border-[#e5e7eb] px-4 py-3">
                                <table className="w-full min-w-[500px] border-collapse text-sm">
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
                                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E0E7FF] text-xs font-medium text-[#3730A3]">U</span>
                                            {p.asset}
                                          </span>
                                        </td>
                                        <td
                                          className="bulk-payout-nested-td bulk-payout-nested-td-address"
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
      </main>
    </div>
  );
}

export default function EmployerBulkPayoutsPage() {
  return (
    <Suspense>
      <BulkPayoutsContent />
    </Suspense>
  );
}
