"use client";
import { useQuery } from "@tanstack/react-query";
import { getTopUps } from "@/lib/api/admin/topups";
import { useAdminAuthStore } from "@/store/adminAuthStore";

export function useTopUps(params?: Record<string, string>) {
  const token = useAdminAuthStore((s) => s.token);
  return useQuery({
    queryKey: ["admin", "top-ups", params ?? {}],
    queryFn: () => getTopUps(token!, params),
    enabled: !!token,
  });
}
