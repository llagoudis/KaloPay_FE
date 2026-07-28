import { apiClient } from "@/lib/api/client";

export type EmployerLeaveRequest = {
  id: number;
  userId: number;
  employeeName: string;
  email: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string | null;
  status: string;
  reviewedAt: string | null;
  reviewedBy: number | null;
  reviewNote: string | null;
  createdAt: string;
};

/**
 * Statuses the employer can set via the review endpoint. `pending` is used by
 * the Absences "Undo" action to revert an approve/reject decision.
 */
export type LeaveReviewStatus = "approved" | "rejected" | "pending";

export const leaveRequestsApi = {
  list: (token: string, params: { status?: string } = {}) => {
    const qs = new URLSearchParams();
    if (params.status) qs.set("status", params.status);
    const q = qs.toString();
    return apiClient<{ requests: EmployerLeaveRequest[] }>(
      `/employer/leave-requests${q ? `?${q}` : ""}`,
      { token }
    );
  },

  review: (
    token: string,
    id: number | string,
    body: { status: LeaveReviewStatus; reviewNote?: string }
  ) =>
    apiClient<{ request: EmployerLeaveRequest }>(
      `/employer/leave-requests/${id}`,
      { token, method: "PATCH", body }
    ),

  create: (
    token: string,
    body: { employee: string; type?: string; startDate: string; endDate: string; reason?: string; status?: string }
  ) =>
    apiClient<{ request: EmployerLeaveRequest }>(
      `/employer/leave-requests`,
      { token, method: "POST", body }
    ),
};
