"use client";

import { useState, useMemo } from "react";
import { useBills } from "@/hooks/admin/useBills";
import type { AdminBill } from "@/lib/api/admin/bills";

const MOCK_BILLS: AdminBill[] = [
  { id: "BILL-001", company: "TechCorp Ltd", month: "2024-06", baseFee: 250, perEmpTotal: 512, amount: 762, due: "2024-06-30", status: "Outstanding", annual: 9144 },
  { id: "BILL-002", company: "Helios Trading", month: "2024-06", baseFee: 250, perEmpTotal: 256, amount: 506, due: "2024-06-30", status: "Outstanding", annual: 6072 },
  { id: "BILL-003", company: "NordBuild AS", month: "2024-07", baseFee: 250, perEmpTotal: 344, amount: 594, due: "2024-07-31", status: "Upcoming", annual: 7128 },
  { id: "BILL-004", company: "BlueWave Media", month: "2024-07", baseFee: 150, perEmpTotal: 152, amount: 302, due: "2024-07-31", status: "Upcoming", annual: 3624 },
  { id: "BILL-005", company: "Acme Robotics", month: "2024-05", baseFee: 150, perEmpTotal: 104, amount: 254, due: "2024-05-31", status: "Paid", annual: 3048 },
  { id: "BILL-006", company: "TechCorp Ltd", month: "2024-05", baseFee: 250, perEmpTotal: 512, amount: 762, due: "2024-05-31", status: "Paid", annual: 9144 },
];

const STATUS_COLORS: Record<AdminBill["status"], string> = {
  Outstanding: "bg-red-50 text-red-700 border border-red-200",
  Upcoming: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  Paid: "bg-green-50 text-green-700 border border-green-200",
};

function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function BillsPage() {
  const { data } = useBills();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | AdminBill["status"]>("All");

  const bills = data?.data ?? MOCK_BILLS;

  const filtered = useMemo(() => {
    return bills.filter((b) => {
      const matchSearch = search === "" || [b.id, b.company, b.month].some((v) => v.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = statusFilter === "All" || b.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [bills, search, statusFilter]);

  const outstanding = bills.filter((b) => b.status === "Outstanding").reduce((s, b) => s + b.amount, 0);
  const upcoming = bills.filter((b) => b.status === "Upcoming").reduce((s, b) => s + b.amount, 0);
  const paid = bills.filter((b) => b.status === "Paid").reduce((s, b) => s + b.amount, 0);
  const annual = bills.reduce((s, b) => s + b.annual, 0) / bills.length * 12;

  const STATS = [
    { label: "Outstanding", value: `€${fmt(outstanding)}`, color: "red" },
    { label: "Next Bills", value: `€${fmt(upcoming)}`, color: "yellow" },
    { label: "Paid", value: `€${fmt(paid)}`, color: "green" },
    { label: "Annual Expected", value: `€${fmt(annual)}`, color: "blue" },
  ];

  const statBg: Record<string, string> = {
    red: "bg-red-50 border-red-100",
    yellow: "bg-yellow-50 border-yellow-100",
    green: "bg-green-50 border-green-100",
    blue: "bg-blue-50 border-blue-100",
  };
  const statText: Record<string, string> = {
    red: "text-red-700",
    yellow: "text-yellow-700",
    green: "text-green-700",
    blue: "text-blue-700",
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Bills</h1>
        <p className="text-sm text-gray-500 mt-0.5">Monthly client fees — base platform fee plus fee per employee</p>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-4 gap-4">
        {STATS.map((s) => (
          <div key={s.label} className={`rounded-xl p-5 shadow-sm border ${statBg[s.color]}`}>
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`text-xl font-semibold tabular-nums mt-1 ${statText[s.color]}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100 flex gap-3">
        <input
          type="text"
          placeholder="Search by bill ID, company, month..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">All statuses</option>
          <option value="Outstanding">Outstanding</option>
          <option value="Upcoming">Upcoming</option>
          <option value="Paid">Paid</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3 text-left">Bill ID</th>
                <th className="px-4 py-3 text-left">Company</th>
                <th className="px-4 py-3 text-left">Billing Month</th>
                <th className="px-4 py-3 text-right">Base Fee</th>
                <th className="px-4 py-3 text-right">Per-Employee</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-left">Due Date</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Annual Equiv.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{b.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{b.company}</td>
                  <td className="px-4 py-3 text-gray-600">{b.month}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-600">€{fmt(b.baseFee)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-600">€{fmt(b.perEmpTotal)}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold text-gray-800">€{fmt(b.amount)}</td>
                  <td className="px-4 py-3 text-gray-600">{b.due}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[b.status]}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-600">€{fmt(b.annual)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-400 text-sm">No bills found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
