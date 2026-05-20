import { apiClient } from "@/lib/api/client";

export interface AdminAdministrator {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  two_factor_enabled?: boolean;
  is_email_verified?: boolean;
  created_at: string;
  updated_at?: string;
}

export function getAdministrators(token: string) {
  return apiClient<{ administrators: AdminAdministrator[] }>("/admin/administrators", { token });
}

export interface CreateAdministratorInput {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}

export function createAdministrator(token: string, data: CreateAdministratorInput) {
  return apiClient<{ administrator: AdminAdministrator }>("/admin/administrators", {
    method: "POST",
    token,
    body: data,
  });
}

export interface UpdateAdministratorInput {
  name?: string;
  email?: string;
  password?: string;
  avatar?: string;
}

export function updateAdministrator(
  token: string,
  id: string,
  data: UpdateAdministratorInput
) {
  return apiClient<{ administrator: AdminAdministrator }>(`/admin/administrators/${id}`, {
    method: "PUT",
    token,
    body: data,
  });
}

export function deleteAdministrator(token: string, id: string) {
  return apiClient<{ success: boolean }>(`/admin/administrators/${id}`, {
    method: "DELETE",
    token,
  });
}
