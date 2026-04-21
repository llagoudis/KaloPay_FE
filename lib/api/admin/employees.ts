import { apiClient } from "@/lib/api/client";

export interface Employee {
  id: number;
  company_id: number | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  job_title: string;
  department: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface EmployeeListResponse {
  data: Employee[];
  total: number;
  page: number;
  limit: number;
}

export function getEmployees(token: string, params?: Record<string, string>) {
  const query = params ? `?${new URLSearchParams(params)}` : "";
  return apiClient<EmployeeListResponse>(`/admin/employees${query}`, { token });
}

export function getEmployee(token: string, id: string) {
  return apiClient<{ employee: Employee; documents?: unknown[] }>(
    `/admin/employees/${id}`,
    { token }
  );
}

export function createEmployee(token: string, data: Record<string, unknown>) {
  return apiClient<{ employee: Employee }>(`/admin/employees`, {
    method: "POST",
    token,
    body: data,
  });
}

export function updateEmployee(token: string, id: string, data: Record<string, unknown>) {
  return apiClient<{ employee: Employee }>(`/admin/employees/${id}`, {
    method: "PUT",
    token,
    body: data,
  });
}

export function deleteEmployee(token: string, id: string) {
  return apiClient<{ message: string }>(`/admin/employees/${id}`, {
    method: "DELETE",
    token,
  });
}
