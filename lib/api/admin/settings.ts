import { apiClient } from "@/lib/api/client";

export interface AdminProfile {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  two_factor_enabled: boolean;
  is_email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export function getProfile(token: string) {
  return apiClient<{ profile: AdminProfile }>(`/admin/settings/profile`, { token });
}

export function updateProfile(
  token: string,
  data: { name?: string; email?: string; avatar?: string }
) {
  return apiClient<{ profile: AdminProfile }>(`/admin/settings/profile`, {
    method: "PUT",
    token,
    body: data,
  });
}

export function changePassword(
  token: string,
  data: { currentPassword: string; newPassword: string }
) {
  return apiClient<{ message: string }>(`/admin/settings/password`, {
    method: "PUT",
    token,
    body: data,
  });
}

export function toggle2FA(token: string, enabled: boolean) {
  return apiClient<{ twoFactorEnabled: boolean }>(`/admin/settings/2fa`, {
    method: "PUT",
    token,
    body: { enabled },
  });
}
