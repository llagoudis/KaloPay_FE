"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createEmployee,
  deleteEmployee,
  getEmployee,
  getEmployees,
  updateEmployee,
} from "@/lib/api/admin/employees";
import { useAdminAuthStore } from "@/store/adminAuthStore";

function useAdminToken() {
  return useAdminAuthStore((s) => s.token);
}

export function useAdminEmployees(params?: Record<string, string>) {
  const token = useAdminToken();
  return useQuery({
    queryKey: ["admin", "employees", params ?? {}],
    queryFn: () => getEmployees(token!, params),
    enabled: !!token,
  });
}

export function useAdminEmployee(id?: string) {
  const token = useAdminToken();
  return useQuery({
    queryKey: ["admin", "employees", id],
    queryFn: () => getEmployee(token!, id!),
    enabled: !!token && !!id,
  });
}

export function useCreateAdminEmployee() {
  const token = useAdminToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => createEmployee(token!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "employees"] });
    },
  });
}

export function useUpdateAdminEmployee() {
  const token = useAdminToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      updateEmployee(token!, id, data),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["admin", "employees"] });
      qc.invalidateQueries({ queryKey: ["admin", "employees", vars.id] });
    },
  });
}

export function useDeleteAdminEmployee() {
  const token = useAdminToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteEmployee(token!, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "employees"] });
    },
  });
}
