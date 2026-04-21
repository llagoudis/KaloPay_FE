"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import { ROUTES } from "@/lib/constants/routes";
import { getCompanies } from "@/lib/api/admin/companies";
import { getEmployees } from "@/lib/api/admin/employees";
import { getAccounts } from "@/lib/api/admin/accounts";
import { getTransactions } from "@/lib/api/admin/transactions";
import { getActivityLogs, type ActivityLog } from "@/lib/api/admin/activityLogs";

type StatCard = {
  label: string;
  value: number | string;
  href: string;
  accent: string;
};

export default function AdminDashboardPage() {
  const token = useAdminAuthStore((s) => s.token);
  const user = useAdminAuthStore((s) => s.user);
  const [stats, setStats] = useState<StatCard[]>([]);
  const [recent, setRecent] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [companies, employees, accounts, transactions, logs] = await Promise.all([
        getCompanies(token, { limit: "1" }).catch(() => ({ total: 0 })),
        getEmployees(token, { limit: "1" }).catch(() => ({ total: 0 })),
        getAccounts(token, { limit: "1" }).catch(() => ({ total: 0 })),
        getTransactions(token, { limit: "1" }).catch(() => ({ total: 0 })),
        getActivityLogs(token, { limit: "5" }).catch(() => ({ data: [] as ActivityLog[] })),
      ]);

      setStats([
        { label: "Companies", value: companies.total ?? 0, href: ROUTES.admin.companies, accent: "#0F50DB" },
        { label: "Employees", value: employees.total ?? 0, href: ROUTES.admin.employees, accent: "#10B981" },
        { label: "Accounts", value: accounts.total ?? 0, href: ROUTES.admin.accounts, accent: "#F59E0B" },
        { label: "Transactions", value: transactions.total ?? 0, href: ROUTES.admin.transactions, accent: "#8B5CF6" },
      ]);
      setRecent(logs.data ?? []);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return (
    <div className="w-full space-y-6">
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
          Welcome back{user?.name ? `, ${user.name}` : ""}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Here&apos;s what&apos;s happening across the platform today.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <Link
                key={s.label}
                href={s.href}
                className="group rounded-xl border border-transparent bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">{s.label}</span>
                  <span
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white"
                    style={{ backgroundColor: s.accent }}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
                <p className="mt-3 text-3xl font-semibold text-gray-900">{s.value}</p>
                <p className="mt-1 text-xs text-gray-400 group-hover:text-gray-600">View all →</p>
              </Link>
            ))}
          </div>

          <div className="admin-page-panel w-full rounded-[10px] bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent admin activity</h2>
              <Link href={ROUTES.admin.activityLogs} className="text-sm font-medium text-blue-600 hover:underline">
                View all
              </Link>
            </div>
            {recent.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-400">No recent activity.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {recent.map((log) => (
                  <div key={log.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900">{log.action}</p>
                      <p className="truncate text-xs text-gray-500">{log.description ?? ""}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3 text-xs text-gray-400">
                      <span>{log.administrator}</span>
                      <span>·</span>
                      <span>
                        {log.created_at
                          ? new Date(log.created_at).toLocaleString("en-GB", { hour12: true })
                          : ""}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
