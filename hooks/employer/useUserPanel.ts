"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEmployerAuthStore } from "@/store/employerAuthStore";
import { useAuthErrorRecovery } from "./useDashboard";
import { peopleApi, type PersonDetail } from "@/lib/api/employer/people";
import { settingsApi, type EmployerProfile } from "@/lib/api/employer/settings";
import { payrollApi, type RunPayrollInput } from "@/lib/api/employer/payroll";

function useToken() {
  return useEmployerAuthStore((s) => s.token);
}

// ─── PEOPLE ───────────────────────────────────────────────
export function usePeople(params: { search?: string; status?: string; department?: string } = {}) {
  const token = useToken();
  const q = useQuery({
    queryKey: ["employer", "people", params.search ?? "", params.status ?? "", params.department ?? ""],
    queryFn: () => peopleApi.list(token!, params),
    enabled: !!token,
  });
  useAuthErrorRecovery(q.error);
  return q;
}

export function usePersonDetail(id: number | null) {
  const token = useToken();
  const q = useQuery({
    queryKey: ["employer", "person", id],
    queryFn: () => peopleApi.detail(token!, id!),
    enabled: !!token && !!id,
  });
  useAuthErrorRecovery(q.error);
  return q;
}

export function useCreatePerson() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<PersonDetail>) => peopleApi.create(token!, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employer", "people"] }),
  });
}

export function useUpdatePerson(id: number) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (partial: Partial<PersonDetail>) => peopleApi.update(token!, id, partial),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employer", "person", id] });
      qc.invalidateQueries({ queryKey: ["employer", "people"] });
    },
  });
}

export function useDeletePerson() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => peopleApi.remove(token!, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employer", "people"] }),
  });
}

export function useBulkImportPeople() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => peopleApi.bulkImport(token!, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employer", "people"] }),
  });
}

// ─── SETTINGS ─────────────────────────────────────────────
export function useEmployerProfile() {
  const token = useToken();
  const q = useQuery({
    queryKey: ["employer", "profile"],
    queryFn: () => settingsApi.getProfile(token!),
    enabled: !!token,
  });
  useAuthErrorRecovery(q.error);
  return q;
}

export function useUpdateProfile() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<EmployerProfile>) => settingsApi.updateProfile(token!, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employer", "profile"] }),
  });
}

export function useChangePassword() {
  const token = useToken();
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      settingsApi.changePassword(token!, data),
  });
}

// ─── PAYROLL WIZARD ───────────────────────────────────────
export function usePayrollEmployees() {
  const token = useToken();
  const q = useQuery({
    queryKey: ["employer", "payroll", "employees"],
    queryFn: () => payrollApi.listEmployees(token!),
    enabled: !!token,
  });
  useAuthErrorRecovery(q.error);
  return q;
}

export function useFundingStatus(required: number, enabled = true) {
  const token = useToken();
  const q = useQuery({
    queryKey: ["employer", "payroll", "funding-status", required],
    queryFn: () => payrollApi.fundingStatus(token!, required),
    enabled: !!token && enabled,
  });
  useAuthErrorRecovery(q.error);
  return q;
}

export function useRunPayroll() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: RunPayrollInput) => payrollApi.run(token!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employer", "payroll-batches"] });
      qc.invalidateQueries({ queryKey: ["employer", "payments"] });
      qc.invalidateQueries({ queryKey: ["employer", "monthly-stats"] });
    },
  });
}
