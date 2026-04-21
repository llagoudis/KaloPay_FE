import { apiClient } from "@/lib/api/client";

export interface ActivityLog {
  id: number;
  action: string;
  description: string | null;
  ip_address: string | null;
  entity_type: string | null;
  entity_id: number | null;
  administrator: string;
  admin_user_id?: number;
  created_at: string;
}

export interface ClientActivityLog {
  id: number;
  action: string;
  description: string | null;
  ip_address: string | null;
  initiator: string;
  user_id?: number;
  created_at: string;
}

export interface LogListResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export function getActivityLogs(token: string, params?: Record<string, string>) {
  const query = params ? `?${new URLSearchParams(params)}` : "";
  return apiClient<LogListResponse<ActivityLog>>(`/admin/activity-logs${query}`, {
    token,
  });
}

export function getActivityLog(token: string, id: string) {
  return apiClient<{ log: ActivityLog }>(`/admin/activity-logs/${id}`, { token });
}

export function getClientActivityLogs(token: string, params?: Record<string, string>) {
  const query = params ? `?${new URLSearchParams(params)}` : "";
  return apiClient<LogListResponse<ClientActivityLog>>(
    `/admin/client-activity-logs${query}`,
    { token }
  );
}

export function getClientActivityLog(token: string, id: string) {
  return apiClient<{ log: ClientActivityLog }>(`/admin/client-activity-logs/${id}`, {
    token,
  });
}
