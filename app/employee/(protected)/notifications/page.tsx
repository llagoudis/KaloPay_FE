"use client";

import NotificationsView from "@/components/shared/NotificationsView";
import { useEmployeeAuthStore } from "@/store/employeeAuthStore";

export default function EmployeeNotificationsPage() {
  const token = useEmployeeAuthStore((s) => s.token);
  // The employee layout's <main> already provides the max-width + padding.
  return <NotificationsView role="employee" token={token} />;
}
