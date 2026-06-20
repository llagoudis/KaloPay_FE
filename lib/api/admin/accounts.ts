import { apiClient } from "@/lib/api/client";

export interface AdminAccount {
  id: number;
  account_number: string;
  company_id?: number | null;
  company_name?: string | null;
  account_type: string;
  currency: string;
  balance: string;
  status: string;
  provider?: string | null;
  created_at: string;
}

export interface AccountListResponse {
  data: AdminAccount[];
  total: number;
  page: number;
  limit: number;
}

export function getAccounts(token: string, params?: Record<string, string>) {
  const query = params ? `?${new URLSearchParams(params)}` : "";
  return apiClient<AccountListResponse>(`/admin/accounts${query}`, { token });
}

export function getAccount(token: string, id: string) {
  return apiClient<{ account: AdminAccount }>(`/admin/accounts/${id}`, { token });
}
