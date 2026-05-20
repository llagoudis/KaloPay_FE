import { apiClient } from "@/lib/api/client";

export interface AdminCompany {
  id: number;
  clientId: string;
  name: string;
  ownerName: string | null;
  owner_name: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  industry: string | null;
  businessType: string | null;
  business_type: string | null;
  verificationStatus: string;
  verification_status: string;
  accountStatus: string;
  account_status: string;
  verification_level: string | null;
  registration_number: string | null;
  tax_id: string | null;
  incorporation_date: string | null;
  address?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompanyListResponse {
  data: AdminCompany[];
  total: number;
  page: number;
  limit: number;
}

export function getCompanies(token: string, params?: Record<string, string>) {
  const query = params ? `?${new URLSearchParams(params)}` : "";
  return apiClient<CompanyListResponse>(`/admin/companies${query}`, { token });
}

export function getCompany(token: string, id: string) {
  return apiClient<{ company: AdminCompany; accounts: unknown[]; documents: unknown[] }>(
    `/admin/companies/${id}`,
    { token }
  );
}

export interface CreateCompanyInput {
  name: string;
  owner_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  country?: string;
  industry?: string;
  business_type?: string;
  registration_number?: string;
  tax_id?: string;
  incorporation_date?: string;
  verification_status?: string;
  account_status?: string;
  verification_level?: string;
}

export function createCompany(token: string, data: CreateCompanyInput) {
  return apiClient<{ company: AdminCompany }>("/admin/companies", {
    method: "POST",
    token,
    body: data,
  });
}

export function updateCompany(token: string, id: string, data: Partial<CreateCompanyInput>) {
  return apiClient<{ company: AdminCompany }>(`/admin/companies/${id}`, {
    method: "PUT",
    token,
    body: data,
  });
}

export function deleteCompany(token: string, id: string) {
  return apiClient<{ success: boolean }>(`/admin/companies/${id}`, {
    method: "DELETE",
    token,
  });
}
