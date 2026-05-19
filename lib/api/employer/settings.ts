import { apiClient } from "@/lib/api/client";

export type EmployerProfile = {
  name: string;
  email: string;
  companyName: string | null;
  companyEmail: string | null;
  companyPhone: string | null;
  companyCountry: string | null;
};

export const settingsApi = {
  getProfile: (token: string) =>
    apiClient<{ profile: EmployerProfile }>(`/employer/settings/profile`, { token }),

  updateProfile: (token: string, data: Partial<EmployerProfile>) =>
    apiClient<{ ok: boolean }>(`/employer/settings/profile`, { token, method: "PUT", body: data }),

  changePassword: (token: string, data: { currentPassword: string; newPassword: string }) =>
    apiClient<{ ok: boolean }>(`/employer/settings/password`, { token, method: "PUT", body: data }),
};
