"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import Badge from "@/components/ui/Badge";

interface DocumentRow {
  id: number;
  entity_type: "company" | "employee";
  entity_id: number;
  document_type: string | null;
  document_status: "pending" | "approved" | "rejected";
  country: string | null;
  file_name: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  uploaded_by_name: string | null;
  created_at: string;
}

interface DocumentListResponse {
  data: DocumentRow[];
  total: number;
  page: number;
  limit: number;
}

function useAdminToken() {
  return useAdminAuthStore((s) => s.token);
}

function useAdminDocuments(filters: { entityType?: string; status?: string }) {
  const token = useAdminToken();
  const params = new URLSearchParams();
  if (filters.entityType) params.set("entityType", filters.entityType);
  if (filters.status) params.set("status", filters.status);
  params.set("limit", "100");
  return useQuery({
    queryKey: ["admin", "documents", filters],
    queryFn: () =>
      apiClient<DocumentListResponse>(`/admin/documents?${params.toString()}`, {
        token: token!,
      }),
    enabled: !!token,
  });
}

function useApproveDocument() {
  const token = useAdminToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, notes }: { id: number; status: "approved" | "rejected"; notes?: string }) =>
      apiClient<{ document: DocumentRow }>(`/admin/documents/${id}/approve`, {
        method: "POST",
        token: token!,
        body: { status, notes },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "documents"] });
    },
  });
}

function fmtBytes(n: number | null) {
  if (n == null) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export default function AdminDocumentsPage() {
  const [entityType, setEntityType] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const { data, isLoading, error } = useAdminDocuments({ entityType, status });
  const approveMut = useApproveDocument();

  const rows = useMemo(() => {
    const items = data?.data ?? [];
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter(
      (d) =>
        d.file_name.toLowerCase().includes(q) ||
        (d.document_type ?? "").toLowerCase().includes(q) ||
        (d.uploaded_by_name ?? "").toLowerCase().includes(q) ||
        String(d.entity_id).includes(q)
    );
  }, [data, search]);

  const handleReview = async (id: number, decision: "approved" | "rejected") => {
    try {
      await approveMut.mutateAsync({ id, status: decision });
    } catch (e) {
      alert(`Failed to ${decision === "approved" ? "approve" : "reject"}: ${(e as Error).message}`);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="w-full rounded-[10px] bg-white p-6">
        <h1
          className="admin-page-heading font-semibold"
          style={{
            fontFamily: "var(--font-poppins), Poppins, sans-serif",
            fontWeight: 600,
            fontSize: "24px",
            color: "#0E1620",
          }}
        >
          Documents
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Review and approve documents uploaded by companies and employees.
        </p>
      </div>

      <div className="w-full rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <input
            type="search"
            placeholder="Search by file name, type, uploader…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 min-w-[240px] flex-1 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <select
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
            className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900"
          >
            <option value="">All entities</option>
            <option value="company">Companies</option>
            <option value="employee">Employees</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900"
          >
            <option value="">Any status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {error ? (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            Failed to load documents: {(error as Error).message}
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs uppercase text-gray-500">
                <th className="px-4 py-3">Uploaded</th>
                <th className="px-4 py-3">Entity</th>
                <th className="px-4 py-3">Document</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Uploaded by</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">
                    No documents found.
                  </td>
                </tr>
              ) : (
                rows.map((d) => (
                  <tr key={d.id} className="border-b border-gray-100">
                    <td className="px-4 py-3 text-gray-700">{new Date(d.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {d.entity_type} #{d.entity_id}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{d.file_name}</td>
                    <td className="px-4 py-3 text-gray-700">{d.document_type ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-700">{fmtBytes(d.file_size)}</td>
                    <td className="px-4 py-3 text-gray-700">{d.uploaded_by_name ?? "—"}</td>
                    <td className="px-4 py-3">
                      <Badge
                        label={d.document_status}
                        variant={
                          d.document_status === "approved"
                            ? "success"
                            : d.document_status === "rejected"
                            ? "danger"
                            : "warning"
                        }
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {d.document_status === "pending" ? (
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleReview(d.id, "approved")}
                            disabled={approveMut.isPending}
                            className="rounded-md bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReview(d.id, "rejected")}
                            disabled={approveMut.isPending}
                            className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">No action</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
