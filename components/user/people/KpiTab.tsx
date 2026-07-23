"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";

// ─── Types ───────────────────────────────────────────────────────────────────

export type KpiPerson = {
  id: number | string;
  name: string;
  email?: string | null;
  jobTitle?: string | null;
  status?: string | null;
  startDate?: string | null;
  lineManagerEmail?: string | null;
  managerEmail?: string | null;
};

type KpiStatus = "Not started" | "On track" | "At risk" | "Achieved" | "Missed";

type KpiRow = {
  id: number;
  title: string;
  weight: string;
  due: string;
  lastReview: string;
  status: KpiStatus;
  mgrNote: string;
  empNote: string;
};

const KPI_STATUSES: Record<KpiStatus, { bg: string; color: string }> = {
  "Not started": { bg: "#F1F5F9", color: "#475569" },
  "On track": { bg: "#DBEAFE", color: "#1D4ED8" },
  "At risk": { bg: "#FEF3C7", color: "#92400E" },
  "Achieved": { bg: "#DCFCE7", color: "#166534" },
  "Missed": { bg: "#FEE2E2", color: "#991B1B" },
};
const KPI_STATUS_KEYS = Object.keys(KPI_STATUSES) as KpiStatus[];

// Fallback roster when usePeople returns no rows.
const MOCK_PEOPLE: KpiPerson[] = [
  { id: 1, name: "Alice Wong", email: "alice@techcorp.com", jobTitle: "Senior Engineer", status: "active", startDate: "12 Jan 2024", lineManagerEmail: "manager@techcorp.com" },
  { id: 2, name: "Ben Carter", email: "ben@techcorp.com", jobTitle: "Product Designer", status: "active", startDate: "03 Mar 2024", lineManagerEmail: "manager@techcorp.com" },
  { id: 3, name: "Carla Diaz", email: "carla@techcorp.com", jobTitle: "Marketing Lead", status: "inactive", startDate: "27 Jun 2025", lineManagerEmail: "director@techcorp.com" },
];

function kpiEmpNo(p: KpiPerson): string {
  return `EMP-${1000 + Number(p.id || 0)}`;
}

function managerEmailFor(p: KpiPerson): string {
  return (
    p.lineManagerEmail ||
    p.managerEmail ||
    `manager@${(p.email ?? "").split("@")[1] || "company.com"}`
  );
}

function storeKeyFor(p: KpiPerson): string {
  return `kp-kpi-${kpiEmpNo(p)}`;
}

function kpiSeed(p: KpiPerson): KpiRow[] {
  const id = Number(p.id) || 1;
  const base: KpiRow[] = [
    { id: 1, title: "Deliver quarterly roadmap milestones", weight: "40", due: "2026-09-30", lastReview: "2026-06-15", status: "On track", mgrNote: "Strong progress on the core workstream — keep the momentum.", empNote: "On schedule; pending a final design sign-off." },
    { id: 2, title: "Improve review / response turnaround", weight: "30", due: "2026-08-31", lastReview: "2026-06-15", status: "At risk", mgrNote: "Turnaround slipped last month — let's pair on triage.", empNote: "Backlog from the incident; catching up this sprint." },
    { id: 3, title: "Mentor one junior team member", weight: "30", due: "2026-12-15", lastReview: "2026-06-01", status: "Achieved", mgrNote: "Mentee ramped up well. Great work.", empNote: "Weekly 1:1s now established." },
  ];
  if (id % 2 === 0) base[0].status = "On track";
  return base;
}

function readStoredKpis(p: KpiPerson): KpiRow[] | null {
  if (typeof window === "undefined") return null;
  try {
    const s = JSON.parse(window.localStorage.getItem(storeKeyFor(p)) ?? "null");
    return Array.isArray(s) ? (s as KpiRow[]) : null;
  } catch {
    return null;
  }
}

function readStoredCount(p: KpiPerson): number {
  const stored = readStoredKpis(p);
  return stored ? stored.length : 3;
}

// ─── Per-employee detail editor ──────────────────────────────────────────────

function PersonKpiDetail({ person, onBack }: { person: KpiPerson; onBack: () => void }) {
  const storeKey = storeKeyFor(person);
  const mgrEmail = managerEmailFor(person);
  const [kpis, setKpis] = useState<KpiRow[]>(() => readStoredKpis(person) ?? kpiSeed(person));
  const [toast, setToast] = useState<string | null>(null);
  const firstRun = useRef(true);

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast((t) => (t === msg ? null : t)), 2000);
  }

  // Debounced autosave (mirrors design).
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    if (typeof window === "undefined") return;
    const t = setTimeout(() => window.localStorage.setItem(storeKey, JSON.stringify(kpis)), 700);
    return () => clearTimeout(t);
  }, [kpis, storeKey]);

  function save() {
    if (typeof window !== "undefined") window.localStorage.setItem(storeKey, JSON.stringify(kpis));
    flash("KPIs saved");
  }
  function setK(id: number, patch: Partial<KpiRow>) {
    setKpis((arr) => arr.map((k) => (k.id === id ? { ...k, ...patch } : k)));
  }
  function addKpi() {
    setKpis((arr) =>
      arr.concat({
        id: Date.now(),
        title: "",
        weight: "0",
        due: "",
        lastReview: new Date().toISOString().slice(0, 10),
        status: "Not started",
        mgrNote: "",
        empNote: "",
      })
    );
  }
  function removeKpi(id: number) {
    setKpis((arr) => arr.filter((k) => k.id !== id));
  }

  const totalWeight = kpis.reduce((s, k) => s + (Number(k.weight) || 0), 0);
  const weightOk = totalWeight === 100;

  const lblCls = "mb-1.5 block text-xs font-semibold text-gray-400";
  const inpCls =
    "box-border h-[38px] w-full rounded-[9px] border border-gray-200 bg-white px-3 text-[13.5px] text-[#0E1620] outline-none focus:border-[#0F50DB] focus:ring-1 focus:ring-[#0F50DB]";
  const noteCls =
    "box-border min-h-[64px] w-full resize-y rounded-[9px] border border-gray-200 bg-white p-2.5 text-[13px] text-[#374151] outline-none focus:border-[#0F50DB] focus:ring-1 focus:ring-[#0F50DB]";

  return (
    <div className="mx-auto max-w-[1245px] rounded-xl bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-[18px]">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-3.5">
          <button type="button" onClick={onBack} aria-label="Back" className="inline-flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:bg-gray-50">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></svg>
          </button>
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0F50DB] text-[15px] font-bold text-white">
            {person.name.split(" ").map((n) => n[0]).join("")}
          </span>
          <div className="min-w-[180px] flex-1">
            <h2 className="text-[19px] font-bold text-[#0E1620]">{person.name} — KPIs</h2>
            <p className="mt-0.5 text-[13px] text-gray-500">{kpiEmpNo(person)} · {person.jobTitle ?? "—"} · Started {person.startDate ?? "—"}</p>
            <p className="mt-[3px] inline-flex items-center gap-1.5 text-[12.5px] text-gray-500">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 5L2 7" /></svg>
              Direct manager: <a href={`mailto:${mgrEmail}`} className="font-semibold text-[#0F50DB] hover:underline">{mgrEmail}</a>
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold"
              style={weightOk ? { background: "#DCFCE7", color: "#166534" } : { background: "#FEF3C7", color: "#92400E" }}
            >
              Total weight: {totalWeight}%{weightOk ? "" : " (should be 100%)"}
            </span>
            <button type="button" onClick={addKpi} className="inline-flex h-10 items-center gap-1.5 rounded-[10px] border border-gray-200 bg-white px-4 text-[13.5px] font-semibold text-[#0F50DB] hover:bg-gray-50">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Add KPI
            </button>
            <button type="button" onClick={save} className="inline-flex h-10 items-center gap-1.5 rounded-[10px] bg-[#0F50DB] px-[18px] text-[13.5px] font-semibold text-white hover:opacity-90">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><path d="M17 21v-8H7v8" /><path d="M7 3v5h8" /></svg>
              Save
            </button>
          </div>
        </div>

        {/* KPI cards */}
        {kpis.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-[13.5px] text-gray-400">
            No KPIs yet. Use &ldquo;Add KPI&rdquo; to create one.
          </div>
        ) : (
          kpis.map((k, i) => {
            const sm = KPI_STATUSES[k.status] ?? KPI_STATUSES["Not started"];
            return (
              <div key={k.id} className="rounded-[14px] border border-gray-100 bg-white p-[18px]">
                <div className="mb-3.5 flex items-start gap-3">
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-[13px] font-bold text-gray-500">{i + 1}</span>
                  <input value={k.title} onChange={(e) => setK(k.id, { title: e.target.value })} placeholder="KPI title / objective" className={cn(inpCls, "h-10 flex-1 text-[14.5px] font-semibold")} />
                  <button type="button" onClick={() => removeKpi(k.id)} aria-label="Remove KPI" className="inline-flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[9px] border border-gray-200 bg-white text-gray-400 hover:bg-gray-50">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                  </button>
                </div>
                <div className="mb-4 grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
                  <div>
                    <label className={lblCls}>Weight (%)</label>
                    <input type="number" min="0" max="100" value={k.weight} onChange={(e) => setK(k.id, { weight: e.target.value })} className={cn(inpCls, "text-right font-mono")} />
                  </div>
                  <div>
                    <label className={lblCls}>Due date</label>
                    <input type="date" value={k.due} onChange={(e) => setK(k.id, { due: e.target.value })} className={inpCls} />
                  </div>
                  <div>
                    <label className={lblCls}>Last review date</label>
                    <input type="date" value={k.lastReview} onChange={(e) => setK(k.id, { lastReview: e.target.value })} className={inpCls} />
                  </div>
                  <div>
                    <label className={lblCls}>Status</label>
                    <div className="relative">
                      <select
                        value={k.status}
                        onChange={(e) => setK(k.id, { status: e.target.value as KpiStatus })}
                        className={cn(inpCls, "appearance-none pr-8 font-semibold")}
                        style={{ color: sm.color }}
                      >
                        {KPI_STATUS_KEYS.map((s) => (
                          <option key={s} value={s} className="text-[#0E1620]">{s}</option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden>
                        <svg width="12" height="7" viewBox="0 0 14 8" fill="none"><path d="M1 1.5 7 6.5 13 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
                  <div>
                    <label className={lblCls}>Line manager note</label>
                    <textarea value={k.mgrNote} onChange={(e) => setK(k.id, { mgrNote: e.target.value })} placeholder="Manager's assessment / feedback…" className={noteCls} />
                  </div>
                  <div>
                    <label className={lblCls}>Employee note</label>
                    <textarea value={k.empNote} onChange={(e) => setK(k.id, { empNote: e.target.value })} placeholder="Employee's comments / self-assessment…" className={noteCls} />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {toast && (
        <div className="fixed bottom-7 left-1/2 z-[1200] inline-flex -translate-x-1/2 items-center gap-2.5 rounded-[10px] bg-[#0E1620] px-[18px] py-[11px] text-[13.5px] font-medium text-white shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          {toast}
        </div>
      )}
    </div>
  );
}

// ─── Employee list ───────────────────────────────────────────────────────────

export default function KpiTab({ people }: { people: KpiPerson[] }) {
  const roster = people.length > 0 ? people : MOCK_PEOPLE;

  const [statusFilter, setStatusFilter] = useState<"active" | "inactive">("active");
  const [selId, setSelId] = useState<number | string | null>(null);

  const list = useMemo(
    () => roster.filter((p) => (statusFilter === "active" ? p.status === "active" : p.status !== "active")),
    [roster, statusFilter]
  );
  const selected = roster.find((p) => p.id === selId);

  if (selected) {
    return <PersonKpiDetail person={selected} onBack={() => setSelId(null)} />;
  }

  const thCls = "border-b border-gray-100 px-4 py-3 text-left text-[11.5px] font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap";
  const tdCls = "border-b border-gray-100 px-4 py-4 align-middle text-[13.5px] text-[#374151]";

  const segBtn = (id: "active" | "inactive", lbl: string) => (
    <button
      key={id}
      type="button"
      onClick={() => setStatusFilter(id)}
      className={cn(
        "h-9 rounded-lg px-4 text-[13.5px] font-semibold",
        statusFilter === id ? "bg-white text-[#0F50DB] shadow-sm" : "text-gray-500"
      )}
    >
      {lbl}
    </button>
  );

  return (
    <div className="mx-auto max-w-[1245px] rounded-xl bg-white shadow-sm">
      <div className="flex flex-col gap-[18px]">
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 pt-5">
          <div>
            <h2 className="text-xl font-semibold text-[#0E1620]">Employee KPIs</h2>
            <p className="mt-1 text-[13.5px] text-gray-500">Select an employee to view and manage their KPIs.</p>
          </div>
          <div className="inline-flex gap-1 rounded-[10px] border border-gray-100 bg-gray-50 p-1">
            {segBtn("active", "Active Employees")}
            {segBtn("inactive", "Non-Active Employees")}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr>
                <th className={thCls}>Employee no</th>
                <th className={thCls}>Name &amp; surname</th>
                <th className={thCls}>Direct manager</th>
                <th className={thCls}>Start date</th>
                <th className={thCls}>KPIs</th>
                <th className={cn(thCls, "text-right")} aria-label="Open"></th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                    No {statusFilter === "active" ? "active" : "non-active"} employees.
                  </td>
                </tr>
              ) : (
                list.map((p) => {
                  const mgr = managerEmailFor(p);
                  const count = readStoredCount(p);
                  return (
                    <tr key={p.id} className="cursor-pointer hover:bg-gray-50" onClick={() => setSelId(p.id)}>
                      <td className={cn(tdCls, "font-mono font-semibold text-[#0E1620] whitespace-nowrap")}>{kpiEmpNo(p)}</td>
                      <td className={tdCls}>
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0F50DB] text-[13px] font-semibold text-white">
                            {p.name.split(" ").map((n) => n[0]).join("")}
                          </span>
                          <div>
                            <div className="font-semibold text-[#0E1620]">{p.name}</div>
                            <div className="text-[12.5px] text-gray-500">{p.jobTitle ?? "—"}</div>
                          </div>
                        </div>
                      </td>
                      <td className={cn(tdCls, "whitespace-nowrap")}>
                        <a href={`mailto:${mgr}`} onClick={(e) => e.stopPropagation()} className="font-medium text-[#0F50DB] hover:underline">{mgr}</a>
                      </td>
                      <td className={cn(tdCls, "whitespace-nowrap")}>{p.startDate ?? "—"}</td>
                      <td className={tdCls}>
                        <span className="inline-flex rounded-full bg-gray-50 px-2.5 py-[3px] text-xs font-semibold text-gray-500">{count} KPIs</span>
                      </td>
                      <td className={cn(tdCls, "text-right")}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline text-gray-400"><path d="m9 18 6-6-6-6" /></svg>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
