"use client";
import { useQuery } from "@tanstack/react-query";
import { getAccounts, getAccount } from "@/lib/api/admin/accounts";
import { useAdminAuthStore } from "@/store/adminAuthStore";

export function useAccounts(params?: Record<string, string>) {
  const token = useAdminAuthStore((s) => s.token);
  return useQuery({
    queryKey: ["admin", "accounts", params ?? {}],
    queryFn: () => getAccounts(token!, params),
    enabled: !!token,
  });
}

export function useAccount(id?: string) {
  const token = useAdminAuthStore((s) => s.token);
  return useQuery({
    queryKey: ["admin", "accounts", id],
    queryFn: () => getAccount(token!, id!),
    enabled: !!token && !!id,
  });
}
