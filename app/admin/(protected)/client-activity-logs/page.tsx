"use client";

import { useMemo, useState } from "react";
import Table from "@/components/ui/Table";
import { useClientActivityLogs } from "@/hooks/admin/useActivityLogs";
import type { ActivityLog } from "@/lib/api/admin/activityLogs";

type ActivityLogRow = ActivityLog & Record<string, unknown>;

function fmtDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

export default function AdminClientActivityLogsPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading, error } = useClientActivityLogs({ limit: "100" });

  const logs = useMemo(() => {
    const rows = data?.data ?? [];
    if (!search) return rows;
    const q = search.toLowerCase();
    return rows.filter(
      (r) =>
        (r.action ?? "").toLowerCase().includes(q) ||
        (r.entity ?? "").toLowerCase().includes(q) ||
        (r.details ?? "").toLowerCase().includes(q) ||
        (r.ip_address ?? "").toLowerCase().includes(q) ||
        fmtDate(r.created_at).toLowerCase().includes(q)
    );
  }, [data, search]);

  const columns = [
    { key: "id" as const, header: "ID", render: (v: unknown) => String(v) },
    {
      key: "admin_id" as const,
      header: "Initiator",
      render: (v: unknown) => String(v ?? "—"),
    },
    { key: "action" as const, header: "Action" },
    { key: "entity" as const, header: "Entity", render: (v: unknown) => String(v ?? "—") },
    { key: "details" as const, header: "Details", render: (v: unknown) => String(v ?? "—") },
    {
      key: "ip_address" as const,
      header: "IP Address",
      render: (v: unknown) => String(v ?? "—"),
    },
    {
      key: "created_at" as const,
      header: "Created At",
      render: (v: unknown) => fmtDate(String(v)),
    },
  ];

  return (
    <div className="admin-activity-log-page w-full space-y-6">
      <div className="w-full rounded-[10px] bg-white p-6">
        <h1 className="text-2xl font-semibold text-[#0E1620]">Client Activity Log</h1>
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

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            Failed to load client activity logs: {(error as Error).message}
          </div>
        )}

        <Table<ActivityLogRow>
          columns={columns}
          data={logs as ActivityLogRow[]}
          emptyMessage={
            isLoading ? "Loading client activity logs…" : "No client activity log entries found."
          }
          className="admin-list-table mt-6 border-0"
        />
      </div>
    </div>
  );
}
