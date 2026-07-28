"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { useEmployerAuthStore } from "@/store/employerAuthStore";
import { getAccounting, putAccounting } from "@/lib/api/employer/appFeatures";

// ─── Static config (mirrored from design) ─────────────────────────────────────

type Provider = { id: string; desc: string; color: string };
const ACCT_PROVIDERS: Provider[] = [
  { id: "Xero", desc: "Cloud accounting — auto-post payroll journals.", color: "#13B5EA" },
  { id: "QuickBooks", desc: "Sync wages, taxes and contributions as bills.", color: "#2CA01C" },
  { id: "Sage", desc: "Export nominal ledger entries each run.", color: "#00DC06" },
  { id: "SAP", desc: "Post payroll journal entries to SAP FI.", color: "#008FD3" },
  { id: "eSoft", desc: "Export payroll journal entries to eSoft.", color: "#00A4B4" },
  { id: "Eurosoft", desc: "Export payroll journal entries to Eurosoft.", color: "#6B7280" },
  { id: "Exact", desc: "Export payroll journal entries to Exact.", color: "#E2001A" },
  { id: "Intelisoft", desc: "Export payroll journal entries to Intelisoft.", color: "#C8102E" },
  { id: "Simplisis", desc: "Export payroll journal entries to Simplisis.", color: "#8A93A2" },
  { id: "CSV / Manual", desc: "Download a journal CSV for any other system.", color: "#64748B" },
];

type Month = { id: string; label: string; open: boolean };
const ACCT_MONTHS_2026: Month[] = [
  { id: "2026-06", label: "June 2026", open: true },
  { id: "2026-05", label: "May 2026", open: false },
  { id: "2026-04", label: "April 2026", open: false },
  { id: "2026-03", label: "March 2026", open: false },
  { id: "2026-02", label: "February 2026", open: false },
  { id: "2026-01", label: "January 2026", open: false },
];

type MonthStatus = "open" | "executed" | "ledgered";
type JournalLine = { account: string; desc: string; debit: number; credit: number };
type Journal = { lines: JournalLine[]; totalDebit: number; totalCredit: number };

function acctMoney(n: number): string {
  return "€" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function acctJournal(monthId: string): Journal {
  const seed = Number(monthId.replace("-", "")) % 6;
  const gross = 84200 + seed * 1850;
  const incomeTax = Math.round(gross * 0.18 * 100) / 100;
  const social = Math.round(gross * 0.083 * 100) / 100;
  const ghs = Math.round(gross * 0.0265 * 100) / 100;
  const erSocial = Math.round(gross * 0.083 * 100) / 100;
  const erOther = Math.round(gross * 0.02 * 100) / 100;
  const net = Math.round((gross - incomeTax - social - ghs) * 100) / 100;
  const lines: JournalLine[] = [
    { account: "6000 · Salaries & Wages", desc: "Gross payroll", debit: gross, credit: 0 },
    { account: "6100 · Employer Contributions", desc: "Employer social + other funds", debit: erSocial + erOther, credit: 0 },
    { account: "2200 · Income Tax (PAYE) Payable", desc: "Employee income tax withheld", debit: 0, credit: incomeTax },
    { account: "2210 · Social Insurance Payable", desc: "Employee + employer social", debit: 0, credit: social + erSocial },
    { account: "2220 · GHS Payable", desc: "General Healthcare System", debit: 0, credit: ghs },
    { account: "2230 · Other Funds Payable", desc: "Cohesion, redundancy, training", debit: 0, credit: erOther },
    { account: "2100 · Net Wages Payable / Bank", desc: "Net pay to employees", debit: 0, credit: net },
  ];
  return {
    lines,
    totalDebit: lines.reduce((s, l) => s + l.debit, 0),
    totalCredit: lines.reduce((s, l) => s + l.credit, 0),
  };
}

function acctDownload(filename: string, mime: string, content: string) {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function acctExport(fmt: "csv" | "xml" | "pdf", month: Month, firm: string) {
  const j = acctJournal(month.id);
  if (fmt === "csv") {
    let csv = "Account,Description,Debit,Credit\n";
    j.lines.forEach((l) => { csv += `"${l.account}","${l.desc}",${l.debit.toFixed(2)},${l.credit.toFixed(2)}\n`; });
    csv += `Total,,${j.totalDebit.toFixed(2)},${j.totalCredit.toFixed(2)}\n`;
    acctDownload(`payroll-journal-${month.id}.csv`, "text/csv", csv);
  } else if (fmt === "xml") {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<PayrollJournal period="${month.label}" target="${firm}">\n`;
    j.lines.forEach((l) => { xml += `  <Entry account="${l.account.split(" · ")[0]}" description="${l.desc}" debit="${l.debit.toFixed(2)}" credit="${l.credit.toFixed(2)}"/>\n`; });
    xml += `  <Totals debit="${j.totalDebit.toFixed(2)}" credit="${j.totalCredit.toFixed(2)}"/>\n</PayrollJournal>\n`;
    acctDownload(`payroll-journal-${month.id}.xml`, "application/xml", xml);
  } else {
    if (typeof window === "undefined") return;
    const win = window.open("", "_blank");
    if (!win) return;
    const rows = j.lines.map((l) =>
      `<tr><td>${l.account}</td><td>${l.desc}</td><td style='text-align:right'>${l.debit ? acctMoney(l.debit) : ""}</td><td style='text-align:right'>${l.credit ? acctMoney(l.credit) : ""}</td></tr>`
    ).join("");
    win.document.write(`<html><head><title>Payroll Journal ${month.label}</title><style>body{font-family:Arial,Helvetica,sans-serif;color:#111;padding:48px;max-width:780px;margin:0 auto}h1{font-size:22px;margin:0}table{width:100%;border-collapse:collapse;margin-top:18px}th,td{padding:9px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;text-align:left}th{background:#f8fafc;text-transform:uppercase;font-size:11px;letter-spacing:.04em;color:#475569}tfoot td{font-weight:700;border-top:2px solid #111}.muted{color:#64748b;margin-top:6px}</style></head><body>`);
    win.document.write(`<h1>Payroll Journal Entry</h1><div class='muted'>Period: ${month.label} &middot; Target ledger: ${firm}</div>`);
    win.document.write(`<table><thead><tr><th>Account</th><th>Description</th><th style='text-align:right'>Debit</th><th style='text-align:right'>Credit</th></tr></thead><tbody>${rows}</tbody><tfoot><tr><td colspan='2'>Total</td><td style='text-align:right'>${acctMoney(j.totalDebit)}</td><td style='text-align:right'>${acctMoney(j.totalCredit)}</td></tr></tfoot></table>`);
    win.document.write("</body></html>");
    win.document.close(); win.focus();
    setTimeout(() => win.print(), 300);
  }
}

// ─── Small pieces ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: MonthStatus }) {
  if (status === "open") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-[11.5px] font-bold text-amber-800">
        <span className="h-1.5 w-1.5 rounded-full bg-current" />OPEN
      </span>
    );
  }
  if (status === "executed") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[11.5px] font-bold text-emerald-700">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>Ledgered
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[11.5px] font-bold text-emerald-700">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>Ledgered
    </span>
  );
}

function Toast({ toast }: { toast: string }) {
  return (
    <div className="fixed bottom-7 left-1/2 z-[1200] inline-flex -translate-x-1/2 items-center gap-2.5 rounded-lg bg-[#0E1620] px-4.5 py-3 text-[13.5px] font-medium text-white shadow-xl">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
      {toast}
    </div>
  );
}

function ConfirmModal({
  kind, firm, month, onCancel, onYes,
}: { kind: "execute" | "reverse"; firm: string; month: string; onCancel: () => void; onYes: () => void }) {
  const isExec = kind === "execute";
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-6" onClick={onCancel}>
      <div className="w-[440px] max-w-full rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className={cn(
          "mb-3.5 inline-flex h-[46px] w-[46px] items-center justify-center rounded-xl",
          isExec ? "bg-blue-50 text-[#0F50DB]" : "bg-red-100 text-red-700"
        )}>
          {isExec ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4 20-7z" /></svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>
          )}
        </div>
        <h3 className="text-lg font-bold text-[#0E1620]">{isExec ? "Post journal entries?" : "Reverse journal entries?"}</h3>
        <p className="mt-2 text-[13.5px] leading-relaxed text-gray-500">
          {isExec
            ? `Are you sure? This will send the ${month} payroll journal entries via API to ${firm} and mark the period as ledgered.`
            : `Are you sure? This will reverse the ${month} journal entries posted to ${firm}. The period will return to open.`}
        </p>
        <div className="mt-5 flex justify-end gap-2.5">
          <button type="button" onClick={onCancel} className="h-[42px] rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
          <button
            type="button" onClick={onYes}
            className={cn("h-[42px] rounded-lg px-5 text-sm font-semibold text-white", isExec ? "bg-[#0F50DB] hover:bg-blue-700" : "bg-red-700 hover:bg-red-800")}
          >Yes, {isExec ? "execute" : "reverse"}</button>
        </div>
      </div>
    </div>
  );
}

const ghostBtn = "inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 text-[13.5px] font-medium text-gray-700 hover:bg-gray-50";

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function LinkWithAccounting() {
  const token = useEmployerAuthStore((s) => s.token);
  const [connected, setConnected] = useState<string>(() =>
    typeof window !== "undefined" ? localStorage.getItem("kp-acct-firm") || "" : ""
  );
  const [openYear, setOpenYear] = useState<number | null>(2026);
  const [selMonth, setSelMonth] = useState<Month | null>(null);
  const [juneStatus, setJuneStatus] = useState<MonthStatus>(() =>
    typeof window !== "undefined" ? ((localStorage.getItem("kp-acct-2026-06") as MonthStatus) || "open") : "open"
  );
  const [acctHydrated, setAcctHydrated] = useState(false);

  // Reconcile with the server after first paint (local cache paints instantly).
  useEffect(() => {
    if (!token) { setAcctHydrated(true); return; }
    let alive = true;
    getAccounting(token)
      .then((res) => {
        const d = res?.data as { firm?: string; june?: MonthStatus } | null;
        if (!alive) return;
        if (d?.firm !== undefined) setConnected(d.firm || "");
        if (d?.june) setJuneStatus(d.june);
      })
      .catch(() => {})
      .finally(() => { if (alive) setAcctHydrated(true); });
    return () => { alive = false; };
  }, [token]);

  // Persist firm + month status to both local cache and the server.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (connected) localStorage.setItem("kp-acct-firm", connected);
    else localStorage.removeItem("kp-acct-firm");
    localStorage.setItem("kp-acct-2026-06", juneStatus);
    if (token && acctHydrated) putAccounting(token, { firm: connected, june: juneStatus }).catch(() => {});
  }, [connected, juneStatus, token, acctHydrated]);

  const [confirm, setConfirm] = useState<"execute" | "reverse" | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast((t) => (t === msg ? null : t)), 2800); };

  const statusOf = (m: Month): MonthStatus => (m.open ? juneStatus : "ledgered");
  const provider = useMemo(() => ACCT_PROVIDERS.find((p) => p.id === connected), [connected]);

  // 1 — Firm picker
  if (!connected) {
    return (
      <div className="flex flex-col gap-5">
        <div className="rounded-xl bg-[var(--dash-card,#fff)] px-7 py-6 shadow-sm ring-1 ring-gray-100">
          <h2 className="text-xl font-semibold text-[#0E1620]">Link with Accounting</h2>
          <p className="mt-1.5 text-[13.5px] text-gray-500">Select a firm to connect. Once linked, you can post payroll journal entries to your accounting software.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ACCT_PROVIDERS.map((p) => (
            <div key={p.id} className="flex flex-col gap-3 rounded-xl bg-[var(--dash-card,#fff)] p-5.5 shadow-sm ring-1 ring-gray-100">
              <div className="flex items-center gap-3">
                <span style={{ background: p.color }} className="flex h-10 w-10 items-center justify-center rounded-lg text-[15px] font-extrabold text-white">{p.id.charAt(0)}</span>
                <div className="text-[15px] font-bold text-[#0E1620]">{p.id}</div>
              </div>
              <p className="flex-1 text-[13px] leading-relaxed text-gray-500">{p.desc}</p>
              <button
                type="button" onClick={() => { setConnected(p.id); flash(`Connected to ${p.id}`); }}
                className="h-10 rounded-lg bg-[#0F50DB] text-[13.5px] font-semibold text-white hover:bg-blue-700"
              >Connect</button>
            </div>
          ))}
        </div>
        {toast && <Toast toast={toast} />}
      </div>
    );
  }

  // 3 — Month journal
  if (selMonth) {
    const j = acctJournal(selMonth.id);
    const st = statusOf(selMonth);
    return (
      <div className="flex flex-col gap-5">
        <div className="overflow-hidden rounded-xl bg-[var(--dash-card,#fff)] shadow-sm ring-1 ring-gray-100">
          <div className="flex flex-wrap items-center gap-3.5 border-b border-gray-100 px-6 py-5">
            <button
              type="button" onClick={() => setSelMonth(null)} aria-label="Back to periods"
              className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></svg>
            </button>
            <div className="min-w-[200px] flex-1">
              <h2 className="text-[19px] font-bold text-[#0E1620]">{selMonth.label} · Payroll Journal Entries</h2>
              <p className="mt-0.5 text-[13px] text-gray-500">Target ledger: {connected}</p>
            </div>
            <StatusBadge status={st} />
          </div>

          {st === "executed" && (
            <div className="mx-6 mt-4 flex items-center gap-3 rounded-xl border border-emerald-600 bg-emerald-50 px-4 py-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="8 12 11 15 16 9" /></svg>
              <div className="text-[13.5px] text-emerald-700"><strong>Entries ledgered.</strong> Journal entries were posted to {connected}. This period is still open — you can reverse them if needed.</div>
            </div>
          )}
          {st === "ledgered" && (
            <div className="mx-6 mt-4 flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="8 12 11 15 16 9" /></svg>
              <div className="text-[13.5px] text-gray-500"><strong className="text-[#0E1620]">Ledgered &amp; closed.</strong> Posted to {connected}. Historic adjustments are made in your accounting software, not in payroll.</div>
            </div>
          )}

          <div className="overflow-x-auto px-6 pb-1 pt-4">
            <table className="w-full min-w-[620px] border-collapse">
              <thead>
                <tr>
                  {["Account", "Description", "Debit", "Credit"].map((h, i) => (
                    <th key={h} className={cn(
                      "whitespace-nowrap border-b border-gray-100 px-3.5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400",
                      i >= 2 ? "text-right" : "text-left"
                    )}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {j.lines.map((l, i) => (
                  <tr key={i}>
                    <td className="whitespace-nowrap border-b border-gray-100 px-3.5 py-3 text-[13px] font-semibold text-[#0E1620]">{l.account}</td>
                    <td className="border-b border-gray-100 px-3.5 py-3 text-[13px] text-gray-700">{l.desc}</td>
                    <td className="border-b border-gray-100 px-3.5 py-3 text-right font-mono text-[13px] text-gray-700">{l.debit ? acctMoney(l.debit) : "—"}</td>
                    <td className="border-b border-gray-100 px-3.5 py-3 text-right font-mono text-[13px] text-gray-700">{l.credit ? acctMoney(l.credit) : "—"}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="border-t-2 border-gray-300 px-3.5 py-3 font-bold text-[#0E1620]" colSpan={2}>Total</td>
                  <td className="border-t-2 border-gray-300 px-3.5 py-3 text-right font-mono font-bold text-[#0E1620]">{acctMoney(j.totalDebit)}</td>
                  <td className="border-t-2 border-gray-300 px-3.5 py-3 text-right font-mono font-bold text-[#0E1620]">{acctMoney(j.totalCredit)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-6 py-4">
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => acctExport("pdf", selMonth, connected)} className={ghostBtn}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
                Print / PDF
              </button>
              <button type="button" onClick={() => acctExport("xml", selMonth, connected)} className={ghostBtn}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                XML
              </button>
              <button type="button" onClick={() => acctExport("csv", selMonth, connected)} className={ghostBtn}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                CSV
              </button>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {st === "open" && (
                <button type="button" onClick={() => setConfirm("execute")} className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#0F50DB] px-5 text-sm font-semibold text-white hover:bg-blue-700">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4 20-7z" /></svg>
                  Execute — post to {connected}
                </button>
              )}
              {st === "executed" && (
                <button type="button" onClick={() => setConfirm("reverse")} className="inline-flex h-11 items-center gap-2 rounded-lg border border-red-700 bg-white px-4 text-sm font-semibold text-red-700 hover:bg-red-50">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>
                  Reverse entries
                </button>
              )}
            </div>
          </div>
        </div>

        {confirm && (
          <ConfirmModal
            kind={confirm} firm={connected} month={selMonth.label}
            onCancel={() => setConfirm(null)}
            onYes={() => {
              if (confirm === "execute") { setJuneStatus("executed"); flash(`Journal entries posted to ${connected}`); }
              else { setJuneStatus("open"); flash("Entries reversed"); }
              setConfirm(null);
            }}
          />
        )}
        {toast && <Toast toast={toast} />}
      </div>
    );
  }

  // 2 — Year / month explorer
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3.5 rounded-xl bg-[var(--dash-card,#fff)] px-6 py-5 shadow-sm ring-1 ring-gray-100">
        <div className="flex items-center gap-3.5">
          <span style={{ background: provider?.color || "#64748B" }} className="flex h-[42px] w-[42px] items-center justify-center rounded-xl text-base font-extrabold text-white">{connected.charAt(0)}</span>
          <div>
            <div className="text-base font-bold text-[#0E1620]">{connected}</div>
            <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />Connected
            </span>
          </div>
        </div>
        <button type="button" onClick={() => { setConnected(""); setSelMonth(null); }} className={ghostBtn}>Change firm</button>
      </div>

      <div className="overflow-hidden rounded-xl bg-[var(--dash-card,#fff)] shadow-sm ring-1 ring-gray-100">
        <div className="border-b border-gray-100 px-6 py-4.5">
          <h3 className="text-base font-bold text-[#0E1620]">Payroll periods</h3>
          <p className="mt-1 text-[13px] text-gray-500">Open a month to view its journal entries. Ledgered months were executed and interfaced with {connected}.</p>
        </div>

        {/* 2026 */}
        <button
          type="button" onClick={() => setOpenYear((y) => (y === 2026 ? null : 2026))}
          className="flex w-full items-center gap-3 border-b border-gray-100 bg-white px-6 py-3.5 text-left"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("transition-transform", openYear === 2026 && "rotate-90")}><path d="m9 18 6-6-6-6" /></svg>
          <span className="text-[15px] font-bold text-[#0E1620]">2026</span>
          <span className="text-xs text-gray-400">Current year</span>
        </button>
        {openYear === 2026 && (
          <div>
            {ACCT_MONTHS_2026.map((m) => {
              const st = statusOf(m);
              return (
                <button
                  key={m.id} type="button" onClick={() => setSelMonth(m)}
                  className="flex w-full items-center gap-3 border-b border-gray-100 bg-gray-50 py-3 pl-10 pr-6 text-left hover:bg-gray-100"
                >
                  <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg bg-white text-gray-500">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="3" y1="10" x2="21" y2="10" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="16" y1="2" x2="16" y2="6" /></svg>
                  </span>
                  <span className="flex-1 text-left text-sm font-semibold text-[#0E1620]">{m.label}</span>
                  <StatusBadge status={st} />
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                </button>
              );
            })}
          </div>
        )}

        {/* Locked years */}
        {[2025, 2024].map((y) => (
          <div key={y} className="flex w-full cursor-not-allowed items-center gap-3 border-b border-gray-100 bg-white px-6 py-3.5 text-left">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            <span className="text-[15px] font-bold text-gray-500">{y}</span>
            <span className="text-xs text-gray-400">Locked year</span>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-2.5 px-1 text-[12.5px] leading-relaxed text-gray-400">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
        <span>Accounting entries are finalised in your accounting software. Payroll is not used for accounting adjustments to historic (closed) payrolls.</span>
      </div>

      {toast && <Toast toast={toast} />}
    </div>
  );
}
