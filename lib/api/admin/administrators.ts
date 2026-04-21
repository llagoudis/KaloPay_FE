import { apiClient } from "@/lib/api/client";

export interface Administrator {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  two_factor_enabled?: boolean;
  is_email_verified?: boolean;
  created_at: string;
  updated_at: string;
}

export function getAdministrators(token: string) {
  return apiClient<{ data: Administrator[] }>(`/admin/administrators`, { token });
}

export function getAdministrator(token: string, id: string) {
  return apiClient<{ administrator: Administrator }>(`/admin/administrators/${id}`, {
    token,
  });
}

export function createAdministrator(token: string, data: Record<string, unknown>) {
  return apiClient<{ administrator: Administrator }>(`/admin/administrators`, {
    method: "POST",
    token,
    body: data,
  });
}

export function updateAdministrator(token: string, id: string, data: Record<string, unknown>) {
  return apiClient<{ administrator: Administrator }>(`/admin/administrators/${id}`, {
    method: "PUT",
    token,
    body: data,
  });
}

export function deleteAdministrator(token: string, id: string) {
  return apiClient<{ message: string }>(`/admin/administrators/${id}`, {
    method: "DELETE",
    token,
  });
}
