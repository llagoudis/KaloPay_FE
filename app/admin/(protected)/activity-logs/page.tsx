"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { useAdminAuthStore } from "@/store/adminAuthStore";

interface ActivityLogRow {
  id: number;
  action: string;
  description: string | null;
  ip_address: string | null;
  entity_type: string | null;
  entity_id: number | null;
  created_at: string;
  administrator: string;
}

interface ActivityLogResponse {
  data: ActivityLogRow[];
  total: number;
  page: number;
  limit: number;
}

function useAdminToken() {
  return useAdminAuthStore((s) => s.token);
}

function fmtDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

export default function AdminActivityLogsPage() {
  const [search, setSearch] = useState("");
  const token = useAdminToken();
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "activity-logs"],
    queryFn: () => apiClient<ActivityLogResponse>("/admin/activity-logs?limit=100", { token: token! }),
    enabled: !!token,
  });

  const logs = useMemo(() => {
    const rows = data?.data ?? [];
    if (!search) return rows;
    const q = search.toLowerCase();
    return rows.filter(
      (r) =>
        (r.administrator ?? "").toLowerCase().includes(q) ||
        (r.description ?? "").toLowerCase().includes(q) ||
        (r.action ?? "").toLowerCase().includes(q) ||
        fmtDate(r.created_at).toLowerCase().includes(q)
    );
  }, [data, search]);

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

        {error ? (
          <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            Failed to load activity logs: {(error as Error).message}
          </div>
        ) : null}

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
              {isLoading ? (
                <div className="py-8 text-center text-sm text-gray-400">Loading activity logs…</div>
              ) : logs.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-400">
                  No activity log entries found.
                </div>
              ) : (
                logs.map((row) => (
                  <div
                    key={row.id}
                    className="grid gap-x-6 py-4 text-sm text-gray-700"
                    style={{ gridTemplateColumns: "1.2fr 1fr 2fr 0.8fr" }}
                  >
                    <span className="whitespace-nowrap">{fmtDate(row.created_at)}</span>
                    <span>{row.administrator}</span>
                    <span>{row.description ?? "—"}</span>
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
