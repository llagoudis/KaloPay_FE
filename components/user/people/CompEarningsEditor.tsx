"use client";

import { useState, useEffect, useRef, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

type CustomFieldCategory = "Earnings" | "Deductions" | "Contributions" | "Other";

type CustomFieldRow = { desc: string; amount: string };

type LoanRow = { date: string; desc: string; amount: string };

type VacationRow = { band: string; from: string; to: string };

type LeaveName =
  | "Sick Leave"
  | "Maternity Leave"
  | "Parental Leave"
  | "Army Leave"
  | "Study Leave"
  | "Force Majeure Leave"
  | "Unpaid Leave";

type CompForm = {
  // Earnings
  salary: string;
  workingHours: string;
  cola: boolean;
  daysPerWeek: string;
  hoursPerDay: string;
  s13: string;
  s14: string;
  sOther: string;
  paymentMethod: "Bank" | "Crypto" | "Both";
  advance: boolean;
  // Funds
  siContrib: boolean;
  siCategory: string;
  siLeaveRate: string;
  medEmpAmt: string;
  medEmpPct: string;
  medErAmt: string;
  medErPct: string;
  pfProvider: string;
  pfMemberId: string;
  pfUseDefaults: boolean;
  pfEmpAmt: string;
  pfEmpPct: string;
  pfErAmt: string;
  pfErPct: string;
  // Union
  unionName: string;
  unionTown: string;
  stampHolidays: string;
  stampIllness: boolean;
  stampAssistance: boolean;
  subContributes: boolean;
  subOther: string;
  umedEmpAmt: string;
  umedEmpPct: string;
  umedErAmt: string;
  umedErPct: string;
  // Taxation
  taxMethod: "Auto" | "Manual" | "Exempt";
  taxManual: string;
  taxAddIncome: string;
  taxOfficer: boolean;
  // Custom Fields
  cfCat: CustomFieldCategory;
  cfSel: number;
  cfRows: Record<CustomFieldCategory, CustomFieldRow[]>;
  // Loan
  loanYear: string;
  loanInstallment: string;
  loanAutoStop: boolean;
  loanRows: LoanRow[];
  loanSel: number;
  // Vacations
  vacBand: string;
  vacRows: VacationRow[];
  leaveToggles: Record<LeaveName, boolean>;
  // Other
  payslipNote: string;
  employmentMemo: string;
};

type NumericValueKey = {
  [K in keyof CompForm]: CompForm[K] extends string ? K : never;
}[keyof CompForm];

type TabName =
  | "Earnings"
  | "Funds"
  | "Union"
  | "Taxation"
  | "Custom Fields"
  | "Loan"
  | "Vacations"
  | "Other";

/* -------------------------------------------------------------------------- */
/* Defaults                                                                    */
/* -------------------------------------------------------------------------- */

const LEAVE_NAMES: LeaveName[] = [
  "Sick Leave",
  "Maternity Leave",
  "Parental Leave",
  "Army Leave",
  "Study Leave",
  "Force Majeure Leave",
  "Unpaid Leave",
];

const CF_CATS: CustomFieldCategory[] = [
  "Earnings",
  "Deductions",
  "Contributions",
  "Other",
];

const TABS: TabName[] = [
  "Earnings",
  "Funds",
  "Union",
  "Taxation",
  "Custom Fields",
  "Loan",
  "Vacations",
  "Other",
];

const DEFAULT_FORM: CompForm = {
  salary: "3000.00",
  workingHours: "173.00",
  cola: false,
  daysPerWeek: "5",
  hoursPerDay: "8.00",
  s13: "0.00",
  s14: "0.00",
  sOther: "0.00",
  paymentMethod: "Bank",
  advance: false,
  siContrib: true,
  siCategory: "M1orM2",
  siLeaveRate: "None",
  medEmpAmt: "0.00",
  medEmpPct: "0.00",
  medErAmt: "0.00",
  medErPct: "0.00",
  pfProvider: "Unknown",
  pfMemberId: "",
  pfUseDefaults: false,
  pfEmpAmt: "0.00",
  pfEmpPct: "0.00",
  pfErAmt: "0.00",
  pfErPct: "0.00",
  unionName: "None",
  unionTown: "None",
  stampHolidays: "None",
  stampIllness: false,
  stampAssistance: false,
  subContributes: false,
  subOther: "0.00",
  umedEmpAmt: "0.00",
  umedEmpPct: "0.00",
  umedErAmt: "0.00",
  umedErPct: "0.00",
  taxMethod: "Auto",
  taxManual: "0.00",
  taxAddIncome: "0.00",
  taxOfficer: false,
  cfCat: "Earnings",
  cfSel: 0,
  cfRows: {
    Earnings: [{ desc: "Travel allowance", amount: "100.00" }],
    Deductions: [],
    Contributions: [],
    Other: [],
  },
  loanYear: "2026",
  loanInstallment: "0.00",
  loanAutoStop: true,
  loanRows: [],
  loanSel: 0,
  vacBand: "",
  vacRows: [],
  leaveToggles: {
    "Sick Leave": true,
    "Maternity Leave": false,
    "Parental Leave": true,
    "Army Leave": true,
    "Study Leave": false,
    "Force Majeure Leave": false,
    "Unpaid Leave": true,
  },
  payslipNote: "",
  employmentMemo: "",
};

/* -------------------------------------------------------------------------- */
/* Small presentational helpers                                                */
/* -------------------------------------------------------------------------- */

const INPUT_CLS =
  "h-9 w-[150px] rounded-lg border border-gray-200 bg-white px-3 text-right text-sm text-[#0E1620] outline-none focus:border-[#0F50DB] focus:ring-1 focus:ring-[#0F50DB]";
const SELECT_CLS =
  "h-9 w-[150px] cursor-pointer rounded-lg border border-gray-200 bg-white px-3 text-left text-sm text-[#0E1620] outline-none focus:border-[#0F50DB] focus:ring-1 focus:ring-[#0F50DB]";
const ROW_CLS = "flex items-center justify-between gap-4 py-[7px]";
const LBL_CLS = "text-sm text-gray-600";
const HEAD_CELL_CLS =
  "px-3.5 py-2.5 text-[11.5px] font-semibold uppercase tracking-wide text-gray-400";

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="m-0 rounded-xl border border-gray-100 px-4 pb-3.5 pt-2">
      <legend className="px-1.5 text-xs font-bold text-[#0E1620]">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function Toggle({
  value,
  onClick,
  label = "Toggle",
}: {
  value: boolean;
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={value}
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center rounded-full",
        value ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
      )}
    >
      {value ? (
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      )}
    </button>
  );
}

function Select({
  value,
  onChange,
  options,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(SELECT_CLS, className)}
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function PlusIcon() {
  return (
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
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* Main component                                                              */
/* -------------------------------------------------------------------------- */

export default function CompEarningsEditor({
  empNo,
  embedded = false,
  storeKeyOverride,
}: {
  empNo?: string;
  embedded?: boolean;
  storeKeyOverride?: string;
}) {
  const storeKey = storeKeyOverride || `kp-comp-${empNo || "default"}`;

  const [tab, setTab] = useState<TabName>("Earnings");
  const [form, setForm] = useState<CompForm>(DEFAULT_FORM);
  const [savedSnap, setSavedSnap] = useState<string>(() =>
    JSON.stringify(DEFAULT_FORM)
  );
  const [status, setStatus] = useState<"saved" | "saving">("saved");
  const hydratedRef = useRef(false);
  const firstRunRef = useRef(true);

  // Hydrate from localStorage once on mount (client only).
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(storeKey);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<CompForm>;
        const merged: CompForm = {
          ...DEFAULT_FORM,
          ...saved,
          cfRows: { ...DEFAULT_FORM.cfRows, ...(saved.cfRows ?? {}) },
          leaveToggles: {
            ...DEFAULT_FORM.leaveToggles,
            ...(saved.leaveToggles ?? {}),
          },
        };
        setForm(merged);
        setSavedSnap(JSON.stringify(merged));
      }
    } catch {
      /* ignore corrupt storage */
    }
    hydratedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeKey]);

  // Debounced autosave (~700ms) after the first render / hydration.
  useEffect(() => {
    if (firstRunRef.current) {
      firstRunRef.current = false;
      return;
    }
    if (!hydratedRef.current || typeof window === "undefined") return;
    const snap = JSON.stringify(form);
    if (snap === savedSnap) {
      setStatus("saved");
      return;
    }
    setStatus("saving");
    const t = setTimeout(() => {
      try {
        window.localStorage.setItem(storeKey, snap);
        setSavedSnap(snap);
        setStatus("saved");
      } catch {
        /* storage full / unavailable */
      }
    }, 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, storeKey]);

  const dirty = JSON.stringify(form) !== savedSnap;

  function set<K extends keyof CompForm>(key: K, value: CompForm[K]) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  function handleSave() {
    if (typeof window === "undefined") return;
    const snap = JSON.stringify(form);
    try {
      window.localStorage.setItem(storeKey, snap);
    } catch {
      /* ignore */
    }
    setSavedSnap(snap);
    setStatus("saved");
  }

  function handleReset() {
    setForm(DEFAULT_FORM);
  }

  /* --- reusable numeric input bound to a form key --- */
  const numInput = (key: NumericValueKey, extra?: string) => (
    <input
      value={form[key]}
      onChange={(e) => set(key, e.target.value)}
      className={cn(INPUT_CLS, extra)}
    />
  );

  /* --- Amount / % table (Medical Fund, Provident Fund, Union Medical) --- */
  const pctTable = (rows: [string, NumericValueKey, NumericValueKey][]) => (
    <div>
      <div className="mb-1.5 grid grid-cols-[86px_1fr_1fr] gap-2.5">
        <span />
        <span className="text-center text-[11.5px] font-semibold text-gray-400">
          Amount
        </span>
        <span className="text-center text-[11.5px] font-semibold text-gray-400">
          %
        </span>
      </div>
      {rows.map(([label, aKey, pKey]) => (
        <div
          key={label}
          className="grid grid-cols-[86px_1fr_1fr] items-center gap-2.5 py-1"
        >
          <span className={LBL_CLS}>{label}</span>
          {numInput(aKey, "w-full")}
          {numInput(pKey, "w-full")}
        </div>
      ))}
    </div>
  );

  /* ------------------------------------------------------------------ */
  /* Tab bodies                                                          */
  /* ------------------------------------------------------------------ */

  const body = (() => {
    switch (tab) {
      case "Earnings":
        return (
          <div className="grid grid-cols-1 items-start gap-[22px] md:grid-cols-2">
            <Group title="Earning Details">
              <div>
                <div className={ROW_CLS}>
                  <span className={LBL_CLS}>Salary</span>
                  {numInput("salary")}
                </div>
                <div className={ROW_CLS}>
                  <span className={LBL_CLS}>Working Hours</span>
                  {numInput("workingHours")}
                </div>
                <div className={ROW_CLS}>
                  <span className={LBL_CLS}>COLA</span>
                  <Toggle
                    value={form.cola}
                    onClick={() => set("cola", !form.cola)}
                    label="Toggle COLA"
                  />
                </div>
                <div className={ROW_CLS}>
                  <span className={LBL_CLS}>Days per week</span>
                  <input
                    type="number"
                    min="0"
                    value={form.daysPerWeek}
                    onChange={(e) => set("daysPerWeek", e.target.value)}
                    className={INPUT_CLS}
                  />
                </div>
                <div className={ROW_CLS}>
                  <span className={LBL_CLS}>Hours per day</span>
                  {numInput("hoursPerDay")}
                </div>
              </div>
            </Group>
            <div className="flex flex-col gap-[18px]">
              <Group title="Other Details">
                <div>
                  <div className={ROW_CLS}>
                    <span className={LBL_CLS}>13th Salaries</span>
                    {numInput("s13")}
                  </div>
                  <div className={ROW_CLS}>
                    <span className={LBL_CLS}>14th Salaries</span>
                    {numInput("s14")}
                  </div>
                  <div className={ROW_CLS}>
                    <span className={LBL_CLS}>Other Salaries</span>
                    {numInput("sOther")}
                  </div>
                </div>
              </Group>
              <Group title="Payment Method">
                <div className={ROW_CLS}>
                  <span className={LBL_CLS}>Payment Method</span>
                  <Select
                    value={form.paymentMethod}
                    onChange={(v) =>
                      set("paymentMethod", v as CompForm["paymentMethod"])
                    }
                    options={["Bank", "Crypto", "Both"]}
                  />
                </div>
              </Group>
            </div>
          </div>
        );

      case "Funds":
        return (
          <div className="grid grid-cols-1 items-start gap-[22px] md:grid-cols-2">
            <div className="flex flex-col gap-[18px]">
              <Group title="Social Insurance">
                <div>
                  <div className={ROW_CLS}>
                    <span className={LBL_CLS}>Contributions</span>
                    <Toggle
                      value={form.siContrib}
                      onClick={() => set("siContrib", !form.siContrib)}
                    />
                  </div>
                  <div className={ROW_CLS}>
                    <span className={LBL_CLS}>Category</span>
                    <Select
                      value={form.siCategory}
                      onChange={(v) => set("siCategory", v)}
                      options={["M1orM2", "M1", "M2", "M3", "Self-employed"]}
                    />
                  </div>
                  <div className={ROW_CLS}>
                    <span className={LBL_CLS}>Annual Leave Rate</span>
                    <Select
                      value={form.siLeaveRate}
                      onChange={(v) => set("siLeaveRate", v)}
                      options={["None", "Weekly", "Monthly", "Annual"]}
                    />
                  </div>
                </div>
              </Group>
              <Group title="Medical Fund">
                {pctTable([
                  ["Employee", "medEmpAmt", "medEmpPct"],
                  ["Employer", "medErAmt", "medErPct"],
                ])}
              </Group>
            </div>
            <Group title="Provident Fund">
              <div>
                <div className="flex items-center gap-2 py-[7px]">
                  <Select
                    value={form.pfProvider}
                    onChange={(v) => set("pfProvider", v)}
                    options={[
                      "Unknown",
                      "KaloPay Provident Plan",
                      "Company Scheme A",
                      "Company Scheme B",
                    ]}
                  />
                  <button
                    type="button"
                    aria-label="Browse"
                    className="h-9 w-9 flex-shrink-0 rounded-lg border border-gray-200 bg-white font-bold text-gray-500"
                  >
                    …
                  </button>
                </div>
                <div className={ROW_CLS}>
                  <span className={LBL_CLS}>Member ID</span>
                  <input
                    value={form.pfMemberId}
                    onChange={(e) => set("pfMemberId", e.target.value)}
                    placeholder="Enter member ID"
                    className={cn(INPUT_CLS, "text-left")}
                  />
                </div>
                <div className={ROW_CLS}>
                  <span className={LBL_CLS}>Use defaults</span>
                  <Toggle
                    value={form.pfUseDefaults}
                    onClick={() => set("pfUseDefaults", !form.pfUseDefaults)}
                  />
                </div>
                <div className="mt-2">
                  {pctTable([
                    ["Employee", "pfEmpAmt", "pfEmpPct"],
                    ["Employer", "pfErAmt", "pfErPct"],
                  ])}
                </div>
              </div>
            </Group>
          </div>
        );

      case "Union":
        return (
          <div className="grid grid-cols-1 items-start gap-[22px] md:grid-cols-2">
            <div className="flex flex-col gap-[18px]">
              <Group title="Union Details">
                <div>
                  <div className={ROW_CLS}>
                    <span className={LBL_CLS}>Union</span>
                    <div className="flex gap-2">
                      <Select
                        value={form.unionName}
                        onChange={(v) => set("unionName", v)}
                        options={["None", "PEO", "SEK", "DEOK", "Other"]}
                      />
                      <button
                        type="button"
                        aria-label="Browse"
                        className="h-9 w-9 flex-shrink-0 rounded-lg border border-gray-200 bg-white font-bold text-gray-500"
                      >
                        …
                      </button>
                    </div>
                  </div>
                  <div className={ROW_CLS}>
                    <span className={LBL_CLS}>Town</span>
                    <div className="flex gap-2">
                      <Select
                        value={form.unionTown}
                        onChange={(v) => set("unionTown", v)}
                        options={[
                          "None",
                          "Nicosia",
                          "Limassol",
                          "Larnaca",
                          "Paphos",
                        ]}
                      />
                      <button
                        type="button"
                        aria-label="Browse"
                        className="h-9 w-9 flex-shrink-0 rounded-lg border border-gray-200 bg-white font-bold text-gray-500"
                      >
                        …
                      </button>
                    </div>
                  </div>
                </div>
              </Group>
              <Group title="Stamps">
                <div>
                  <div className={ROW_CLS}>
                    <span className={LBL_CLS}>Holidays</span>
                    <Select
                      value={form.stampHolidays}
                      onChange={(v) => set("stampHolidays", v)}
                      options={["None", "Weekly", "Monthly", "Annual"]}
                    />
                  </div>
                  <div className={ROW_CLS}>
                    <span className={LBL_CLS}>Illness</span>
                    <Toggle
                      value={form.stampIllness}
                      onClick={() => set("stampIllness", !form.stampIllness)}
                    />
                  </div>
                  <div className={ROW_CLS}>
                    <span className={LBL_CLS}>Assistance</span>
                    <Toggle
                      value={form.stampAssistance}
                      onClick={() =>
                        set("stampAssistance", !form.stampAssistance)
                      }
                    />
                  </div>
                </div>
              </Group>
            </div>
            <div className="flex flex-col gap-[18px]">
              <Group title="Subscription">
                <div>
                  <div className={ROW_CLS}>
                    <span className={LBL_CLS}>Contributes</span>
                    <Toggle
                      value={form.subContributes}
                      onClick={() =>
                        set("subContributes", !form.subContributes)
                      }
                    />
                  </div>
                  <div className={ROW_CLS}>
                    <span className={LBL_CLS}>Other</span>
                    {numInput("subOther")}
                  </div>
                </div>
              </Group>
              <Group title="Medical Fund">
                {pctTable([
                  ["Employee", "umedEmpAmt", "umedEmpPct"],
                  ["Employer", "umedErAmt", "umedErPct"],
                ])}
              </Group>
            </div>
          </div>
        );

      case "Taxation":
        return (
          <div className="max-w-[420px]">
            <Group title="Tax">
              <div>
                <div className={ROW_CLS}>
                  <span className={LBL_CLS}>Method</span>
                  <Select
                    value={form.taxMethod}
                    onChange={(v) =>
                      set("taxMethod", v as CompForm["taxMethod"])
                    }
                    options={["Auto", "Manual", "Exempt"]}
                  />
                </div>
                <div className={ROW_CLS}>
                  <span className={LBL_CLS}>Manual Deduction</span>
                  <input
                    value={form.taxManual}
                    onChange={(e) => set("taxManual", e.target.value)}
                    disabled={form.taxMethod === "Auto"}
                    className={cn(
                      INPUT_CLS,
                      form.taxMethod === "Auto" &&
                        "cursor-not-allowed bg-gray-50 text-gray-400"
                    )}
                  />
                </div>
                <div className={ROW_CLS}>
                  <span className={LBL_CLS}>Add. Tax. Income</span>
                  {numInput("taxAddIncome")}
                </div>
                <div className={ROW_CLS}>
                  <span className={LBL_CLS}>Officer</span>
                  <Toggle
                    value={form.taxOfficer}
                    onClick={() => set("taxOfficer", !form.taxOfficer)}
                  />
                </div>
              </div>
            </Group>
          </div>
        );

      case "Custom Fields": {
        const rows = form.cfRows[form.cfCat];
        return (
          <div className="grid grid-cols-1 items-start gap-[22px] md:grid-cols-[200px_minmax(0,1fr)]">
            <div className="flex flex-col gap-[18px]">
              <div className="flex flex-col gap-1">
                {CF_CATS.map((c) => (
                  <label
                    key={c}
                    className="flex cursor-pointer items-center gap-2.5 px-1.5 py-2 text-sm text-gray-600"
                  >
                    <input
                      type="radio"
                      name="cfcat"
                      checked={form.cfCat === c}
                      onChange={() =>
                        setForm((s) => ({ ...s, cfCat: c, cfSel: 0 }))
                      }
                      className="h-4 w-4 accent-[#0F50DB]"
                    />
                    {c}
                  </label>
                ))}
              </div>
              <fieldset className="m-0 rounded-xl border border-gray-100 px-3.5 pb-3.5 pt-2.5">
                <legend className="px-1.5 text-xs font-bold text-[#0E1620]">
                  Actions
                </legend>
                <div className="flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      setForm((s) => {
                        const next = s.cfRows[s.cfCat].concat({
                          desc: "",
                          amount: "0.00",
                        });
                        return {
                          ...s,
                          cfRows: { ...s.cfRows, [s.cfCat]: next },
                          cfSel: next.length - 1,
                        };
                      })
                    }
                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-[#0F50DB]"
                  >
                    <PlusIcon />
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((s) => {
                        const next = s.cfRows[s.cfCat].filter(
                          (_, i) => i !== s.cfSel
                        );
                        return {
                          ...s,
                          cfRows: { ...s.cfRows, [s.cfCat]: next },
                          cfSel: 0,
                        };
                      })
                    }
                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-600"
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
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Remove
                  </button>
                </div>
              </fieldset>
            </div>
            <div className="min-h-[320px] overflow-hidden rounded-xl border border-gray-100">
              <div className="grid grid-cols-[1fr_150px] border-b border-gray-100 bg-gray-50">
                <div className={HEAD_CELL_CLS}>Description</div>
                <div className={cn(HEAD_CELL_CLS, "text-right")}>
                  Default Amount
                </div>
              </div>
              {rows.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-400">
                  No custom {form.cfCat.toLowerCase()} fields. Use Add to create
                  one.
                </div>
              ) : (
                rows.map((row, i) => (
                  <div
                    key={i}
                    onClick={() => set("cfSel", i)}
                    className={cn(
                      "grid cursor-pointer grid-cols-[1fr_150px] items-center border-b border-gray-100",
                      form.cfSel === i && "bg-[#0F50DB]/5"
                    )}
                  >
                    <input
                      value={row.desc}
                      placeholder="Description"
                      onChange={(ev) =>
                        setForm((s) => ({
                          ...s,
                          cfRows: {
                            ...s.cfRows,
                            [s.cfCat]: s.cfRows[s.cfCat].map((x, j) =>
                              j === i ? { ...x, desc: ev.target.value } : x
                            ),
                          },
                        }))
                      }
                      className="border-none bg-transparent px-3.5 py-3 text-sm font-medium text-[#0E1620] outline-none"
                    />
                    <input
                      value={row.amount}
                      placeholder="0.00"
                      onChange={(ev) =>
                        setForm((s) => ({
                          ...s,
                          cfRows: {
                            ...s.cfRows,
                            [s.cfCat]: s.cfRows[s.cfCat].map((x, j) =>
                              j === i ? { ...x, amount: ev.target.value } : x
                            ),
                          },
                        }))
                      }
                      className="border-none bg-transparent px-3.5 py-3 text-right text-sm text-[#0E1620] outline-none"
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        );
      }

      case "Loan": {
        const total = form.loanRows
          .reduce((s, r) => s + (Number(r.amount) || 0), 0)
          .toFixed(2);
        return (
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2.5">
                <span className={LBL_CLS}>Year of Interest</span>
                <input
                  type="number"
                  value={form.loanYear}
                  onChange={(e) => set("loanYear", e.target.value)}
                  className={cn(INPUT_CLS, "w-[110px]")}
                />
              </div>
              <div className="flex items-center gap-2.5">
                <span className={LBL_CLS}>Loan default installment</span>
                {numInput("loanInstallment")}
              </div>
              <div className="flex items-center gap-2.5">
                <span className={LBL_CLS}>Auto Stop</span>
                <Toggle
                  value={form.loanAutoStop}
                  onClick={() => set("loanAutoStop", !form.loanAutoStop)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-[minmax(0,1fr)_140px]">
              <div className="flex min-h-[300px] flex-col overflow-hidden rounded-xl border border-gray-100">
                <div className="grid grid-cols-[150px_1fr_140px] border-b border-gray-100 bg-gray-50">
                  <div className={HEAD_CELL_CLS}>Entry Date</div>
                  <div className={HEAD_CELL_CLS}>Description</div>
                  <div className={cn(HEAD_CELL_CLS, "text-right")}>Amount</div>
                </div>
                <div className="flex-1">
                  {form.loanRows.length === 0 ? (
                    <div className="px-4 py-10 text-center text-sm text-gray-400">
                      No loan entries. Use Add to create one.
                    </div>
                  ) : (
                    form.loanRows.map((row, i) => (
                      <div
                        key={i}
                        onClick={() => set("loanSel", i)}
                        className={cn(
                          "grid cursor-pointer grid-cols-[150px_1fr_140px] items-center border-b border-gray-100",
                          form.loanSel === i && "bg-[#0F50DB]/5"
                        )}
                      >
                        <input
                          type="date"
                          value={row.date}
                          onChange={(ev) =>
                            setForm((s) => ({
                              ...s,
                              loanRows: s.loanRows.map((x, j) =>
                                j === i ? { ...x, date: ev.target.value } : x
                              ),
                            }))
                          }
                          className="border-none bg-transparent px-3.5 py-2.5 text-[13px] text-gray-600 outline-none"
                        />
                        <input
                          value={row.desc}
                          placeholder="Description"
                          onChange={(ev) =>
                            setForm((s) => ({
                              ...s,
                              loanRows: s.loanRows.map((x, j) =>
                                j === i ? { ...x, desc: ev.target.value } : x
                              ),
                            }))
                          }
                          className="border-none bg-transparent px-3.5 py-2.5 text-sm font-medium text-[#0E1620] outline-none"
                        />
                        <input
                          value={row.amount}
                          placeholder="0.00"
                          onChange={(ev) =>
                            setForm((s) => ({
                              ...s,
                              loanRows: s.loanRows.map((x, j) =>
                                j === i ? { ...x, amount: ev.target.value } : x
                              ),
                            }))
                          }
                          className="border-none bg-transparent px-3.5 py-2.5 text-right text-sm text-[#0E1620] outline-none"
                        />
                      </div>
                    ))
                  )}
                </div>
                <div className="grid grid-cols-[1fr_140px] border-t border-gray-100 bg-gray-50">
                  <div className="px-3.5 py-3 text-[12.5px] font-bold text-gray-400">
                    Total
                  </div>
                  <div className="px-3.5 py-3 text-right text-sm font-bold text-[#0E1620]">
                    {total}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() =>
                    setForm((s) => ({
                      ...s,
                      loanRows: s.loanRows.concat({
                        date: new Date().toISOString().slice(0, 10),
                        desc: "",
                        amount: "0.00",
                      }),
                      loanSel: s.loanRows.length,
                    }))
                  }
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-[#0F50DB]"
                >
                  <PlusIcon />
                  Add
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setForm((s) => ({
                      ...s,
                      loanRows: s.loanRows.filter((_, i) => i !== s.loanSel),
                      loanSel: 0,
                    }))
                  }
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-600"
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
                  >
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                  </svg>
                  Edit
                </button>
              </div>
            </div>
          </div>
        );
      }

      case "Vacations":
        return (
          <div className="grid grid-cols-1 items-start gap-[22px] md:grid-cols-[minmax(0,1fr)_280px]">
            <Group title="Annual Leave">
              <div>
                <div className="min-h-[220px] overflow-hidden rounded-lg border border-gray-100">
                  <div className="grid grid-cols-[1fr_140px_140px] border-b border-gray-100 bg-gray-50">
                    <div className={HEAD_CELL_CLS}>Band</div>
                    <div className={HEAD_CELL_CLS}>From</div>
                    <div className={HEAD_CELL_CLS}>To</div>
                  </div>
                  {form.vacRows.length === 0 ? (
                    <div className="px-4 py-10 text-center text-sm text-gray-400">
                      No vacation bands. Pick a band below and Add.
                    </div>
                  ) : (
                    form.vacRows.map((row, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-[1fr_140px_140px] items-center border-b border-gray-100"
                      >
                        <div className="px-3.5 py-2.5 text-sm font-medium text-[#0E1620]">
                          {row.band}
                        </div>
                        <input
                          type="date"
                          value={row.from}
                          onChange={(ev) =>
                            setForm((s) => ({
                              ...s,
                              vacRows: s.vacRows.map((x, j) =>
                                j === i ? { ...x, from: ev.target.value } : x
                              ),
                            }))
                          }
                          className="border-none bg-transparent px-3 py-2 text-[13px] text-gray-600 outline-none"
                        />
                        <input
                          type="date"
                          value={row.to}
                          onChange={(ev) =>
                            setForm((s) => ({
                              ...s,
                              vacRows: s.vacRows.map((x, j) =>
                                j === i ? { ...x, to: ev.target.value } : x
                              ),
                            }))
                          }
                          className="border-none bg-transparent px-3 py-2 text-[13px] text-gray-600 outline-none"
                        />
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-3 flex gap-2.5">
                  <Select
                    value={form.vacBand || "[Vacation Band]"}
                    onChange={(v) => set("vacBand", v)}
                    options={[
                      "[Vacation Band]",
                      "Band A (20 days)",
                      "Band B (22 days)",
                      "Band C (25 days)",
                      "Pro-rata",
                    ]}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (form.vacBand && form.vacBand !== "[Vacation Band]")
                        setForm((s) => ({
                          ...s,
                          vacRows: s.vacRows.concat({
                            band: s.vacBand,
                            from: "",
                            to: "",
                          }),
                        }));
                    }}
                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-[18px] text-sm font-semibold text-[#0F50DB]"
                  >
                    <PlusIcon />
                    Add
                  </button>
                </div>
              </div>
            </Group>
            <Group title="Activate Other Leave">
              <div className="flex flex-col gap-1">
                {LEAVE_NAMES.map((leave) => (
                  <div
                    key={leave}
                    className="flex items-center justify-between gap-3 py-[7px]"
                  >
                    <span className={LBL_CLS}>{leave}</span>
                    <Toggle
                      value={form.leaveToggles[leave]}
                      onClick={() =>
                        setForm((s) => ({
                          ...s,
                          leaveToggles: {
                            ...s.leaveToggles,
                            [leave]: !s.leaveToggles[leave],
                          },
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            </Group>
          </div>
        );

      case "Other":
        return (
          <div className="flex flex-col gap-[18px]">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#0E1620]">
                Default Payslip Note
              </label>
              <textarea
                value={form.payslipNote}
                onChange={(e) => set("payslipNote", e.target.value)}
                rows={4}
                placeholder="This note prints on every payslip for this employee…"
                className="w-full resize-y rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-600 outline-none focus:border-[#0F50DB] focus:ring-1 focus:ring-[#0F50DB]"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#0E1620]">
                General Employment Memo
              </label>
              <textarea
                value={form.employmentMemo}
                onChange={(e) => set("employmentMemo", e.target.value)}
                rows={8}
                placeholder="Internal notes about this employment (not shown on payslips)…"
                className="w-full resize-y rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-600 outline-none focus:border-[#0F50DB] focus:ring-1 focus:ring-[#0F50DB]"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  })();

  /* ------------------------------------------------------------------ */
  /* Shell                                                               */
  /* ------------------------------------------------------------------ */

  // Dark-mode gaps inside the Add-Employee form: <legend> titles (text-[#0E1620]) stay near-black,
  // and table head/footer strips (bg-gray-50) stay light. The add-employee dark block doesn't cover
  // these — inject scoped overrides here (hot-reloads even when globals.css is stale).
  const compDarkCss = `
[data-dashboard-theme][data-theme="dark"] [data-page="add-employee"] legend.text-\\[\\#0E1620\\],
[data-dashboard-theme][data-theme="dark"] [data-page="add-employee"] .text-\\[\\#0E1620\\]{color:#f1f5f9!important}
[data-dashboard-theme][data-theme="dark"] [data-page="add-employee"] .bg-gray-50{background-color:#0f172a!important}
[data-dashboard-theme][data-theme="dark"] [data-page="add-employee"] .border-gray-100{border-color:rgba(255,255,255,0.12)!important}
`;

  const inner = (
    <>
      <style dangerouslySetInnerHTML={{ __html: compDarkCss }} />
      {/* Pill tab strip */}
      <div className="flex flex-nowrap gap-1 overflow-x-auto border-b border-gray-100 p-2">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "h-9 flex-shrink-0 whitespace-nowrap rounded-full px-4 text-sm font-semibold transition-colors",
              tab === t
                ? "bg-[#0F50DB] text-white shadow"
                : "bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab body */}
      <div className="p-[22px]">{body}</div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2.5 border-t border-gray-100 bg-gray-50 px-[22px] py-3.5">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 text-[12.5px] font-medium",
            status === "saving" || dirty ? "text-gray-400" : "text-green-600"
          )}
        >
          {status === "saving" || dirty ? (
            <>
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
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Saving…
            </>
          ) : (
            <>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              All changes saved
            </>
          )}
        </span>
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-[18px] text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#0F50DB] px-[22px] text-sm font-semibold text-white hover:bg-[#0D46C3]"
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
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <path d="M17 21v-8H7v8" />
              <path d="M7 3v5h8" />
            </svg>
            Save
          </button>
        </div>
      </div>
    </>
  );

  if (embedded) {
    return <div className="w-full">{inner}</div>;
  }

  return (
    <div className="w-full overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
      {inner}
    </div>
  );
}
