"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createLeaveRequest,
  getLeaveBalance,
  getTeamLeaveCalendar,
  listLeaveRequests,
  type LeaveType,
} from "@/lib/api/employee/leave";
import {
  changeEmployeePassword,
  getEmployeeProfile,
  listEmployeePayslips,
  updateEmployeeProfile,
  type EmployeeProfile,
} from "@/lib/api/employee/profile";
import { useEmployeeAuthStore } from "@/store/employeeAuthStore";

function useEmployeeToken() {
  return useEmployeeAuthStore((s) => s.token);
}

export function useMyLeaveRequests() {
  const token = useEmployeeToken();
  return useQuery({
    queryKey: ["employee", "leave", "list"],
    queryFn: () => listLeaveRequests(token!),
    enabled: !!token,
  });
}

export function useMyLeaveBalance() {
  const token = useEmployeeToken();
  return useQuery({
    queryKey: ["employee", "leave", "balance"],
    queryFn: () => getLeaveBalance(token!),
    enabled: !!token,
  });
}

export function useTeamLeaveCalendar() {
  const token = useEmployeeToken();
  return useQuery({
    queryKey: ["employee", "leave", "calendar"],
    queryFn: () => getTeamLeaveCalendar(token!),
    enabled: !!token,
  });
}

export function useApplyLeave() {
  const token = useEmployeeToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { type: LeaveType; startDate: string; endDate: string; reason?: string }) =>
      createLeaveRequest(token!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employee", "leave"] });
    },
  });
}

export function useMyProfile() {
  const token = useEmployeeToken();
  return useQuery({
    queryKey: ["employee", "me"],
    queryFn: () => getEmployeeProfile(token!),
    enabled: !!token,
  });
}

export function useUpdateMyProfile() {
  const token = useEmployeeToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Record<keyof EmployeeProfile | "name", string>>) =>
      updateEmployeeProfile(token!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employee", "me"] });
    },
  });
}

export function useChangeMyPassword() {
  const token = useEmployeeToken();
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      changeEmployeePassword(token!, data),
  });
}

export function useMyPayslips() {
  const token = useEmployeeToken();
  return useQuery({
    queryKey: ["employee", "payslips"],
    queryFn: () => listEmployeePayslips(token!),
    enabled: !!token,
  });
}
