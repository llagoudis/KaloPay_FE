"use client";

import { useState } from "react";
import { useMyPayslips, useMyProfile } from "@/hooks/employee/useEmployeeData";
import type { Payslip } from "@/lib/api/employee/profile";
import type { EmployeeProfile } from "@/lib/api/employee/profile";

/* ── helpers ──────────────────────────────────────────────────────── */
function fmtMoney(n: number, currency: string) {
  return n.toLocaleString("en-US", { style: "currency", currency: currency || "USD", maximumFractionDigits: 2 });
}
function dash(v: string | number | null | undefined) {
  return v === null || v === undefined || v === "" ? "—" : String(v);
}

function buildPayslipHtml(p: Payslip, profile: EmployeeProfile | undefined) {
  const companyName = profile?.companyName ?? "—";
  const net = fmtMoney(p.amount, p.currency);
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#111;max-width:900px;">
      <div style="color:#1d3fae;font-weight:bold;font-size:18px;">${companyName}</div>
      <div style="margin:16px 0;background:#e9edfb;padding:10px 16px;text-align:center;font-weight:bold;font-size:16px;">
        Payslip for Period: ${dash(p.period)}
      </div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
        <tr>
          <td style="vertical-align:top;width:50%;padding-right:12px;">
            <div style="background:#eef1fc;padding:10px;">
              <div style="font-weight:bold;color:#1d3fae;text-decoration:underline;margin-bottom:6px;">Employee Details</div>
              <div><b>Name:</b> ${dash(profile?.name)}</div>
              <div><b>Employment Date:</b> ${dash(profile?.contractStart)}</div>
              <div><b>Job Title:</b> ${dash(profile?.jobTitle)}</div>
              <div><b>Address:</b> ${dash(profile?.city)}${profile?.country ? ", " + profile.country : ""}</div>
            </div>
          </td>
          <td style="vertical-align:top;width:50%;">
            <div style="background:#eef1fc;padding:10px;">
              <div style="font-weight:bold;color:#1d3fae;text-decoration:underline;margin-bottom:6px;">Payment Details (${p.currency})</div>
              <div><b>Payroll Period:</b> ${dash(p.period)}</div>
              <div><b>Reference:</b> ${dash(p.ref)}</div>
              <div><b>Payment Method:</b> ${dash(profile?.paymentCurrencyCode)}</div>
              <div><b>Payment Date:</b> ${dash(p.paymentDate?.slice(0, 10))}</div>
            </div>
          </td>
        </tr>
      </table>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead>
          <tr style="background:#1d3fae;color:#fff;">
            <th style="padding:6px;text-align:left;">Earnings</th>
            <th style="padding:6px;text-align:left;">Deductions</th>
            <th style="padding:6px;text-align:left;">Contributions</th>
            <th style="padding:6px;text-align:left;">Transactions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding:6px;border-bottom:1px solid #e5e7eb;">Basic Salary</td>
            <td style="padding:6px;border-bottom:1px solid #e5e7eb;">—</td>
            <td style="padding:6px;border-bottom:1px solid #e5e7eb;">—</td>
            <td style="padding:6px;border-bottom:1px solid #e5e7eb;">—</td>
          </tr>
        </tbody>
      </table>
      <div style="margin-top:12px;display:flex;justify-content:flex-end;background:#eef1fc;padding:10px 16px;font-weight:bold;">
        Net Salary: ${net}
      </div>
    </div>
  `;
}

function openPayslipPreview(payslip: Payslip, profile: EmployeeProfile | undefined) {
  const win = window.open("", "_blank");
  if (!win) { alert("Pop-ups blocked. Allow pop-ups to preview/print this payslip."); return; }
  win.document.write(
    `<html><head><title>Payslip ${payslip.ref}</title></head><body>${buildPayslipHtml(payslip, profile)}<script>setTimeout(()=>window.print(),300)<\/script></body></html>`
  );
  win.document.close();
}

function downloadCsv(filename: string, payslip: Payslip) {
  const rows = [
    ["Period", "Reference", "Batch", "Amount", "Currency", "Status", "Payment Date"],
    [payslip.period ?? "", payslip.ref ?? "", payslip.batchRef ?? "", payslip.amount ?? 0, payslip.currency ?? "", payslip.status ?? "", payslip.paymentDate ?? ""],
  ];
  const escape = (v: string | number) => { const s = String(v ?? ""); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const csv = rows.map((r) => r.map(escape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
}

/* ── Tax docs (static) ─────────────────────────────────────────────── */
const TAX_DOCS = [
  { id: 1, type: "TD63", year: "2025", name: "Emoluments Certificate", ref: "TD63-2025-014", status: "Ready", issued: "2026-01-31" },
  { id: 2, type: "TD63", year: "2024", name: "Emoluments Certificate", ref: "TD63-2024-014", status: "Ready", issued: "2025-01-31" },
  { id: 3, type: "TD63", year: "2023", name: "Emoluments Certificate", ref: "TD63-2023-014", status: "Ready", issued: "2024-01-31" },
  { id: 4, type: "IR59", year: "2026", name: "Tax Deductions Declaration", ref: "IR59-2026-014", status: "Submitted", issued: "2026-01-15" },
  { id: 5, type: "IR59", year: "2025", name: "Tax Deductions Declaration", ref: "IR59-2025-014", status: "Submitted", issued: "2025-01-15" },
];

const TH = "px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200 text-left";
const TD = "px-6 py-4 text-sm border-t border-gray-100";

/* ── Page ─────────────────────────────────────────────────────────── */
export default function EmployeeReportsPage() {
  const { data: payslipData, isLoading, error } = useMyPayslips();
  const { data: profileData } = useMyProfile();
  const payslips = payslipData?.payslips ?? [];
  const profile = profileData?.profile;

  const [tab, setTab] = useState<"payslips" | "tax">("payslips");
  const [taxFilter, setTaxFilter] = useState<"all" | "TD63" | "IR59">("all");
  const taxRows = TAX_DOCS.filter((d) => taxFilter === "all" || d.type === taxFilter);

  const ytd = payslips.filter((p) => p.status === "completed").reduce((s, p) => s + p.amount, 0);
  const lastPayslip = payslips.find((p) => p.status === "completed");
  const nextPay = payslips.find((p) => p.status !== "completed");

  return (
    <div className="flex flex-col gap-6">
      {/* Heading */}
      <div className="rounded-xl border border-gray-200 bg-white px-7 py-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
        <p className="mt-1.5 text-sm text-gray-500">
          Your pay statements and tax documents.{profile?.name ? <> Showing for <span className="font-semibold text-gray-700">{profile.name}</span>.</> : null}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm w-fit">
        {([["payslips", "My Payslips", payslips.length], ["tax", "Tax Documents", TAX_DOCS.length]] as const).map(([v, label, count]) => (
          <button key={v} onClick={() => setTab(v)}
            className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold transition ${tab === v ? "bg-[#0F50DB] text-white" : "text-gray-600 hover:bg-gray-100"}`}>
            {label}
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${tab === v ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>{count}</span>
          </button>
        ))}
      </div>

      {/* Payslips tab */}
      {tab === "payslips" && (
        <div className="flex flex-col gap-6">
          {/* Stat cards */}
          <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-3">
            <StatCard label="Paid year-to-date" value={payslips.length ? fmtMoney(ytd, payslips[0]?.currency ?? "USD") : "—"} icon="wallet" />
            <StatCard label="Last payslip" value={lastPayslip ? fmtMoney(lastPayslip.amount, lastPayslip.currency) : "—"} icon="doc" />
            <StatCard label="Next pay date" value={nextPay?.paymentDate?.slice(0, 10) ?? "—"} icon="calendar" />
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-[18px]">
              <h2 className="text-[17px] font-semibold text-gray-900">Pay history</h2>
              <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3.5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Export all
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse">
                <thead><tr>
                  <th className={TH}>Period</th><th className={TH}>Reference</th><th className={TH}>Amount</th>
                  <th className={TH}>Status</th><th className={TH}>Payment date</th>
                  <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200 text-right">Download</th>
                </tr></thead>
                <tbody>
                  {error ? (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-red-600">Failed to load payslips: {(error as Error).message}</td></tr>
                  ) : isLoading ? (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">Loading payslips…</td></tr>
                  ) : payslips.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">No payslips yet — your employer hasn&apos;t run payroll for you yet.</td></tr>
                  ) : payslips.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className={`${TD} font-semibold text-gray-900`}>{p.period ?? "—"}</td>
                      <td className={`${TD} font-['Inter'] text-xs text-gray-500`}>{p.ref}</td>
                      <td className={`${TD} font-['Inter'] font-semibold text-gray-900`}>{fmtMoney(p.amount, p.currency)}</td>
                      <td className={TD}>
                        <span className={p.status === "completed" ? "rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700"
                          : p.status === "failed" ? "rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700"
                          : "rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700"}>
                          {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                        </span>
                      </td>
                      <td className={`${TD} text-gray-500`}>{p.paymentDate?.slice(0, 10) ?? "—"}</td>
                      <td className={`${TD} text-right`}>
                        <button onClick={() => openPayslipPreview(p, profile)}
                          className="mr-2 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">View</button>
                        <button onClick={() => downloadCsv(`payslip-${p.ref}.csv`, p)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F50DB] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0D46C3]">
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                          PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tax Documents tab */}
      {tab === "tax" && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 px-6 py-[18px]">
            <div>
              <h2 className="text-[17px] font-semibold text-gray-900">Tax documents</h2>
              <p className="mt-0.5 text-xs text-gray-500">Year-end IR59 declarations and TD63 emoluments certificates.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1 gap-1">
                {(["all", "TD63", "IR59"] as const).map((f) => (
                  <button key={f} onClick={() => setTaxFilter(f)}
                    className={`rounded-md px-3.5 py-1.5 text-[13px] font-semibold transition ${taxFilter === f ? "bg-[#0F50DB] text-white" : "text-gray-500 hover:bg-white"}`}>
                    {f === "all" ? "All" : f}
                  </button>
                ))}
              </div>
              <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3.5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Export all
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse">
              <thead><tr>
                <th className={TH}>Type</th><th className={TH}>Document</th><th className={TH}>Tax year</th>
                <th className={TH}>Reference</th><th className={TH}>Status</th><th className={TH}>Issued</th>
                <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200 text-right">Action</th>
              </tr></thead>
              <tbody>
                {taxRows.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className={TD}>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${d.type === "IR59" ? "bg-[#EEF2FF] text-[#0F50DB]" : "bg-blue-50 text-blue-600"}`}>{d.type}</span>
                    </td>
                    <td className={`${TD} text-gray-900`}>
                      <span className="inline-flex items-center gap-2.5">
                        <svg className="text-gray-400" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        {d.name}
                      </span>
                    </td>
                    <td className={`${TD} font-semibold text-gray-900`}>{d.year}</td>
                    <td className={`${TD} font-['Inter'] text-xs text-gray-500`}>{d.ref}</td>
                    <td className={TD}>
                      <span className={d.status === "Ready" ? "rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700" : "rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700"}>{d.status}</span>
                    </td>
                    <td className={`${TD} text-gray-500`}>{d.issued}</td>
                    <td className={`${TD} text-right`}>
                      <button className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F50DB] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0D46C3]">
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{label}</span>
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF2FF] text-[#0F50DB]">
          {icon === "wallet" && <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a1 1 0 1 0 2 0 1 1 0 0 0-2 0z"/></svg>}
          {icon === "doc" && <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
          {icon === "calendar" && <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
        </span>
      </div>
      <p className="mt-3 font-['Inter'] text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
