import { API_BASE_URL } from "@/lib/constants/config";

export async function getAdministrators() {
  const res = await fetch(`${API_BASE_URL}/admin/administrators`);
  if (!res.ok) throw new Error("Failed to fetch administrators");
  return res.json();
}

export async function createAdministrator(data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE_URL}/admin/administrators`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create administrator");
  return res.json();
}

export async function updateAdministrator(id: string, data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE_URL}/admin/administrators/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update administrator");
  return res.json();
}

export async function deleteAdministrator(id: string) {
  const res = await fetch(`${API_BASE_URL}/admin/administrators/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete administrator");
  return res.json();
}
