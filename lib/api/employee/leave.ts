import { apiClient } from "@/lib/api/client";

export type LeaveType = "Annual" | "Sick" | "Unpaid" | "Maternity" | "Paternity" | "Other";

export interface LeaveRequest {
  id: number;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string | null;
  status: "pending" | "approved" | "rejected" | "cancelled";
  reviewedAt: string | null;
  reviewNote: string | null;
  createdAt: string;
}

export interface LeaveBalance {
  year: number;
  totalAnnual: number;
  used: number;
  pending: number;
  remaining: number;
}

export interface LeaveCalendarEvent {
  id: number;
  userName: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  status: "pending" | "approved";
}

export function listLeaveRequests(token: string) {
  return apiClient<{ requests: LeaveRequest[] }>("/employee/leave", { token });
}

export function createLeaveRequest(
  token: string,
  data: { type: LeaveType; startDate: string; endDate: string; reason?: string }
) {
  return apiClient<{ request: LeaveRequest }>("/employee/leave", {
    method: "POST",
    token,
    body: data,
  });
}

export function getLeaveBalance(token: string) {
  return apiClient<{ balance: LeaveBalance }>("/employee/leave/balance", { token });
}

export function getTeamLeaveCalendar(token: string) {
  return apiClient<{ events: LeaveCalendarEvent[] }>("/employee/leave/calendar", { token });
}
