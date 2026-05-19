"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi, type Period } from "@/lib/api/employer/dashboard";
import { useEmployerAuthStore } from "@/store/employerAuthStore";
import { ApiError } from "@/lib/api/client";

function useToken() {
  return useEmployerAuthStore((s) => s.token);
}

/** Auto-clear stale session + redirect to login on 401/403, or stale-token 400 ("No company linked"). */
export function useAuthErrorRecovery(error: unknown) {
  const router = useRouter();
  const clearAuth = useEmployerAuthStore((s) => s.clearAuth);
  useEffect(() => {
    if (!(error instanceof ApiError)) return;
    const isStale =
      error.status === 401 ||
      error.status === 403 ||
      (error.status === 400 && /no company/i.test(error.message));
    if (isStale) {
      clearAuth();
      router.replace("/user/login");
    }
  }, [error, router, clearAuth]);
}

export function useWallets() {
  const token = useToken();
  return useQuery({
    queryKey: ["employer", "wallets"],
    queryFn: () => dashboardApi.getWallets(token!),
    enabled: !!token,
  });
}

export function useMonthlyStats() {
  const token = useToken();
  return useQuery({
    queryKey: ["employer", "monthly-stats"],
    queryFn: () => dashboardApi.getMonthlyStats(token!),
    enabled: !!token,
  });
}

export function usePayrollExpenses(period: Period) {
  const token = useToken();
  return useQuery({
    queryKey: ["employer", "payroll-expenses", period],
    queryFn: () => dashboardApi.getPayrollExpenses(token!, period),
    enabled: !!token,
  });
}

export function usePayrollBatches(limit = 3) {
  const token = useToken();
  return useQuery({
    queryKey: ["employer", "payroll-batches", limit],
    queryFn: () => dashboardApi.getPayrollBatches(token!, limit),
    enabled: !!token,
  });
}

export function useBatchDetails(id: number | null) {
  const token = useToken();
  return useQuery({
    queryKey: ["employer", "batch", id],
    queryFn: () => dashboardApi.getBatchDetails(token!, id!),
    enabled: !!token && !!id,
  });
}
