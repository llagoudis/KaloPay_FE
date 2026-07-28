"use client";

import { useQuery } from "@tanstack/react-query";
import { getNotifications, type NotificationRole, type AppNotification } from "@/lib/api/notifications";
import { useDashTheme } from "@/hooks/useDashTheme";
import { cn } from "@/lib/utils/cn";

function relTime(iso: string | null): string {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24); if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const TONE_ICON_CLASS: Record<AppNotification["tone"], string> = {
  danger: "bg-red-50 text-red-600",
  warning: "bg-amber-50 text-amber-600",
  info: "bg-blue-50 text-[#0F50DB]",
  success: "bg-green-50 text-green-600",
};

function ToneIcon({ tone }: { tone: AppNotification["tone"] }) {
  return (
    <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", TONE_ICON_CLASS[tone])}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        {tone === "success" ? (
          <polyline points="20 6 9 17 4 12" />
        ) : tone === "danger" ? (
          <><circle cx="12" cy="12" r="9" /><line x1="12" y1="8" x2="12" y2="13" /><line x1="12" y1="16" x2="12" y2="16" /></>
        ) : tone === "warning" ? (
          <><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12" y2="17" /></>
        ) : (
          <><circle cx="12" cy="12" r="9" /><line x1="12" y1="8" x2="12" y2="8" /><line x1="12" y1="11" x2="12" y2="16" /></>
        )}
      </svg>
    </span>
  );
}

/** Full-page notifications list (same feed as the bell) — shared by all three panels. */
export default function NotificationsView({
  role,
  token,
}: {
  role: NotificationRole;
  token: string | null | undefined;
}) {
  const isLight = useDashTheme() === "light";
  const { data } = useQuery({
    queryKey: ["notifications", role],
    queryFn: () => getNotifications(role, token!),
    enabled: !!token,
    refetchInterval: 60_000,
  });
  const notifications = data?.notifications ?? [];

  return (
    <div className="mx-auto w-full max-w-[1120px]">
      <h1 className={cn("text-2xl font-bold", isLight ? "text-gray-900" : "text-white")}>Notifications</h1>
      <p className={cn("mt-1 text-sm", isLight ? "text-gray-500" : "text-white/50")}>
        {notifications.length === 0
          ? "You're all caught up"
          : `${notifications.length} notification${notifications.length === 1 ? "" : "s"}`}
      </p>

      <div className="mt-6 space-y-3">
        {notifications.length === 0 ? (
          <div className={cn("rounded-xl border px-6 py-16 text-center text-sm", isLight ? "border-slate-200 bg-white text-gray-400" : "border-white/10 bg-[#1e293b] text-white/40")}>
            No notifications yet.
          </div>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className={cn("flex items-start gap-4 rounded-xl border px-5 py-4", isLight ? "border-slate-200 bg-white" : "border-white/10 bg-[#1e293b]")}>
              <ToneIcon tone={n.tone} />
              <div className="min-w-0 flex-1">
                <div className={cn("text-[14px] font-semibold", isLight ? "text-gray-900" : "text-white")}>{n.title}</div>
                <div className={cn("mt-0.5 text-[13px]", isLight ? "text-gray-500" : "text-white/60")}>{n.body}</div>
                <div className={cn("mt-1 text-[11.5px]", isLight ? "text-gray-400" : "text-white/40")}>{relTime(n.createdAt)}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
