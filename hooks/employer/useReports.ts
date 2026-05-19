"use client";

import { useQuery } from "@tanstack/react-query";
import { reportsApi } from "@/lib/api/employer/reports";
import { useEmployerAuthStore } from "@/store/employerAuthStore";
import { useAuthErrorRecovery } from "./useDashboard";

function useToken() {
  return useEmployerAuthStore((s) => s.token);
}

export function usePeopleStats() {
  const token = useToken();
  const q = useQuery({
    queryKey: ["employer", "reports", "people"],
    queryFn: () => reportsApi.getPeopleStats(token!),
    enabled: !!token,
  });
  useAuthErrorRecovery(q.error);
  return q;
}

export function useCompensationStats() {
  const token = useToken();
  const q = useQuery({
    queryKey: ["employer", "reports", "compensation"],
    queryFn: () => reportsApi.getCompensationStats(token!),
    enabled: !!token,
  });
  useAuthErrorRecovery(q.error);
  return q;
}

export function usePayrollSummary(period?: string) {
  const token = useToken();
  const q = useQuery({
    queryKey: ["employer", "reports", "payroll-summary", period ?? "current"],
    queryFn: () => reportsApi.getPayrollSummary(token!, period),
    enabled: !!token,
  });
  useAuthErrorRecovery(q.error);
  return q;
}

export function useTaxBreakdown(period?: string) {
  const token = useToken();
  const q = useQuery({
    queryKey: ["employer", "reports", "tax-breakdown", period ?? "current"],
    queryFn: () => reportsApi.getTaxBreakdown(token!, period),
    enabled: !!token,
  });
  useAuthErrorRecovery(q.error);
  return q;
}

export function useEmployerCost(period?: string) {
  const token = useToken();
  const q = useQuery({
    queryKey: ["employer", "reports", "employer-cost", period ?? "current"],
    queryFn: () => reportsApi.getEmployerCost(token!, period),
    enabled: !!token,
  });
  useAuthErrorRecovery(q.error);
  return q;
}

export function useAuditLogs(limit = 50) {
  const token = useToken();
  const q = useQuery({
    queryKey: ["employer", "reports", "audit-logs", limit],
    queryFn: () => reportsApi.getAuditLogs(token!, limit),
    enabled: !!token,
  });
  useAuthErrorRecovery(q.error);
  return q;
}

export function useRegulatory() {
  const token = useToken();
  const q = useQuery({
    queryKey: ["employer", "reports", "regulatory"],
    queryFn: () => reportsApi.getRegulatory(token!),
    enabled: !!token,
  });
  useAuthErrorRecovery(q.error);
  return q;
}
