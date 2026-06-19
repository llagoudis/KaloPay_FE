import { apiClient } from "@/lib/api/client";

export interface AccountRow {
  id: number;
  slNo?: number;
  number: string;
  providerNumber: string;
  holder: string;
  type: string;
  providerCurrency: string;
  status: string;
  providerName: string;
  bankDetails?: string;
  iban?: string;
  swiftBic?: string;
  bankName?: string;
}

export function getAccounts(token: string, params?: Record<string, string>) {
  const query = params ? `?${new URLSearchParams(params)}` : "";
  return apiClient<{ accounts: AccountRow[]; total?: number }>(`/admin/accounts${query}`, { token });
}

export function getAccount(token: string, id: string) {
  return apiClient<{ account: AccountRow }>(`/admin/accounts/${id}`, { token });
}
