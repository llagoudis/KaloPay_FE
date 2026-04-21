"use client";

import { useState, useEffect, useCallback } from "react";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import {
  getCryptoTransactions,
  type CryptoTransaction,
  type Pagination,
} from "@/lib/api/admin/cryptoWallet";
import { cn } from "@/lib/utils/cn";

function maskAddress(address: string): string {
  if (!address || address.length < 10) return address || "-";
  return address.slice(0, 6) + "..." + address.slice(-4);
}

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: "bg-green-100 text-green-700",
  SUBMITTED: "bg-yellow-100 text-yellow-700",
  FAILED: "bg-red-100 text-red-700",
  PENDING: "bg-blue-100 text-blue-700",
};

export default function CryptoTransactionsPage() {
  const token = useAdminAuthStore((s) => s.token);
  const [transactions, setTransactions] = useState<CryptoTransaction[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, pageSize: 20, pageNumber: 1, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [search, setSearch] = useState("");

  const fetchTransactions = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getCryptoTransactions(token, {
        pageSize: pagination.pageSize,
        pageNumber: pagination.pageNumber,
        status: statusFilter || undefined,
        transactionType: typeFilter || undefined,
        search: search || undefined,
        sort: "DESC",
      });
      setTransactions(data.transactions);
      setPagination(data.pagination);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    } finally {
      setLoading(false);
    }
  }, [token, pagination.pageSize, pagination.pageNumber, statusFilter, typeFilter, search]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const goToPage = (page: number) => {
    setPagination((p) => ({ ...p, pageNumber: page }));
  };

  return (
    <div className="w-full space-y-6">
      {/* Title */}
      <div className="w-full rounded-xl bg-white shadow-sm" style={{ padding: "24px" }}>
        <h1 className="align-middle font-semibold" style={{ fontFamily: "var(--font-poppins), Poppins, sans-serif", fontWeight: 600, fontSize: "24px", lineHeight: "26px", color: "#0E1620" }}>
          Crypto Transactions
        </h1>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
        <input type="search" placeholder="Search by address or hash..." value={search} onChange={(e) => { setSearch(e.target.value); setPagination((p) => ({ ...p, pageNumber: 1 })); }}
          className="h-10 w-64 rounded-lg border border-gray-200 bg-white pl-3 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />

        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPagination((p) => ({ ...p, pageNumber: 1 })); }}
          className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:border-blue-500 focus:outline-none">
          <option value="">All Statuses</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="COMPLETED">Completed</option>
          <option value="FAILED">Failed</option>
          <option value="PENDING">Pending</option>
        </select>

        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPagination((p) => ({ ...p, pageNumber: 1 })); }}
          className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:border-blue-500 focus:outline-none">
          <option value="">All Types</option>
          <option value="INCOMING">Incoming</option>
          <option value="OUTGOING">Outgoing</option>
        </select>
      </div>

      {/* Table */}
      <div className="w-full rounded-xl bg-white p-6 shadow-sm overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-center text-gray-400 py-12">No transactions found.</p>
        ) : (
          <>
            <table className="min-w-full border-collapse text-left text-sm text-gray-700">
              <thead className="text-xs font-medium text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 font-medium">Asset</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">From</th>
                  <th className="px-4 py-3 font-medium">To</th>
                  <th className="px-4 py-3 font-medium text-right">Amount</th>
                  <th className="px-4 py-3 font-medium">Tx Hash</th>
                  <th className="px-4 py-3 font-medium text-center">Status</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="bg-white hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-800">{tx.asset_id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                        tx.transaction_type === "INCOMING" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700")}>
                        {tx.transaction_type === "INCOMING" ? "IN" : "OUT"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1">
                        <span className="font-mono text-xs text-gray-600">{maskAddress(tx.source_address)}</span>
                        <button type="button" onClick={() => navigator.clipboard.writeText(tx.source_address)} className="text-gray-400 hover:text-gray-600">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        </button>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1">
                        <span className="font-mono text-xs text-gray-600">{maskAddress(tx.target_address)}</span>
                        <button type="button" onClick={() => navigator.clipboard.writeText(tx.target_address)} className="text-gray-400 hover:text-gray-600">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        </button>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-800">
                      {parseFloat(tx.amount).toFixed(6)}
                    </td>
                    <td className="px-4 py-3">
                      {tx.tx_hash ? (
                        <span className="inline-flex items-center gap-1">
                          <span className="font-mono text-xs text-blue-600">{maskAddress(tx.tx_hash)}</span>
                          <button type="button" onClick={() => navigator.clipboard.writeText(tx.tx_hash!)} className="text-gray-400 hover:text-gray-600">
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                          </button>
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", STATUS_COLORS[tx.status] || "bg-gray-100 text-gray-700")}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(tx.created_at).toLocaleDateString("en-GB")}
                      <br />
                      {new Date(tx.created_at).toLocaleTimeString("en-GB", { hour12: true })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Showing {(pagination.pageNumber - 1) * pagination.pageSize + 1} - {Math.min(pagination.pageNumber * pagination.pageSize, pagination.total)} of {pagination.total}
                </p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => goToPage(pagination.pageNumber - 1)} disabled={pagination.pageNumber === 1}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                    Previous
                  </button>
                  <button type="button" onClick={() => goToPage(pagination.pageNumber + 1)} disabled={pagination.pageNumber >= pagination.totalPages}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
