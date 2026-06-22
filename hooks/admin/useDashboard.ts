"use client";
import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "@/lib/api/admin/dashboard";
import { useAdminAuthStore } from "@/store/adminAuthStore";

export function useAdminDashboard() {
  const token = useAdminAuthStore((s) => s.token);
  return useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: () => getDashboardStats(token!),
    enabled: !!token,
  });
}
