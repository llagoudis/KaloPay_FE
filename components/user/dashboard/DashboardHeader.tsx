"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import Logo from "@/components/shared/Logo";
import { DASHBOARD_ROUTES } from "./routes";
import type { DashboardTheme } from "@/app/user/(protected)/UserLayoutClient";
import { useEmployerAuthStore } from "@/store/employerAuthStore";
import { employerLogout } from "@/lib/api/employer/auth";

const navItems = [
  { label: "Home", href: DASHBOARD_ROUTES.dashboard },
  { label: "People", href: DASHBOARD_ROUTES.people },
  { label: "Payroll", href: DASHBOARD_ROUTES.payroll },
  { label: "Reports", href: DASHBOARD_ROUTES.reports },
];

interface DashboardHeaderProps {
  theme: DashboardTheme;
  onThemeChange: (theme: DashboardTheme) => void;
}

export default function DashboardHeader({ theme, onThemeChange }: DashboardHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isLight = theme === "light";
  const notificationCount = 8;
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { user, clearAuth } = useEmployerAuthStore();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [profileOpen]);

  async function handleLogout() {
    setProfileOpen(false);
    setMobileMenuOpen(false);
    try {
      await employerLogout();
    } finally {
      clearAuth();
      router.push("/user/login");
    }
  }

  const displayName = user?.companyName ?? user?.name ?? "—";
  const displayEmail = user?.email ?? "—";
  const avatarInitial = (user?.companyName ?? user?.name ?? "?").charAt(0).toUpperCase();

  const navPillDarkBg = "linear-gradient(180deg, #1a2332 0%, #0f172a 100%)";

  function isNavActive(item: (typeof navItems)[0]) {
    const isPeopleSection =
      pathname === DASHBOARD_ROUTES.people ||
      pathname.startsWith(`${DASHBOARD_ROUTES.people}/`);
    const isPayrollSection =
      pathname === DASHBOARD_ROUTES.payroll ||
      pathname === DASHBOARD_ROUTES.payments ||
      pathname === DASHBOARD_ROUTES.bulkPayouts ||
      pathname === DASHBOARD_ROUTES.transfers ||
      pathname === DASHBOARD_ROUTES.payrollReports;
    return item.label === "Payroll"
      ? isPayrollSection
      : item.label === "Reports"
        ? pathname === item.href && !isPayrollSection
        : item.label === "People"
          ? isPeopleSection
          : pathname === item.href;
  }

  function NavIcon({ label }: { label: string }) {
    if (label === "Home") return (
      <svg className="w-[20px] h-[20px] md:w-[22px] md:h-[22px] shrink-0" viewBox="0 0 24 24" fill="none">
        <path d="M12 3L3 10.5V21H21V10.5Z" fill="currentColor" fillOpacity="0.78" stroke="currentColor" strokeOpacity="0.78" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx="12" cy="15" r="2" fill="currentColor" />
      </svg>
    );
    if (label === "People") return (
      <svg className="w-[20px] h-[20px] md:w-[22px] md:h-[22px] shrink-0" viewBox="0 0 24 24" fill="none">
        <circle cx="9" cy="8.5" r="3.8" fill="currentColor" fillOpacity="0.5" />
        <path d="M2 22a7 7 0 0 1 14 0Z" fill="currentColor" fillOpacity="0.5" />
        <circle cx="16" cy="7" r="4.5" fill="currentColor" />
        <path d="M9.5 22a7 7 0 0 1 14 0Z" fill="currentColor" />
        <path d="M5 15.5L5.35 18.15L8 18.5L5.35 18.85L5 21.5L4.65 18.85L2 18.5L4.65 18.15Z" fill="currentColor" />
      </svg>
    );
    if (label === "Payroll") return (
      <svg className="w-[20px] h-[20px] md:w-[22px] md:h-[22px] shrink-0" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="3" width="15" height="18" rx="4" fill="currentColor" fillOpacity="0.55" />
        <rect x="14" y="10" width="4.5" height="4" rx="2" fill="currentColor" />
      </svg>
    );
    if (label === "Reports") return (
      <svg className="w-[20px] h-[20px] md:w-[22px] md:h-[22px] shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden>
        <defs>
          <mask id="rcm">
            <rect x="12.5" y="12.5" width="8" height="8" rx="2.5" fill="white" />
            <path d="M14.5 17L16.3 18.8L19.5 15.2" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </mask>
        </defs>
        <rect x="0.5" y="0.5" width="18" height="18" rx="5" fill="currentColor" fillOpacity="0.5" />
        <rect x="3.5" y="4.5" width="3" height="9" rx="1.5" fill="currentColor" />
        <rect x="8" y="4.5" width="3" height="9" rx="1.5" fill="currentColor" />
        <rect x="12.5" y="4.5" width="3" height="9" rx="1.5" fill="currentColor" />
        <rect x="12.5" y="12.5" width="8" height="8" rx="2.5" fill="currentColor" mask="url(#rcm)" />
      </svg>
    );
    return null;
  }

  return (
    <header className="relative z-50 w-full bg-dash-page pt-3 md:pt-6 lg:pt-7 shadow-none" style={{ boxShadow: "none" }}>
      <div className="dash-shell flex min-h-[44px] items-center justify-between gap-2 md:min-h-[56px] md:gap-4">
        {/* Logo */}
        <div className="flex shrink-0 items-center">
          <Logo
            href={DASHBOARD_ROUTES.dashboard}
            variant={isLight ? "light" : "dark"}
            accentColor="var(--color-figma-337-4624)"
          />
        </div>

        {/* Desktop nav pill (md+) */}
        <nav className="hidden md:flex min-w-0 flex-1 justify-center" aria-label="Main navigation">
          <div
            className={cn(
              "flex h-[56px] w-full max-w-[485px] shrink-0 items-stretch gap-[10px] rounded-[100px] p-2 shadow-none",
              isLight ? "bg-[#f7f7fa]" : ""
            )}
            style={isLight ? undefined : { background: navPillDarkBg, boxShadow: "none" }}
          >
            {navItems.map((item) => {
              const isActive = isNavActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex min-h-0 min-w-0 flex-1 basis-0 items-center justify-center gap-2 rounded-full px-2 align-middle font-medium text-[14px] leading-[100%] tracking-normal transition-colors [font-family:var(--font-poppins),Poppins,sans-serif]",
                    isActive
                      ? "bg-[#0F50DB] text-white [&_svg]:opacity-95"
                      : isLight
                        ? "text-[#9EA6B3] hover:bg-black/[0.06]"
                        : "text-[#9EA6B3] hover:bg-white/5"
                  )}
                >
                  <NavIcon label={item.label} />
                  <span className="truncate whitespace-nowrap align-middle">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Right controls */}
        <div className="flex shrink-0 items-center gap-1.5 md:gap-[10px]">
          {/* Theme toggle */}
          <button
            type="button"
            role="switch"
            aria-checked={isLight}
            aria-label="Toggle dark or light mode"
            onClick={() => onThemeChange(isLight ? "dark" : "light")}
            className={cn(
              "flex h-9 w-[68px] shrink-0 items-center gap-1 rounded-[13px] py-1 pl-1 pr-1 opacity-100 transition-colors md:h-[56px] md:w-[98px] md:gap-[10px] md:rounded-[18.67px] md:py-2 md:pl-[7px] md:pr-[7px]",
              isLight ? "bg-white" : "bg-[#0f172a]"
            )}
          >
            <span
              className={cn(
                "flex h-7 min-h-0 min-w-0 flex-1 items-center justify-center rounded-[8px] transition-colors md:h-10 md:rounded-[10px]",
                !isLight ? "bg-[#0F50DB] text-white" : "text-[#9EA6B3]"
              )}
              aria-hidden
            >
              <svg className="w-[16px] h-[16px] md:w-[22px] md:h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            </span>
            <span
              className={cn(
                "flex h-7 min-h-0 min-w-0 flex-1 items-center justify-center rounded-[8px] transition-colors md:h-10 md:rounded-[10px]",
                isLight ? "bg-[#0F50DB] text-white" : "text-[#9EA6B3]"
              )}
              aria-hidden
            >
              <svg className="w-[16px] h-[16px] md:w-[22px] md:h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            </span>
          </button>

          {/* Notification (hidden on mobile to save space) */}
          <div
            className={cn(
              "hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-[13px] opacity-100 md:h-[56px] md:w-[56px] md:rounded-[18.67px]",
              isLight ? "bg-white" : "bg-[#0f172a]"
            )}
          >
            <button
              type="button"
              className="relative flex h-full w-full items-center justify-center transition hover:[&_.notification-bell-icon]:opacity-60"
              aria-label={`${notificationCount} notifications`}
            >
              <svg
                className="notification-bell-icon pointer-events-none shrink-0 text-[#878787] opacity-50 w-[18px] h-[18px] md:w-[22px] md:h-[22px]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.35"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="absolute bottom-0.5 right-0.5 z-10 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-lg border-0 bg-[#0F50DB] px-1 text-[10px] font-normal leading-none tracking-normal text-white md:min-h-[22px] md:min-w-[22px] md:px-1.5 md:text-[14px] [font-family:var(--font-poppins),Poppins,sans-serif]">
                {notificationCount}
              </span>
            </button>
          </div>

          {/* Avatar + chevron */}
          <div className="relative flex items-center" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((o) => !o)}
              className="flex items-center gap-1.5 rounded-full outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 md:gap-[10px]"
              aria-label="User menu"
              aria-expanded={profileOpen}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[13px] bg-[#0F50DB] text-[14px] font-semibold leading-none text-white opacity-100 md:h-[56px] md:w-[56px] md:rounded-[18.67px] md:text-[18px] [font-family:var(--font-poppins),Poppins,sans-serif]">
                K
              </div>
              <svg
                className="hidden sm:block w-[16px] h-[16px] md:w-[20px] md:h-[20px] shrink-0 text-[#9EA6B3] transition-transform"
                style={{ transform: profileOpen ? "rotate(180deg)" : undefined }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {profileOpen && (
              <div
                className={cn(
                  "absolute right-0 top-full z-50 mt-2 min-w-[200px] max-w-[calc(100vw-2rem)] rounded-xl py-2",
                  isLight
                    ? "bg-white shadow-slate-200/50 border border-slate-200"
                    : "bg-dash-card border border-[var(--color-dash-icon-bg)]"
                )}
              >
                <div className="px-4 py-2">
                  <p className="font-semibold text-dash-primary">{displayName}</p>
                  <p className="text-sm text-dash-secondary">{displayEmail}</p>
                </div>
                <div className="my-2 border-t border-[var(--color-dash-icon-bg)]" />
                <Link
                  href={DASHBOARD_ROUTES.settings}
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-dash-primary hover:bg-black/5"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-dash-secondary">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                  Profile settings
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className={cn(
                    "flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium",
                    isLight ? "text-red-600 hover:bg-red-50" : "text-red-400 hover:bg-red-900/20"
                  )}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Hamburger (mobile only) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((o) => !o)}
            className={cn(
              "flex md:hidden h-9 w-9 shrink-0 items-center justify-center rounded-[13px] transition",
              isLight ? "bg-white text-[#1f2937]" : "bg-[#0f172a] text-[#9EA6B3]"
            )}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav dropdown – in document flow so parent overflow:hidden can't clip it */}
      {mobileMenuOpen && (
        <div
          className={cn(
            "w-full border-t md:hidden",
            isLight ? "border-gray-100 bg-white" : "border-white/10 bg-[#0d1525]"
          )}
        >
          <nav className="dash-shell flex flex-col gap-1 py-3" aria-label="Mobile navigation">
            {navItems.map((item) => {
              const isActive = isNavActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3.5 text-[15px] font-medium transition [font-family:var(--font-poppins),Poppins,sans-serif]",
                    isActive
                      ? "bg-[#0F50DB] text-white"
                      : isLight
                        ? "text-[#4b5563] hover:bg-black/[0.05]"
                        : "text-[#cbd5e1] hover:bg-white/[0.07]"
                  )}
                >
                  <NavIcon label={item.label} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
