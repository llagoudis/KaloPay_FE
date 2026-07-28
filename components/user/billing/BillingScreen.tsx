"use client";

import { useEffect, useRef, useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/utils/cn";
import { useEmployerAuthStore } from "@/store/employerAuthStore";
import { getBilling, putBilling } from "@/lib/api/employer/appFeatures";

/* ── Types & static data ──────────────────────────────────────────────────── */

interface Invoice {
  id: string;
  date: string;
  desc: string;
  amount: string;
  status: string;
}

const INVOICES: Invoice[] = [
  { id: "INV-2026-06", date: "Jun 01, 2026", desc: "Payroll platform · June 2026", amount: "€334.00", status: "Paid" },
  { id: "INV-2026-05", date: "May 01, 2026", desc: "Payroll platform · May 2026", amount: "€330.00", status: "Paid" },
  { id: "INV-2026-04", date: "Apr 01, 2026", desc: "Payroll platform · April 2026", amount: "€326.00", status: "Paid" },
  { id: "INV-2026-03", date: "Mar 01, 2026", desc: "Payroll platform · March 2026", amount: "€322.00", status: "Paid" },
];

const AMOUNT_DUE = "€334.00";
const DEFAULT_METHOD = "Bank of Cyprus · IBAN ****9001";
const STORAGE_KEY = "kp-billing";

interface BillingState {
  paid: boolean;
  method: string;
}

function loadState(): BillingState {
  if (typeof window === "undefined") return { paid: false, method: DEFAULT_METHOD };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { paid: false, method: DEFAULT_METHOD };
    const parsed = JSON.parse(raw) as Partial<BillingState>;
    return {
      paid: Boolean(parsed.paid),
      method: typeof parsed.method === "string" ? parsed.method : DEFAULT_METHOD,
    };
  } catch {
    return { paid: false, method: DEFAULT_METHOD };
  }
}

function saveState(state: BillingState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore write failures (private mode, quota) */
  }
}

/* ── Icons ────────────────────────────────────────────────────────────────── */

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function BankIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 21h18" />
      <path d="M4 10h16" />
      <path d="M12 3 4 7v3h16V7z" />
      <path d="M6 10v8M10 10v8M14 10v8M18 10v8" />
    </svg>
  );
}

/* ── Invoice print/download ───────────────────────────────────────────────── */

function printInvoice(v: Invoice) {
  if (typeof window === "undefined") return;
  const win = window.open("", "_blank");
  if (!win) {
    window.alert("Pop-ups blocked. Allow pop-ups to download the invoice.");
    return;
  }
  const total = v.amount;
  const rows: string[][] = [
    ["Base platform fee", "1", "€250.00", "€250.00"],
    ["Per-employee fee (21 × €4)", "21", "€4.00", "€84.00"],
  ];
  const rowHtml = rows
    .map(
      (r) =>
        "<tr>" +
        r
          .map(
            (c, i) =>
              "<td style='padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;" +
              (i ? "text-align:right;" : "") +
              "color:#1f2937'>" +
              c +
              "</td>"
          )
          .join("") +
        "</tr>"
    )
    .join("");
  win.document.write(
    "<html><head><title>" +
      v.id +
      "</title><style>" +
      "body{font-family:Arial,Helvetica,sans-serif;color:#111;padding:48px;max-width:760px;margin:0 auto}" +
      ".top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px}" +
      ".brand{color:#0f50db;font-weight:700;font-size:22px}" +
      ".muted{color:#6b7280;font-size:13px;line-height:1.5}" +
      ".pill{display:inline-block;border-radius:9999px;padding:4px 12px;font-size:12px;font-weight:600;background:#e6fae6;color:#388e3c}" +
      "h1{font-size:18px;margin:0 0 4px}" +
      "table{width:100%;border-collapse:collapse;margin-top:8px}" +
      "th{padding:10px 12px;border-bottom:2px solid #0f50db;font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:#374151;text-align:left}" +
      ".tot{display:flex;justify-content:flex-end;margin-top:18px}" +
      ".tot div{min-width:240px}" +
      ".tot .row{display:flex;justify-content:space-between;padding:6px 0;font-size:14px}" +
      ".tot .grand{border-top:2px solid #0f50db;margin-top:6px;padding-top:10px;font-weight:700;font-size:16px}" +
      "</style></head><body>" +
      "<div class='top'><div><div class='brand'>KaloPay</div><div class='muted' style='margin-top:6px'>KaloPay Ltd<br/>12 Stadiou Street<br/>1065 Nicosia, Cyprus<br/>VAT: CY10234567L</div></div>" +
      "<div style='text-align:right'><h1>Invoice " +
      v.id +
      "</h1><div class='muted'>Issued " +
      v.date +
      "<br/>Due " +
      v.date +
      "</div><div style='margin-top:8px'><span class='pill'>" +
      v.status +
      "</span></div></div></div>" +
      "<div class='muted'><strong style='color:#111'>Bill to</strong><br/>TechCorp Solutions<br/>owner@techcorp.com</div>" +
      "<table><thead><tr><th>Description</th><th style='text-align:right'>Qty</th><th style='text-align:right'>Unit</th><th style='text-align:right'>Amount</th></tr></thead><tbody>" +
      rowHtml +
      "</tbody></table>" +
      "<div class='tot'><div><div class='row'><span class='muted'>Subtotal</span><span>" +
      total +
      "</span></div><div class='row'><span class='muted'>VAT (0%)</span><span>€0.00</span></div><div class='row grand'><span>Total</span><span>" +
      total +
      "</span></div></div></div>" +
      "<p class='muted' style='margin-top:40px'>Payment received via Bank of Cyprus · IBAN ****9001. Thank you for your business.</p>" +
      "<script>setTimeout(function(){window.print()},350)<\/script></body></html>"
  );
  win.document.close();
}

/* ── Pay-now modal ────────────────────────────────────────────────────────── */

function PayModal({
  amount,
  method,
  onClose,
  onPaid,
}: {
  amount: string;
  method: string;
  onClose: () => void;
  onPaid: () => void;
}) {
  const [payFrom, setPayFrom] = useState(method);
  const [processing, setProcessing] = useState(false);

  const rows: [string, string][] = [
    ["Invoice", "INV-2026-07"],
    ["Billing period", "July 2026"],
    ["Total", amount],
  ];

  return (
    <Modal isOpen onClose={onClose} title="Pay bill" size="md">
      <div className="flex flex-col gap-[18px]">
        <div className="py-2 text-center">
          <div className="text-[12.5px] text-gray-400">Amount to pay</div>
          <div className="mt-1 text-[34px] font-bold text-[#0E1620]">{amount}</div>
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-gray-500">Pay from</label>
          <select
            value={payFrom}
            onChange={(e) => setPayFrom(e.target.value)}
            className="h-[42px] w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-[#0F50DB] focus:outline-none focus:ring-1 focus:ring-[#0F50DB]"
          >
            <option>{DEFAULT_METHOD}</option>
            <option>Add a new bank account…</option>
          </select>
        </div>

        <div className="flex flex-col gap-2 rounded-[10px] border border-gray-100 bg-gray-50 p-[14px]">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-gray-500">{label}</span>
              <span className="font-semibold text-[#0E1620]">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2.5">
        <Button variant="outline" onClick={onClose} disabled={processing}>
          Cancel
        </Button>
        <Button
          loading={processing}
          onClick={() => {
            setProcessing(true);
            window.setTimeout(onPaid, 900);
          }}
        >
          {processing ? "Processing…" : `Pay ${amount}`}
        </Button>
      </div>
    </Modal>
  );
}

/* ── Add-bank modal ───────────────────────────────────────────────────────── */

interface BankForm {
  accountName: string;
  bankName: string;
  iban: string;
  swift: string;
  country: string;
  currency: string;
}

const BANK_FIELDS: { label: string; key: keyof BankForm }[] = [
  { label: "Account holder name", key: "accountName" },
  { label: "Bank name", key: "bankName" },
  { label: "IBAN / Account number", key: "iban" },
  { label: "SWIFT / BIC", key: "swift" },
];

function BankModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<BankForm>({
    accountName: "",
    bankName: "",
    iban: "",
    swift: "",
    country: "Cyprus",
    currency: "EUR",
  });
  const [saved, setSaved] = useState(false);

  function set<K extends keyof BankForm>(key: K, value: BankForm[K]) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  const selectClass =
    "h-[42px] w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-[#0F50DB] focus:outline-none focus:ring-1 focus:ring-[#0F50DB]";

  return (
    <Modal isOpen onClose={onClose} title="Add bank account" size="lg">
      <div className="flex flex-col gap-4">
        {BANK_FIELDS.map(({ label, key }) => (
          <Input
            key={key}
            label={label}
            placeholder={label}
            value={form[key]}
            onChange={(e) => set(key, e.target.value)}
          />
        ))}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Country</label>
            <select value={form.country} onChange={(e) => set("country", e.target.value)} className={selectClass}>
              {["Cyprus", "Greece", "Germany", "Spain", "Sweden"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Currency</label>
            <select value={form.currency} onChange={(e) => set("currency", e.target.value)} className={selectClass}>
              {["EUR", "USDC", "USDT", "BTC"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {saved && (
          <div className="flex items-center gap-2 rounded-lg bg-green-100 px-3 py-2.5 text-[13.5px] font-medium text-green-700">
            <CheckIcon />
            Bank account added.
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-2.5">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            setSaved(true);
            window.setTimeout(onClose, 900);
          }}
        >
          Add bank account
        </Button>
      </div>
    </Modal>
  );
}

/* ── Screen ───────────────────────────────────────────────────────────────── */

export default function BillingScreen({ autoOpenPay = false }: { autoOpenPay?: boolean }) {
  const [hydrated, setHydrated] = useState(false);
  const [paid, setPaid] = useState(false);
  const [method, setMethod] = useState(DEFAULT_METHOD);
  const [payOpen, setPayOpen] = useState(false);
  const [bankOpen, setBankOpen] = useState(false);
  // Guard: never PUT billing to the server until we've successfully GET-reconciled it,
  // otherwise the initial local {paid:false} default can overwrite a server-side paid bill.
  const serverLoadedRef = useRef(false);

  const token = useEmployerAuthStore((s) => s.token);

  // Hydrate: paint from local cache instantly, then reconcile with the server.
  useEffect(() => {
    const state = loadState();
    setPaid(state.paid);
    setMethod(state.method);
    setHydrated(true);
    if (autoOpenPay && !state.paid) setPayOpen(true);
    if (!token) return;
    let alive = true;
    getBilling(token)
      .then((res) => {
        serverLoadedRef.current = true; // server state now known — safe to persist future changes
        const d = res?.data as Partial<BillingState> | null;
        if (!alive || !d) return;
        if (typeof d.paid === "boolean") setPaid(d.paid);
        if (typeof d.method === "string") setMethod(d.method);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [autoOpenPay, token]);

  // Persist to both local cache and the server (post-hydration only).
  useEffect(() => {
    if (!hydrated) return;
    saveState({ paid, method });
    // Only push to the server AFTER the initial GET has reconciled — prevents the
    // mount-time local default from resetting a server-side paid bill.
    if (token && serverLoadedRef.current) putBilling(token, { paid, method }).catch(() => {});
  }, [hydrated, paid, method, token]);

  function handlePaid() {
    setPaid(true);
    setPayOpen(false);
  }

  const cardClass = "rounded-xl border border-gray-100 bg-white p-6 shadow-sm";
  const eyebrowClass = "text-[12px] font-semibold uppercase tracking-[0.06em] text-gray-400";

  // Theme the billing surfaces (light cards #f7f7fa like other screens; full dark set).
  // Injected here so it hot-reloads even when globals.css is stale in dev.
  const billingCss = `
[data-dashboard-theme][data-theme="light"] [data-page="billing"] .bg-white{background-color:#f7f7fa!important}
[data-dashboard-theme][data-theme="dark"] [data-page="billing"] .bg-white{background-color:#1e293b!important}
[data-dashboard-theme][data-theme="dark"] [data-page="billing"] .bg-gray-50{background-color:#0f172a!important}
[data-dashboard-theme][data-theme="dark"] [data-page="billing"] .bg-blue-50{background-color:rgba(59,130,246,0.15)!important}
[data-dashboard-theme][data-theme="dark"] [data-page="billing"] h1,
[data-dashboard-theme][data-theme="dark"] [data-page="billing"] h2,
[data-dashboard-theme][data-theme="dark"] [data-page="billing"] .text-\\[\\#0E1620\\]{color:#f1f5f9!important}
[data-dashboard-theme][data-theme="dark"] [data-page="billing"] .text-gray-600{color:#cbd5e1!important}
[data-dashboard-theme][data-theme="dark"] [data-page="billing"] .text-gray-500{color:#94a3b8!important}
[data-dashboard-theme][data-theme="dark"] [data-page="billing"] .text-gray-400{color:#7c8798!important}
[data-dashboard-theme][data-theme="light"] [data-page="billing"] .border-gray-100{border-color:#e5e7eb!important}
[data-dashboard-theme][data-theme="dark"] [data-page="billing"] .border-gray-100{border-color:rgba(255,255,255,0.12)!important}
`;

  return (
    <div className="min-h-full w-full bg-dash-page" data-dashboard-theme data-page="billing">
      <style dangerouslySetInnerHTML={{ __html: billingCss }} />
      <div className="dash-shell pb-8 pt-6">
        <div className="mx-auto flex w-full max-w-[1245px] flex-col gap-5">
          {/* Heading */}
          <div>
            <h1 className="text-2xl font-semibold text-[#0E1620]">Billing</h1>
            <p className="mt-1.5 text-sm text-gray-500">Your plan, payment method and invoices.</p>
          </div>

          {/* Amount due — pay now */}
          <section
            className={cn(
              "flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white p-6 shadow-sm",
              paid ? "border border-green-600" : "border border-[#0F50DB]"
            )}
          >
            <div>
              <span className={eyebrowClass}>
                {paid ? "Amount due" : "Amount due · due Jul 01, 2026"}
              </span>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-[30px] font-bold text-[#0E1620]">
                  {paid ? "€0.00" : AMOUNT_DUE}
                </span>
                <span className="text-[13.5px] text-gray-500">Payroll platform · July 2026</span>
              </div>
            </div>
            {paid ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                <CheckIcon />
                Paid · via Bank of Cyprus
              </span>
            ) : (
              <Button size="lg" onClick={() => setPayOpen(true)}>
                Pay now
              </Button>
            )}
          </section>

          {/* Plan + payment method */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-[1.3fr_1fr]">
            {/* Current plan */}
            <section className={cardClass}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className={eyebrowClass}>Current plan</span>
                  <h2 className="mt-2 text-[22px] font-bold text-[#0E1620]">Growth</h2>
                  <p className="mt-1.5 text-sm text-gray-500">
                    €250 base + €4 / active employee · billed monthly
                  </p>
                </div>
                <Badge label="Active" variant="success" className="shrink-0" />
              </div>
              <div className="mt-5 flex gap-7 border-t border-gray-100 pt-[18px]">
                <div>
                  <div className="text-[12.5px] text-gray-400">This month</div>
                  <div className="mt-1 text-[20px] font-bold text-[#0E1620]">{AMOUNT_DUE}</div>
                </div>
                <div>
                  <div className="text-[12.5px] text-gray-400">Next invoice</div>
                  <div className="mt-1 text-[20px] font-bold text-[#0E1620]">Jul 01</div>
                </div>
              </div>
            </section>

            {/* Payment method */}
            <section className={cardClass}>
              <h2 className="mb-4 text-[17px] font-semibold text-[#0E1620]">Payment method</h2>
              <div className="flex items-center gap-3.5 rounded-xl border border-gray-100 bg-gray-50 p-4">
                <span className="inline-flex h-[30px] w-11 shrink-0 items-center justify-center rounded-md bg-blue-50 text-[#0F50DB]">
                  <BankIcon />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-[#0E1620]">{method}</div>
                  <div className="text-[12.5px] text-gray-400">Bank transfer (SEPA) · BCYPCY2N</div>
                </div>
                <Badge label="Default" variant="info" className="shrink-0" />
              </div>
              <div className="mt-4 flex gap-2.5">
                <Button className="flex-1" onClick={() => setBankOpen(true)}>
                  Add bank account
                </Button>
              </div>
            </section>
          </div>

          {/* Billing history */}
          <section className="rounded-xl border border-gray-100 bg-white shadow-sm">
            <h2 className="px-6 pt-6 text-[17px] font-semibold text-[#0E1620]">Billing history</h2>
            <div className="overflow-x-auto px-6 pb-2 pt-3">
              <table className="w-full min-w-[560px] border-collapse text-sm">
                <thead>
                  <tr>
                    {["Invoice", "Date", "Description", "Amount", "Status", ""].map((h) => (
                      <th
                        key={h || "actions"}
                        className="whitespace-nowrap border-b border-gray-100 px-3.5 py-3 text-left text-[12px] font-medium text-gray-500"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {INVOICES.map((v, i) => (
                    <tr key={v.id}>
                      <td
                        className={cn(
                          "px-3.5 py-3.5 align-middle font-medium text-[#0F50DB]",
                          i < INVOICES.length - 1 && "border-b border-gray-100"
                        )}
                      >
                        {v.id}
                      </td>
                      <td
                        className={cn(
                          "px-3.5 py-3.5 align-middle text-[#0E1620]",
                          i < INVOICES.length - 1 && "border-b border-gray-100"
                        )}
                      >
                        {v.date}
                      </td>
                      <td
                        className={cn(
                          "px-3.5 py-3.5 align-middle text-gray-600",
                          i < INVOICES.length - 1 && "border-b border-gray-100"
                        )}
                      >
                        {v.desc}
                      </td>
                      <td
                        className={cn(
                          "px-3.5 py-3.5 align-middle font-medium text-[#0E1620]",
                          i < INVOICES.length - 1 && "border-b border-gray-100"
                        )}
                      >
                        {v.amount}
                      </td>
                      <td
                        className={cn(
                          "px-3.5 py-3.5 align-middle",
                          i < INVOICES.length - 1 && "border-b border-gray-100"
                        )}
                      >
                        <Badge label={v.status} variant="success" />
                      </td>
                      <td
                        className={cn(
                          "px-3.5 py-3.5 text-right align-middle",
                          i < INVOICES.length - 1 && "border-b border-gray-100"
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => printInvoice(v)}
                          className="text-[13.5px] font-medium text-[#0F50DB] hover:underline"
                        >
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>

      {payOpen && (
        <PayModal amount={AMOUNT_DUE} method={method} onClose={() => setPayOpen(false)} onPaid={handlePaid} />
      )}
      {bankOpen && <BankModal onClose={() => setBankOpen(false)} />}
    </div>
  );
}
