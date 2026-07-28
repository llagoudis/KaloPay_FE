"use client";

import NotificationsView from "@/components/shared/NotificationsView";
import { useEmployerAuthStore } from "@/store/employerAuthStore";

export default function EmployerNotificationsPage() {
  const token = useEmployerAuthStore((s) => s.token);
  return (
    <div className="dash-shell py-8">
      <NotificationsView role="employer" token={token} />
    </div>
  );
}
