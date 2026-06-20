import { apiClient } from "@/lib/api/client";

export interface ActivityLog {
  id: number;
  adminId?: number;
  admin_id?: number;
  action: string;
  entity?: string;
  entity_id?: string;
  details?: string;
  ip_address?: string;
  created_at: string;
}

export interface ActivityLogListResponse {
  data: ActivityLog[];
  total: number;
  page: number;
  limit: number;
}

export function getActivityLogs(token: string, params?: Record<string, string>) {
  const query = params ? `?${new URLSearchParams(params)}` : "";
  return apiClient<ActivityLogListResponse>(`/admin/activity-logs${query}`, { token });
}

export function getClientActivityLogs(token: string, params?: Record<string, string>) {
  const query = params ? `?${new URLSearchParams(params)}` : "";
  return apiClient<ActivityLogListResponse>(`/admin/client-activity-logs${query}`, { token });
}
