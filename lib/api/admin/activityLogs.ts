import { API_BASE_URL } from "@/lib/constants/config";

export async function getActivityLogs(params?: Record<string, string>) {
  const query = params ? `?${new URLSearchParams(params)}` : "";
  const res = await fetch(`${API_BASE_URL}/admin/activity-logs${query}`);
  if (!res.ok) throw new Error("Failed to fetch activity logs");
  return res.json();
}
