"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useApplyLeave,
  useMyLeaveBalance,
  useMyLeaveRequests,
} from "@/hooks/employee/useEmployeeData";
import type { LeaveType } from "@/lib/api/employee/leave";

const LEAVE_TYPES: LeaveType[] = ["Annual", "Sick", "Unpaid", "Maternity", "Paternity", "Other"];

const BALANCE_CARDS = [
  { label: "Sick Leave", color: "#22c55e", pct: 100 },
  { label: "Annual Leave", color: "#f59e0b", pct: 34 },
  { label: "Unpaid", color: "#64748b", pct: 0 },
  { label: "Maternity / Paternity", color: "#a855f7", pct: 15 },
];

function statusBadgeClass(status: string) {
  switch (status) {
    case "approved": return "rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700";
    case "rejected": return "rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700";
    case "cancelled": return "rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600";
    default: return "rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700";
  }
}

function daysBetween(from: string, to: string): number {
  if (!from || !to) return 0;
  const diff = (new Date(to).getTime() - new Date(from).getTime()) / 86400000;
  return diff >= 0 ? diff + 1 : 0;
}

export default function EmployeeLeavePage() {
  const { data: leaveData, isLoading, error } = useMyLeaveRequests();
  const { data: balanceData } = useMyLeaveBalance();
  const applyMut = useApplyLeave();

  const [leaveType, setLeaveType] = useState<LeaveType>("Annual");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [reason, setReason] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const requests = leaveData?.requests ?? [];
  const balance = balanceData?.balance;
  const days = daysBetween(from, to);

  const submit = async () => {
    setSubmitError(null);
    if (!from || !to || days <= 0) {
      setSubmitError("Please pick a valid From and To date.");
      return;
    }
    try {
      await applyMut.mutateAsync({ type: leaveType, startDate: from, endDate: to, reason: reason || undefined });
      setSubmitted(true);
      setFrom(""); setTo(""); setReason(""); setLeaveType("Annual"); setShowComments(false);
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err) {
      setSubmitError((err as Error).message);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb home chip */}
      <div>
        <Link href="/employee/dashboard" className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 shadow-sm hover:bg-gray-50">
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" /><polyline points="9 21 9 12 15 12 15 21" />
          </svg>
        </Link>
      </div>

      {/* Balances */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Your Balances</h2>
        <div className="flex gap-[18px] overflow-x-auto pb-1">
          {BALANCE_CARDS.map((b) => (
            <div key={b.label} className="w-[232px] shrink-0 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">{b.label}</span>
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: b.color }} />
              </div>
              <p className="mt-3.5 font-['Inter'] text-3xl font-bold leading-none text-gray-900">
                {b.label === "Annual Leave" ? balance?.remaining ?? "—" : b.label === "Sick Leave" ? balance?.totalAnnual ?? "—" : "—"}
              </p>
              <p className="mt-0.5 text-xs text-gray-500">Balance Days</p>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-gray-200">
                <div className="h-full rounded-full" style={{ width: `${b.pct}%`, background: b.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Apply for Leave form */}
      <div className="rounded-xl border border-gray-200 bg-white p-7 shadow-sm">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-[22px] font-bold text-gray-900">Apply for Leave</h2>
          <span className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3.5 py-2 text-sm text-gray-500">
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Last leave taken:{" "}
            <span className="font-semibold text-gray-900">
              {requests[0]?.endDate?.slice(0, 10) ?? "—"}
            </span>
          </span>
        </div>

        {/* Leave type band */}
        <div className="flex flex-wrap items-center justify-between gap-5 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4">
          <div className="flex items-center gap-4 min-w-0">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[#0F50DB]">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </span>
            <div>
              <p className="text-base font-semibold text-[#0F50DB]">Select Leave Type</p>
              <p className="text-xs text-blue-600">Choose the category of leave you wish to apply for</p>
            </div>
          </div>
          <select
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value as LeaveType)}
            className="w-60 shrink-0 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#0F50DB] focus:outline-none"
          >
            {LEAVE_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>

        {/* Date range */}
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">From Date <span className="text-red-500">*</span></span>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-[#0F50DB] focus:outline-none focus:ring-1 focus:ring-[#0F50DB]" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">To Date <span className="text-red-500">*</span></span>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-[#0F50DB] focus:outline-none focus:ring-1 focus:ring-[#0F50DB]" />
          </label>
        </div>

        {days > 0 && (
          <p className="mt-3 text-sm text-gray-500">
            Duration:{" "}
            <span className="font-semibold text-gray-900">{days.toFixed(2)} day{days === 1 ? "" : "s"}</span>{" "}
            of <span className="font-semibold text-gray-900">{leaveType}</span>
          </p>
        )}

        {/* Comments toggle */}
        <div className="mt-5">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700">
            <input type="checkbox" checked={showComments} onChange={(e) => setShowComments(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-[#0F50DB] accent-[#0F50DB]" />
            Comments
          </label>
          <textarea
            placeholder="Add any additional details about your leave request here..."
            disabled={!showComments}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            className="mt-3 w-full resize-y rounded-lg border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#0F50DB] focus:outline-none focus:ring-1 focus:ring-[#0F50DB] disabled:bg-gray-50 disabled:opacity-70"
          />
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between gap-4 border-t border-gray-200 pt-5">
          <span className="text-sm text-gray-500">
            {submitError
              ? <span className="text-red-600">{submitError}</span>
              : <><span className="text-red-500">*</span> Required fields</>}
          </span>
          <button
            type="button"
            onClick={submit}
            disabled={applyMut.isPending}
            className="rounded-lg bg-[#0F50DB] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0D46C3] disabled:opacity-60"
          >
            {applyMut.isPending ? "Submitting…" : "Apply for Leave"}
          </button>
        </div>
      </div>

      {/* Leave requests table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-[17px] font-semibold text-gray-900">Leave Requests</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Type</th>
                <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">From</th>
                <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">To</th>
                <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Reason</th>
                <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {error ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-red-600">Failed to load: {(error as Error).message}</td></tr>
              ) : isLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">Loading…</td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">No leave requests yet.</td></tr>
              ) : requests.map((r) => (
                <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{r.type}</td>
                  <td className="px-6 py-4 text-gray-600">{r.startDate?.slice(0, 10)}</td>
                  <td className="px-6 py-4 text-gray-600">{r.endDate?.slice(0, 10)}</td>
                  <td className="px-6 py-4 text-gray-600">{r.reason || "—"}</td>
                  <td className="px-6 py-4"><span className={statusBadgeClass(r.status)}>{r.status.charAt(0).toUpperCase() + r.status.slice(1)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Success toast */}
      {submitted && (
        <div className="fixed right-7 top-20 z-50 rounded-xl border border-green-200 bg-white px-5 py-4 shadow-lg">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-900">Leave request submitted</p>
              <p className="text-xs text-gray-500">{days > 0 ? `${days.toFixed(2)} day(s) of ${leaveType} sent for approval.` : "Your request has been sent for approval."}</p>
            </div>
            <button onClick={() => setSubmitted(false)} className="ml-2 text-gray-400 hover:text-gray-600">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
