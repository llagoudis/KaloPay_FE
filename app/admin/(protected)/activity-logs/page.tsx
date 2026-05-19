"use client";

import { useState } from "react";

type ActivityLogRow = {
  createdAt: string;
  administrator: string;
  description: string;
  action: string;
};

const mockActivityLogs: ActivityLogRow[] = Array.from({ length: 7 }, () => ({
  createdAt: "23-09-2025 12:19:04 PM",
  administrator: "Shivraj_NET",
  description: "Shivraj_NET Logged In",
  action: "Login",
}));

export default function AdminActivityLogsPage() {
  const [search, setSearch] = useState("");

  const filtered = mockActivityLogs.filter(
    (row) =>
      row.administrator.toLowerCase().includes(search.toLowerCase()) ||
      row.description.toLowerCase().includes(search.toLowerCase()) ||
      row.action.toLowerCase().includes(search.toLowerCase()) ||
      row.createdAt.includes(search)
  );

  return (
    <div className="admin-activity-log-page w-full space-y-6">
      <div className="w-full rounded-[10px] bg-white" style={{ padding: "24px" }}>
        <h1
          className="admin-page-heading align-middle font-semibold"
          style={{
            fontFamily: "var(--font-poppins), Poppins, sans-serif",
            fontWeight: 600,
            fontSize: "24px",
            lineHeight: "26px",
            letterSpacing: "0px",
            color: "#0E1620",
          }}
        >
          Admin Activity Log
        </h1>
      </div>

      {/* Ek hi div — iske andar search + saara data; data ke liye alag-alag div nahi */}
      <div className="w-full rounded-xl bg-white p-6 shadow-sm">
        <label className="relative block">
          <span className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="search"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </label>

        <div className="mt-6 overflow-x-auto rounded-lg">
          <div className="min-w-[720px] px-1">
            {/* Header — column spacing set, neeche line */}
            <div
              className="admin-activity-log-header grid gap-x-6 py-2 text-xs font-medium text-gray-500"
              style={{ gridTemplateColumns: "1.2fr 1fr 2fr 0.8fr" }}
            >
              <span>Created at</span>
              <span>Administrator</span>
              <span>Description</span>
              <span>Action</span>
            </div>
            {/* Data — har detail ke neeche line */}
            <div className="admin-activity-log-rows">
              {filtered.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-400">
                  No activity log entries found.
                </div>
              ) : (
                filtered.map((row, i) => (
                  <div
                    key={i}
                    className="grid gap-x-6 py-4 text-sm text-gray-700"
                    style={{ gridTemplateColumns: "1.2fr 1fr 2fr 0.8fr" }}
                  >
                    <span className="whitespace-nowrap">{row.createdAt}</span>
                    <span>{row.administrator}</span>
                    <span>{row.description}</span>
                    <span>{row.action}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}