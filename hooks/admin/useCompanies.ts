"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCompany,
  deleteCompany,
  getCompanies,
  getCompany,
  updateCompany,
  type CreateCompanyInput,
} from "@/lib/api/admin/companies";
import { useAdminAuthStore } from "@/store/adminAuthStore";

function useAdminToken() {
  return useAdminAuthStore((s) => s.token);
}

export function useCompanies(params?: Record<string, string>) {
  const token = useAdminToken();
  return useQuery({
    queryKey: ["admin", "companies", params ?? {}],
    queryFn: () => getCompanies(token!, params),
    enabled: !!token,
  });
}

export function useCompany(id?: string) {
  const token = useAdminToken();
  return useQuery({
    queryKey: ["admin", "companies", id],
    queryFn: () => getCompany(token!, id!),
    enabled: !!token && !!id,
  });
}

export function useCreateCompany() {
  const token = useAdminToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCompanyInput) => createCompany(token!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "companies"] });
    },
  });
}

export function useUpdateCompany() {
  const token = useAdminToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateCompanyInput> }) =>
      updateCompany(token!, id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "companies"] });
    },
  });
}

export function useDeleteCompany() {
  const token = useAdminToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCompany(token!, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "companies"] });
    },
  });
}
