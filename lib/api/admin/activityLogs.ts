import { apiClient } from "@/lib/api/client";

export interface ActivityLog {
  id: number;
  action: string;
  description: string | null;
  ip_address: string | null;
  entity_type: string | null;
  entity_id: number | null;
  created_at: string;
  administrator: string;
}

export interface ActivityLogResponse {
  data: ActivityLog[];
  total: number;
  page: number;
  limit: number;
}

export function getActivityLogs(token: string, params?: Record<string, string>) {
  const query = params ? `?${new URLSearchParams(params)}` : "";
  return apiClient<ActivityLogResponse>(`/admin/activity-logs${query}`, { token });
}
