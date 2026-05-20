"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTransaction,
  getTransactions,
  type CreateTransactionInput,
} from "@/lib/api/admin/transactions";
import { useAdminAuthStore } from "@/store/adminAuthStore";

function useAdminToken() {
  return useAdminAuthStore((s) => s.token);
}

export function useAdminTransactions(params?: Record<string, string>) {
  const token = useAdminToken();
  return useQuery({
    queryKey: ["admin", "transactions", params ?? {}],
    queryFn: () => getTransactions(token!, params),
    enabled: !!token,
  });
}

export function useCreateAdminTransaction() {
  const token = useAdminToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTransactionInput) => createTransaction(token!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "transactions"] });
    },
  });
}
