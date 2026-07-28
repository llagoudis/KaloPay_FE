"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getNotifications, type NotificationRole, type AppNotification } from "@/lib/api/notifications";
import { cn } from "@/lib/utils/cn";

// Per-role route to the full notifications page (backend segment is the role name,
// but the employer app path is /user).
const ALL_HREF: Record<NotificationRole, string> = {
  admin: "/admin/notifications",
  employer: "/user/notifications",
  employee: "/employee/notifications",
};

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
    <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", TONE_ICON_CLASS[tone])}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

export default function NotificationBell({
  role,
  token,
  isLight = true,
  buttonClassName,
}: {
  role: NotificationRole;
  token: string | null | undefined;
  isLight?: boolean;
  buttonClassName?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const storeKey = `kp-notif-read-${role}`;

  const { data } = useQuery({
    queryKey: ["notifications", role],
    queryFn: () => getNotifications(role, token!),
    enabled: !!token,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
  const notifications = useMemo(() => data?.notifications ?? [], [data]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try { setReadIds(JSON.parse(localStorage.getItem(storeKey) || "[]")); } catch { setReadIds([]); }
  }, [storeKey]);

  function persist(ids: string[]) {
    setReadIds(ids);
    if (typeof window !== "undefined") localStorage.setItem(storeKey, JSON.stringify(ids));
  }

  const unreadCount = useMemo(
    () => notifications.filter((n) => !readIds.includes(n.id)).length,
    [notifications, readIds]
  );

  useEffect(() => {
    function onDown(e: MouseEvent) {
      const t = e.target as Node;
      // The menu is portaled to <body>, so it isn't inside `ref` — check both.
      if (ref.current && !ref.current.contains(t) && (!menuRef.current || !menuRef.current.contains(t))) setOpen(false);
    }
    if (open) { document.addEventListener("mousedown", onDown); return () => document.removeEventListener("mousedown", onDown); }
  }, [open]);

  function markAll() { persist(Array.from(new Set([...readIds, ...notifications.map((n) => n.id)]))); }
  function handleClick(n: AppNotification) {
    if (!readIds.includes(n.id)) persist([...readIds, n.id]);
    setOpen(false);
    if (n.link) router.push(n.link);
  }

  // Portal + fixed coords (read from the bell box) so the menu escapes ANY ancestor
  // overflow/stacking/transform clipping (the employer layout was clipping an absolute menu).
  const rect = open && typeof window !== "undefined" && ref.current ? ref.current.getBoundingClientRect() : null;
  const menuStyle = rect
    ? ({ position: "fixed", top: rect.bottom + 8, right: Math.max(8, window.innerWidth - rect.right), zIndex: 1000 } as const)
    : ({ position: "fixed", top: 64, right: 16, zIndex: 1000 } as const);

  return (
    <div ref={ref} className="relative h-full w-full">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`${unreadCount} unread notifications`}
        aria-expanded={open}
        className={cn("relative flex h-full w-full items-center justify-center transition hover:opacity-70", buttonClassName)}
      >
        <svg className="h-[18px] w-[18px] md:h-[22px] md:w-[22px] text-[#878787]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#0F50DB] px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {mounted && open && createPortal(
        <div
          ref={menuRef}
          role="menu"
          style={menuStyle}
          className={cn(
            "w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl shadow-xl",
            isLight ? "border border-slate-200 bg-white" : "border border-white/10 bg-[#1e293b]"
          )}
        >
          <div className={cn("flex items-center justify-between border-b px-4 py-3", isLight ? "border-slate-100" : "border-white/10")}>
            <span className={cn("text-[15px] font-semibold", isLight ? "text-gray-900" : "text-white")}>Notifications</span>
            {unreadCount > 0 ? (
              <button type="button" onClick={markAll} className="text-[12px] font-medium text-[#0F50DB] hover:underline">
                Mark all read
              </button>
            ) : (
              <span className={cn("text-[11px]", isLight ? "text-gray-400" : "text-white/40")}>All caught up</span>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className={cn("px-4 py-10 text-center text-sm", isLight ? "text-gray-400" : "text-white/40")}>
                No notifications yet.
              </div>
            ) : (
              notifications.slice(0, 3).map((n, i, arr) => {
                const unread = !readIds.includes(n.id);
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => handleClick(n)}
                    className={cn(
                      "relative flex w-full gap-3 px-4 py-3.5 text-left transition",
                      i < arr.length - 1 && (isLight ? "border-b border-slate-100" : "border-b border-white/10"),
                      isLight ? "hover:bg-slate-50" : "hover:bg-white/5",
                      unread && (isLight ? "bg-blue-50/40" : "bg-blue-500/10")
                    )}
                  >
                    {unread && <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#0F50DB]" />}
                    <ToneIcon tone={n.tone} />
                    <span className="min-w-0 flex-1">
                      <span className={cn("block text-[13px] font-semibold", isLight ? "text-gray-900" : "text-white")}>{n.title}</span>
                      <span className={cn("mt-0.5 block text-[12px] leading-snug", isLight ? "text-gray-500" : "text-white/60")}>{n.body}</span>
                      <span className={cn("mt-1 block text-[11px]", isLight ? "text-gray-400" : "text-white/40")}>{relTime(n.createdAt)}</span>
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {notifications.length > 0 && (
            <button
              type="button"
              onClick={() => { setOpen(false); router.push(ALL_HREF[role]); }}
              className={cn(
                "block w-full shrink-0 border-t py-3 text-center text-[13px] font-semibold text-[#0F50DB]",
                isLight ? "border-slate-100 hover:bg-slate-50" : "border-white/10 hover:bg-white/5"
              )}
            >
              See all notifications ({notifications.length})
            </button>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
