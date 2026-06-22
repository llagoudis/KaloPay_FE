"use client";

import { useState, useMemo } from "react";
import { useTopUps } from "@/hooks/admin/useTopUps";
import type { AdminTopUp } from "@/lib/api/admin/topups";

const MOCK_TOPUPS: AdminTopUp[] = [
  { id: 1, datetime: "2024-06-15 09:34", transactionId: "TXN-8821-AA", amount: "50000.00", currency: "EUR", sendingBank: "DNB Bank", company: "TechCorp Ltd", status: "Executed" },
  { id: 2, datetime: "2024-06-14 14:12", transactionId: "TXN-8820-BB", amount: "25000.00", currency: "USDC", sendingBank: "Nordea", company: "Helios Trading", status: "Executed" },
  { id: 3, datetime: "2024-06-13 11:08", transactionId: "TXN-8819-CC", amount: "30000.00", currency: "USDT", sendingBank: "SEB", company: "NordBuild AS", status: "Pending" },
  { id: 4, datetime: "2024-06-12 16:55", transactionId: "TXN-8818-DD", amount: "15000.00", currency: "EUR", sendingBank: "Handelsbanken", company: "BlueWave Media", status: "Failed" },
  { id: 5, datetime: "2024-06-11 08:22", transactionId: "TXN-8817-EE", amount: "20000.00", currency: "EUR", sendingBank: "Swedbank", company: "Acme Robotics", status: "Executed" },
  { id: 6, datetime: "2024-06-10 13:47", transactionId: "TXN-8816-FF", amount: "45000.00", currency: "USDC", sendingBank: "DNB Bank", company: "TechCorp Ltd", status: "Executed" },
];

const STATUS_COLORS: Record<AdminTopUp["status"], string> = {
  Executed: "bg-green-50 text-green-700 border border-green-200",
  Pending: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  Failed: "bg-red-50 text-red-700 border border-red-200",
};

type FilterField = "All fields" | "Date/Time" | "Transaction ID" | "Amount" | "Currency" | "Sending Bank" | "Status";

export default function TopUpsPage() {
  const { data } = useTopUps();
  const [search, setSearch] = useState("");
  const [fieldFilter, setFieldFilter] = useState<FilterField>("All fields");

  const topups = data?.data ?? MOCK_TOPUPS;

  const filtered = useMemo(() => {
    if (search === "") return topups;
    const q = search.toLowerCase();
    return topups.filter((t) => {
      if (fieldFilter === "Date/Time") return t.datetime.toLowerCase().includes(q);
      if (fieldFilter === "Transaction ID") return t.transactionId.toLowerCase().includes(q);
      if (fieldFilter === "Amount") return t.amount.includes(q);
      if (fieldFilter === "Currency") return t.currency.toLowerCase().includes(q);
      if (fieldFilter === "Sending Bank") return t.sendingBank.toLowerCase().includes(q);
      if (fieldFilter === "Status") return t.status.toLowerCase().includes(q);
      return [t.datetime, t.transactionId, t.amount, t.currency, t.sendingBank, t.status].some((v) => v.toLowerCase().includes(q));
    });
  }, [topups, search, fieldFilter]);

  const FIELDS: FilterField[] = ["All fields", "Date/Time", "Transaction ID", "Amount", "Currency", "Sending Bank", "Status"];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Top-ups</h1>
        <p className="text-sm text-gray-500 mt-0.5">Incoming transactions funding company balances &amp; wallets for payroll</p>
      </div>

      {/* Filters */}
      <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100 flex gap-3">
        <input
          type="text"
          placeholder="Search top-ups..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={fieldFilter}
          onChange={(e) => setFieldFilter(e.target.value as FilterField)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {FIELDS.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3 text-left">Date/Time</th>
                <th className="px-4 py-3 text-left">Transaction ID</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-left">Currency</th>
                <th className="px-4 py-3 text-left">Sending Bank</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{t.datetime}</td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-blue-600">{t.transactionId}</span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold text-gray-800">{t.amount}</td>
                  <td className="px-4 py-3 font-medium text-gray-700">{t.currency}</td>
                  <td className="px-4 py-3 text-gray-600">{t.sendingBank}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[t.status]}`}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">No top-ups found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
