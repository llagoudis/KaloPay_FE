import { apiClient } from "@/lib/api/client";

export interface AdminWallet {
  id: number;
  type: "MASTER" | "GAS";
  asset: string;
  address: string;
  balance: string;
  network: string;
}

export interface WalletListResponse {
  data: AdminWallet[];
  total: number;
}

export function getAdminWallets(token: string) {
  return apiClient<WalletListResponse>("/admin/admin-wallet", { token });
}

export function createAdminWallet(
  token: string,
  data: { type: "MASTER" | "GAS"; asset: string; network: string }
) {
  return apiClient<{ wallet: AdminWallet }>("/admin/admin-wallet", {
    method: "POST",
    token,
    body: data,
  });
}

export function withdrawFromWallet(
  token: string,
  id: number,
  data: { amount: string; destination: string; network: string; note?: string }
) {
  return apiClient<{ success: boolean }>(`/admin/admin-wallet/${id}/withdraw`, {
    method: "POST",
    token,
    body: data,
  });
}

export function getWalletSummary(token: string) {
  return apiClient<{ data: unknown[] }>("/admin/wallet", { token });
}
