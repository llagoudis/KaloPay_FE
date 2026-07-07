"use client";

import { useState } from "react";

// ── KPI status metadata ──────────────────────────────────────────────────────
const KPI_STATUS: Record<string, { label: string; color: string }> = {
  "on-track": { label: "On track",  color: "#0F50DB" },
  "at-risk":  { label: "At risk",   color: "#b45309" },
  "behind":   { label: "Behind",    color: "#dc2626" },
  "complete": { label: "Complete",  color: "#16a34a" },
};

// ── Mock data (replace with API keyed by logged-in user's email) ──────────────
interface KPI {
  id: number;
  title: string;
  weight: number;
  due: string;
  review: string;
  status: string;
  managerNote: string;
  employeeNote: string;
}
interface TeamPerson {
  no: string;
  name: string;
  role: string;
  start: string;
  manager: string;
  kpis: KPI[];
}

const SELF_PERSON: TeamPerson = {
  no: "EMP-1001",
  name: "Alice Wong",
  role: "Senior Engineer",
  start: "12 Jan 2024",
  manager: "manager@techcorp.com",
  kpis: [
    { id: 1, title: "Ship the payments migration", weight: 40, due: "2026-09-30", review: "2026-06-15", status: "on-track", managerNote: "Strong progress — keep the momentum.", employeeNote: "On schedule; pending a final design sign-off." },
    { id: 2, title: "Mentor two junior engineers",  weight: 30, due: "2026-12-31", review: "2026-06-15", status: "on-track", managerNote: "Great feedback from both mentees.",           employeeNote: "Weekly 1:1s running smoothly." },
    { id: 3, title: "Improve service uptime to 99.9%", weight: 30, due: "2026-08-31", review: "2026-06-15", status: "at-risk", managerNote: "Two incidents last month — let's review the on-call rota.", employeeNote: "Root-causing the recurring DB timeouts." },
  ],
};

const TEAM: TeamPerson[] = [
  {
    no: "EMP-1002", name: "Ben Carter", role: "Product Designer", start: "03 Mar 2024", manager: "alice@techcorp.com",
    kpis: [
      { id: 1, title: "Redesign the onboarding flow",         weight: 40, due: "2026-09-30", review: "2026-06-15", status: "on-track", managerNote: "Strong progress.", employeeNote: "Pending design sign-off." },
      { id: 2, title: "Improve review / response turnaround", weight: 30, due: "2026-08-31", review: "2026-06-15", status: "at-risk",  managerNote: "Turnaround slipped — let's pair on triage.", employeeNote: "Catching up this sprint." },
      { id: 3, title: "Establish the component library v2",   weight: 30, due: "2026-12-31", review: "2026-06-15", status: "on-track", managerNote: "Adoption looking good.", employeeNote: "Two more teams migrating." },
    ],
  },
  {
    no: "EMP-1004", name: "Dmitri Volkov", role: "Backend Engineer", start: "15 Feb 2023", manager: "alice@techcorp.com",
    kpis: [
      { id: 1, title: "Reduce API p95 latency by 20%",    weight: 50, due: "2026-09-30", review: "2026-06-15", status: "on-track", managerNote: "Down 14% already.", employeeNote: "Profiling the last hot path." },
      { id: 2, title: "Migrate legacy jobs to the queue", weight: 30, due: "2026-10-31", review: "2026-06-15", status: "behind",   managerNote: "Scope grew — cut P2 jobs from this cycle.", employeeNote: "Blocked on vendor rate limits." },
      { id: 3, title: "Own the incident on-call rota",    weight: 20, due: "2026-12-31", review: "2026-06-15", status: "complete", managerNote: "Rota running smoothly — thank you.", employeeNote: "Runbooks updated." },
    ],
  },
  {
    no: "EMP-1006", name: "Farid Hassan", role: "Support Specialist", start: "20 Jun 2024", manager: "alice@techcorp.com",
    kpis: [
      { id: 1, title: "Keep CSAT above 92%",              weight: 60, due: "2026-12-31", review: "2026-06-15", status: "on-track", managerNote: "Consistently above target.", employeeNote: "Focusing on faster first-response." },
      { id: 2, title: "Write 10 new help-centre articles", weight: 40, due: "2026-09-30", review: "2026-06-15", status: "at-risk",  managerNote: "6 of 10 done — protect writing time.", employeeNote: "Ticket volume high; drafting in batches." },
    ],
  },
];

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ name, size = "sm" }: { name: string; size?: "sm" | "md" }) {
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  const dim = size === "md" ? 44 : 32;
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#dbeafe] font-semibold text-[#0F50DB]"
      style={{ width: dim, height: dim, fontSize: size === "md" ? 15 : 12 }}
    >
      {initials}
    </span>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function TeamPage() {
  const [tab, setTab] = useState<"team" | "mine">("team");

  return (
    <div className="flex flex-col gap-6">
      {/* Heading */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">Team</h1>
        <p className="mt-1.5 text-sm text-gray-500">Appraisals &amp; KPI reviews for you and your direct reports.</p>
      </div>

      {/* Underline tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {([["team", "Team Appraisals"], ["mine", "My Appraisal"]] as const).map(([v, l]) => {
          const on = tab === v;
          return (
            <button
              key={v}
              type="button"
              onClick={() => setTab(v)}
              className="mb-[-1px] border-b-2 px-4 py-2.5 text-sm font-medium transition-colors"
              style={{
                borderColor: on ? "#0F50DB" : "transparent",
                color: on ? "#0F50DB" : "#64748b",
              }}
            >
              {l}
            </button>
          );
        })}
      </div>

      {tab === "team" ? <TeamAppraisals /> : <AppraisalEditor person={SELF_PERSON} selfMode />}
    </div>
  );
}

// ── Team Appraisals ───────────────────────────────────────────────────────────
function TeamAppraisals() {
  const [selected, setSelected] = useState<TeamPerson | null>(null);
  if (selected) return <AppraisalEditor person={selected} onBack={() => setSelected(null)} />;
  return <TeamList onOpen={setSelected} />;
}

function TeamList({ onOpen }: { onOpen: (p: TeamPerson) => void }) {
  const [seg, setSeg] = useState<"active" | "inactive">("active");

  const thCls = "px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-gray-500 border-b border-gray-200";

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-200 px-6 py-[22px]">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Employee KPIs</h2>
          <p className="mt-1 text-sm text-gray-500">Select an employee to view and manage their KPIs.</p>
        </div>
        {/* Segmented control */}
        <div className="flex gap-0.5 rounded-lg border border-gray-200 bg-gray-100 p-0.5">
          {([["active", "Active Employees"], ["inactive", "Non-Active Employees"]] as const).map(([v, l]) => (
            <button
              key={v}
              type="button"
              onClick={() => setSeg(v)}
              className="rounded-md px-4 py-1.5 text-sm font-semibold transition-all"
              style={{
                background: seg === v ? "white" : "transparent",
                color: seg === v ? "#0F50DB" : "#64748b",
                boxShadow: seg === v ? "0 1px 3px rgba(0,0,0,0.10)" : "none",
              }}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {seg === "inactive" ? (
        <p className="px-6 py-12 text-center text-sm text-gray-500">No non-active employees on your team.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr>
                <th className={thCls}>Employee No</th>
                <th className={thCls}>Name &amp; Surname</th>
                <th className={thCls}>Direct Manager</th>
                <th className={thCls}>Start Date</th>
                <th className={thCls}>KPIs</th>
                <th className={`${thCls} w-11`}></th>
              </tr>
            </thead>
            <tbody>
              {TEAM.map((p) => (
                <tr
                  key={p.no}
                  onClick={() => onOpen(p)}
                  className="cursor-pointer border-t border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-6 py-4 font-['Inter'] text-sm font-bold text-gray-900">{p.no}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={p.name} />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                        <p className="text-xs text-gray-500">{p.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-[#0F50DB]">{p.manager}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{p.start}</td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
                      {p.kpis.length} KPIs
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-400">
                    <ChevronIcon />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Appraisal Editor ──────────────────────────────────────────────────────────
function AppraisalEditor({
  person,
  onBack,
  selfMode = false,
}: {
  person: TeamPerson;
  onBack?: () => void;
  selfMode?: boolean;
}) {
  const [kpis, setKpis] = useState<KPI[]>(person.kpis);
  const [saved, setSaved] = useState(false);

  const totalWeight = kpis.reduce((s, k) => s + (Number(k.weight) || 0), 0);
  const weightOk = totalWeight === 100;

  const patch = <K extends keyof KPI>(id: number, field: K, value: KPI[K]) => {
    setKpis((ks) => ks.map((k) => (k.id === id ? { ...k, [field]: value } : k)));
    setSaved(false);
  };
  const remove = (id: number) => { setKpis((ks) => ks.filter((k) => k.id !== id)); setSaved(false); };
  const add = () => {
    setKpis((ks) => [...ks, { id: Date.now(), title: "", weight: 0, due: "", review: "", status: "on-track", managerNote: "", employeeNote: "" }]);
    setSaved(false);
  };

  const inputCls = "w-full h-11 rounded-lg border border-gray-300 bg-white px-3.5 text-sm text-gray-900 focus:border-[#0F50DB] focus:outline-none focus:ring-1 focus:ring-[#0F50DB]";
  const roCls   = selfMode ? "bg-gray-50 text-gray-700 cursor-default pointer-events-none" : "";

  return (
    <div className="flex flex-col gap-5">
      {/* Editor header card */}
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-gray-200 bg-white p-[22px] shadow-sm">
        <div className="flex items-center gap-4">
          {!selfMode && onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Back to team"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
            >
              <span className="rotate-180 inline-flex"><ChevronIcon /></span>
            </button>
          )}
          <Avatar name={person.name} size="md" />
          <div>
            <h2 className="text-[22px] font-bold text-gray-900">{person.name} — KPIs</h2>
            <p className="mt-0.5 text-sm text-gray-500">{person.no} · {person.role} · Started {person.start}</p>
            <p className="mt-1.5 text-sm text-gray-500">
              Direct manager:{" "}
              <span className="font-semibold text-[#0F50DB]">{person.manager}</span>
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold"
            style={{
              background: weightOk ? "#dcfce7" : "#fef3c7",
              color: weightOk ? "#16a34a" : "#b45309",
            }}
          >
            Total weight: {totalWeight}%
          </span>
          {!selfMode && (
            <>
              <button
                type="button"
                onClick={add}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <PlusIcon /> Add KPI
              </button>
              <button
                type="button"
                onClick={() => setSaved(true)}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#0F50DB] px-4 text-sm font-semibold text-white hover:bg-[#0D46C3]"
              >
                <CheckIcon size={15} /> {saved ? "Saved" : "Save"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Info banner for self mode */}
      {selfMode && (
        <div className="flex items-center gap-2.5 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700 border border-blue-200">
          <InfoIcon />
          This is your appraisal from your manager. Manager notes are read-only — you can update your own note and save.
        </div>
      )}

      {/* KPI cards */}
      {kpis.map((k, i) => {
        const st = KPI_STATUS[k.status] ?? KPI_STATUS["on-track"];
        return (
          <div key={k.id} className="rounded-xl border border-gray-200 bg-white p-[22px] shadow-sm">
            {/* Title row */}
            <div className="mb-5 flex items-center gap-3.5">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 font-['Inter'] text-sm font-bold text-gray-500">
                {i + 1}
              </span>
              <input
                value={k.title}
                readOnly={selfMode}
                onChange={(e) => patch(k.id, "title", e.target.value)}
                placeholder="KPI title"
                className={`${inputCls} flex-1 font-semibold ${roCls}`}
              />
              {!selfMode && (
                <button
                  type="button"
                  onClick={() => remove(k.id)}
                  aria-label="Delete KPI"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-red-500"
                >
                  <TrashIcon />
                </button>
              )}
            </div>

            {/* 4-col field grid */}
            <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-500">Weight (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={k.weight}
                  readOnly={selfMode}
                  onChange={(e) => patch(k.id, "weight", Number(e.target.value))}
                  className={`${inputCls} font-['Inter'] ${roCls}`}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-500">Due date</label>
                <input
                  type="date"
                  value={k.due}
                  readOnly={selfMode}
                  onChange={(e) => patch(k.id, "due", e.target.value)}
                  className={`${inputCls} font-['Inter'] ${roCls}`}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-500">Last review date</label>
                <input
                  type="date"
                  value={k.review}
                  readOnly={selfMode}
                  onChange={(e) => patch(k.id, "review", e.target.value)}
                  className={`${inputCls} font-['Inter'] ${roCls}`}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-500">Status</label>
                {selfMode ? (
                  <div
                    className={`${inputCls} flex items-center bg-gray-50`}
                    style={{ color: st.color }}
                  >
                    <span className="font-semibold">{st.label}</span>
                  </div>
                ) : (
                  <select
                    value={k.status}
                    onChange={(e) => patch(k.id, "status", e.target.value)}
                    className={`${inputCls} cursor-pointer`}
                    style={{ color: st.color, fontWeight: 600 }}
                  >
                    {Object.entries(KPI_STATUS).map(([v, m]) => (
                      <option key={v} value={v}>{m.label}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Notes 2-col */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-500">Line manager note</label>
                <textarea
                  value={k.managerNote}
                  readOnly={selfMode}
                  onChange={(e) => patch(k.id, "managerNote", e.target.value)}
                  placeholder="Manager feedback…"
                  rows={3}
                  className={`w-full resize-y rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:border-[#0F50DB] focus:outline-none focus:ring-1 focus:ring-[#0F50DB] ${selfMode ? "bg-gray-50 cursor-default pointer-events-none" : ""}`}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-500">Employee note</label>
                <textarea
                  value={k.employeeNote}
                  onChange={(e) => patch(k.id, "employeeNote", e.target.value)}
                  placeholder="Employee comment…"
                  rows={3}
                  className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:border-[#0F50DB] focus:outline-none focus:ring-1 focus:ring-[#0F50DB]"
                />
              </div>
            </div>
          </div>
        );
      })}

      {/* Self-mode save button */}
      {selfMode && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setSaved(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#0F50DB] px-4 text-sm font-semibold text-white hover:bg-[#0D46C3]"
          >
            <CheckIcon size={15} /> {saved ? "Saved" : "Save my notes"}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Icon helpers ─────────────────────────────────────────────────────────────
function ChevronIcon() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function CheckIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}
function InfoIcon() {
  return (
    <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
