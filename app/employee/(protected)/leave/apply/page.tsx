"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useApplyLeave } from "@/hooks/employee/useEmployeeData";
import type { LeaveType } from "@/lib/api/employee/leave";

const LEAVE_TYPES: LeaveType[] = ["Annual", "Sick", "Unpaid", "Maternity", "Paternity", "Other"];

export default function EmployeeApplyLeavePage() {
  const router = useRouter();
  const applyMut = useApplyLeave();
  const [type, setType] = useState<LeaveType>("Annual");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!from || !to) {
      setError("Please choose start and end dates.");
      return;
    }
    if (new Date(from) > new Date(to)) {
      setError("End date must be on or after start date.");
      return;
    }
    try {
      await applyMut.mutateAsync({ type, startDate: from, endDate: to, reason: reason || undefined });
      setSuccess(true);
      setTimeout(() => router.push("/employee/leave"), 800);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-xl bg-white p-6 shadow-sm dark:bg-slate-900">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">Apply for Leave</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Submit a new leave request — your employer will review it.
          </p>
        </div>
        <Link
          href="/employee/leave"
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
        >
          Back
        </Link>
      </div>

      <form
        onSubmit={submit}
        className="space-y-4 rounded-xl bg-white p-6 shadow-sm dark:bg-slate-900"
      >
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">From</span>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">To</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              required
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
        {error ? (
          <div className="rounded-md bg-red-50 p-2 text-sm text-red-700 dark:bg-red-900/40 dark:text-red-200">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="rounded-md bg-green-50 p-2 text-sm text-green-700 dark:bg-green-900/40 dark:text-green-200">
            Request submitted. Redirecting…
          </div>
        ) : null}
        <div className="flex justify-end gap-2">
          <Link
            href="/employee/leave"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          >
            Cancel
          </Link>
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
  );
}
