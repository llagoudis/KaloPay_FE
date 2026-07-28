"use client";

import NotificationsView from "@/components/shared/NotificationsView";
import { useAdminAuthStore } from "@/store/adminAuthStore";

export default function AdminNotificationsPage() {
  const token = useAdminAuthStore((s) => s.token);
  // The admin layout's <main> already provides the padding.
  return <NotificationsView role="admin" token={token} />;
}
