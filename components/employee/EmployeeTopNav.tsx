"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEmployeeAuthStore } from "@/store/employeeAuthStore";
import { useMyProfile } from "@/hooks/employee/useEmployeeData";
import NotificationBell from "@/components/shared/NotificationBell";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/employee/dashboard", icon: HomeIcon },
  { label: "Leave",     href: "/employee/leave",     icon: CalendarIcon },
  { label: "Reports",   href: "/employee/reports",   icon: DocIcon },
  { label: "Settings",  href: "/employee/settings",  icon: GearIcon },
] as const;

interface EmployeeTopNavProps {
  theme: "light" | "dark";
  onThemeChange: (t: "light" | "dark") => void;
}

export default function EmployeeTopNav({ theme, onThemeChange }: EmployeeTopNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, token, clearAuth } = useEmployeeAuthStore();
  const { data: profileData } = useMyProfile();
  const profile = profileData?.profile;

  const displayName = profile?.name ?? user?.name ?? "Employee";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";

  function isActive(href: string) {
    if (!pathname) return false;
    return pathname === href || pathname.startsWith(href + "/");
  }

  function handleLogout() {
    clearAuth();
    if (typeof document !== "undefined") {
      document.cookie = "employee-auth=; path=/; max-age=0";
    }
    router.push("/employee/login");
  }

  const isLight = theme === "light";

  return (
    <header
      className={`sticky top-0 z-30 w-full ${
        isLight
          ? "border-b border-gray-100 bg-white"
          : "border-b border-[#1e293b] bg-[#0f172a]"
      }`}
    >
      <div className="mx-auto flex h-[68px] w-full items-center justify-between gap-6 px-7">
        {/* Left: brand */}
        <Link href="/employee/dashboard" className="flex items-center gap-2 shrink-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#0f50db] text-base font-bold text-white">
            K
          </span>
          <span
            className={`text-[20px] font-semibold tracking-tight ${
              isLight ? "text-[#0f50db]" : "text-white"
            }`}
          >
            KaloPay
          </span>
        </Link>

        {/* Center: nav pills */}
        <nav className="hidden md:flex items-center gap-1.5">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-[#0f50db] text-white shadow-sm"
                    : isLight
                    ? "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                }`}
              >
                <Icon active={active} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: theme + bell + avatar + logout */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <div
            className={`flex items-center gap-1 rounded-full p-1 ${
              isLight ? "bg-gray-100" : "bg-[#1e293b]"
            }`}
          >
            <button
              type="button"
              onClick={() => onThemeChange("dark")}
              className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                !isLight ? "bg-[#0f50db] text-white" : "text-gray-400 hover:text-gray-600"
              }`}
              aria-label="Dark mode"
            >
              <MoonIcon />
            </button>
            <button
              type="button"
              onClick={() => onThemeChange("light")}
              className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                isLight ? "bg-[#0f50db] text-white" : "text-gray-400 hover:text-gray-200"
              }`}
              aria-label="Light mode"
            >
              <SunIcon />
            </button>
          </div>

          {/* Notification bell */}
          <div
            className={`relative flex h-10 w-10 items-center justify-center rounded-full ${
              isLight ? "bg-gray-100" : "bg-[#1e293b]"
            }`}
          >
            <NotificationBell role="employee" token={token} isLight={isLight} />
          </div>

          {/* Avatar */}
          <Link
            href="/employee/settings"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0f50db] text-sm font-semibold text-white"
            aria-label="Profile"
          >
            {initials}
          </Link>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              isLight
                ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                : "bg-[#1e293b] text-gray-300 hover:bg-[#334155]"
            }`}
            aria-label="Logout"
          >
            <LogoutIcon />
          </button>
        </div>
      </div>

      {/* Mobile nav row */}
      <nav className="flex items-center gap-1.5 overflow-x-auto px-7 pb-3 md:hidden">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-1.5 text-[13px] font-medium ${
                active
                  ? "bg-[#0f50db] text-white"
                  : isLight
                  ? "bg-gray-100 text-gray-600"
                  : "bg-[#1e293b] text-gray-300"
              }`}
            >
              <Icon active={active} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

// ── Icons ────────────────────────────────────────────────────────────
function HomeIcon({ active }: { active?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? "currentColor" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
      <polyline points="9 21 9 12 15 12 15 21" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
function DocIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}
function GearIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="4" />
      <line x1="12" y1="20" x2="12" y2="22" />
      <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
      <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
      <line x1="2" y1="12" x2="4" y2="12" />
      <line x1="20" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="19.07" x2="6.34" y2="17.66" />
      <line x1="17.66" y1="6.34" x2="19.07" y2="4.93" />
    </svg>
  );
}
function BellIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
