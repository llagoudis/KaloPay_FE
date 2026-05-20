"use client";

import { useState } from "react";
import Link from "next/link";

type LeaveRequest = {
  id: string;
  type: "Annual" | "Sick" | "Unpaid";
  from: string;
  to: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
};

const STORAGE_KEY = "kalopay-employee-leave-requests";

function loadRequests(): LeaveRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LeaveRequest[]) : [];
  } catch {
    return [];
  }
}

function saveRequests(requests: LeaveRequest[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
}

export default function EmployeeLeavePage() {
  const [requests, setRequests] = useState<LeaveRequest[]>(loadRequests);
  const [formOpen, setFormOpen] = useState(false);
  const [type, setType] = useState<LeaveRequest["type"]>("Annual");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
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
    const next: LeaveRequest = {
      id: `lr-${Date.now()}`,
      type,
      from,
      to,
      reason: reason.trim(),
      status: "Pending",
    };
    const updated = [next, ...requests];
    setRequests(updated);
    saveRequests(updated);
    setFormOpen(false);
    setFrom("");
    setTo("");
    setReason("");
    setType("Annual");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-6 shadow-sm dark:bg-slate-900">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">Leave</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Submit a time-off request and track its status.
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
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-slate-400">
                    No leave requests yet.
                  </td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr key={r.id} className="border-b border-gray-100 dark:border-slate-800">
                    <td className="px-4 py-3 text-gray-900 dark:text-slate-100">{r.type}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-slate-200">{r.from}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-slate-200">{r.to}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-slate-200">{r.reason || "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          r.status === "Approved"
                            ? "rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/40 dark:text-green-300"
                            : r.status === "Rejected"
                            ? "rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-900/40 dark:text-red-300"
                            : "rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                        }
                      >
                        {r.status}
                      </span>
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
                  onChange={(e) => setType(e.target.value as LeaveRequest["type"])}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                >
                  <option>Annual</option>
                  <option>Sick</option>
                  <option>Unpaid</option>
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
              {error ? (
                <div className="rounded-md bg-red-50 p-2 text-sm text-red-700 dark:bg-red-900/40 dark:text-red-200">
                  {error}
                </div>
              ) : null}
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Note: requests are tracked locally until the leave API is connected. Your employer
                will follow up directly to confirm.
              </p>
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
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
