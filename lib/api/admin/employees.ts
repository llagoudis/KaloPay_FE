import { API_BASE_URL } from "@/lib/constants/config";

export async function getEmployees(params?: Record<string, string>) {
  const query = params ? `?${new URLSearchParams(params)}` : "";
  const res = await fetch(`${API_BASE_URL}/admin/employees${query}`);
  if (!res.ok) throw new Error("Failed to fetch employees");
  return res.json();
}

export async function getEmployee(id: string) {
  const res = await fetch(`${API_BASE_URL}/admin/employees/${id}`);
  if (!res.ok) throw new Error("Failed to fetch employee");
  return res.json();
}

export async function createEmployee(data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE_URL}/admin/employees`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create employee");
  return res.json();
}

export async function updateEmployee(id: string, data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE_URL}/admin/employees/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update employee");
  return res.json();
}

export async function deleteEmployee(id: string) {
  const res = await fetch(`${API_BASE_URL}/admin/employees/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete employee");
  return res.json();
}
