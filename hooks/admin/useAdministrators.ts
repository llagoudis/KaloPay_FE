"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdministrator,
  deleteAdministrator,
  getAdministrators,
  updateAdministrator,
  type CreateAdministratorInput,
  type UpdateAdministratorInput,
} from "@/lib/api/admin/administrators";
import { useAdminAuthStore } from "@/store/adminAuthStore";

function useAdminToken() {
  return useAdminAuthStore((s) => s.token);
}

export function useAdministrators() {
  const token = useAdminToken();
  return useQuery({
    queryKey: ["admin", "administrators"],
    queryFn: () => getAdministrators(token!),
    enabled: !!token,
  });
}

export function useCreateAdministrator() {
  const token = useAdminToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAdministratorInput) => createAdministrator(token!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "administrators"] });
    },
  });
}

export function useUpdateAdministrator() {
  const token = useAdminToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAdministratorInput }) =>
      updateAdministrator(token!, id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "administrators"] });
    },
  });
}

export function useDeleteAdministrator() {
  const token = useAdminToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAdministrator(token!, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "administrators"] });
    },
  });
}
