"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";

// ─── Types ────────────────────────────────────────────────────────────────────

/** A single employee line the payslip editor operates on. */
export type PayslipEmployee = {
  id: number;
  name: string;
  department: string;
  avatar: string;
  color: string;
  currency: string;
  /** Base monthly gross. */
  salary: number;
  gross: number;
  deductions: number;
  net: number;
  incomeTax: number;
  social: number;
  health: number;
};

/** A free-form description/amount row. */
type ExtraRow = { desc: string; amount: string };

/** Structured earnings keyed by field. */
type EarnVals = {
  salaryRate: string; salary: string;
  cola: string;
  timeoffRate: string; timeoff: string;
  ot1Rate: string; ot1: string;
  ot15Rate: string; ot15: string;
  ot2Rate: string; ot2: string;
  sh0Rate: string; sh0: string;
  sh1Rate: string; sh1: string;
  sh2Rate: string; sh2: string;
  calc1314: string;
  vacRate: string; vac: string;
};

type NamedVals = Record<string, string>;

/** The persisted payslip document. */
export type PayslipData = {
  earnVals: EarnVals;
  extras: ExtraRow[];
  dedVals: NamedVals;
  extraDeductions: ExtraRow[];
  contribVals: NamedVals;
  extraContrib: ExtraRow[];
  otherRows: ExtraRow[];
  payslipNote: string;
};

/** A single read-only leave record for the Vacations tab. */
export type PayslipLeave = {
  ref: string;
  from: string;
  to: string;
  description: string;
  status: string;
  note: string;
  hours: number;
};

export type PayslipEditorProps = {
  /** Employee to edit. */
  employee: PayslipEmployee;
  /** Full list for Prev/Next navigation (defaults to just [employee]). */
  employees?: PayslipEmployee[];
  /** Batch reference; drives the localStorage key. Use "CONFIG" for standalone. */
  batchRef: string;
  /** Navigate to another employee (Prev/Next). */
  onSelect?: (emp: PayslipEmployee) => void;
  /** Back handler. When omitted (or hideBack), the back affordances are hidden. */
  onBack?: () => void;
  /** Standalone mode (Payroll Configurations) — hides the back button + footer back. */
  hideBack?: boolean;
  /** Per-employee lock state (batch flow only). */
  locked?: boolean;
  onToggleLock?: () => void;
  /** Read-only leave records for the Vacations tab. */
  leave?: PayslipLeave[];
};

type PayslipTab = "Earnings" | "Deductions" | "Contributions" | "Other" | "Vacations";
const TABS: PayslipTab[] = ["Earnings", "Deductions", "Contributions", "Other", "Vacations"];

const DEDUCTION_LABELS = [
  "Social Insurances", "Income Tax", "General Healthcare System", "Provident Fund",
  "Company Medical", "Union Medical", "Union Subscription", "Union Other",
  "Loan Installment", "Advances",
];
const CONTRIBUTION_LABELS = [
  "Social Insurances", "Social Cohesion", "Industrial Training", "Redundancy Fund",
  "Annual Leave", "General Healthcare System", "Provident Fund", "Company Medical",
  "Union Medical", "Union Stamps", "Benefit in Kind",
];
const EXTRA_EARNING_LABELS = ["Notice", "Vacations", "Bonus / Ex-gratia", "Benefit in Kind"] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function num(v: string | undefined): number {
  const n = parseFloat(v ?? "");
  return isNaN(n) ? 0 : n;
}

function sumVals(vals: NamedVals): number {
  return Object.values(vals).reduce((s, v) => s + num(v), 0);
}

function sumRows(rows: ExtraRow[]): number {
  return rows.reduce((s, r) => s + num(r.amount), 0);
}

/** Builds a default payslip document seeded from the employee's computed figures. */
function seedData(e: PayslipEmployee): PayslipData {
  const rate = e.salary / 22 / 8;
  const gross = e.gross;
  return {
    earnVals: {
      salaryRate: rate.toFixed(2), salary: e.salary.toFixed(2), cola: "0.00",
      timeoffRate: "0.00", timeoff: "0.00",
      ot1Rate: "0.00", ot1: "0.00", ot15Rate: "0.00", ot15: "0.00", ot2Rate: "0.00", ot2: "0.00",
      sh0Rate: "0.00", sh0: "0.00", sh1Rate: "0.00", sh1: "0.00", sh2Rate: "0.00", sh2: "0.00",
      calc1314: "0.00", vacRate: "0.00", vac: "0.00",
    },
    extras: [],
    dedVals: {
      "Social Insurances": e.social.toFixed(2), "Income Tax": e.incomeTax.toFixed(2),
      "General Healthcare System": e.health.toFixed(2), "Provident Fund": "0.00",
      "Company Medical": "0.00", "Union Medical": "0.00", "Union Subscription": "0.00",
      "Union Other": "0.00", "Loan Installment": "0.00", "Advances": "0.00",
    },
    extraDeductions: [],
    contribVals: {
      "Social Insurances": (gross * 0.0883).toFixed(2), "Social Cohesion": (gross * 0.02).toFixed(2),
      "Industrial Training": (gross * 0.005).toFixed(2), "Redundancy Fund": (gross * 0.012).toFixed(2),
      "Annual Leave": "0.00", "General Healthcare System": (gross * 0.029).toFixed(2),
      "Provident Fund": "0.00", "Company Medical": "0.00", "Union Medical": "0.00",
      "Union Stamps": "0.00", "Benefit in Kind": "0.00",
    },
    extraContrib: [],
    otherRows: [],
    payslipNote: "",
  };
}

function loadData(key: string, e: PayslipEmployee): PayslipData {
  const fallback = seedData(e);
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<PayslipData>;
    return {
      earnVals: { ...fallback.earnVals, ...parsed.earnVals },
      extras: parsed.extras ?? fallback.extras,
      dedVals: { ...fallback.dedVals, ...parsed.dedVals },
      extraDeductions: parsed.extraDeductions ?? fallback.extraDeductions,
      contribVals: { ...fallback.contribVals, ...parsed.contribVals },
      extraContrib: parsed.extraContrib ?? fallback.extraContrib,
      otherRows: parsed.otherRows ?? fallback.otherRows,
      payslipNote: parsed.payslipNote ?? fallback.payslipNote,
    };
  } catch {
    return fallback;
  }
}

// ─── Small building blocks ────────────────────────────────────────────────────

function AmountField({
  value, onChange, editMode, width = 110, muted = false,
}: { value: string; onChange: (v: string) => void; editMode: boolean; width?: number; muted?: boolean }) {
  if (editMode) {
    return (
      <input
        type="number" min="0" step="0.01" value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width }}
        className="h-[34px] shrink-0 rounded-lg border border-[#0F50DB] bg-white px-2.5 text-right font-mono text-[13px] text-[#0E1620] outline-none"
      />
    );
  }
  return (
    <div
      style={{ width }}
      className={cn(
        "flex h-[34px] shrink-0 items-center justify-end rounded-lg border border-gray-200 px-2.5 font-mono text-[13px]",
        muted ? "bg-gray-50 text-gray-400" : "bg-white text-[#0E1620]"
      )}
    >
      {value}
    </div>
  );
}

function ExtraTable({
  rows, onRows, addLabel, onAdd,
}: { rows: ExtraRow[]; onRows: (fn: (xs: ExtraRow[]) => ExtraRow[]) => void; addLabel: string; onAdd: () => void }) {
  return (
    <div className="min-h-[360px] overflow-hidden rounded-xl border border-gray-200">
      <div className="grid grid-cols-[1fr_130px_40px] border-b border-gray-200 bg-gray-50">
        <div className="px-3.5 py-2.5 text-[11.5px] font-semibold uppercase tracking-wide text-gray-400">Description</div>
        <div className="px-3.5 py-2.5 text-right text-[11.5px] font-semibold uppercase tracking-wide text-gray-400">Amount</div>
        <div />
      </div>
      {rows.map((row, i) => (
        <div key={i} className="grid grid-cols-[1fr_130px_40px] items-center border-b border-gray-200">
          <input
            value={row.desc} placeholder="Description"
            onChange={(e) => onRows((xs) => xs.map((x, j) => (j === i ? { ...x, desc: e.target.value } : x)))}
            className="border-none bg-transparent px-3.5 py-3 text-[13.5px] font-medium text-[#0E1620] outline-none"
          />
          <input
            value={row.amount} placeholder="0.00"
            onChange={(e) => onRows((xs) => xs.map((x, j) => (j === i ? { ...x, amount: e.target.value } : x)))}
            className="border-none bg-transparent px-3.5 py-3 text-right font-mono text-[13.5px] text-[#0E1620] outline-none"
          />
          <button
            type="button" aria-label="Remove"
            onClick={() => onRows((xs) => xs.filter((_, j) => j !== i))}
            className="flex items-center justify-center p-2 text-gray-400 hover:text-gray-600"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
      ))}
      <button
        type="button" onClick={onAdd}
        className="m-3 inline-flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3.5 py-2 text-[13px] font-semibold text-[#0F50DB] hover:border-[#0F50DB]"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
        {addLabel}
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function PayslipEditor({
  employee, employees, batchRef, onSelect, onBack, hideBack, locked, onToggleLock, leave,
}: PayslipEditorProps) {
  const e = employee;
  const list = employees && employees.length ? employees : [e];
  const idx = Math.max(0, list.findIndex((x) => x.id === e.id));

  const storeKey = `kp-payslip-${batchRef || "x"}-${e.id}`;

  const [tab, setTab] = useState<PayslipTab>("Earnings");
  const [editMode, setEditMode] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"saved" | "saving">("saved");
  const [extraModal, setExtraModal] = useState(false);
  const [extraVals, setExtraVals] = useState<NamedVals>({
    Notice: "0.00", Vacations: "0.00", "Bonus / Ex-gratia": "0.00", "Benefit in Kind": "0.00",
  });

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notify = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };

  // Document state — seeded from localStorage. This component is mounted with a
  // `key` per employee (see call sites), so it remounts on employee switch and
  // `useState`'s initializer re-runs with the correct data automatically.
  const [data, setData] = useState<PayslipData>(() => loadData(storeKey, e));

  // Debounced autosave. Persisting to localStorage is a genuine external-system
  // sync; the "saving"/"saved" transitions happen inside async callbacks (never
  // synchronously in the effect body) so they don't cascade renders. The first
  // run (the mount write) is skipped so no spurious toast appears on open.
  const skipAutosave = useRef(true);
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(storeKey, JSON.stringify(data));
    if (skipAutosave.current) { skipAutosave.current = false; return; }
    const raf = requestAnimationFrame(() => setSaveState("saving"));
    const t = setTimeout(() => { setSaveState("saved"); notify("Changes autosaved"); }, 600);
    return () => { cancelAnimationFrame(raf); clearTimeout(t); };
  }, [data, storeKey]);

  function manualSave() {
    if (typeof window !== "undefined") localStorage.setItem(storeKey, JSON.stringify(data));
    setSaveState("saved");
    notify("Payslip saved");
  }

  // Live summary recompute from the current document.
  const summary = useMemo(() => {
    const structuredEarnings =
      num(data.earnVals.salary) + num(data.earnVals.cola) + num(data.earnVals.timeoff) +
      num(data.earnVals.ot1) + num(data.earnVals.ot15) + num(data.earnVals.ot2) +
      num(data.earnVals.sh0) + num(data.earnVals.sh1) + num(data.earnVals.sh2) +
      num(data.earnVals.calc1314) + num(data.earnVals.vac);
    const earnings = structuredEarnings + sumRows(data.extras);
    const deductions = sumVals(data.dedVals) + sumRows(data.extraDeductions);
    const contributions = sumVals(data.contribVals) + sumRows(data.extraContrib);
    const net = earnings - deductions;
    const cost = earnings + contributions;
    return { earnings, deductions, contributions, net, cost };
  }, [data]);

  const goPrev = () => onSelect?.(list[(idx - 1 + list.length) % list.length]);
  const goNext = () => onSelect?.(list[(idx + 1) % list.length]);

  const setEarn = (key: keyof EarnVals, v: string) =>
    setData((d) => ({ ...d, earnVals: { ...d.earnVals, [key]: v } }));

  // Earnings rows: [label, rateKey (or null), amtKey]
  const earnGroups: { title: string; rows: [string, keyof EarnVals | null, keyof EarnVals, string?][] }[] = [
    { title: "Basic Salary", rows: [
      ["Salary", "salaryRate", "salary"],
      ["C.O.L.A.", null, "cola"],
      ["Time off", "timeoffRate", "timeoff"],
    ] },
    { title: "Overtime", rows: [
      ["1.00 ×", "ot1Rate", "ot1"],
      ["1.50 ×", "ot15Rate", "ot15"],
      ["2.00 ×", "ot2Rate", "ot2"],
    ] },
    { title: "Shift", rows: [
      ["0.00 ×", "sh0Rate", "sh0", "shift-0"],
      ["0.00 ×", "sh1Rate", "sh1", "shift-1"],
      ["0.00 ×", "sh2Rate", "sh2", "shift-2"],
    ] },
    { title: "Other Calculations", rows: [
      ["13th / 14th", null, "calc1314"],
      ["Vacations", "vacRate", "vac"],
    ] },
  ];

  const summaryCells: { label: string; value: string; accent?: string }[] = [
    { label: "Currency", value: "EUR" },
    { label: "Earnings", value: "€" + fmt(summary.earnings) },
    { label: "Deductions", value: "€" + fmt(summary.deductions), accent: "text-red-600" },
    { label: "Contributions", value: "€" + fmt(summary.contributions) },
    { label: "Employer Cost", value: "€" + fmt(summary.cost) },
    { label: "Net Pay", value: "€" + fmt(summary.net), accent: "text-[#0F50DB]" },
  ];

  return (
    <section className="mt-5 overflow-hidden rounded-xl bg-[var(--dash-card,#fff)] shadow-sm ring-1 ring-gray-100">
      {/* General Information header */}
      <div className="border-b border-gray-100 px-6 py-5">
        <div className="mb-4 flex flex-wrap items-center gap-3.5">
          {!hideBack && onBack && (
            <button
              type="button" onClick={onBack} aria-label="Back to batch"
              className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></svg>
            </button>
          )}
          <span
            style={{ background: e.color }}
            className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
          >
            {e.avatar}
          </span>
          <div className="min-w-[180px] flex-1">
            <h2 className="text-[19px] font-bold text-[#0E1620]">{e.name}</h2>
            <p className="mt-0.5 text-[13px] text-gray-500">
              {e.department} · EMP-{1000 + Number(e.id || 0)}
              {batchRef && batchRef !== "CONFIG" ? ` · Ref No ${batchRef}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setEditMode((m) => { const n = !m; notify(n ? "Editing amounts enabled" : "Amounts locked"); return n; })}
              className={cn(
                "inline-flex h-[38px] items-center gap-2 rounded-lg border border-[#0F50DB] px-4 text-[13.5px] font-semibold",
                editMode ? "bg-[#0F50DB] text-white" : "bg-white text-[#0F50DB]"
              )}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
              {editMode ? "Done editing" : "Edit amounts"}
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          {summaryCells.map((c) => (
            <div key={c.label} className="min-w-[96px]">
              <div className="mb-1 text-[11.5px] text-gray-400">{c.label}</div>
              <div className={cn(
                "flex h-[38px] items-center justify-end rounded-lg border border-gray-100 bg-gray-50 px-3 font-mono text-sm font-bold",
                c.accent ?? "text-[#0E1620]"
              )}>
                {c.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-gray-100 px-6 pt-3">
        {TABS.map((t) => (
          <button
            key={t} type="button" onClick={() => setTab(t)}
            className={cn(
              "-mb-px h-[38px] border-b-2 px-4 text-sm font-semibold",
              tab === t ? "border-[#0F50DB] text-[#0F50DB]" : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="p-6">
        {tab === "Earnings" && (
          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(300px,360px)_minmax(0,1fr)]">
            <div className="flex flex-col gap-3.5">
              <div className="flex justify-end gap-2 pr-0.5">
                <span className="w-[90px] text-center text-[11px] font-semibold text-gray-400">Rate / hrs</span>
                <span className="w-[90px] text-center text-[11px] font-semibold text-gray-400">Amount</span>
              </div>
              {earnGroups.map((g) => (
                <fieldset key={g.title} className="m-0 rounded-xl border border-gray-200 px-3.5 pb-3 pt-2">
                  <legend className="px-1.5 text-xs font-bold text-[#0E1620]">{g.title}</legend>
                  {g.rows.map(([label, rateKey, amtKey, uid]) => (
                    <div key={uid ?? label} className="flex items-center justify-between gap-2.5 py-[5px]">
                      <span className="text-[13px] text-gray-700">{label}</span>
                      <div className="flex gap-2">
                        {rateKey == null
                          ? <div className="w-[90px]" />
                          : <AmountField value={data.earnVals[rateKey]} onChange={(v) => setEarn(rateKey, v)} editMode={editMode} width={90} />}
                        <AmountField value={data.earnVals[amtKey]} onChange={(v) => setEarn(amtKey, v)} editMode={editMode} width={90} muted />
                      </div>
                    </div>
                  ))}
                </fieldset>
              ))}
            </div>

            <ExtraTable
              rows={data.extras}
              onRows={(fn) => setData((d) => ({ ...d, extras: fn(d.extras) }))}
              addLabel="Add extra earning"
              onAdd={() => setExtraModal(true)}
            />
          </div>
        )}

        {tab === "Deductions" && (
          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(300px,360px)_minmax(0,1fr)]">
            <fieldset className="m-0 rounded-xl border border-gray-200 px-3.5 pb-3 pt-2">
              <legend className="px-1.5 text-xs font-bold text-[#0E1620]">Deductions</legend>
              <div className="mb-1 flex justify-end pr-0.5">
                <span className="w-[110px] text-center text-[11px] font-semibold text-gray-400">Amount</span>
              </div>
              {DEDUCTION_LABELS.map((label) => (
                <div key={label} className="flex items-center justify-between gap-3 py-1.5">
                  <span className="text-[13px] text-gray-700">{label}</span>
                  <AmountField
                    value={data.dedVals[label] ?? "0.00"} editMode={editMode}
                    onChange={(v) => setData((d) => ({ ...d, dedVals: { ...d.dedVals, [label]: v } }))}
                  />
                </div>
              ))}
            </fieldset>
            <ExtraTable
              rows={data.extraDeductions}
              onRows={(fn) => setData((d) => ({ ...d, extraDeductions: fn(d.extraDeductions) }))}
              addLabel="Add deduction"
              onAdd={() => setData((d) => ({ ...d, extraDeductions: [...d.extraDeductions, { desc: "", amount: "" }] }))}
            />
          </div>
        )}

        {tab === "Contributions" && (
          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(300px,360px)_minmax(0,1fr)]">
            <fieldset className="m-0 rounded-xl border border-gray-200 px-3.5 pb-3 pt-2">
              <legend className="px-1.5 text-xs font-bold text-[#0E1620]">Employer Contributions</legend>
              <div className="mb-1 flex justify-end pr-0.5">
                <span className="w-[110px] text-center text-[11px] font-semibold text-gray-400">Amount</span>
              </div>
              {CONTRIBUTION_LABELS.map((label) => (
                <div key={label} className="flex items-center justify-between gap-3 py-1.5">
                  <span className="text-[13px] text-gray-700">{label}</span>
                  <AmountField
                    value={data.contribVals[label] ?? "0.00"} editMode={editMode}
                    onChange={(v) => setData((d) => ({ ...d, contribVals: { ...d.contribVals, [label]: v } }))}
                  />
                </div>
              ))}
            </fieldset>
            <ExtraTable
              rows={data.extraContrib}
              onRows={(fn) => setData((d) => ({ ...d, extraContrib: fn(d.extraContrib) }))}
              addLabel="Add contribution"
              onAdd={() => setData((d) => ({ ...d, extraContrib: [...d.extraContrib, { desc: "", amount: "" }] }))}
            />
          </div>
        )}

        {tab === "Other" && (
          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
            <div>
              <label className="mb-2 block text-[13px] font-semibold text-[#0E1620]">Payslip Note</label>
              <textarea
                value={data.payslipNote}
                onChange={(ev) => setData((d) => ({ ...d, payslipNote: ev.target.value }))}
                placeholder="Add a note that will appear on this employee's payslip…"
                className="min-h-[360px] w-full resize-y rounded-xl border border-gray-200 px-3.5 py-3 text-[13.5px] leading-relaxed text-[#0E1620] outline-none focus:border-[#0F50DB]"
              />
            </div>
            <ExtraTable
              rows={data.otherRows}
              onRows={(fn) => setData((d) => ({ ...d, otherRows: fn(d.otherRows) }))}
              addLabel="Add item"
              onAdd={() => setData((d) => ({ ...d, otherRows: [...d.otherRows, { desc: "", amount: "" }] }))}
            />
          </div>
        )}

        {tab === "Vacations" && (
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[820px] border-collapse">
              <thead>
                <tr>
                  {["Reference", "Date", "Description", "Approved", "Note", "Hours"].map((h, i) => (
                    <th key={h} className={cn(
                      "whitespace-nowrap border-b border-gray-200 px-3.5 py-2.5 text-[11.5px] font-semibold uppercase tracking-wide text-gray-400",
                      i === 5 ? "text-right" : "text-left"
                    )}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(!leave || leave.length === 0) ? (
                  <tr><td colSpan={6} className="px-3.5 py-3 text-center text-[13.5px] text-gray-400 border-b border-gray-200">No vacation records for this employee.</td></tr>
                ) : leave.map((v) => {
                  const approved = v.status === "Approved";
                  return (
                    <tr key={v.ref}>
                      <td className="whitespace-nowrap border-b border-gray-200 px-3.5 py-3 align-top font-mono text-[13.5px] font-semibold text-[#0E1620]">{v.ref}</td>
                      <td className="whitespace-nowrap border-b border-gray-200 px-3.5 py-3 align-top text-[13.5px] text-gray-700">{v.from} – {v.to}</td>
                      <td className="min-w-[150px] border-b border-gray-200 px-3.5 py-3 align-top text-[13.5px] font-medium text-[#0E1620]">{v.description}</td>
                      <td className="border-b border-gray-200 px-3.5 py-3 align-top">
                        <span className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold",
                          approved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                        )}>{v.status || "Pending"}</span>
                      </td>
                      <td className="min-w-[180px] border-b border-gray-200 px-3.5 py-3 align-top text-[13.5px] text-gray-500">{v.note || "—"}</td>
                      <td className="whitespace-nowrap border-b border-gray-200 px-3.5 py-3 text-right align-top font-mono text-[13.5px] text-gray-700">{v.hours}h</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Extra Earnings modal */}
      {extraModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-6" onClick={() => setExtraModal(false)}>
          <div className="w-full max-w-[380px] rounded-2xl bg-white p-6 shadow-xl" onClick={(ev) => ev.stopPropagation()}>
            <h3 className="mb-3.5 text-base font-bold text-[#0E1620]">Extra Earnings</h3>
            <fieldset className="m-0 rounded-xl border border-gray-200 px-3.5 pb-3.5 pt-2">
              <legend className="px-1.5 text-xs font-bold text-[#0E1620]">No Social Insurance Contributions</legend>
              <div className="flex flex-col gap-2.5">
                {EXTRA_EARNING_LABELS.map((label) => (
                  <div key={label} className="flex items-center justify-between gap-3">
                    <span className="text-[13px] text-gray-700">{label}</span>
                    <input
                      type="number" min="0" step="0.01" value={extraVals[label]}
                      onChange={(ev) => setExtraVals((v) => ({ ...v, [label]: ev.target.value }))}
                      className="h-[34px] w-[110px] rounded-lg border border-gray-200 px-2.5 text-right font-mono text-[13px] text-[#0E1620] outline-none"
                    />
                  </div>
                ))}
              </div>
            </fieldset>
            <div className="mt-4 flex justify-end gap-2.5">
              <button
                type="button" onClick={() => setExtraModal(false)}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >Cancel</button>
              <button
                type="button"
                onClick={() => {
                  const add = Object.entries(extraVals)
                    .filter(([, v]) => Number(v) > 0)
                    .map(([k, v]) => ({ desc: k, amount: Number(v).toFixed(2) }));
                  if (add.length) setData((d) => ({ ...d, extras: [...d.extras, ...add] }));
                  setExtraVals({ Notice: "0.00", Vacations: "0.00", "Bonus / Ex-gratia": "0.00", "Benefit in Kind": "0.00" });
                  setExtraModal(false);
                }}
                className="rounded-lg bg-[#0F50DB] px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-6 py-4">
        {!hideBack && onBack ? (
          <button
            type="button" onClick={onBack}
            className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >Back to batch</button>
        ) : <span />}
        <div className="flex flex-wrap items-center gap-2.5">
          {onToggleLock && (
            <button
              type="button" onClick={onToggleLock} title={locked ? "Unlock this employee" : "Lock this employee"}
              className={cn(
                "inline-flex h-10 items-center gap-1.5 rounded-lg px-4 text-sm font-semibold",
                locked ? "bg-emerald-100 text-emerald-700" : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              )}
            >
              {locked ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" /></svg>
              )}
              {locked ? "Locked" : "Lock employee"}
            </button>
          )}
          <button
            type="button" onClick={goPrev}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            Previous
          </button>
          <span className="text-[13.5px] font-semibold text-gray-500">{idx + 1} of {list.length}</span>
          <button
            type="button" onClick={goNext}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Next
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
          </button>
          <span className={cn(
            "inline-flex items-center gap-1.5 text-[12.5px] font-semibold",
            saveState === "saving" ? "text-gray-400" : "text-emerald-600"
          )}>
            {saveState === "saving" ? (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                Saving…
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                All changes saved
              </>
            )}
          </span>
          <button
            type="button" onClick={manualSave}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0F50DB] px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
            Save
          </button>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-[1100] inline-flex items-center gap-2.5 rounded-xl bg-[#0E1620] px-4.5 py-3 text-[13.5px] font-semibold text-white shadow-xl">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          {toast}
        </div>
      )}
    </section>
  );
}

// ─── Shared employee-derivation helper (Cyprus rates) ─────────────────────────

/** Cyprus employee deduction rates, mirrored from the design source. */
const DERIVE_RATES = { incomeTax: 0.2, social: 0.08, health: 0.02 };
const PALETTE = ["#F97316", "#3B82F6", "#8B5CF6", "#EC4899", "#14B8A6", "#6366F1", "#22C55E", "#F59E0B"];

/** Build a {@link PayslipEmployee} from a minimal source (name, department, salary). */
export function derivePayslipEmployee(
  src: { id: number; name: string; department?: string | null; salary: number; currency?: string },
  index = 0,
): PayslipEmployee {
  const gross = src.salary;
  const incomeTax = gross * DERIVE_RATES.incomeTax;
  const social = gross * DERIVE_RATES.social;
  const health = gross * DERIVE_RATES.health;
  const deductions = incomeTax + social + health;
  return {
    id: src.id,
    name: src.name,
    department: src.department || "—",
    avatar: (src.name || "?").charAt(0).toUpperCase(),
    color: PALETTE[index % PALETTE.length],
    currency: src.currency || "EUR",
    salary: src.salary,
    gross,
    incomeTax, social, health,
    deductions,
    net: gross - deductions,
  };
}
