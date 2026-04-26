"use client";

import { useState } from "react";
import Sidebar from "@/components/shared/Sidebar";
import Header from "@/components/shared/Header";

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const isLight = theme === "light";

  function handleMenuClick() {
    // Desktop: collapse the fixed sidebar. Mobile: open/close overlay drawer.
    if (typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches) {
      setDesktopSidebarCollapsed((v) => !v);
      return;
    }
    setSidebarOpen((prev) => !prev);
  }

  return (
    <div className="flex min-h-screen w-full" data-dashboard-theme data-theme={theme}>
      {/* Desktop sidebar */}
      <div className="hidden md:block sticky top-0 h-screen flex-shrink-0">
        <div
          className={`h-full overflow-hidden transition-[width] duration-200 ease-in-out ${
            isLight ? "" : "border-r border-[#1e293b]"
          }`}
          style={{ width: desktopSidebarCollapsed ? 0 : 240 }}
        >
          <Sidebar role="admin" />
        </div>
      </div>

      {/* Mobile sidebar as overlay drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className={`relative w-60 max-w-[80%] shadow-xl ${isLight ? "bg-white" : "bg-[#0f172a]"}`}>
            <button
              type="button"
              aria-label="Close sidebar"
              className={`absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full ${
                isLight ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
              onClick={handleMenuClick}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6l12 12M18 6l-12 12" />
              </svg>
            </button>
            <Sidebar role="admin" />
          </div>
          <button
            type="button"
            aria-label="Close sidebar"
            className="flex-1 bg-black/30"
            onClick={handleMenuClick}
          />
        </div>
      )}

      <div className={`flex min-h-screen flex-1 flex-col overflow-hidden ${isLight ? "bg-[#F5F6FA]" : "bg-[#04102A]"}`}>
        <Header role="admin" onMenuClick={handleMenuClick} theme={theme} onThemeChange={setTheme} />
        <main className="min-h-0 flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
