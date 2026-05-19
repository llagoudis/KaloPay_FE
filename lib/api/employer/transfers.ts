import { apiClient } from "@/lib/api/client";

export type Transfer = {
  id: number;
  ref: string;
  sender: string;
  beneficiary: string;
  amount: number;
  currency: string;
  type: string;
  paymentType: string;
  status: string;
  reference: string | null;
  createdAt: string;
};

export type CreateTransferInput = {
  kind: "crypto" | "fiat";
  currency: string;
  amount: number;
  address?: string;
  beneficiary?: string;
  description?: string;
};

export const transfersApi = {
  list: (token: string, limit = 50) =>
    apiClient<{ transfers: Transfer[] }>(`/employer/transfers?limit=${limit}`, { token }),
  create: (token: string, data: CreateTransferInput) =>
    apiClient<{ ref: string; status: string }>(`/employer/transfers`, { token, method: "POST", body: data }),
};
