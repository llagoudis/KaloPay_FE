"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEmployerAuthStore } from "@/store/employerAuthStore";
import { useAuthErrorRecovery } from "./useDashboard";
import {
  getKpis,
  createKpi,
  updateKpi,
  deleteKpi,
  type CreateKpiInput,
  type UpdateKpiInput,
} from "@/lib/api/employer/kpis";
import {
  leaveRequestsApi,
  type LeaveReviewStatus,
} from "@/lib/api/employer/leaveRequests";

function useToken() {
  return useEmployerAuthStore((s) => s.token);
}

// ─── KPIS ─────────────────────────────────────────────────
export function useKpis() {
  const token = useToken();
  const q = useQuery({
    queryKey: ["employer", "kpis"],
    queryFn: () => getKpis(token!),
    enabled: !!token,
  });
  useAuthErrorRecovery(q.error);
  return q;
}

export function useCreateKpi() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateKpiInput) => createKpi(token!, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employer", "kpis"] }),
  });
}

export function useUpdateKpi() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateKpiInput }) =>
      updateKpi(token!, id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employer", "kpis"] }),
  });
}

export function useDeleteKpi() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteKpi(token!, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employer", "kpis"] }),
  });
}

// ─── EMPLOYER LEAVE REQUESTS (Absences tab) ───────────────
export function useEmployerLeaveRequests(params: { status?: string } = {}) {
  const token = useToken();
  const q = useQuery({
    queryKey: ["employer", "leave-requests", params.status ?? ""],
    queryFn: () => leaveRequestsApi.list(token!, params),
    enabled: !!token,
  });
  useAuthErrorRecovery(q.error);
  return q;
}

export function useReviewLeaveRequest() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      reviewNote,
    }: {
      id: number | string;
      status: LeaveReviewStatus;
      reviewNote?: string;
    }) => leaveRequestsApi.review(token!, id, { status, reviewNote }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["employer", "leave-requests"] }),
  });
}

export function useCreateLeaveRequest() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      employee: string;
      type?: string;
      startDate: string;
      endDate: string;
      reason?: string;
      status?: string;
    }) => leaveRequestsApi.create(token!, body),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["employer", "leave-requests"] }),
  });
}
