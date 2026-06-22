import { apiClient } from "@/lib/api/client";

export interface AdminBill {
  id: string;
  company: string;
  month: string;
  baseFee: number;
  perEmpTotal: number;
  amount: number;
  due: string;
  status: "Outstanding" | "Upcoming" | "Paid";
  annual: number;
}

export interface BillListResponse {
  data: AdminBill[];
  total: number;
}

export function getBills(token: string, params?: Record<string, string>) {
  const query = params ? `?${new URLSearchParams(params)}` : "";
  return apiClient<BillListResponse>(`/admin/bills${query}`, { token });
}
