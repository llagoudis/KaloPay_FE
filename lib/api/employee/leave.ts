import { API_BASE_URL } from "@/lib/constants/config";

export async function getLeaveBalance() {
  const res = await fetch(`${API_BASE_URL}/employee/leave/balance`);
  if (!res.ok) throw new Error("Failed to fetch leave balance");
  return res.json();
}

export async function getLeaveRequests(params?: Record<string, string>) {
  const query = params ? `?${new URLSearchParams(params)}` : "";
  const res = await fetch(`${API_BASE_URL}/employee/leave${query}`);
  if (!res.ok) throw new Error("Failed to fetch leave requests");
  return res.json();
}

export async function applyLeave(data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE_URL}/employee/leave`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to apply leave");
  return res.json();
}

export async function getTeamLeaveCalendar() {
  const res = await fetch(`${API_BASE_URL}/employee/leave/calendar`);
  if (!res.ok) throw new Error("Failed to fetch team calendar");
  return res.json();
}
