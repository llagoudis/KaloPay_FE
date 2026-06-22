import { apiClient } from "@/lib/api/client";

export interface AdminTopUp {
  id: number;
  datetime: string;
  transactionId: string;
  amount: string;
  currency: string;
  sendingBank: string;
  company: string;
  status: "Executed" | "Pending" | "Failed";
}

export interface TopUpListResponse {
  data: AdminTopUp[];
  total: number;
}

export function getTopUps(token: string, params?: Record<string, string>) {
  const query = params ? `?${new URLSearchParams(params)}` : "";
  return apiClient<TopUpListResponse>(`/admin/top-ups${query}`, { token });
}
