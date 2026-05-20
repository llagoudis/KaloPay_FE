import { apiClient } from "@/lib/api/client";

export interface AdminTransaction {
  id: number;
  transaction_ref: string;
  account_id: number;
  amount: string;
  currency: string;
  transaction_type: string;
  transaction_status: string;
  payment_type: string;
  description: string | null;
  created_at: string;
  // FE-friendly aliases
  transactionId?: string;
  transactionStatus?: string;
  transactionType?: string;
  paymentType?: string;
  createdOn?: string;
}

export interface TransactionListResponse {
  data: AdminTransaction[];
  total: number;
  page: number;
  limit: number;
}

export function getTransactions(token: string, params?: Record<string, string>) {
  const query = params ? `?${new URLSearchParams(params)}` : "";
  return apiClient<TransactionListResponse>(`/admin/transactions${query}`, { token });
}

export function getTransaction(token: string, id: string) {
  return apiClient<{ transaction: AdminTransaction }>(`/admin/transactions/${id}`, {
    token,
  });
}

export interface CreateTransactionInput {
  transaction_ref?: string;
  account_id?: number | null;
  sender?: string;
  beneficiary?: string;
  amount: number | string;
  currency?: string;
  fee?: number | string;
  transaction_type?: string;
  payment_type?: string;
  transaction_status?: string;
  reference?: string;
  description?: string;
}

export function createTransaction(token: string, data: CreateTransactionInput) {
  return apiClient<{ transaction: AdminTransaction }>("/admin/transactions", {
    method: "POST",
    token,
    body: data,
  });
}
