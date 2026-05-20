"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useTeamLeaveCalendar } from "@/hooks/employee/useEmployeeData";

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
function daysOfMonth(d: Date) {
  const days: Date[] = [];
  const last = endOfMonth(d);
  for (let i = 1; i <= last.getDate(); i++) days.push(new Date(d.getFullYear(), d.getMonth(), i));
  return days;
}
function fmtIso(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function EmployeeLeaveCalendarPage() {
  const { data, isLoading, error } = useTeamLeaveCalendar();
  const today = useMemo(() => new Date(), []);
  const monthStart = useMemo(() => startOfMonth(today), [today]);
  const days = useMemo(() => daysOfMonth(today), [today]);
  const startWeekday = monthStart.getDay();
  const events = data?.events ?? [];

  const eventsByDay = new Map<string, typeof events>();
  for (const e of events) {
    const start = new Date(e.startDate);
    const end = new Date(e.endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = fmtIso(d);
      const arr = eventsByDay.get(key) ?? [];
      arr.push(e);
      eventsByDay.set(key, arr);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-6 shadow-sm dark:bg-slate-900">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">
            Leave Calendar — {today.toLocaleString("en-US", { month: "long", year: "numeric" })}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Approved and pending leaves across your company for this month.
          </p>
        </div>
        <Link
          href="/employee/leave"
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
        >
          Back to Leave
        </Link>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-900">
        {error ? (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/40 dark:text-red-200">
            Failed to load calendar: {(error as Error).message}
          </div>
        ) : null}
        <div className="grid grid-cols-7 gap-1 text-xs font-medium uppercase text-gray-500 dark:text-slate-400">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="px-2 py-2 text-center">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startWeekday }).map((_, i) => (
            <div key={`blank-${i}`} className="min-h-[80px] rounded-md bg-gray-50 dark:bg-slate-800/40" />
          ))}
          {days.map((day) => {
            const key = fmtIso(day);
            const dayEvents = eventsByDay.get(key) ?? [];
            const isToday = fmtIso(day) === fmtIso(today);
            return (
              <div
                key={key}
                className={`min-h-[80px] rounded-md border p-1 text-xs ${
                  isToday
                    ? "border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/30"
                    : "border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                }`}
              >
                <div className={`text-right font-semibold ${isToday ? "text-blue-700 dark:text-blue-200" : "text-gray-700 dark:text-slate-200"}`}>
                  {day.getDate()}
                </div>
                <div className="mt-1 space-y-1">
                  {dayEvents.slice(0, 3).map((e, i) => (
                    <div
                      key={`${e.id}-${i}`}
                      className={`truncate rounded px-1 py-0.5 ${
                        e.status === "approved"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
                      }`}
                      title={`${e.userName} — ${e.type} (${e.status})`}
                    >
                      {e.userName.split(" ")[0]} · {e.type}
                    </div>
                  ))}
                  {dayEvents.length > 3 ? (
                    <div className="text-[10px] text-gray-500 dark:text-slate-400">
                      +{dayEvents.length - 3} more
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
        {isLoading ? (
          <p className="mt-4 text-center text-sm text-gray-500 dark:text-slate-400">Loading…</p>
        ) : events.length === 0 ? (
          <p className="mt-4 text-center text-sm text-gray-500 dark:text-slate-400">
            No leaves on the calendar this month.
          </p>
        ) : null}
      </div>
    </div>
  );
}
