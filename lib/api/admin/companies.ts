import { apiClient } from "@/lib/api/client";

export interface Company {
  id: number;
  name: string;
  owner_name: string;
  email: string;
  phone: string;
  country: string;
  industry: string;
  business_type: string;
  verification_status: string;
  account_status: string;
  verification_level: string;
  registration_number: string;
  tax_id: string;
  incorporation_date: string;
  created_at: string;
  updated_at: string;
  clientId: string;
  ownerName: string;
  businessType: string;
  verificationStatus: string;
  accountStatus: string;
}

export interface CompanyListResponse {
  data: Company[];
  total: number;
  page: number;
  limit: number;
}

export function getCompanies(token: string, params?: Record<string, string>) {
  const query = params ? `?${new URLSearchParams(params)}` : "";
  return apiClient<CompanyListResponse>(`/admin/companies${query}`, { token });
}

export function getCompany(token: string, id: string) {
  return apiClient<{ company: Company; accounts: unknown[]; documents: unknown[] }>(
    `/admin/companies/${id}`,
    { token }
  );
}

export function createCompany(token: string, data: Record<string, unknown>) {
  return apiClient<{ company: Company }>(`/admin/companies`, {
    method: "POST",
    token,
    body: data,
  });
}

export function updateCompany(token: string, id: string, data: Record<string, unknown>) {
  return apiClient<{ company: Company }>(`/admin/companies/${id}`, {
    method: "PUT",
    token,
    body: data,
  });
}

export function deleteCompany(token: string, id: string) {
  return apiClient<{ message: string }>(`/admin/companies/${id}`, {
    method: "DELETE",
    token,
  });
}
