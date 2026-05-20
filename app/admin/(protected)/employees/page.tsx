"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import { ROUTES } from "@/lib/constants/routes";
import { useAdminEmployees, useDeleteAdminEmployee } from "@/hooks/admin/useEmployees";
import type { AdminEmployee } from "@/lib/api/admin/employees";

type EmployeeRow = {
  clientId: string;
  name: string;
  emails: string;
  verificationStatus1: string;
  verificationStatus2: string;
  country: string;
  createdAt: string;
};

function toRow(e: AdminEmployee): EmployeeRow {
  const verification = (e.status ?? "active").toLowerCase() === "active" ? "Approved" : "Pending";
  const created = e.created_at ? new Date(e.created_at).toLocaleDateString() : "—";
  return {
    clientId: String(e.id),
    name: e.name,
    emails: e.email ?? "—",
    verificationStatus1: verification,
    verificationStatus2: verification,
    country: (e.nationality as string) ?? "—",
    createdAt: created,
  };
}

export default function AdminEmployeesPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading, error } = useAdminEmployees(search ? { search } : undefined);
  const deleteMut = useDeleteAdminEmployee();

  const rows = useMemo(() => (data?.data ?? []).map(toRow), [data]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete employee "${name}"? This cannot be undone.`)) return;
    try {
      await deleteMut.mutateAsync(id);
    } catch (e) {
      alert(`Failed to delete: ${(e as Error).message}`);
    }
  };

  const columns = [
    { key: "clientId" as const, header: "Client ID" },
    {
      key: "name" as const,
      header: "Name",
      render: (value: unknown, row: EmployeeRow) => (
        <Link
          href={ROUTES.admin.employeeDetail(row.clientId)}
          className="font-medium text-blue-600 hover:underline"
        >
          {String(value)}
        </Link>
      ),
    },
    { key: "emails" as const, header: "Emails" },
    {
      key: "verificationStatus1" as const,
      header: "Verification Status",
      render: (value: unknown) => (
        <Badge
          label={String(value)}
          variant={String(value) === "Approved" ? "success" : "warning"}
        />
      ),
    },
    {
      key: "verificationStatus2" as const,
      header: "Account Status",
      render: (value: unknown) => (
        <Badge
          label={String(value)}
          variant={String(value) === "Approved" ? "success" : "warning"}
        />
      ),
    },
    { key: "country" as const, header: "Country" },
    { key: "createdAt" as const, header: "Created At" },
    {
      key: "actions" as const,
      header: "",
      render: (_: unknown, row: EmployeeRow) => (
        <button
          type="button"
          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-600 disabled:opacity-50"
          aria-label={`Delete ${row.name}`}
          title="Delete"
          onClick={() => handleDelete(row.clientId, row.name)}
          disabled={deleteMut.isPending}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a2 2 0 012-2h2a2 2 0 012 2v3" />
          </svg>
        </button>
      ),
    },
  ];

  const tableData = rows.map((e) => ({ ...e, actions: null }));

  return (
    <div className="w-full space-y-6">
      <div className="w-full rounded-[10px] bg-white" style={{ padding: "24px" }}>
        <h1
          className="admin-page-heading align-middle font-semibold"
          style={{
            fontFamily: "var(--font-poppins), Poppins, sans-serif",
            fontWeight: 600,
            fontStyle: "normal",
            fontSize: "24px",
            lineHeight: "26px",
            letterSpacing: "0px",
            color: "#0E1620",
          }}
        >
          Employees
        </h1>
      </div>

      <div className="w-full rounded-xl bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <label className="relative min-w-0 flex-1">
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
          <Link href={ROUTES.admin.employeeAdd} className="shrink-0">
            <Button variant="primary" size="md">
              + Add new
            </Button>
          </Link>
        </div>
        {error ? (
          <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            Failed to load employees: {(error as Error).message}
          </div>
        ) : null}
        <Table<EmployeeRow & { actions: null }>
          columns={columns}
          data={tableData}
          emptyMessage={isLoading ? "Loading employees…" : "No employees found."}
          className="admin-list-table mt-6 border-0 border-gray-100"
        />
      </div>
    </div>
  );
}
