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

function statusBadgeClass(status: string) {
  switch (status) {
    case "approved":
      return "rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/40 dark:text-green-300";
    case "rejected":
      return "rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-900/40 dark:text-red-300";
    case "cancelled":
      return "rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-slate-700 dark:text-slate-200";
    default:
      return "rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";
  }
}

function fmtStatus(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function EmployeeLeavePage() {
  const { data: leaveData, isLoading, error } = useMyLeaveRequests();
  const { data: balanceData } = useMyLeaveBalance();
  const applyMut = useApplyLeave();

  const [formOpen, setFormOpen] = useState(false);
  const [type, setType] = useState<LeaveType>("Annual");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [reason, setReason] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const requests = leaveData?.requests ?? [];
  const balance = balanceData?.balance;

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);
    if (!from || !to) {
      setSubmitError("Please choose start and end dates.");
      return;
    }
    if (new Date(from) > new Date(to)) {
      setSubmitError("End date must be on or after start date.");
      return;
    }
    try {
      await applyMut.mutateAsync({ type, startDate: from, endDate: to, reason: reason || undefined });
      setFormOpen(false);
      setFrom("");
      setTo("");
      setReason("");
      setType("Annual");
    } catch (err) {
      setSubmitError((err as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-6 shadow-sm dark:bg-slate-900">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">Leave</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Submit time-off requests and track approvals from your employer.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/employee/leave/calendar"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          >
            View Calendar
          </Link>
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Request Leave
          </button>
        </div>
      </div>

      {balance ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <BalanceCard label={`Annual ${balance.year}`} value={`${balance.totalAnnual} days`} />
          <BalanceCard label="Used" value={`${balance.used} days`} tone="green" />
          <BalanceCard label="Pending" value={`${balance.pending} days`} tone="amber" />
          <BalanceCard label="Remaining" value={`${balance.remaining} days`} tone="blue" />
        </div>
      ) : null}

      <div className="rounded-xl bg-white shadow-sm dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs uppercase text-gray-500 dark:border-slate-700 dark:text-slate-400">
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">From</th>
                <th className="px-4 py-3">To</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {error ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sm text-red-600">
                    Failed to load leave: {(error as Error).message}
                  </td>
                </tr>
              ) : isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-slate-400">
                    Loading…
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-slate-400">
                    No leave requests yet.
                  </td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr key={r.id} className="border-b border-gray-100 dark:border-slate-800">
                    <td className="px-4 py-3 text-gray-900 dark:text-slate-100">{r.type}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-slate-200">{r.startDate?.slice(0, 10)}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-slate-200">{r.endDate?.slice(0, 10)}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-slate-200">{r.reason || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={statusBadgeClass(r.status)}>{fmtStatus(r.status)}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {formOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setFormOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Request Leave</h2>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form className="space-y-4" onSubmit={submit}>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">Type</span>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as LeaveType)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                >
                  {LEAVE_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">From</span>
                  <input
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">To</span>
                  <input
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  />
                </label>
              </div>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">Reason</span>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  placeholder="Optional note for your manager"
                />
              </label>
              {submitError ? (
                <div className="rounded-md bg-red-50 p-2 text-sm text-red-700 dark:bg-red-900/40 dark:text-red-200">
                  {submitError}
                </div>
              ) : null}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applyMut.isPending}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {applyMut.isPending ? "Submitting…" : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function BalanceCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "green" | "amber" | "blue";
}) {
  const toneClass =
    tone === "green"
      ? "text-green-600 dark:text-green-300"
      : tone === "amber"
      ? "text-amber-600 dark:text-amber-300"
      : tone === "blue"
      ? "text-blue-600 dark:text-blue-300"
      : "text-gray-900 dark:text-slate-100";
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-900">
      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}
