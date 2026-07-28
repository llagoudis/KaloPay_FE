import { apiClient } from "@/lib/api/client";

export type NotificationRole = "admin" | "employer" | "employee";

export interface AppNotification {
  id: string;
  tone: "danger" | "warning" | "info" | "success";
  title: string;
  body: string;
  createdAt: string | null;
  link: string | null;
}

export function getNotifications(role: NotificationRole, token: string) {
  // employer routes live under /employer, but the app path is /user — the backend
  // segment is always the role name.
  return apiClient<{ notifications: AppNotification[] }>(`/${role}/notifications`, { token });
}
