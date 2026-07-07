"use client";

import { useState } from "react";

// ── Types ────────────────────────────────────────────────────────────────────
type LeaveStatus = "pending" | "approved" | "rejected";

interface ApprovalRow {
  id: string;
  name: string;
  role: string;
  type: string;
  from: string;
  to: string;
  days: number;
  reason: string;
  requested: string;
  status: LeaveStatus;
}

// ── Mock data (replace with API when "direct reports" endpoint exists) ────────
const INITIAL_ROWS: ApprovalRow[] = [
  {
    id: "lr-1",
    name: "Ben Carter",
    role: "Product Designer",
    type: "Annual Leave",
    from: "2026-07-14",
    to: "2026-07-18",
    days: 5,
    reason: "Summer holiday with family.",
    requested: "2026-07-01",
    status: "pending",
  },
  {
    id: "lr-2",
    name: "Dmitri Volkov",
    role: "Backend Engineer",
    type: "Sick Leave",
    from: "2026-07-08",
    to: "2026-07-09",
    days: 2,
    reason: "Recovering from flu.",
    requested: "2026-07-07",
    status: "pending",
  },
  {
    id: "lr-3",
    name: "Farid Hassan",
    role: "Support Specialist",
    type: "Parental Leave",
    from: "2026-08-01",
    to: "2026-08-15",
    days: 15,
    reason: "New baby arriving.",
    requested: "2026-07-05",
    status: "pending",
  },
];

const STORAGE_KEY = "kp-leave-approvals";

function loadRows(): ApprovalRow[] {
  if (typeof window === "undefined") return INITIAL_ROWS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ApprovalRow[];
  } catch {}
  return INITIAL_ROWS;
}

function saveRows(rows: ApprovalRow[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

// ── Leave type pill colours ───────────────────────────────────────────────────
const TYPE_META: Record<string, { color: string; bg: string }> = {
  "Annual Leave":   { color: "#f59e0b", bg: "#fff7e6" },
  "Sick Leave":     { color: "#22c55e", bg: "#e9faef" },
  "Business Trip":  { color: "#0F50DB", bg: "#EEF2FF" },
  "Parental Leave": { color: "#a855f7", bg: "#f6edff" },
};

function fmt(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

function Avatar({ name, size = "sm" }: { name: string; size?: "sm" | "md" }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const dim = size === "md" ? 40 : 32;
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#dbeafe] font-semibold text-[#0F50DB]"
      style={{ width: dim, height: dim, fontSize: size === "md" ? 14 : 12 }}
    >
      {initials}
    </span>
  );
}

// ── Sub-tab bar (shared pattern with leave page) ─────────────────────────────
function LeaveSubTabs() {
  const tabs = [
    { label: "Apply for Leave",    href: "/employee/leave" },
    { label: "Calendar & History", href: "/employee/leave/calendar" },
    { label: "Leave Requests",     href: "/employee/leave/requests" },
  ];
  return (
    <div className="flex gap-1 border-b border-gray-200">
      {tabs.map((t) => {
        const on = t.href === "/employee/leave/requests";
        return (
          <a
            key={t.href}
            href={t.href}
            className="mb-[-1px] border-b-2 px-4 py-2.5 text-sm font-medium transition-colors"
            style={{ borderColor: on ? "#0F50DB" : "transparent", color: on ? "#0F50DB" : "#64748b" }}
          >
            {t.label}
          </a>
        );
      })}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function LeaveRequestsPage() {
  const [rows, setRows] = useState<ApprovalRow[]>(() => loadRows());

  const decide = (id: string, status: "approved" | "rejected") => {
    setRows((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, status } : r));
      saveRows(next);
      return next;
    });
  };

  const pending = rows.filter((r) => r.status === "pending");
  const decided = rows.filter((r) => r.status !== "pending");
  const approvedCount = rows.filter((r) => r.status === "approved").length;

  return (
    <div className="flex flex-col gap-6">
      {/* Sub-tab bar */}
      <LeaveSubTabs />
      {/* Heading */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">Leave Requests</h1>
        <p className="mt-1.5 text-sm text-gray-500">
          Time-off requests from your direct reports awaiting your decision.
        </p>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-3">
        <StatCard label="Pending approval" value={pending.length} icon={<HistoryIcon />} />
        <StatCard label="Approved this year" value={approvedCount} icon={<CheckIcon />} />
        <StatCard label="Direct reports" value={3} icon={<UsersIcon />} />
      </div>

      {/* Awaiting decision */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-[18px]">
          <h2 className="text-[17px] font-semibold text-gray-900">Awaiting decision</h2>
          {pending.length > 0 ? (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
              {pending.length} pending
            </span>
          ) : (
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
              0 pending
            </span>
          )}
        </div>

        {pending.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-gray-500">
            All caught up — no requests waiting on you.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-gray-100">
            {pending.map((r) => {
              const m = TYPE_META[r.type] ?? TYPE_META["Annual Leave"];
              return (
                <div
                  key={r.id}
                  className="flex flex-wrap items-center gap-4 px-6 py-[18px]"
                >
                  {/* Name */}
                  <div className="flex min-w-[190px] items-center gap-3">
                    <Avatar name={r.name} />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{r.name}</p>
                      <p className="text-xs text-gray-500">{r.role}</p>
                    </div>
                  </div>

                  {/* Type pill */}
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                    style={{ background: m.bg, color: m.color }}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: m.color }}
                    />
                    {r.type}
                  </span>

                  {/* Dates */}
                  <div className="min-w-[150px]">
                    <p className="font-['Inter'] text-sm font-semibold text-gray-900">
                      {fmt(r.from)} – {fmt(r.to)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {r.days} {r.days === 1 ? "day" : "days"} · requested {fmt(r.requested)}
                    </p>
                  </div>

                  {/* Reason */}
                  <p className="min-w-[180px] flex-1 text-sm text-gray-600">{r.reason}</p>

                  {/* Actions */}
                  <div className="ml-auto flex gap-2">
                    <button
                      type="button"
                      onClick={() => decide(r.id, "rejected")}
                      className="inline-flex h-[34px] items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => decide(r.id, "approved")}
                      className="inline-flex h-[34px] items-center gap-1.5 rounded-lg bg-[#0F50DB] px-4 text-sm font-semibold text-white hover:bg-[#0D46C3]"
                    >
                      <CheckIcon size={15} />
                      Approve
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent decisions table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-[18px]">
          <h2 className="text-[17px] font-semibold text-gray-900">Recent decisions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                {["Employee", "Type", "Dates", "Days", "Decision"].map((h, i) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.04em] text-gray-500"
                    style={{ textAlign: i === 3 ? "right" : "left" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {decided.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                    No decisions yet.
                  </td>
                </tr>
              ) : (
                decided.map((r) => (
                  <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={r.name} />
                        <span className="font-semibold text-gray-900">{r.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-gray-600">{r.type}</td>
                    <td className="px-6 py-3.5 font-['Inter'] text-gray-500">
                      {fmt(r.from)} – {fmt(r.to)}
                    </td>
                    <td className="px-6 py-3.5 text-right font-['Inter'] text-gray-700">
                      {r.days}
                    </td>
                    <td className="px-6 py-3.5">
                      {r.status === "approved" ? (
                        <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                          Approved
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                          Rejected
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Small shared components ───────────────────────────────────────────────────
function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EEF2FF] text-[#0F50DB]">
        {icon}
      </span>
      <div>
        <p className="font-['Inter'] text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

function CheckIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function HistoryIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
