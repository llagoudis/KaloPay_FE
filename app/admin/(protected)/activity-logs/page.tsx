"use client";

import { useState, useEffect, useCallback } from "react";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import { getActivityLogs, type ActivityLog } from "@/lib/api/admin/activityLogs";

type ActivityLogRow = {
  id: number;
  createdAt: string;
  administrator: string;
  description: string;
  action: string;
};

export default function AdminActivityLogsPage() {
  const token = useAdminAuthStore((s) => s.token);
  const [search, setSearch] = useState("");
  const [logs, setLogs] = useState<ActivityLogRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await getActivityLogs(token, { limit: "100" });
      const rows: ActivityLogRow[] = (res.data ?? []).map((l: ActivityLog) => ({
        id: l.id,
        createdAt: l.created_at
          ? new Date(l.created_at).toLocaleString("en-GB", { hour12: true })
          : "",
        administrator: l.administrator ?? "Unknown",
        description: l.description ?? "",
        action: l.action ?? "",
      }));
      setLogs(rows);
    } catch (err) {
      console.error("Failed to fetch activity logs:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const filtered = logs.filter(
    (row) =>
      row.administrator.toLowerCase().includes(search.toLowerCase()) ||
      row.description.toLowerCase().includes(search.toLowerCase()) ||
      row.action.toLowerCase().includes(search.toLowerCase()) ||
      row.createdAt.includes(search)
  );

  return (
    <div className="admin-activity-log-page w-full space-y-6">
      <div className="admin-page-title-strip w-full rounded-[10px] bg-white" style={{ padding: "24px" }}>
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

      <div className="admin-page-panel w-full rounded-[10px] bg-white p-6">
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
            <div
              className="admin-activity-log-header grid gap-x-6 py-2 text-xs font-medium text-gray-500"
              style={{ gridTemplateColumns: "1.2fr 1fr 2fr 0.8fr" }}
            >
              <span>Created at</span>
              <span>Administrator</span>
              <span>Description</span>
              <span>Action</span>
            </div>
            <div className="admin-activity-log-rows">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-400">
                  No activity log entries found.
                </div>
              ) : (
                filtered.map((row) => (
                  <div
                    key={row.id}
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
