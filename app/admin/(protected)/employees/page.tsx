"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import { ROUTES } from "@/lib/constants/routes";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import { getEmployees, deleteEmployee, type Employee } from "@/lib/api/admin/employees";

type EmployeeRow = {
  id: number;
  clientId: string;
  name: string;
  email: string;
  jobTitle: string;
  department: string;
  status: string;
  createdAt: string;
};

function statusVariant(status: string): "success" | "warning" | "danger" | "info" {
  const s = (status ?? "").toLowerCase();
  if (s === "active" || s === "approved") return "success";
  if (s === "pending") return "warning";
  if (s === "terminated" || s === "inactive" || s === "rejected") return "danger";
  return "info";
}

export default function AdminEmployeesPage() {
  const token = useAdminAuthStore((s) => s.token);
  const [search, setSearch] = useState("");
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await getEmployees(token, { limit: "100" });
      const rows: EmployeeRow[] = (res.data ?? []).map((e: Employee) => ({
        id: e.id,
        clientId: String(e.id),
        name: `${e.first_name ?? ""} ${e.last_name ?? ""}`.trim() || "—",
        email: e.email ?? "",
        jobTitle: e.job_title ?? "",
        department: e.department ?? "",
        status: e.status ?? "active",
        createdAt: e.created_at ? new Date(e.created_at).toLocaleDateString("en-GB") : "",
      }));
      setEmployees(rows);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id: number) => {
    if (!token) return;
    if (!confirm("Delete this employee?")) return;
    try {
      await deleteEmployee(token, String(id));
      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete employee");
    }
  };

  const filtered = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      e.clientId.includes(search)
  );

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
    { key: "email" as const, header: "Email" },
    { key: "jobTitle" as const, header: "Job Title" },
    { key: "department" as const, header: "Department" },
    {
      key: "status" as const,
      header: "Status",
      render: (value: unknown) => (
        <Badge label={String(value)} variant={statusVariant(String(value))} />
      ),
    },
    { key: "createdAt" as const, header: "Created At" },
    {
      key: "actions" as const,
      header: "",
      render: (_: unknown, row: EmployeeRow) => (
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenMenuId(openMenuId === row.id ? null : row.id)}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Actions"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </button>
          {openMenuId === row.id && (
            <div className="absolute right-0 z-10 mt-1 w-32 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
              <Link
                href={ROUTES.admin.employeeDetail(row.clientId)}
                className="block px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setOpenMenuId(null)}
              >
                View / Edit
              </Link>
              <button
                type="button"
                onClick={() => { setOpenMenuId(null); handleDelete(row.id); }}
                className="block w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-gray-100"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  const tableData = filtered.map((e) => ({ ...e, actions: null }));

  return (
    <div className="w-full space-y-6">
      <div className="admin-page-title-strip w-full rounded-[10px] bg-white" style={{ padding: "24px" }}>
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

      <div className="admin-page-panel w-full rounded-[10px] bg-white p-6">
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
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          </div>
        ) : (
          <Table<EmployeeRow & { actions: null }>
            columns={columns}
            data={tableData}
            emptyMessage="No employees found."
            className="admin-list-table mt-6 border-0 border-gray-100"
            bordered={false}
            rowDividers
            rowHover={false}
          />
        )}
      </div>
    </div>
  );
}
