"use client";

import { useState } from "react";
import Avatar from "@/components/ui/Avatar";
import { useAdminAuthStore } from "@/store/adminAuthStore";

type Role = "admin";

interface HeaderProps {
  role: Role;
  onMenuClick?: () => void;
  theme?: "light" | "dark";
  onThemeChange?: (theme: "light" | "dark") => void;
}

const loginUrls: Record<Role, string> = {
  admin: "/admin/login",
};

const cookieNames: Record<Role, string> = {
  admin: "admin-auth",
};

export default function Header({ role, onMenuClick, theme: externalTheme, onThemeChange }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [internalTheme, setInternalTheme] = useState<"light" | "dark">("light");
  const [profileOpen, setProfileOpen] = useState(false);

  const theme = externalTheme ?? internalTheme;
  const setTheme = onThemeChange ?? setInternalTheme;
  const isLight = theme === "light";

  const store = useAdminAuthStore();
  const user = store.user;
  void role;

  function handleLogout() {
    store.clearAuth();
    document.cookie = `${cookieNames[role]}=; path=/; max-age=0`;
    window.location.href = loginUrls[role];
  }

  return (
    <header
      className={
        isLight
          ? "flex h-16 items-center justify-between gap-2 border-b border-gray-200 bg-white px-3 sm:gap-4 sm:px-6"
          : "flex h-16 items-center justify-between gap-2 border-b border-[#1e293b] bg-[#0f172a] px-3 sm:gap-4 sm:px-6"
      }
    >
      {/* Left: Hamburger + Search */}
      <div className="flex flex-1 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className={
            isLight
              ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg hover:bg-gray-100"
              : "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg hover:bg-white/10"
          }
          aria-label="Toggle sidebar"
        >
          <svg className={isLight ? "h-6 w-6 text-[#0E1620]" : "h-6 w-6 text-gray-300"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {/* Mobile: compact search icon */}
        <button
          type="button"
          className={
            isLight
              ? "inline-flex h-[38px] w-[38px] items-center justify-center rounded-[16px] border border-[#E6E6E6] bg-[#F5F6FA] text-gray-400 sm:hidden"
              : "inline-flex h-[38px] w-[38px] items-center justify-center rounded-[16px] border border-[#334155] bg-[#1e293b] text-gray-400 sm:hidden"
          }
          aria-label="Search"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        {/* Desktop/tablet: full search input */}
        <div className="relative hidden w-full max-w-[323px] sm:block">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="search"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={
              isLight
                ? "h-[38px] w-full rounded-[16px] border border-[#E6E6E6] bg-[#F5F6FA] pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
                : "h-[38px] w-full rounded-[16px] border border-[#334155] bg-[#1e293b] pl-9 pr-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
            }
          />
        </div>
      </div>

      {/* Right: Theme, Notifications, Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Theme: capsule with moon + sun */}
        <div className={isLight ? "flex items-center rounded-full bg-gray-100 p-0.5" : "flex items-center rounded-full bg-[#1e293b] p-0.5"}>
          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
              !isLight
                ? "bg-[#0F50DB] text-white"
                : "text-gray-500 hover:text-gray-700"
            }`}
            aria-label="Dark mode"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
              isLight
                ? "bg-[#0F50DB] text-white"
                : "text-gray-400 hover:text-gray-200"
            }`}
            aria-label="Light mode"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </button>
        </div>
        <button
          type="button"
          className={
            isLight
              ? "relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200"
              : "relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#1e293b] text-gray-400 hover:bg-[#334155]"
          }
          aria-label="Notifications"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded bg-[#0F50DB] px-1 text-[10px] font-medium text-white">
            8
          </span>
        </button>
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen((o) => !o)}
            className="flex items-center gap-1.5 rounded-lg p-0.5 hover:opacity-90"
            aria-expanded={profileOpen}
            aria-haspopup="true"
          >
            <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-[#0F50DB]">
              <Avatar
                name={user?.name ?? "User"}
                size="sm"
                className="bg-[#0F50DB] text-white"
              />
            </span>
            <svg className={isLight ? "h-4 w-4 text-gray-400" : "h-4 w-4 text-gray-300"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {profileOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                aria-hidden
                onClick={() => setProfileOpen(false)}
              />
              <div className={
                isLight
                  ? "absolute right-0 top-full z-20 mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
                  : "absolute right-0 top-full z-20 mt-1 w-48 rounded-lg border border-[#334155] bg-[#1e293b] py-1 shadow-lg"
              }>
                <div className={isLight ? "border-b border-gray-100 px-3 py-2" : "border-b border-[#334155] px-3 py-2"}>
                  <p className={isLight ? "truncate text-sm font-medium text-gray-900" : "truncate text-sm font-medium text-white"}>{user?.name ?? "User"}</p>
                  <p className={isLight ? "truncate text-xs text-gray-500" : "truncate text-xs text-gray-400"}>{user?.email ?? ""}</p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className={
                    isLight
                      ? "flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                      : "flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-300 hover:bg-white/5"
                  }
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
