"use client";
import { useQuery } from "@tanstack/react-query";
import { getBills } from "@/lib/api/admin/bills";
import { useAdminAuthStore } from "@/store/adminAuthStore";

export function useBills(params?: Record<string, string>) {
  const token = useAdminAuthStore((s) => s.token);
  return useQuery({
    queryKey: ["admin", "bills", params ?? {}],
    queryFn: () => getBills(token!, params),
    enabled: !!token,
  });
}
