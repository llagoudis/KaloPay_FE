"use client";
import { useQuery } from "@tanstack/react-query";
import { getActivityLogs, getClientActivityLogs } from "@/lib/api/admin/activityLogs";
import { useAdminAuthStore } from "@/store/adminAuthStore";

export function useActivityLogs(params?: Record<string, string>) {
  const token = useAdminAuthStore((s) => s.token);
  return useQuery({
    queryKey: ["admin", "activity-logs", params ?? {}],
    queryFn: () => getActivityLogs(token!, params),
    enabled: !!token,
  });
}

export function useClientActivityLogs(params?: Record<string, string>) {
  const token = useAdminAuthStore((s) => s.token);
  return useQuery({
    queryKey: ["admin", "client-activity-logs", params ?? {}],
    queryFn: () => getClientActivityLogs(token!, params),
    enabled: !!token,
  });
}
