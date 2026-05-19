import { apiClient } from "@/lib/api/client";

export type Payment = {
  id: number;
  paymentRef: string;
  recipient: string;
  amount: number;
  currency: string;
  period: string;
  status: string;
  date: string;
};

export const paymentsApi = {
  list: (token: string, params: { status?: "all" | "due" | "executed"; search?: string } = {}) => {
    const qs = new URLSearchParams();
    if (params.status && params.status !== "all") qs.set("status", params.status);
    if (params.search) qs.set("search", params.search);
    const q = qs.toString();
    return apiClient<{ payments: Payment[] }>(`/employer/payments${q ? `?${q}` : ""}`, { token });
  },
};
