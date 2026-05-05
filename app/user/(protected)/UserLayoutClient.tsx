"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardHeader from "@/components/user/dashboard/DashboardHeader";
import { cn } from "@/lib/utils/cn";

export type DashboardTheme = "light" | "dark";

/** Protected layout: header + nav; content is the active page (dashboard, people, etc.). */
export default function UserLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [theme, setTheme] = useState<DashboardTheme>("dark");

  useEffect(() => {
    if (pathname === "/user" || pathname === "/user/") {
      router.replace("/user/dashboard");
    }
  }, [pathname, router]);

  return (
    <div
      data-dashboard-theme
      data-theme={theme}
      className={cn(
        "min-h-screen w-full overflow-x-hidden",
        theme === "light" && "employer-dash-shell",
        theme === "dark" && "bg-dash-page"
      )}
    >
      <DashboardHeader theme={theme} onThemeChange={setTheme} />
      {children}
    </div>
  );
}
