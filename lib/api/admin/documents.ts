import { API_BASE_URL } from "@/lib/constants/config";
import { apiClient } from "@/lib/api/client";

export interface AdminDocumentRow {
  id: number;
  entity_type: string;
  entity_id: number;
  document_type: string | null;
  document_status: "pending" | "approved" | "rejected";
  country: string | null;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  uploaded_by_name: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  notes: string | null;
  created_at: string;
  name?: string;
  type?: string;
  url?: string;
  status?: string;
  uploadedAt?: string;
}

export function listDocuments(
  token: string,
  params: { entityType?: string; entityId?: string; page?: number; limit?: number } = {}
) {
  const p = new URLSearchParams();
  if (params.entityType) p.set("entityType", params.entityType);
  if (params.entityId) p.set("entityId", params.entityId);
  if (params.page) p.set("page", String(params.page));
  if (params.limit) p.set("limit", String(params.limit));
  const query = p.toString() ? `?${p}` : "";
  return apiClient<{ data: AdminDocumentRow[]; total: number }>(`/admin/documents${query}`, { token });
}

export function approveDocument(token: string, id: number) {
  return apiClient<{ message: string }>(`/admin/documents/${id}/approve`, {
    method: "PUT",
    token,
  });
}

export function deleteDocument(token: string, id: number) {
  return apiClient<{ message: string }>(`/admin/documents/${id}`, {
    method: "DELETE",
    token,
  });
}

export async function uploadDocument(token: string, entityType: string, entityId: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("entityType", entityType);
  formData.append("entityId", entityId);
  const res = await fetch(`${API_BASE_URL}/admin/documents`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to upload document");
  return res.json();
}
