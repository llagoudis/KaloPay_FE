"use client";

/* KaloPay employer — T.D.59 (Cyprus Employee Declaration of Income / withholding
   tax computation). A deliberately different, desktop-application style window:
   title bar, Tax Year + Download Reports toolbar, a left employee grid with search,
   Current/Other vertical tabs, and a right tabbed panel (Incomes / Allowances /
   Taxation) with the live Cyprus tax-band computation. Per-employee edits persist
   to localStorage under "kp-td59", keyed by "<year>:<employeeId>".

   Ported faithfully from DESIGN_Td59.jsx. Tax bands, GHS/SI/fund rates and all
   money math are copied verbatim from the design. */

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils/cn";

// ─── Props contract ─────────────────────────────────────────────────────────

export interface Td59Employee {
  id: string;
  name: string;
  employeeNo?: string;
}

interface Td59WindowProps {
  employees: Td59Employee[];
  onClose: () => void;
}

const STORAGE_KEY = "kp-td59";

// ─── Types ──────────────────────────────────────────────────────────────────

type NumField = number | "";

interface Td59Form {
  // Incomes
  daysAbroad: NumField;
  benefits: NumField;
  benefitsNI: NumField;
  pensionNormal: NumField;
  grossRents: NumField;
  incomeOther: NumField;
  nonTaxable: NumField;
  widowEmployer: NumField;
  widowSI: NumField;
  widowDed: NumField;
  deductAll: boolean;
  salariedOverride: NumField;
  // Allowances
  subscriptions: NumField;
  firstEmployment: string;
  homeInsurance: NumField;
  rentedProps: NumField;
  otherDeductions: NumField;
  provFund: NumField;
  health: NumField;
  si: NumField;
  ghs: NumField;
  lifeInsurance: NumField;
  dependentChildren: NumField;
  rentInterest: NumField;
  energyUpgrade: NumField;
  innovative: NumField;
  // Taxation
  adjustScales: boolean;
  taxDeducted: NumField;
}

interface Band {
  lo: number;
  hi: number;
  rate: number;
  rateLabel: string;
  label: string;
  amt: number;
  tax: number;
}

interface Td59Computed {
  salaried: number;
  totalIncome: number;
  totalTaxable: number;
  intermediary: number;
  funds: number;
  ghs: number;
  totalAllowances: number;
  chargeable: number;
  bands: Band[];
  taxOnChargeable: number;
  taxToBeDeducted: number;
}

interface Roster {
  id: string;
  empId: number;
  emplId: number;
  name: string;
  gross: number;
  employeeNo: string;
}

// ─── Data + computation (ported verbatim from the design) ───────────────────

function grossFromNo(employeeNo: string, index: number): number {
  const digits = employeeNo.replace(/[^0-9]/g, "");
  const seed = digits ? Number(digits) : index + 1;
  return 21000 + (seed % 6) * 4500;
}

function td59Defaults(gross: number): Td59Form {
  const g = gross || 21000;
  return {
    daysAbroad: 0,
    benefits: 0,
    benefitsNI: 0,
    pensionNormal: 0,
    grossRents: 0,
    incomeOther: 0,
    nonTaxable: 0,
    widowEmployer: 0,
    widowSI: 0,
    widowDed: 0,
    deductAll: true,
    salariedOverride: g,
    subscriptions: 0,
    firstEmployment: "None",
    homeInsurance: 0,
    rentedProps: 0,
    otherDeductions: 0,
    provFund: 0,
    health: 0,
    si: Math.round(g * 0.088 * 100) / 100,
    ghs: Math.round(g * 0.0265 * 100) / 100,
    lifeInsurance: 0,
    dependentChildren: 0,
    rentInterest: 0,
    energyUpgrade: 0,
    innovative: 0,
    adjustScales: false,
    taxDeducted: 0,
  };
}

function nz(v: NumField | number | undefined): number {
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

function td59Compute(f: Td59Form): Td59Computed {
  const salaried = nz(f.salariedOverride);
  const totalIncome =
    salaried +
    nz(f.benefits) +
    nz(f.benefitsNI) +
    nz(f.pensionNormal) +
    nz(f.grossRents) +
    nz(f.incomeOther);
  const totalTaxable = totalIncome - nz(f.nonTaxable);
  const intermediary =
    totalTaxable -
    (nz(f.subscriptions) + nz(f.homeInsurance) + nz(f.rentedProps) + nz(f.otherDeductions));
  const funds = nz(f.provFund) + nz(f.health) + nz(f.si);
  const ghs = nz(f.ghs);
  const totalAllowances =
    funds +
    ghs +
    nz(f.lifeInsurance) +
    nz(f.dependentChildren) +
    nz(f.rentInterest) +
    nz(f.energyUpgrade) +
    nz(f.innovative);
  const chargeable = Math.max(0, intermediary - totalAllowances);
  const bandDefs = [
    { lo: 0, hi: 22000, rate: 0, rateLabel: "NIL", label: "From €0 to €22,000" },
    { lo: 22000, hi: 32000, rate: 0.2, rateLabel: "20%", label: "From €22,001 to €32,000" },
    { lo: 32000, hi: 42000, rate: 0.25, rateLabel: "25%", label: "From €32,001 to €42,000" },
    { lo: 42000, hi: 72000, rate: 0.3, rateLabel: "30%", label: "From €42,001 to €72,000" },
    { lo: 72000, hi: Infinity, rate: 0.35, rateLabel: "35%", label: "From €72,001" },
  ];
  const bands: Band[] = bandDefs.map((b) => {
    const amt = Math.max(0, Math.min(chargeable, b.hi) - b.lo);
    return { ...b, amt, tax: Math.round(amt * b.rate * 100) / 100 };
  });
  const taxOnChargeable = Math.round(bands.reduce((s, b) => s + b.tax, 0) * 100) / 100;
  const taxToBeDeducted = Math.max(
    0,
    Math.round((taxOnChargeable - nz(f.taxDeducted)) * 100) / 100
  );
  return {
    salaried,
    totalIncome,
    totalTaxable,
    intermediary,
    funds,
    ghs,
    totalAllowances,
    chargeable,
    bands,
    taxOnChargeable,
    taxToBeDeducted,
  };
}

function td59Money(n: NumField | number): string {
  return Number(nz(n)).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
function td59Int(n: number): string {
  return Math.round(nz(n)).toLocaleString("en-US");
}

// ─── Persistence ────────────────────────────────────────────────────────────

type Store = Record<string, Partial<Td59Form>>;

function readStore(): Store {
  if (typeof window === "undefined") return {};
  try {
    return (JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}") as Store) || {};
  } catch {
    return {};
  }
}
function writeStore(store: Store): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* ignore quota / serialization errors */
  }
}

// ─── Download + print (ported from the design) ──────────────────────────────

function td59DocText(year: string, sel: Roster, f: Td59Form, c: Td59Computed): string {
  const L: string[] = [];
  L.push("T.D.59 — Employee Income Tax Computation");
  L.push("Tax Year: " + year + "    Employee: " + sel.name + " (ID " + sel.empId + ")");
  L.push("");
  L.push("INCOMES");
  L.push("  Salaried services: " + td59Money(c.salaried));
  L.push("  Benefits: " + td59Money(f.benefits));
  L.push("  Gross rents: " + td59Money(f.grossRents));
  L.push("  Income from other sources: " + td59Money(f.incomeOther));
  L.push("  TOTAL INCOME: " + td59Money(c.totalIncome));
  L.push("  Non Taxable Income: " + td59Money(f.nonTaxable));
  L.push("  TOTAL TAXABLE INCOME: " + td59Money(c.totalTaxable));
  L.push("");
  L.push("ALLOWANCES");
  L.push("  Intermediary calculation: " + td59Money(c.intermediary));
  L.push("  Pension/Provident/Health/SI funds: " + td59Money(c.funds));
  L.push("  Contribution to G.H.S: " + td59Money(c.ghs));
  L.push("  TOTAL ALLOWANCES: " + td59Money(c.totalAllowances));
  L.push("");
  L.push("TAXATION");
  L.push("  CHARGEABLE INCOME: " + td59Money(c.chargeable));
  c.bands.forEach((b) =>
    L.push(
      "  " +
        b.label +
        "  @ " +
        b.rateLabel +
        "  income " +
        td59Int(b.amt) +
        "  tax " +
        td59Money(b.tax)
    )
  );
  L.push("  TAX ON CHARGEABLE INCOME: " + td59Money(c.taxOnChargeable));
  L.push("  TAX DEDUCTED: " + td59Money(f.taxDeducted));
  L.push("  TAX TO BE DEDUCTED: " + td59Money(c.taxToBeDeducted));
  return L.join("\n");
}

function td59Download(year: string, sel: Roster, f: Td59Form, c: Td59Computed): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([td59DocText(year, sel, f, c)], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "TD59-" + year + "-" + sel.name.replace(/\s+/g, "_") + ".txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function td59Print(year: string, sel: Roster, f: Td59Form, c: Td59Computed): void {
  if (typeof window === "undefined") return;
  const win = window.open("", "_blank");
  if (!win) return;
  const row = (l: string, v: string, b?: boolean) =>
    "<tr><td style='padding:6px 10px;border-bottom:1px solid #e5e7eb;" +
    (b ? "font-weight:700;text-transform:uppercase;font-size:12px;" : "") +
    "'>" +
    l +
    "</td><td style='padding:6px 10px;border-bottom:1px solid #e5e7eb;text-align:right;font-variant-numeric:tabular-nums;" +
    (b ? "font-weight:700;" : "") +
    "'>" +
    v +
    "</td></tr>";
  const bandRows = c.bands
    .map(
      (b) =>
        "<tr><td style='padding:5px 10px;border-bottom:1px solid #eee'>" +
        b.label +
        "</td><td style='padding:5px 10px;border-bottom:1px solid #eee;text-align:right'>" +
        td59Int(b.amt) +
        "</td><td style='padding:5px 10px;border-bottom:1px solid #eee;text-align:center'>@ " +
        b.rateLabel +
        "</td><td style='padding:5px 10px;border-bottom:1px solid #eee;text-align:right'>" +
        td59Money(b.tax) +
        "</td></tr>"
    )
    .join("");
  win.document.write(
    "<html><head><title>T.D.59 — " +
      sel.name +
      "</title><style>body{font-family:Arial,Helvetica,sans-serif;color:#111;padding:42px;max-width:760px;margin:0 auto}h1{font-size:20px;margin:0 0 2px}h2{font-size:13px;text-transform:uppercase;letter-spacing:.05em;color:#0f50db;margin:22px 0 6px;border-bottom:2px solid #0f50db;padding-bottom:4px}.muted{color:#6b7280;font-size:13px;margin-bottom:8px}table{width:100%;border-collapse:collapse}</style></head><body>"
  );
  win.document.write(
    "<h1>T.D.59 — Employee Income Tax Computation</h1><div class='muted'>Tax Year " +
      year +
      " &middot; " +
      sel.name +
      " &middot; Employee ID " +
      sel.empId +
      "</div>"
  );
  win.document.write(
    "<h2>Incomes</h2><table>" +
      row("Salaried services", td59Money(c.salaried)) +
      row("Benefits", td59Money(f.benefits)) +
      row("Gross rents", td59Money(f.grossRents)) +
      row("Income from other sources", td59Money(f.incomeOther)) +
      row("Total income", td59Money(c.totalIncome), true) +
      row("Non taxable income", td59Money(f.nonTaxable)) +
      row("Total taxable income", td59Money(c.totalTaxable), true) +
      "</table>"
  );
  win.document.write(
    "<h2>Allowances</h2><table>" +
      row("Intermediary calculation", td59Money(c.intermediary), true) +
      row("Pension/Provident/Health/SI funds", td59Money(c.funds)) +
      row("Contribution to G.H.S", td59Money(c.ghs)) +
      row("Total allowances", td59Money(c.totalAllowances), true) +
      "</table>"
  );
  win.document.write(
    "<h2>Taxation</h2><table>" + row("Chargeable income", td59Money(c.chargeable), true) + "</table>"
  );
  win.document.write(
    "<table style='margin-top:8px'><thead><tr><th style='text-align:left;padding:6px 10px;border-bottom:2px solid #0f50db;font-size:12px'>Band</th><th style='text-align:right;padding:6px 10px;border-bottom:2px solid #0f50db;font-size:12px'>Chargeable</th><th style='text-align:center;padding:6px 10px;border-bottom:2px solid #0f50db;font-size:12px'>Rate</th><th style='text-align:right;padding:6px 10px;border-bottom:2px solid #0f50db;font-size:12px'>Tax</th></tr></thead><tbody>" +
      bandRows +
      "</tbody></table>"
  );
  win.document.write(
    "<table style='margin-top:10px'>" +
      row("Tax on chargeable income", td59Money(c.taxOnChargeable), true) +
      row("Tax deducted", td59Money(f.taxDeducted)) +
      row("Tax to be deducted", td59Money(c.taxToBeDeducted), true) +
      "</table>"
  );
  win.document.write("</body></html>");
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 300);
}

// ─── Small field helpers ────────────────────────────────────────────────────

const READONLY_CELL =
  "inline-block min-w-[120px] rounded border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-right font-mono text-[13px] font-semibold tabular-nums text-[#0E1620]";
const FOOT_BTN =
  "inline-flex h-[38px] items-center gap-2 rounded-md border border-gray-300 bg-white px-[18px] text-[13.5px] font-semibold text-gray-700";

function Td59Num({
  value,
  onChange,
  int,
  className,
}: {
  value: NumField;
  onChange: (v: NumField) => void;
  int?: boolean;
  className?: string;
}) {
  return (
    <input
      type="number"
      step={int ? "1" : "0.01"}
      value={value}
      onChange={(e) =>
        onChange(
          e.target.value === ""
            ? ""
            : int
              ? parseInt(e.target.value, 10)
              : parseFloat(e.target.value)
        )
      }
      className={cn(
        "box-border h-[30px] w-[110px] rounded border border-gray-300 bg-white px-2 text-right font-mono text-[13px] text-[#0E1620] outline-none focus:border-[#0F50DB] focus:ring-1 focus:ring-[#0F50DB]",
        className
      )}
    />
  );
}

function Td59Mini({ value, onChange }: { value: NumField; onChange: (v: NumField) => void }) {
  return (
    <input
      type="number"
      step="0.01"
      value={value}
      onChange={(e) => onChange(e.target.value === "" ? "" : parseFloat(e.target.value))}
      className="box-border h-[28px] w-[84px] rounded border border-gray-300 bg-white px-2 text-right font-mono text-[12.5px] text-[#0E1620] outline-none focus:border-[#0F50DB] focus:ring-1 focus:ring-[#0F50DB]"
    />
  );
}

function Td59Spin({
  label,
  value,
  onChange,
  int,
}: {
  label: string;
  value: NumField;
  onChange: (v: NumField) => void;
  int?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="text-[13px] text-gray-500">{label}</span>
      <Td59Num value={value} onChange={onChange} int={int} />
    </span>
  );
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 14 8"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M1 1.5 7 6.5 13 1.5" />
    </svg>
  );
}

function CheckCircle() {
  return (
    <span className="inline-flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#2E7D32] text-white">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-[13px] w-[13px]"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </span>
  );
}

function CrossCircle() {
  return (
    <span className="inline-flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#C62828] text-white">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-[13px] w-[13px]"
      >
        <line x1="6" y1="6" x2="18" y2="18" />
        <line x1="18" y1="6" x2="6" y2="18" />
      </svg>
    </span>
  );
}

function Td59Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="m-0 rounded-lg border border-gray-200 px-[18px] pb-4 pt-2">
      <legend className="px-2 text-[13px] font-semibold text-[#0E1620]">{title}</legend>
      <div className="flex flex-col">{children}</div>
    </fieldset>
  );
}

interface Td59RowProps {
  label: string;
  input?: boolean;
  value?: NumField;
  onChange?: (v: NumField) => void;
  rightVal?: number;
  total?: boolean;
  extra?: React.ReactNode;
  select?: boolean;
  selVal?: string;
  onSel?: (v: string) => void;
  selOpts?: string[];
}

function Td59Row({
  label,
  input,
  value,
  onChange,
  rightVal,
  total,
  extra,
  select,
  selVal,
  onSel,
  selOpts,
}: Td59RowProps) {
  return (
    <div className="flex items-center gap-3.5 border-b border-transparent py-[7px]">
      <span
        className={cn(
          "flex-1 text-[13.5px]",
          total
            ? "font-semibold uppercase tracking-[0.02em] text-[#0E1620]"
            : "font-normal text-gray-700"
        )}
      >
        {label}
      </span>
      {extra && <span className="shrink-0">{extra}</span>}
      {select && (
        <span className="relative shrink-0">
          <select
            value={selVal}
            onChange={(e) => onSel?.(e.target.value)}
            className="h-[30px] w-[130px] appearance-none rounded border border-gray-300 bg-white py-0 pl-2.5 pr-7 text-[13px] text-[#0E1620] outline-none focus:border-[#0F50DB]"
          >
            {selOpts?.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-[6px] w-[10px] -translate-y-1/2 text-gray-400" />
        </span>
      )}
      {input && onChange && <Td59Num value={value ?? ""} onChange={onChange} />}
      {rightVal !== undefined && <span className={READONLY_CELL}>{td59Money(rightVal)}</span>}
    </div>
  );
}

function Td59Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="mt-2 flex items-center justify-between border-t border-gray-200 pb-1 pt-4">
      <span className="text-[13.5px] text-gray-700">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        title="Toggle"
        className="inline-flex cursor-pointer border-none bg-transparent"
      >
        {value ? (
          <CheckCircle />
        ) : (
          <span className="inline-flex h-[22px] w-[22px] rounded-full border border-gray-300 bg-gray-50" />
        )}
      </button>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────

const YEARS = ["2026", "2025", "2024", "2023"];

export default function Td59Window({ employees, onClose }: Td59WindowProps) {
  const roster: Roster[] = useMemo(() => {
    const source: Td59Employee[] = employees.length
      ? employees
      : [{ id: "1", name: "Karlos Santana", employeeNo: "1001" }];
    return source.map((p, i) => {
      const employeeNo = p.employeeNo ?? String(1000 + i + 1);
      return {
        id: p.id,
        empId: Number(employeeNo.replace(/[^0-9]/g, "")) || 1000 + i + 1,
        emplId: i + 1,
        name: p.name,
        gross: grossFromNo(employeeNo, i),
        employeeNo,
      };
    });
  }, [employees]);

  const [year, setYear] = useState<string>("2026");
  const [query, setQuery] = useState("");
  const [selId, setSelId] = useState<string>(roster[0].id);
  const [side, setSide] = useState<"Current" | "Other">("Current");
  const [tab, setTab] = useState<"Incomes" | "Allowances" | "Taxation">("Incomes");
  const [toast, setToast] = useState<string | null>(null);
  const [store, setStore] = useState<Store>(() => readStore());

  const sel = roster.find((r) => r.id === selId) || roster[0];
  const key = year + ":" + sel.id;
  const f: Td59Form = { ...td59Defaults(sel.gross), ...(store[key] || {}) };

  function setF(patch: Partial<Td59Form>) {
    setStore((s) => {
      const next: Store = {
        ...s,
        [key]: { ...td59Defaults(sel.gross), ...(s[key] || {}), ...patch },
      };
      writeStore(next);
      return next;
    });
  }

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast((t) => (t === msg ? null : t)), 2200);
  }

  function resetEmp() {
    setStore((s) => {
      const next = { ...s };
      delete next[key];
      writeStore(next);
      return next;
    });
    flash("Form reset");
  }

  const c = td59Compute(f);
  const filtered = roster.filter(
    (r) =>
      !query ||
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      String(r.empId).includes(query)
  );

  return (
    <div className="font-sans">
      {/* window */}
      <div className="overflow-hidden rounded-[10px] border border-gray-300 bg-gray-50 shadow-[0_10px_40px_-16px_rgba(15,23,42,0.35)]">
        {/* title bar */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-b from-white to-gray-50 px-3.5 py-[9px]">
          <span className="text-[13.5px] font-bold tracking-[0.01em] text-[#0E1620]">T.D. 59</span>
          <div className="flex items-center gap-4 text-gray-400">
            <button
              type="button"
              onClick={onClose}
              title="Back to reports"
              className="inline-flex cursor-pointer border-none bg-transparent text-gray-400"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="4" y="4" width="16" height="16" rx="1.5" />
            </svg>
            <button
              type="button"
              onClick={onClose}
              title="Close"
              className="inline-flex cursor-pointer border-none bg-transparent text-gray-400"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
              >
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* toolbar */}
        <div className="flex items-center gap-4 border-b border-gray-200 bg-white px-3.5 py-3">
          <label className="text-[13px] text-gray-700">Tax Year</label>
          <div className="relative">
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="h-[30px] cursor-pointer appearance-none rounded-[5px] border border-gray-300 bg-white py-0 pl-2.5 pr-[30px] text-[13px] text-[#0E1620] outline-none focus:border-[#0F50DB]"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-[9px] top-1/2 h-[7px] w-[11px] -translate-y-1/2 text-gray-400" />
          </div>
          <button
            type="button"
            onClick={() => {
              td59Download(year, sel, f, c);
              flash("Report downloaded");
            }}
            className="inline-flex h-8 items-center gap-2 rounded-md border border-gray-300 bg-white px-3.5 text-[13px] font-semibold text-gray-700"
          >
            <span className="inline-flex h-[18px] w-[18px] items-center justify-center rounded bg-[#2E7D32] text-white">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3v12" />
                <path d="m7 11 5 5 5-5" />
                <path d="M5 21h14" />
              </svg>
            </span>
            Download Reports
          </button>
        </div>

        {/* body */}
        <div className="grid grid-cols-[330px_1fr] gap-0">
          {/* left: search + employee grid */}
          <div className="flex min-h-[560px] flex-col border-r border-gray-200 bg-white">
            <div className="flex gap-2 p-3">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter text to search..."
                className="h-8 flex-1 rounded-[5px] border border-gray-300 px-2.5 text-[13px] text-[#0E1620] outline-none focus:border-[#0F50DB] focus:ring-1 focus:ring-[#0F50DB]"
              />
              <button
                type="button"
                className="h-8 rounded-[5px] border border-gray-300 bg-gray-50 px-4 text-[13px] font-semibold text-gray-700"
              >
                Find
              </button>
            </div>
            <div className="border-y border-gray-200 bg-gradient-to-r from-gray-50 to-[rgba(124,134,247,0.10)] px-3 py-2 text-[11.5px] italic text-gray-400">
              Drag a column header here to group by that column
            </div>
            <div className="flex-1 overflow-x-auto">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr className="bg-gray-50">
                    {["Employee Id", "Employm. Id", "Employee"].map((h, i) => (
                      <th
                        key={h}
                        className={cn(
                          "whitespace-nowrap border-b border-gray-200 px-2.5 py-2 text-left font-semibold text-gray-700",
                          i < 2 && "border-r border-gray-200"
                        )}
                      >
                        {h}
                        {i === 0 ? " ▲" : ""}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => {
                    const on = r.id === selId;
                    return (
                      <tr
                        key={r.id}
                        onClick={() => setSelId(r.id)}
                        className={cn("cursor-pointer", on ? "bg-[#0F50DB]/10" : "bg-transparent")}
                      >
                        <td
                          className={cn(
                            "border-b border-r border-gray-200 px-2.5 py-[7px] text-center",
                            on ? "font-semibold text-[#0F50DB]" : "text-gray-700"
                          )}
                        >
                          {r.empId}
                        </td>
                        <td
                          className={cn(
                            "border-b border-r border-gray-200 px-2.5 py-[7px] text-center",
                            on ? "font-semibold text-[#0F50DB]" : "text-gray-700"
                          )}
                        >
                          {r.emplId}
                        </td>
                        <td
                          className={cn(
                            "whitespace-nowrap border-b border-gray-200 px-2.5 py-[7px]",
                            on ? "font-semibold text-[#0F50DB]" : "text-gray-700"
                          )}
                        >
                          {r.name}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* right: tabbed form */}
          <div className="flex bg-white">
            {/* vertical side tabs */}
            <div className="flex flex-col border-r border-gray-200 bg-gray-50">
              {(["Current", "Other"] as const).map((s) => {
                const on = side === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSide(s)}
                    style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                    className={cn(
                      "cursor-pointer border-none px-2 py-4 text-[12.5px] font-semibold tracking-[0.02em]",
                      on
                        ? "border-r-[3px] border-[#0F50DB] bg-white text-[#0F50DB]"
                        : "border-r-[3px] border-transparent bg-transparent text-gray-400"
                    )}
                  >
                    {s}
                  </button>
                );
              })}
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
              {/* horizontal tabs */}
              <div className="flex gap-0.5 border-b border-gray-200 px-3.5 pt-2.5">
                {(["Incomes", "Allowances", "Taxation"] as const).map((t) => {
                  const on = tab === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTab(t)}
                      className={cn(
                        "-mb-px cursor-pointer rounded-t-md px-4 py-2 text-[13px]",
                        on
                          ? "border border-b-white border-gray-200 bg-white font-semibold text-[#0F50DB]"
                          : "border border-transparent border-b-gray-200 bg-transparent font-medium text-gray-500"
                      )}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>

              {/* form body */}
              <div className="flex-1 overflow-y-auto p-5">
                {side === "Other" ? (
                  <div className="px-2 py-10 text-[13.5px] text-gray-400">
                    “Other” employments — no secondary employment recorded for {sel.name} in {year}.
                  </div>
                ) : tab === "Incomes" ? (
                  <Td59Section title="Incomes">
                    <Td59Row
                      label="Salaried services"
                      rightVal={c.salaried}
                      extra={
                        <Td59Spin
                          label="Days abroad"
                          value={f.daysAbroad}
                          onChange={(v) => setF({ daysAbroad: v })}
                          int
                        />
                      }
                    />
                    <Td59Row
                      label="Benefits"
                      input
                      value={f.benefits}
                      onChange={(v) => setF({ benefits: v })}
                    />
                    <Td59Row
                      label="Benefits not insurable"
                      input
                      value={f.benefitsNI}
                      onChange={(v) => setF({ benefitsNI: v })}
                      rightVal={0}
                    />
                    <Td59Row
                      label="Pension & Widow's pension taxable at normal rates"
                      input
                      value={f.pensionNormal}
                      onChange={(v) => setF({ pensionNormal: v })}
                      rightVal={0}
                    />
                    <Td59Row
                      label="Gross rents"
                      input
                      value={f.grossRents}
                      onChange={(v) => setF({ grossRents: v })}
                    />
                    <Td59Row
                      label="Income from other sources"
                      input
                      value={f.incomeOther}
                      onChange={(v) => setF({ incomeOther: v })}
                    />
                    <Td59Row label="TOTAL INCOME" total rightVal={c.totalIncome} />
                    <Td59Row
                      label="Non Taxable Income"
                      input
                      value={f.nonTaxable}
                      onChange={(v) => setF({ nonTaxable: v })}
                    />
                    <Td59Row label="TOTAL TAXABLE INCOME" total rightVal={c.totalTaxable} />
                    <Td59Row
                      label="Widow's pension (employer)"
                      input
                      value={f.widowEmployer}
                      onChange={(v) => setF({ widowEmployer: v })}
                    />
                    <Td59Row
                      label="Widow's pension (Social Insurance)"
                      input
                      value={f.widowSI}
                      onChange={(v) => setF({ widowSI: v })}
                    />
                    <Td59Row
                      label="Widow's pension deductions"
                      input
                      value={f.widowDed}
                      onChange={(v) => setF({ widowDed: v })}
                      rightVal={0}
                    />
                    <Td59Toggle
                      label="Deduct Tax from all earnings"
                      value={f.deductAll}
                      onChange={(v) => setF({ deductAll: v })}
                    />
                  </Td59Section>
                ) : tab === "Allowances" ? (
                  <Td59Section title="Allowances">
                    <Td59Row
                      label="Subscriptions to Unions & other Professional bodies"
                      input
                      value={f.subscriptions}
                      onChange={(v) => setF({ subscriptions: v })}
                      rightVal={0}
                    />
                    <Td59Row
                      label="Deductions for First employment"
                      select
                      selVal={f.firstEmployment}
                      onSel={(v) => setF({ firstEmployment: v })}
                      selOpts={["None", "20% of remuneration", "€8,550"]}
                      rightVal={0}
                    />
                    <Td59Row
                      label="Home insurance against natural disasters (up to €500)"
                      input
                      value={f.homeInsurance}
                      onChange={(v) => setF({ homeInsurance: v })}
                    />
                    <Td59Row
                      label="Deductions for Rented properties"
                      input
                      value={f.rentedProps}
                      onChange={(v) => setF({ rentedProps: v })}
                    />
                    <Td59Row
                      label="Other deductions"
                      input
                      value={f.otherDeductions}
                      onChange={(v) => setF({ otherDeductions: v })}
                    />
                    <Td59Row label="INTERMEDIARY CALCULATION" total rightVal={c.intermediary} />
                    <Td59Row
                      label="Pension, Provident, Health and Social Insurance Funds"
                      total
                      rightVal={c.funds}
                    />
                    <div className="flex flex-wrap items-center gap-2.5 py-0 pb-3.5 pl-2">
                      <Td59Mini value={f.provFund} onChange={(v) => setF({ provFund: v })} />{" "}
                      <span className="text-[12.5px] text-gray-500">Prov. Fund</span>
                      <Td59Mini value={f.health} onChange={(v) => setF({ health: v })} />{" "}
                      <span className="text-[12.5px] text-gray-500">Health</span>
                      <Td59Mini value={f.si} onChange={(v) => setF({ si: v })} />{" "}
                      <span className="text-[12.5px] text-gray-500">S.I.</span>
                    </div>
                    <Td59Row
                      label="Contribution to G.H.S (General Healthcare Security)"
                      total
                      rightVal={c.ghs}
                    />
                    <Td59Row
                      label="Life Insurance Premiums"
                      input
                      value={f.lifeInsurance}
                      onChange={(v) => setF({ lifeInsurance: v })}
                    />
                    <Td59Row
                      label="Deductions for dependent children"
                      input
                      value={f.dependentChildren}
                      onChange={(v) => setF({ dependentChildren: v })}
                    />
                    <Td59Row
                      label="Deduction for rent or for interest on a primary residence housing loan"
                      input
                      value={f.rentInterest}
                      onChange={(v) => setF({ rentInterest: v })}
                    />
                    <Td59Row
                      label="Deduction for energy upgrade of primary residence or purchase of electric vehicle"
                      input
                      value={f.energyUpgrade}
                      onChange={(v) => setF({ energyUpgrade: v })}
                    />
                    <Td59Row
                      label="Investment in innovative companies"
                      input
                      value={f.innovative}
                      onChange={(v) => setF({ innovative: v })}
                    />
                    <Td59Row label="TOTAL ALLOWANCES" total rightVal={c.totalAllowances} />
                  </Td59Section>
                ) : (
                  <Td59Section title="Tax Computation">
                    <Td59Row label="CHARGEABLE INCOME" total rightVal={c.chargeable} />
                    <div className="flex items-center justify-between pb-4 pt-1">
                      <span className="text-[13.5px] text-gray-700">Adjust scales</span>
                      <button
                        type="button"
                        onClick={() => setF({ adjustScales: !f.adjustScales })}
                        title="Toggle scale adjustment"
                        className="inline-flex cursor-pointer border-none bg-transparent"
                      >
                        {f.adjustScales ? <CheckCircle /> : <CrossCircle />}
                      </button>
                    </div>
                    {/* band table header */}
                    <div className="grid grid-cols-[1.5fr_1fr_0.7fr_1fr] items-center gap-3 pb-2 text-[12px] font-semibold text-gray-400">
                      <span />
                      <span className="text-right">Chargable income</span>
                      <span className="text-center">Rate</span>
                      <span className="text-right">Tax</span>
                    </div>
                    {c.bands.map((b, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-[1.5fr_1fr_0.7fr_1fr] items-center gap-3 py-[5px]"
                      >
                        <span className="text-[13px] text-gray-700">{b.label}</span>
                        <span className={READONLY_CELL}>{td59Int(b.amt)}</span>
                        <span className="text-center text-[13px] text-gray-500">
                          @ {b.rateLabel}
                        </span>
                        <span className={READONLY_CELL}>{td59Money(b.tax)}</span>
                      </div>
                    ))}
                    <div className="h-4" />
                    <Td59Row label="TAX ON CHARGEABLE INCOME" total rightVal={c.taxOnChargeable} />
                    <Td59Row
                      label="TAX DEDUCTED"
                      input
                      value={f.taxDeducted}
                      onChange={(v) => setF({ taxDeducted: v })}
                    />
                    <Td59Row label="TAX TO BE DEDUCTED" total rightVal={c.taxToBeDeducted} />
                  </Td59Section>
                )}
              </div>

              {/* footer */}
              <div className="flex items-center justify-between gap-2.5 border-t border-gray-200 bg-gray-50 px-4 py-3">
                <button type="button" onClick={resetEmp} className={FOOT_BTN}>
                  <span className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#C62828] text-white">
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    >
                      <line x1="6" y1="6" x2="18" y2="18" />
                      <line x1="18" y1="6" x2="6" y2="18" />
                    </svg>
                  </span>
                  Reset
                </button>
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => td59Print(year, sel, f, c)}
                    className={FOOT_BTN}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-gray-500"
                    >
                      <polyline points="6 9 6 2 18 2 18 9" />
                      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                      <rect x="6" y="14" width="12" height="8" />
                    </svg>
                    Print
                  </button>
                  <button
                    type="button"
                    onClick={() => flash("T.D.59 saved for " + sel.name)}
                    className={cn(FOOT_BTN, "border-none bg-[#0F50DB] text-white")}
                  >
                    <span className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full bg-white/25 text-white">
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-7 left-1/2 z-[1200] inline-flex -translate-x-1/2 items-center gap-2.5 rounded-[10px] bg-[#0E1620] px-[18px] py-[11px] text-[13.5px] font-medium text-white shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {toast}
        </div>
      )}
    </div>
  );
}
