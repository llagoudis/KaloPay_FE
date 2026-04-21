"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import { ROUTES } from "@/lib/constants/routes";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import { getCompanies, deleteCompany, type Company } from "@/lib/api/admin/companies";

type CompanyRow = {
  clientId: string;
  id: number;
  name: string;
  owner: string;
  verificationStatus: string;
  accountStatus: string;
  email: string;
  country: string;
  businessType: string;
};

function statusVariant(status: string): "success" | "warning" | "danger" | "info" {
  const s = (status ?? "").toLowerCase();
  if (s === "approved" || s === "active") return "success";
  if (s === "pending") return "warning";
  if (s === "rejected" || s === "frozen" || s === "inactive") return "danger";
  return "info";
}

export default function AdminCompaniesPage() {
  const token = useAdminAuthStore((s) => s.token);
  const [search, setSearch] = useState("");
  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await getCompanies(token, { limit: "100" });
      const rows: CompanyRow[] = (res.data ?? []).map((c: Company) => ({
        clientId: String(c.id),
        id: c.id,
        name: c.name ?? "",
        owner: c.ownerName ?? c.owner_name ?? "",
        verificationStatus: c.verificationStatus ?? c.verification_status ?? "pending",
        accountStatus: c.accountStatus ?? c.account_status ?? "active",
        email: c.email ?? "",
        country: c.country ?? "",
        businessType: c.businessType ?? c.business_type ?? "",
      }));
      setCompanies(rows);
    } catch (err) {
      console.error("Failed to fetch companies:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id: number) => {
    if (!token) return;
    if (!confirm("Delete this company? This action soft-deletes the record.")) return;
    try {
      await deleteCompany(token, String(id));
      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete company");
    }
  };

  const filtered = companies.filter(
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
    { key: "owner" as const, header: "Owner" },
    {
      key: "verificationStatus" as const,
      header: "Verification Status",
      render: (value: unknown) => (
        <Badge label={String(value)} variant={statusVariant(String(value))} />
      ),
    },
    {
      key: "accountStatus" as const,
      header: "Account Status",
      render: (value: unknown) => (
        <Badge label={String(value)} variant={statusVariant(String(value))} />
      ),
    },
    { key: "email" as const, header: "Email" },
    { key: "country" as const, header: "Country" },
    { key: "businessType" as const, header: "Business Type" },
    {
      key: "actions" as const,
      header: "",
      render: (_: unknown, row: CompanyRow) => (
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
                href={ROUTES.admin.companyDetail(row.clientId)}
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

  const tableData = filtered.map((c) => ({ ...c, actions: null }));

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
          Companies
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
          <Link href={ROUTES.admin.companyAdd} className="shrink-0">
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
          <Table<CompanyRow & { actions: null }>
            columns={columns}
            data={tableData}
            emptyMessage="No companies found."
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
