import { apiClient } from "@/lib/api/client";

export interface AdminEmployee {
  id: number;
  company_id: number | null;
  user_id: number | null;
  name: string;
  email: string | null;
  phone: string | null;
  position: string | null;
  department: string | null;
  salary: string | number | null;
  status: string;
  date_of_birth: string | null;
  contract_start: string | null;
  contract_end: string | null;
  nationality: string | null;
  gender: string | null;
  marital_status: string | null;
  dependants: number | null;
  created_at: string;
  updated_at: string;
  [k: string]: unknown;
}

export interface EmployeeListResponse {
  data: AdminEmployee[];
  total: number;
  page: number;
  limit: number;
}

export function getEmployees(token: string, params?: Record<string, string>) {
  const query = params ? `?${new URLSearchParams(params)}` : "";
  return apiClient<EmployeeListResponse>(`/admin/employees${query}`, { token });
}

export function getEmployee(token: string, id: string) {
  return apiClient<{ employee: AdminEmployee }>(`/admin/employees/${id}`, { token });
}

export function createEmployee(token: string, data: Record<string, unknown>) {
  return apiClient<{ employee: AdminEmployee }>("/admin/employees", {
    method: "POST",
    token,
    body: data,
  });
}

export function updateEmployee(token: string, id: string, data: Record<string, unknown>) {
  return apiClient<{ employee: AdminEmployee }>(`/admin/employees/${id}`, {
    method: "PUT",
    token,
    body: data,
  });
}

export function deleteEmployee(token: string, id: string) {
  return apiClient<{ success: boolean }>(`/admin/employees/${id}`, {
    method: "DELETE",
    token,
  });
}
