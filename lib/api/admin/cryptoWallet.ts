import { apiClient } from "@/lib/api/client";

// Types
export interface CryptoAsset {
  id: number;
  name: string;
  asset_id: string;
  icon: string;
  kraken_asset_id: string;
}

export interface CryptoAdminWallet {
  id: number;
  user_id: number;
  asset_id: string;
  address: string;
  vault_id: number;
  public_key: string;
  balance: string;
  notify: boolean;
  network: string;
  asset_name: string;
  asset_icon: string;
  kraken_asset_id: string;
  created_at: string;
}

export interface CryptoClientWallet {
  id: number;
  user_id: number;
  company_id: number | null;
  address: string;
  wallet_name: string;
  asset_id: string;
  vault_id: string;
  public_key: string;
  balance: string;
  notify: boolean;
  archived: boolean;
  asset_archived: boolean;
  asset_name: string;
  asset_icon: string;
  company_name: string;
  created_at: string;
}

export interface CryptoTransaction {
  id: number;
  user_id: number;
  transaction_id: string;
  amount: string;
  asset_id: string;
  source_address: string;
  target_address: string;
  tx_hash: string | null;
  status: "SUBMITTED" | "COMPLETED" | "FAILED" | "PENDING";
  sub_status: string;
  note: string | null;
  user_type: string;
  transaction_type: "OUTGOING" | "INCOMING";
  which_user: string;
  asset_name: string;
  asset_icon: string;
  user_name: string;
  created_at: string;
}

export interface Pagination {
  total: number;
  pageSize: number;
  pageNumber: number;
  totalPages: number;
}

// ─── API Functions ──────────────────────────────────────────

export async function getCryptoAssets(token: string) {
  return apiClient<{ assets: CryptoAsset[] }>("/admin/crypto-wallet/assets", { token });
}

export async function getAdminCryptoWallets(token: string, wallet?: string) {
  const params = wallet ? `?wallet=${wallet}` : "";
  return apiClient<{ master: CryptoAdminWallet[]; gas: CryptoAdminWallet[] }>(
    `/admin/crypto-wallet${params}`,
    { token }
  );
}

export async function createAdminCryptoWallet(token: string, walletType: "MASTER" | "GAS") {
  return apiClient<{ success: boolean; message: string }>(
    `/admin/crypto-wallet?wallet=${walletType}`,
    { method: "POST", token }
  );
}

export async function getClientCryptoWallets(
  token: string,
  params?: {
    pageSize?: number;
    pageNumber?: number;
    vaultId?: string;
    companyId?: string;
    search?: string;
    sort?: string;
  }
) {
  const searchParams = new URLSearchParams();
  if (params?.pageSize) searchParams.set("pageSize", params.pageSize.toString());
  if (params?.pageNumber) searchParams.set("pageNumber", params.pageNumber.toString());
  if (params?.vaultId) searchParams.set("vaultId", params.vaultId);
  if (params?.companyId) searchParams.set("companyId", params.companyId);
  if (params?.search) searchParams.set("search", params.search);
  if (params?.sort) searchParams.set("sort", params.sort);

  const qs = searchParams.toString();
  return apiClient<{ wallets: CryptoClientWallet[]; pagination: Pagination }>(
    `/admin/crypto-wallet/client${qs ? `?${qs}` : ""}`,
    { token }
  );
}

export async function createClientCryptoWallet(
  token: string,
  data: { walletName: string; companyId?: string }
) {
  return apiClient<{ success: boolean; message: string }>(
    "/admin/crypto-wallet/client",
    { method: "POST", token, body: data }
  );
}

export async function createCryptoWithdrawal(
  token: string,
  data: {
    assetId: string;
    sourceAddress: string;
    targetAddress: string;
    amount: number;
    note?: string;
    wallet?: "CLIENT" | "MASTER";
  }
) {
  return apiClient<{
    success: boolean;
    message: string;
    txHash?: string;
    transactionId?: string;
  }>("/admin/crypto-wallet/withdraw", { method: "POST", token, body: data });
}

export async function getCryptoTransactions(
  token: string,
  params?: {
    pageSize?: number;
    pageNumber?: number;
    status?: string;
    transactionType?: string;
    assetId?: string;
    search?: string;
    sort?: string;
  }
) {
  const searchParams = new URLSearchParams();
  if (params?.pageSize) searchParams.set("pageSize", params.pageSize.toString());
  if (params?.pageNumber) searchParams.set("pageNumber", params.pageNumber.toString());
  if (params?.status) searchParams.set("status", params.status);
  if (params?.transactionType) searchParams.set("transactionType", params.transactionType);
  if (params?.assetId) searchParams.set("assetId", params.assetId);
  if (params?.search) searchParams.set("search", params.search);
  if (params?.sort) searchParams.set("sort", params.sort);

  const qs = searchParams.toString();
  return apiClient<{ transactions: CryptoTransaction[]; pagination: Pagination }>(
    `/admin/crypto-wallet/reports${qs ? `?${qs}` : ""}`,
    { token }
  );
}

export async function approveCryptoTransaction(token: string, transactionId: string) {
  return apiClient<{ success: boolean }>("/admin/crypto-wallet/reports/approve", {
    method: "POST",
    token,
    body: { transactionId },
  });
}
