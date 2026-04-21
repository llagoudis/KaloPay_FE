export type LeaveType = "annual" | "sick" | "maternity" | "paternity" | "unpaid" | "other";
export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason?: string;
  status: LeaveStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveBalance {
  annual: number;
  sick: number;
  used: number;
  remaining: number;
}
