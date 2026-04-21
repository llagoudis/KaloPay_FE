import { apiClient } from "@/lib/api/client";
import { API_BASE_URL } from "@/lib/constants/config";

export interface Document {
  id: number;
  entity_type: "company" | "employee";
  entity_id: number;
  document_type: string | null;
  document_status: "pending" | "approved" | "rejected";
  country: string | null;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string | null;
  uploaded_by: number | null;
  uploaded_by_name?: string;
  created_at: string;
  updated_at: string;
}

export function getDocuments(token: string, params?: Record<string, string>) {
  const query = params ? `?${new URLSearchParams(params)}` : "";
  return apiClient<{ data: Document[]; total: number; page: number; limit: number }>(
    `/admin/documents${query}`,
    { token }
  );
}

export function getDocument(token: string, id: string) {
  return apiClient<{ document: Document }>(`/admin/documents/${id}`, { token });
}

export function updateDocument(token: string, id: string, data: Record<string, unknown>) {
  return apiClient<{ document: Document }>(`/admin/documents/${id}`, {
    method: "PUT",
    token,
    body: data,
  });
}

export function deleteDocument(token: string, id: string) {
  return apiClient<{ message: string }>(`/admin/documents/${id}`, {
    method: "DELETE",
    token,
  });
}

export function approveDocument(
  token: string,
  id: string,
  status: "approved" | "rejected",
  notes?: string
) {
  return apiClient<{ document: Document }>(`/admin/documents/${id}/approve`, {
    method: "POST",
    token,
    body: { status, notes },
  });
}

// File upload uses raw fetch because apiClient sets JSON Content-Type
export async function uploadDocument(
  token: string,
  entityType: string,
  entityId: string,
  file: File,
  extra?: { documentType?: string; country?: string }
) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("entityType", entityType);
  formData.append("entityId", entityId);
  if (extra?.documentType) formData.append("documentType", extra.documentType);
  if (extra?.country) formData.append("country", extra.country);

  const res = await fetch(`${API_BASE_URL}/admin/documents`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error((json as { error?: string })?.error || "Upload failed");
  return json as { document: Document };
}
