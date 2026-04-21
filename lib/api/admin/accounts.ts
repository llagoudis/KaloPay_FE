import { apiClient } from "@/lib/api/client";

export interface Account {
  id: number;
  number: string;
  type: "Crypto" | "Bank";
  holder: string;
  company_id: number | null;
  company_name?: string;
  provider_name: string;
  provider_currency: string;
  wallet_address: string;
  bank_details: string;
  iban: string;
  swift_bic: string;
  bank_name: string;
  current_balance: string;
  status: string;
  created_at: string;
  updated_at: string;
  slNo?: number;
  providerNumber?: string;
}

export interface AccountListResponse {
  data: Account[];
  total: number;
  page: number;
  limit: number;
}

export function getAccounts(token: string, params?: Record<string, string>) {
  const query = params ? `?${new URLSearchParams(params)}` : "";
  return apiClient<AccountListResponse>(`/admin/accounts${query}`, { token });
}

export function getAccount(token: string, id: string) {
  return apiClient<{ account: Account; transactions: unknown[] }>(
    `/admin/accounts/${id}`,
    { token }
  );
}

export function createAccount(token: string, data: Record<string, unknown>) {
  return apiClient<{ account: Account }>(`/admin/accounts`, {
    method: "POST",
    token,
    body: data,
  });
}

export function updateAccount(token: string, id: string, data: Record<string, unknown>) {
  return apiClient<{ account: Account }>(`/admin/accounts/${id}`, {
    method: "PUT",
    token,
    body: data,
  });
}

export function deleteAccount(token: string, id: string) {
  return apiClient<{ message: string }>(`/admin/accounts/${id}`, {
    method: "DELETE",
    token,
  });
}
