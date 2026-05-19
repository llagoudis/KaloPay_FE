import { API_BASE_URL } from "@/lib/constants/config";

export async function uploadDocument(entityType: string, entityId: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("entityType", entityType);
  formData.append("entityId", entityId);
  const res = await fetch(`${API_BASE_URL}/admin/documents`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to upload document");
  return res.json();
}

export async function deleteDocument(id: string) {
  const res = await fetch(`${API_BASE_URL}/admin/documents/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete document");
  return res.json();
}
