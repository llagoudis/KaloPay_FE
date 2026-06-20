"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminWallets,
  createAdminWallet,
  withdrawFromWallet,
} from "@/lib/api/admin/wallet";
import { useAdminAuthStore } from "@/store/adminAuthStore";

export function useAdminWallets() {
  const token = useAdminAuthStore((s) => s.token);
  return useQuery({
    queryKey: ["admin", "wallets"],
    queryFn: () => getAdminWallets(token!),
    enabled: !!token,
  });
}

export function useCreateAdminWallet() {
  const token = useAdminAuthStore((s) => s.token);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { type: "MASTER" | "GAS"; asset: string; network: string }) =>
      createAdminWallet(token!, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "wallets"] }),
  });
}

export function useWithdrawFromWallet() {
  const token = useAdminAuthStore((s) => s.token);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: { amount: string; destination: string; network: string; note?: string };
    }) => withdrawFromWallet(token!, id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "wallets"] }),
  });
}
