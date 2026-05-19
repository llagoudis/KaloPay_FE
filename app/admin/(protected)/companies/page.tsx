"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import { ROUTES } from "@/lib/constants/routes";

type CompanyRow = {
  clientId: string;
  name: string;
  owner: string;
  verificationStatus: string;
  accountStatus: string;
  email: string;
  country: string;
  businessType: string;
};

const mockCompanies: CompanyRow[] = [
  {
    clientId: "2983",
    name: "Test Entity 0",
    owner: "Amar Hegde",
    verificationStatus: "Approved",
    accountStatus: "Active",
    email: "abc@gmail.com",
    country: "Cyprus",
    businessType: "SaaS",
  },
  {
    clientId: "2983",
    name: "Test Entity 0",
    owner: "Amar Hegde",
    verificationStatus: "Approved",
    accountStatus: "Active",
    email: "abc@gmail.com",
    country: "Cyprus",
    businessType: "SaaS",
  },
  {
    clientId: "2983",
    name: "Test Entity 0",
    owner: "Amar Hegde",
    verificationStatus: "Approved",
    accountStatus: "Active",
    email: "abc@gmail.com",
    country: "Cyprus",
    businessType: "SaaS",
  },
  {
    clientId: "2983",
    name: "Test Entity 0",
    owner: "Amar Hegde",
    verificationStatus: "Approved",
    accountStatus: "Active",
    email: "abc@gmail.com",
    country: "Cyprus",
    businessType: "SaaS",
  },
  {
    clientId: "2983",
    name: "Test Entity 0",
    owner: "Amar Hegde",
    verificationStatus: "Approved",
    accountStatus: "Active",
    email: "abc@gmail.com",
    country: "Cyprus",
    businessType: "SaaS",
  },
];

export default function AdminCompaniesPage() {
  const [search, setSearch] = useState("");

  const filtered = mockCompanies.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.owner.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.clientId.includes(search) ||
      c.country.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { key: "clientId" as const, header: "Client ID" },
    {
      key: "name" as const,
      header: "Name",
      render: (value: unknown, row: CompanyRow) => (
        <Link
          href={ROUTES.admin.companyDetail(row.clientId)}
          className="font-medium text-blue-600 hover:underline"
        >
          {String(value)}
        </Link>
      ),
    },
    {
      key: "owner" as const,
      header: "Owner",
      render: (value: unknown) => (
        <Link href="#" className="font-medium text-blue-600 hover:underline">
          {String(value)}
        </Link>
      ),
    },
    {
      key: "verificationStatus" as const,
      header: "Verification Status",
      render: (value: unknown) => (
        <Badge label={String(value)} variant="success" />
      ),
    },
    {
      key: "accountStatus" as const,
      header: "Account Status",
      render: (value: unknown) => (
        <Badge label={String(value)} variant="success" />
      ),
    },
    { key: "email" as const, header: "Email" },
    { key: "country" as const, header: "Country" },
    { key: "businessType" as const, header: "Business Type" },
    {
      key: "actions" as const,
      header: "",
      render: () => (
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

  const tableData = filtered.map((c) => ({ ...c, actions: null }));

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
          Companies
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
          <Link href={ROUTES.admin.companyAdd} className="shrink-0">
            <Button variant="primary" size="md">
              + Add new
            </Button>
          </Link>
        </div>
        <Table<CompanyRow & { actions: null }>
          columns={columns}
          data={tableData}
          emptyMessage="No companies found."
          className="admin-list-table mt-6 border-0 border-gray-100"
        />
      </div>
    </div>
  );
}