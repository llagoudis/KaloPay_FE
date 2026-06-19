"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useTeamLeaveCalendar } from "@/hooks/employee/useEmployeeData";

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_NAMES = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

const LEAVE_COLORS: Record<string, string> = {
  Annual: "#f59e0b",
  Sick: "#22c55e",
  Unpaid: "#64748b",
  Maternity: "#a855f7",
  Paternity: "#a855f7",
  Other: "#0F50DB",
};

function fmtIso(d: Date) { return d.toISOString().slice(0, 10); }

function daysInMonth(year: number, month: number) {
  const days: Date[] = [];
  const last = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= last; i++) days.push(new Date(year, month, i));
  return days;
}

export default function EmployeeLeaveCalendarPage() {
  const { data, isLoading, error } = useTeamLeaveCalendar();
  const today = useMemo(() => new Date(), []);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const days = useMemo(() => daysInMonth(year, month), [year, month]);
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const startOffset = firstDay === 0 ? 6 : firstDay - 1; // Mon-first

  const events = data?.events ?? [];

  const eventsByDay = useMemo(() => {
    const map = new Map<string, typeof events>();
    for (const e of events) {
      const start = new Date(e.startDate);
      const end = new Date(e.endDate);
      for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const key = fmtIso(new Date(d));
        const arr = map.get(key) ?? [];
        arr.push(e);
        map.set(key, arr);
      }
    }
    return map;
  }, [events]);

  // "This year" summary counts
  const thisYearEvents = events.filter((e) => new Date(e.startDate).getFullYear() === year);
  const typeCounts = thisYearEvents.reduce<Record<string, number>>((acc, e) => {
    acc[e.type] = (acc[e.type] ?? 0) + 1;
    return acc;
  }, {});

  const prevMonth = () => { if (month === 0) { setYear((y) => y - 1); setMonth(11); } else setMonth((m) => m - 1); };
  const nextMonth = () => { if (month === 11) { setYear((y) => y + 1); setMonth(0); } else setMonth((m) => m + 1); };

  const todayIso = fmtIso(today);
  const types = [...new Set(events.map((e) => e.type))];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-7 py-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Leave Calendar</h1>
          <p className="mt-1.5 text-sm text-gray-500">Team and personal leave at a glance.</p>
        </div>
        <Link href="/employee/leave" className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Apply for Leave
        </Link>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Calendar */}
        <div className="flex-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {/* Month nav */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <button onClick={prevMonth} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <h2 className="text-base font-semibold text-gray-900">{MONTH_NAMES[month]} {year}</h2>
            <button onClick={nextMonth} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>

          {/* Day name headers */}
          <div className="grid grid-cols-7 border-b border-gray-200">
            {DAY_NAMES.map((d) => (
              <div key={d} className="py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-500">{d}</div>
            ))}
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="py-16 text-center text-sm text-gray-500">Loading…</div>
          ) : error ? (
            <div className="py-16 text-center text-sm text-red-600">{(error as Error).message}</div>
          ) : (
            <div className="grid grid-cols-7">
              {/* blank offsets */}
              {Array.from({ length: startOffset }).map((_, i) => (
                <div key={`off-${i}`} className="min-h-[80px] border-b border-r border-gray-100 bg-gray-50/50" />
              ))}
              {days.map((day) => {
                const iso = fmtIso(day);
                const dayEvents = eventsByDay.get(iso) ?? [];
                const isToday = iso === todayIso;
                return (
                  <div key={iso} className="min-h-[80px] border-b border-r border-gray-100 p-1.5">
                    <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${isToday ? "bg-[#0F50DB] text-white" : "text-gray-700"}`}>
                      {day.getDate()}
                    </span>
                    <div className="mt-1 flex flex-col gap-0.5">
                      {dayEvents.slice(0, 2).map((e, idx) => (
                        <div key={idx} className="truncate rounded px-1 py-0.5 text-[10px] font-medium text-white"
                          style={{ background: LEAVE_COLORS[e.type] ?? "#0F50DB" }}>
                          {e.userName ?? e.type}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-[10px] text-gray-400">+{dayEvents.length - 2} more</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Legend */}
          {types.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 border-t border-gray-200 px-5 py-3">
              {types.map((t) => (
                <span key={t} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: LEAVE_COLORS[t] ?? "#0F50DB" }} />
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: This year summary */}
        <div className="w-full lg:w-64 shrink-0 flex flex-col gap-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">This year — {year}</h3>
            {Object.keys(LEAVE_COLORS).map((t) => (
              <div key={t} className="mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: LEAVE_COLORS[t] }} />
                  {t}
                </span>
                <span className="text-sm font-semibold text-gray-900">{typeCounts[t] ?? 0}</span>
              </div>
            ))}
          </div>

          {/* Leave entitlements */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">Leave Entitlements</h3>
            {[
              { label: "Annual Leave", used: 3, total: 21 },
              { label: "Sick Leave", used: 2, total: 10 },
              { label: "Unpaid", used: 0, total: 999 },
            ].map((item) => (
              <div key={item.label} className="mb-3">
                <div className="mb-1 flex items-center justify-between text-xs text-gray-600">
                  <span>{item.label}</span>
                  <span className="font-medium">{item.used}/{item.total === 999 ? "∞" : item.total}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
                  <div className="h-full rounded-full bg-[#0F50DB]"
                    style={{ width: item.total === 999 ? "0%" : `${Math.min((item.used / item.total) * 100, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
