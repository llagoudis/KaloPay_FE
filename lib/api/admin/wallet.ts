import { apiClient } from "@/lib/api/client";

export interface CommissionWalletRow {
  id: number;
  currency: string;
  address: string;
  balance: string;
  [key: string]: unknown;
}

export function getWalletSummary(token: string) {
  return apiClient<{ wallets: CommissionWalletRow[] }>(`/admin/wallet`, { token });
}
