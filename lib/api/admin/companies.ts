import { API_BASE_URL } from "@/lib/constants/config";

export async function getCompanies(params?: Record<string, string>) {
  const query = params ? `?${new URLSearchParams(params)}` : "";
  const res = await fetch(`${API_BASE_URL}/admin/companies${query}`);
  if (!res.ok) throw new Error("Failed to fetch companies");
  return res.json();
}

export async function getCompany(id: string) {
  const res = await fetch(`${API_BASE_URL}/admin/companies/${id}`);
  if (!res.ok) throw new Error("Failed to fetch company");
  return res.json();
}

export async function createCompany(data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE_URL}/admin/companies`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create company");
  return res.json();
}

export async function updateCompany(id: string, data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE_URL}/admin/companies/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update company");
  return res.json();
}
