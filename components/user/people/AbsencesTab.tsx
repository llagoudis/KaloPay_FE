"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

// ─── Types & static meta ─────────────────────────────────────────────────────

export type AbsencePerson = {
  id: number | string;
  name: string;
  department?: string | null;
};

type AbsenceStatus = "Pending" | "Approved" | "Rejected";

type AbsenceRecord = {
  ref: string;
  employee: string;
  department?: string | null;
  type: string;
  status: AbsenceStatus;
  from: string;
  to: string;
  hours: number;
  subject: string;
  note: string;
};

type AbsenceDecisions = Record<string, AbsenceStatus>;

const ABS_TYPES: { id: string; color: string; bg: string }[] = [
  { id: "Annual leave", color: "#1D4ED8", bg: "#DBEAFE" },
  { id: "Sick leave", color: "#DC2626", bg: "#FEE2E2" },
  { id: "Maternity", color: "#DB2777", bg: "#FCE7F3" },
  { id: "Parental", color: "#7C3AED", bg: "#EDE9FE" },
  { id: "Army", color: "#15803D", bg: "#DCFCE7" },
  { id: "Study", color: "#D97706", bg: "#FEF3C7" },
];

function absMeta(type: string) {
  return ABS_TYPES.find((t) => t.id === type) ?? ABS_TYPES[0];
}

function absStatusMeta(s: AbsenceStatus): { bg: string; color: string } {
  if (s === "Approved") return { bg: "#DCFCE7", color: "#166534" };
  if (s === "Rejected") return { bg: "#FEE2E2", color: "#991B1B" };
  return { bg: "#FEF3C7", color: "#92400E" };
}

function absFmt(iso: string): string {
  if (!iso) return "—";
  const d = new Date(`${iso}T00:00:00`);
  return isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

// Per-employee seeded absence records (mirrors design ppAbsences).
function ppAbsences(person: AbsencePerson): Omit<AbsenceRecord, "employee" | "department">[] {
  const id = Number(person.id) || 1;
  const seed = (id * 7) % 3;
  const base: Omit<AbsenceRecord, "employee" | "department">[] = [
    { ref: "ABS-2026-0001", type: "Annual leave", from: "2026-03-09", to: "2026-03-13", hours: 40, status: "Approved", subject: "Spring holiday with family", note: "Approved — within annual entitlement." },
    { ref: "ABS-2026-0002", type: "Sick leave", from: "2026-02-04", to: "2026-02-05", hours: 16, status: "Approved", subject: "Seasonal flu", note: "Medical certificate received and filed." },
    { ref: "ABS-2026-0003", type: "Study", from: "2026-05-18", to: "2026-05-19", hours: 16, status: "Pending", subject: "ACCA exam preparation", note: "Study leave granted per L&D policy." },
    { ref: "ABS-2025-0008", type: "Parental", from: "2025-11-10", to: "2025-11-14", hours: 40, status: "Approved", subject: "Child care", note: "Parental leave, unpaid portion noted in payroll." },
  ];
  if (seed === 1) base.push({ ref: "ABS-2026-0004", type: "Army", from: "2026-06-01", to: "2026-06-03", hours: 24, status: "Rejected", subject: "National guard service", note: "Reservist call-up; documentation attached." });
  if (seed === 2) base.push({ ref: "ABS-2026-0005", type: "Maternity", from: "2026-04-06", to: "2026-07-24", hours: 640, status: "Approved", subject: "Maternity leave", note: "18-week statutory maternity leave." });
  return base;
}

// Fallback roster used when usePeople returns no rows.
const MOCK_PEOPLE: AbsencePerson[] = [
  { id: 1, name: "Alice Wong", department: "Engineering" },
  { id: 2, name: "Ben Carter", department: "Design" },
  { id: 3, name: "Carla Diaz", department: "Marketing" },
];

const ABS_STORAGE_KEY = "kp-abs-decisions";

function readDecisions(): AbsenceDecisions {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(ABS_STORAGE_KEY) ?? "{}") as AbsenceDecisions;
  } catch {
    return {};
  }
}

// ─── Small UI helpers ────────────────────────────────────────────────────────

function Caret() {
  return (
    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden>
      <svg width="12" height="7" viewBox="0 0 14 8" fill="none">
        <path d="M1 1.5 7 6.5 13 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function pgBtnClass(disabled: boolean) {
  return cn(
    "inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 text-[13px] font-semibold",
    disabled ? "cursor-not-allowed text-gray-400 opacity-55" : "text-[#0E1620] hover:bg-gray-50"
  );
}

// ─── Add-absence modal ───────────────────────────────────────────────────────

type ModalForm = {
  employee: string;
  type: string;
  from: string;
  to: string;
  hours: string;
  subject: string;
  note: string;
};

function AddAbsenceModal({
  people,
  year,
  seq,
  onClose,
  onSave,
}: {
  people: AbsencePerson[];
  year: number;
  seq: number;
  onClose: () => void;
  onSave: (a: AbsenceRecord) => void;
}) {
  const reference = `ABS-${year}-${String(seq).padStart(4, "0")}`;
  const [form, setForm] = useState<ModalForm>({
    employee: people[0]?.name ?? "",
    type: "Annual leave",
    from: "",
    to: "",
    hours: "",
    subject: "",
    note: "",
  });
  const [err, setErr] = useState<Partial<Record<keyof ModalForm, boolean>>>({});
  const set = (k: keyof ModalForm, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const inputCls =
    "box-border h-[42px] w-full rounded-[10px] border px-3 text-sm text-[#374151] outline-none focus:border-[#0F50DB] focus:ring-1 focus:ring-[#0F50DB]";
  const labelCls = "mb-1.5 block text-[13.5px] font-medium text-[#374151]";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const miss: Partial<Record<keyof ModalForm, boolean>> = {};
    if (!form.employee) miss.employee = true;
    if (!form.from) miss.from = true;
    if (!form.to) miss.to = true;
    if (!form.hours) miss.hours = true;
    if (Object.keys(miss).length) {
      setErr(miss);
      return;
    }
    const dept = people.find((p) => p.name === form.employee)?.department ?? null;
    onSave({
      ref: reference,
      employee: form.employee,
      department: dept,
      type: form.type,
      status: "Pending",
      from: form.from,
      to: form.to,
      hours: Number(form.hours) || 0,
      subject: form.subject.trim(),
      note: form.note.trim(),
    });
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-[rgba(10,20,40,0.55)] p-6 backdrop-blur-[3px]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[560px] overflow-hidden rounded-[18px] border border-gray-100 bg-white shadow-[0_24px_60px_rgba(0,0,0,0.35)]"
      >
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-[22px] py-[18px]">
          <span className="text-[17px] font-bold text-[#0E1620]">Record absence</span>
          <button type="button" onClick={onClose} aria-label="Close" className="inline-flex p-1 text-gray-400 hover:text-gray-600">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={submit}>
          <div className="grid grid-cols-1 gap-4 p-[22px] sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelCls}>Employee</label>
              <select
                value={form.employee}
                onChange={(e) => set("employee", e.target.value)}
                className={cn(inputCls, "bg-white", err.employee ? "border-[#DC2626]" : "border-gray-200")}
              >
                {people.map((p) => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Absence type</label>
              <select value={form.type} onChange={(e) => set("type", e.target.value)} className={cn(inputCls, "border-gray-200 bg-white")}>
                {ABS_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>{t.id}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Reference number</label>
              <input value={reference} readOnly className={cn(inputCls, "border-gray-200 bg-gray-50 font-mono text-gray-400")} />
            </div>
            <div>
              <label className={labelCls}>Date from</label>
              <input type="date" value={form.from} onChange={(e) => set("from", e.target.value)} className={cn(inputCls, "bg-white", err.from ? "border-[#DC2626]" : "border-gray-200")} />
            </div>
            <div>
              <label className={labelCls}>Date to</label>
              <input type="date" value={form.to} onChange={(e) => set("to", e.target.value)} className={cn(inputCls, "bg-white", err.to ? "border-[#DC2626]" : "border-gray-200")} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Hours</label>
              <input type="number" min="0" placeholder="Enter total hours" value={form.hours} onChange={(e) => set("hours", e.target.value)} className={cn(inputCls, "bg-white", err.hours ? "border-[#DC2626]" : "border-gray-200")} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Subject</label>
              <input value={form.subject} onChange={(e) => set("subject", e.target.value)} placeholder="One-line summary of the absence" className={cn(inputCls, "border-gray-200 bg-white")} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>
                Note <span className="font-normal text-gray-400">(internal, for HR / payroll archiving)</span>
              </label>
              <textarea
                value={form.note}
                onChange={(e) => set("note", e.target.value)}
                rows={4}
                placeholder="Add a note for archiving purposes…"
                className="box-border w-full resize-y rounded-[10px] border border-gray-200 bg-white p-3 text-sm text-[#374151] outline-none focus:border-[#0F50DB] focus:ring-1 focus:ring-[#0F50DB]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2.5 border-t border-gray-100 bg-gray-50 px-[22px] py-4">
            <button type="button" onClick={onClose} className="h-[42px] rounded-[10px] border border-gray-300 bg-white px-[18px] text-sm font-medium text-[#374151] hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="h-[42px] rounded-[10px] bg-[#0F50DB] px-[22px] text-sm font-semibold text-white hover:opacity-90">
              Save absence
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Calendar view ───────────────────────────────────────────────────────────

function AbsenceCalendar({ rows, year }: { rows: AbsenceRecord[]; year: number }) {
  const dayMap = useMemo(() => {
    const map: Record<string, { color: string; id: string }> = {};
    rows.forEach((a) => {
      const m = absMeta(a.type);
      const d = new Date(`${a.from}T00:00:00`);
      const end = new Date(`${a.to}T00:00:00`);
      if (isNaN(d.getTime()) || isNaN(end.getTime())) return;
      while (d <= end) {
        if (d.getFullYear() === year) map[`${d.getMonth()}-${d.getDate()}`] = { color: m.color, id: m.id };
        d.setDate(d.getDate() + 1);
      }
    });
    return map;
  }, [rows, year]);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dow = ["M", "T", "W", "T", "F", "S", "S"];

  function cells(month: number): (number | null)[] {
    const first = new Date(year, month, 1);
    const start = (first.getDay() + 6) % 7;
    const n = new Date(year, month + 1, 0).getDate();
    const arr: (number | null)[] = [];
    for (let i = 0; i < start; i++) arr.push(null);
    for (let d = 1; d <= n; d++) arr.push(d);
    return arr;
  }

  return (
    <div>
      <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(210px,1fr))]">
        {monthNames.map((mn, mi) => (
          <div key={mn} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
            <div className="mb-2 text-[13px] font-bold text-[#0E1620]">{mn}</div>
            <div className="mb-1 grid grid-cols-7 gap-0.5">
              {dow.map((d, i) => (
                <div key={i} className="text-center text-[10px] font-semibold text-gray-400">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {cells(mi).map((d, i) => {
                const m = d ? dayMap[`${mi}-${d}`] : null;
                return (
                  <div
                    key={i}
                    title={m ? m.id : ""}
                    className={cn("flex aspect-square items-center justify-center rounded-[5px] text-[10.5px]", m ? "font-bold text-white" : "text-gray-500")}
                    style={m ? { background: m.color } : undefined}
                  >
                    {d ?? ""}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-3.5 border-t border-gray-100 pt-3.5">
        {ABS_TYPES.map((t) => (
          <span key={t.id} className="inline-flex items-center gap-1.5 text-[12.5px] text-gray-500">
            <span className="h-3 w-3 rounded" style={{ background: t.color }} />
            {t.id}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Main Absences tab ───────────────────────────────────────────────────────

export default function AbsencesTab({ people }: { people: AbsencePerson[] }) {
  const roster = people.length > 0 ? people : MOCK_PEOPLE;

  const [year, setYear] = useState(2026);
  const [view, setView] = useState<"list" | "calendar">("list");
  const [deptFilter, setDeptFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [extra, setExtra] = useState<AbsenceRecord[]>([]);
  const [decisions, setDecisions] = useState<AbsenceDecisions>(() => readDecisions());

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(ABS_STORAGE_KEY, JSON.stringify(decisions));
  }, [decisions]);

  function decide(key: string, status: AbsenceStatus) {
    setDecisions((d) => ({ ...d, [key]: status }));
  }
  function undo(key: string) {
    setDecisions((d) => {
      const next = { ...d };
      delete next[key];
      return next;
    });
  }

  // Base rows derived from real people + design seed data.
  const base = useMemo<AbsenceRecord[]>(() => {
    const rows: AbsenceRecord[] = [];
    roster.forEach((p) => {
      ppAbsences(p).forEach((a) => rows.push({ ...a, employee: p.name, department: p.department ?? null }));
    });
    return rows;
  }, [roster]);

  // Apply persisted decisions (keyed by `${employee}|${ref}`) on top of base status.
  const combined = useMemo<AbsenceRecord[]>(() => {
    return [...extra, ...base].map((a) => {
      const k = `${a.employee}|${a.ref}`;
      return decisions[k] ? { ...a, status: decisions[k] } : a;
    });
  }, [extra, base, decisions]);

  const years = [2024, 2025, 2026, 2027];
  const depts = useMemo(
    () => Array.from(new Set(roster.map((p) => p.department).filter((d): d is string => Boolean(d)))),
    [roster]
  );

  const yearRows = useMemo(() => {
    let rows = combined.filter((a) => new Date(`${a.from}T00:00:00`).getFullYear() === year);
    if (deptFilter) rows = rows.filter((a) => a.department === deptFilter);
    return rows.slice().sort((a, b) => new Date(a.from).getTime() - new Date(b.from).getTime());
  }, [combined, year, deptFilter]);

  const totalRows = yearRows.length;
  const pageCount = Math.max(1, Math.ceil(totalRows / pageSize));

  useEffect(() => {
    setPage(1);
  }, [year, deptFilter, pageSize, extra.length]);

  const curPage = Math.min(page, pageCount);
  const pageRows = yearRows.slice((curPage - 1) * pageSize, curPage * pageSize);
  const firstRow = totalRows === 0 ? 0 : (curPage - 1) * pageSize + 1;
  const lastRow = Math.min(curPage * pageSize, totalRows);

  // Summed HOURS per type computed from the visible (filtered) year rows.
  const totals = ABS_TYPES.map((t) => ({
    ...t,
    hours: yearRows.filter((a) => a.type === t.id).reduce((s, a) => s + (Number(a.hours) || 0), 0),
  })).filter((t) => t.hours > 0);

  const selCls =
    "h-10 appearance-none rounded-[10px] border border-gray-200 bg-white pl-3.5 pr-9 text-sm font-semibold text-[#0E1620] outline-none focus:border-[#0F50DB] focus:ring-1 focus:ring-[#0F50DB]";

  const segBtn = (id: "list" | "calendar", label: string): ReactNode => (
    <button
      key={id}
      type="button"
      onClick={() => setView(id)}
      className={cn(
        "h-9 rounded-lg px-4 text-[13.5px] font-semibold",
        view === id ? "bg-white text-[#0F50DB] shadow-sm" : "text-gray-500"
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="mx-auto max-w-[1245px] rounded-xl bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-[18px]">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold text-[#0E1620]">Absences</h2>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-gray-400">Year</span>
              <div className="relative inline-flex">
                <select value={year} onChange={(e) => setYear(Number(e.target.value))} className={selCls}>
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <Caret />
              </div>
            </div>
            <div className="relative inline-flex">
              <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className={cn(selCls, "font-medium")}>
                <option value="">All departments</option>
                {depts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <Caret />
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="inline-flex gap-1 rounded-[10px] border border-gray-100 bg-gray-50 p-1">
              {segBtn("list", "List")}
              {segBtn("calendar", "Calendar")}
            </div>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#0F50DB] px-4 text-[13.5px] font-semibold text-white hover:opacity-90"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add absence
            </button>
          </div>
        </div>

        {/* Type totals (summed HOURS) */}
        {totals.length > 0 && (
          <div className="flex flex-wrap gap-2.5">
            {totals.map((t) => (
              <div key={t.id} className="inline-flex items-center gap-2 rounded-full px-3 py-[7px] text-[12.5px] font-semibold" style={{ background: t.bg, color: t.color }}>
                <span className="h-2 w-2 rounded-full" style={{ background: t.color }} />
                {t.id} · {t.hours}h
              </div>
            ))}
          </div>
        )}

        {view === "list" ? (
          <>
            {/* Table */}
            {pageRows.length === 0 ? (
              <p className="my-2 text-sm text-gray-400">No absences recorded for this year.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full min-w-[1040px] border-collapse">
                  <thead>
                    <tr className="text-left">
                      {["Employee", "Reference", "Type", "Status", "From", "To", "Hours", "Subject", "Note"].map((h) => (
                        <th key={h} className="border-b border-gray-100 px-3.5 py-2.5 text-[11.5px] font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap">{h}</th>
                      ))}
                      <th className="border-b border-gray-100 px-3.5 py-2.5 text-center text-[11.5px] font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.map((a, i) => {
                      const m = absMeta(a.type);
                      const sm = absStatusMeta(a.status);
                      const key = `${a.employee}|${a.ref}`;
                      return (
                        <tr key={`${a.ref}-${a.employee}-${i}`}>
                          <td className="border-b border-gray-100 px-3.5 py-3.5 align-top text-[13.5px] font-semibold text-[#0E1620] whitespace-nowrap">{a.employee}</td>
                          <td className="border-b border-gray-100 px-3.5 py-3.5 align-top font-mono text-[13.5px] font-semibold text-[#0E1620] whitespace-nowrap">{a.ref}</td>
                          <td className="border-b border-gray-100 px-3.5 py-3.5 align-top">
                            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap" style={{ background: m.bg, color: m.color }}>
                              <span className="h-[7px] w-[7px] rounded-full" style={{ background: m.color }} />
                              {a.type}
                            </span>
                          </td>
                          <td className="border-b border-gray-100 px-3.5 py-3.5 align-top">
                            <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap" style={{ background: sm.bg, color: sm.color }}>{a.status}</span>
                          </td>
                          <td className="border-b border-gray-100 px-3.5 py-3.5 align-top text-[13.5px] text-[#374151] whitespace-nowrap">{absFmt(a.from)}</td>
                          <td className="border-b border-gray-100 px-3.5 py-3.5 align-top text-[13.5px] text-[#374151] whitespace-nowrap">{absFmt(a.to)}</td>
                          <td className="border-b border-gray-100 px-3.5 py-3.5 align-top font-mono text-[13.5px] text-[#374151] whitespace-nowrap">{a.hours}h</td>
                          <td className="border-b border-gray-100 px-3.5 py-3.5 align-top text-[13.5px] font-medium text-[#0E1620] min-w-[150px]">{a.subject || "—"}</td>
                          <td className="border-b border-gray-100 px-3.5 py-3.5 align-top text-[13.5px] text-gray-500 min-w-[190px]">{a.note || "—"}</td>
                          <td className="border-b border-gray-100 px-3.5 py-3.5 text-center align-top whitespace-nowrap">
                            {a.status === "Pending" ? (
                              <div className="inline-flex gap-2">
                                <button type="button" onClick={() => decide(key, "Approved")} className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-[12.5px] font-semibold text-white" style={{ background: "#16A34A" }}>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                                  Approve
                                </button>
                                <button type="button" onClick={() => decide(key, "Rejected")} className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-[12.5px] font-semibold text-white" style={{ background: "#DC2626" }}>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <button type="button" onClick={() => undo(key)} className="h-[30px] rounded-lg border border-gray-200 bg-white px-3 text-[12.5px] font-semibold text-gray-500 hover:bg-gray-50">Undo</button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalRows > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-[13px] text-gray-400">Rows per page</span>
                  <div className="relative inline-flex">
                    <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="h-9 appearance-none rounded-[10px] border border-gray-200 bg-white pl-3 pr-8 text-[13.5px] font-semibold text-[#0E1620] outline-none focus:border-[#0F50DB] focus:ring-1 focus:ring-[#0F50DB]">
                      {[10, 25, 50, 100].map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                    <Caret />
                  </div>
                  <span className="text-[13px] text-gray-500">{firstRow}–{lastRow} of {totalRows}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={curPage <= 1} className={pgBtnClass(curPage <= 1)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    Prev
                  </button>
                  <span className="px-1.5 text-[13.5px] font-semibold text-[#0E1620]">Page {curPage} of {pageCount}</span>
                  <button type="button" onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={curPage >= pageCount} className={pgBtnClass(curPage >= pageCount)}>
                    Next
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <AbsenceCalendar rows={yearRows} year={year} />
        )}
      </div>

      {modalOpen && (
        <AddAbsenceModal
          people={roster}
          year={year}
          seq={combined.length + 1}
          onClose={() => setModalOpen(false)}
          onSave={(a) => {
            setExtra((xs) => [a, ...xs]);
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
