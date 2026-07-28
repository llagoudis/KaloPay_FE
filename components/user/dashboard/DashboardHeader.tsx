"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils/cn";
import Logo from "@/components/shared/Logo";
import { DASHBOARD_ROUTES } from "./routes";
import type { DashboardTheme } from "@/app/user/(protected)/UserLayoutClient";
import { useEmployerAuthStore } from "@/store/employerAuthStore";
import { employerLogout } from "@/lib/api/employer/auth";
import { listCompanies, switchCompanyApi } from "@/lib/api/employer/appFeatures";
import NotificationBell from "@/components/shared/NotificationBell";

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
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const profileBtnRef = useRef<HTMLButtonElement>(null);
  const { user, token, clearAuth, setAuth } = useEmployerAuthStore();
  const queryClient = useQueryClient();
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    // Clear any stale saved selection from the old mock multi-company switcher.
    if (typeof window !== "undefined") localStorage.removeItem("kp-employer-company");
  }, []);

  // Real companies this user can act on (many-to-many membership on the server).
  const { data: companyData } = useQuery({
    queryKey: ["employer", "companies"],
    queryFn: () => listCompanies(token!),
    enabled: !!token,
    staleTime: 60_000,
  });

  // Map the server list to the switcher's row shape; fall back to the single JWT
  // company before the list loads so the header never renders empty.
  const companies = useMemo(() => {
    const rows = companyData?.companies ?? [];
    if (rows.length) {
      return rows.map((c) => ({
        id: String(c.id),
        name: c.name,
        email: user?.email ?? "—",
        initials: (c.name ?? "?").charAt(0).toUpperCase(),
      }));
    }
    return [
      {
        id: user?.companyId != null ? String(user.companyId) : "current",
        name: user?.companyName ?? user?.name ?? "My Company",
        email: user?.email ?? "—",
        initials: (user?.companyName ?? user?.name ?? "?").charAt(0).toUpperCase(),
      },
    ];
  }, [companyData, user]);

  // Prefer user.companyId (updated instantly by setAuth on switch) over the
  // companies query's activeCompanyId (stale until it refetches) so the ✓ moves
  // the moment you click — no waiting on the network round-trip.
  const activeId =
    user?.companyId != null
      ? String(user.companyId)
      : companyData?.activeCompanyId != null
      ? String(companyData.activeCompanyId)
      : "current";
  const activeCompany = companies.find((c) => c.id === activeId) ?? companies[0];

  async function switchCompany(id: string) {
    if (!token || !user || id === activeCompany.id || switching) { setProfileOpen(false); return; }
    const target = companies.find((c) => c.id === id);
    const prevUser = user;
    const prevToken = token;
    // Instant feedback: close the menu and move the ✓ / company name NOW, before
    // the network call — so a single click visibly switches with no lag.
    setProfileOpen(false);
    setSwitching(true);
    setAuth({ ...user, companyId: Number(id), companyName: target?.name ?? user.companyName }, prevToken);
    try {
      const res = await switchCompanyApi(prevToken, Number(id));
      // Confirm with the freshly-signed token scoped to the new company…
      setAuth(
        { ...prevUser, companyId: Number(res.company.id), companyName: res.companyName },
        res.token
      );
      // …then refresh every panel's data in the background (don't block the UI).
      queryClient.invalidateQueries();
    } catch {
      // Switch rejected (e.g. not a member) / network error — revert cleanly.
      setAuth(prevUser, prevToken);
    } finally {
      setSwitching(false);
    }
  }

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

  const displayName = activeCompany.name;
  const displayEmail = activeCompany.email;
  const avatarInitial = activeCompany.initials;

  const navPillDarkBg = "linear-gradient(180deg, #1a2332 0%, #0f172a 100%)";

  function isNavActive(item: (typeof navItems)[0]) {
    const isPeopleSection =
      pathname === DASHBOARD_ROUTES.people ||
      pathname.startsWith(`${DASHBOARD_ROUTES.people}/`);
    const isPayrollSection =
      pathname === DASHBOARD_ROUTES.payroll ||
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

  // Position the profile menu with FIXED coords read from the avatar button, so
  // it escapes the layout's overflow-hidden + sticky-header clipping (as an
  // absolutely-positioned child it was rendering hidden / off, with a stray scrollbar).
  const profileBtnRect = profileOpen && typeof window !== "undefined" ? profileBtnRef.current?.getBoundingClientRect() : null;
  const profileMenuStyle = profileBtnRect
    ? { position: "fixed" as const, top: profileBtnRect.bottom + 8, right: Math.max(8, window.innerWidth - profileBtnRect.right), zIndex: 1000 }
    : { position: "fixed" as const, top: 72, right: 16, zIndex: 1000 };

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
              "relative hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-[13px] opacity-100 md:h-[56px] md:w-[56px] md:rounded-[18.67px]",
              isLight ? "bg-white" : "bg-[#0f172a]"
            )}
          >
            <NotificationBell role="employer" token={token} isLight={isLight} />
          </div>

          {/* Avatar + chevron */}
          <div className="relative flex items-center" ref={profileRef}>
            <button
              ref={profileBtnRef}
              type="button"
              onClick={() => setProfileOpen((o) => !o)}
              className="flex items-center gap-1.5 rounded-full outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 md:gap-[10px]"
              aria-label="User menu"
              aria-expanded={profileOpen}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[13px] bg-[#0F50DB] text-[14px] font-semibold leading-none text-white opacity-100 md:h-[56px] md:w-[56px] md:rounded-[18.67px] md:text-[18px] [font-family:var(--font-poppins),Poppins,sans-serif]">
                {avatarInitial}
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
                style={profileMenuStyle}
                className={cn(
                  "min-w-[200px] max-w-[calc(100vw-2rem)] rounded-xl py-2 shadow-xl",
                  isLight
                    ? "bg-white shadow-slate-200/50 border border-slate-200"
                    : "bg-[#1e293b] border border-[var(--color-dash-icon-bg)]"
                )}
              >
                <div className="px-4 py-2">
                  <p className="font-semibold text-dash-primary">{displayName}</p>
                  <p className="text-sm text-dash-secondary">{displayEmail}</p>
                </div>
                <div className="my-2 border-t border-[var(--color-dash-icon-bg)]" />
                <div className="px-4 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wider text-dash-secondary">
                  Switch company
                </div>
                {companies.map((c) => {
                  const on = c.id === activeCompany.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => switchCompany(c.id)}
                      className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm text-dash-primary hover:bg-black/5"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#0F50DB] text-[12px] font-semibold text-white">
                        {c.initials}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{c.name}</span>
                      {on && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0F50DB" strokeWidth="2.5" className="shrink-0">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  );
                })}
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
                <Link
                  href={DASHBOARD_ROUTES.billing}
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-dash-primary hover:bg-black/5"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-dash-secondary">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                  </svg>
                  Billing
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

/* Notification dropdown — the outstanding bill payment is the lead alert and
   deep-links into Billing → Pay now. */
function NotificationPanel({
  isLight,
  onClose,
  onGoToBilling,
  onPayBill,
}: {
  isLight: boolean;
  onClose: () => void;
  onGoToBilling: () => void;
  onPayBill: () => void;
}) {
  const notes = [
    {
      id: "bill",
      tone: "danger" as const,
      title: "Bill payment due",
      body: "Your July invoice of €334.00 is due Jul 01, 2026. Pay now to avoid a late fee.",
      time: "Due in 7 days",
      amount: "€334.00",
      cta: "Pay bill",
    },
    {
      id: "payroll",
      tone: "warning" as const,
      title: "June payroll runs in 3 days",
      body: "21 employees · €48,200 will be disbursed on Jun 27.",
      time: "2h ago",
      amount: undefined,
      cta: undefined,
    },
    {
      id: "person",
      tone: "info" as const,
      title: "Maria Andreou completed onboarding",
      body: "Bank details and tax forms are now on file.",
      time: "Yesterday",
      amount: undefined,
      cta: undefined,
    },
  ];
  const toneClass: Record<string, string> = {
    danger: "bg-red-50 text-red-600",
    warning: "bg-amber-50 text-amber-600",
    info: "bg-blue-50 text-[#0F50DB]",
  };

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-[39]" aria-hidden />
      <div
        role="menu"
        className={cn(
          "absolute right-0 top-full z-40 mt-2 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl shadow-xl",
          isLight ? "border border-slate-200 bg-white" : "border border-[var(--color-dash-icon-bg)] bg-dash-card"
        )}
      >
        <div className={cn("flex items-center justify-between border-b px-4 py-3", isLight ? "border-slate-100" : "border-white/10")}>
          <span className="text-[15px] font-semibold text-dash-primary">Notifications</span>
          <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide", isLight ? "bg-red-50 text-red-600" : "bg-red-500/15 text-red-300")}>
            1 action needed
          </span>
        </div>
        <div className="max-h-[380px] overflow-y-auto">
          {notes.map((n, i) => {
            const lead = n.tone === "danger";
            return (
              <div
                key={n.id}
                className={cn(
                  "relative flex gap-3 px-4 py-3.5",
                  i < notes.length - 1 && (isLight ? "border-b border-slate-100" : "border-b border-white/10"),
                  lead && (isLight ? "bg-red-50/60" : "bg-red-500/10")
                )}
              >
                {lead && <span className="absolute bottom-0 left-0 top-0 w-[3px] bg-red-500" />}
                <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", toneClass[n.tone])}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 7h20v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z" />
                    <path d="M2 7l2-3h16l2 3" />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[14px] font-semibold text-dash-primary">{n.title}</span>
                    {n.amount && <span className="shrink-0 text-[14px] font-bold text-red-600">{n.amount}</span>}
                  </div>
                  <p className="mt-1 text-[12.5px] leading-snug text-dash-secondary">{n.body}</p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className={cn("text-[11.5px] font-medium", lead ? "text-red-600" : "text-dash-secondary")}>
                      {n.time}
                    </span>
                    {n.cta && (
                      <button
                        type="button"
                        onClick={onPayBill}
                        className="rounded-lg bg-[#0F50DB] px-4 py-1.5 text-[13px] font-semibold text-white"
                      >
                        {n.cta}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={onGoToBilling}
          className={cn("block w-full border-t py-3 text-center text-[13.5px] font-semibold text-[#0F50DB]", isLight ? "border-slate-100 hover:bg-slate-50" : "border-white/10 hover:bg-white/5")}
        >
          View billing
        </button>
      </div>
    </>
  );
}
