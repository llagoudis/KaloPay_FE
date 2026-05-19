"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import { ROUTES } from "@/lib/constants/routes";

type EmployeeRow = {
  clientId: string;
  name: string;
  emails: string;
  verificationStatus1: string;
  verificationStatus2: string;
  country: string;
  createdAt: string;
};

const mockEmployees: EmployeeRow[] = [
  {
    clientId: "2983",
    name: "John Doe",
    emails: "abc@gmail.com",
    verificationStatus1: "Approved",
    verificationStatus2: "Approved",
    country: "Crypto",
    createdAt: "13-08-20025",
  },
  {
    clientId: "2984",
    name: "Jane Smith",
    emails: "jane@example.com",
    verificationStatus1: "Approved",
    verificationStatus2: "Pending",
    country: "Crypto",
    createdAt: "14-08-20025",
  },
  {
    clientId: "2985",
    name: "Bob Wilson",
    emails: "bob@example.com",
    verificationStatus1: "Approved",
    verificationStatus2: "Approved",
    country: "Crypto",
    createdAt: "15-08-20025",
  },
  {
    clientId: "2986",
    name: "Alice Brown",
    emails: "alice@example.com",
    verificationStatus1: "Approved",
    verificationStatus2: "Approved",
    country: "Crypto",
    createdAt: "16-08-20025",
  },
  {
    clientId: "2987",
    name: "Charlie Davis",
    emails: "charlie@example.com",
    verificationStatus1: "Approved",
    verificationStatus2: "Approved",
    country: "Crypto",
    createdAt: "17-08-20025",
  },
];

export default function AdminEmployeesPage() {
  const [search, setSearch] = useState("");

  const filtered = mockEmployees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.emails.toLowerCase().includes(search.toLowerCase()) ||
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
    { key: "emails" as const, header: "Emails" },
    {
      key: "verificationStatus1" as const,
      header: "Verification Status",
      render: (value: unknown) => (
        <Badge label={String(value)} variant="success" />
      ),
    },
    {
      key: "verificationStatus2" as const,
      header: "Verification Status",
      render: (value: unknown) => (
        <Badge label={String(value)} variant="success" />
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
          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label="Actions"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
        </button>
      ),
    },
  ];

  const tableData = filtered.map((e) => ({ ...e, actions: null }));

  return (
    <div className="w-full space-y-6">
      {/* Employees - alag horizontal div/card */}
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

      {/* Search + Add new + Table - neeche wala card */}
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
        <Table<EmployeeRow & { actions: null }>
          columns={columns}
          data={tableData}
          emptyMessage="No employees found."
          className="admin-list-table mt-6 border-0 border-gray-100"
        />
      </div>
    </div>
  );
}