"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { ROUTES } from "@/lib/constants/routes";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import { useEmployerAuthStore } from "@/store/employerAuthStore";
import { useEmployeeAuthStore } from "@/store/employeeAuthStore";

type Role = "admin" | "employer" | "employee";

// Icons as inline SVG components
const IconManagement = ({ className, active, color: _color }: { className?: string; active?: boolean; color?: string }) => (
  <svg className={cn("h-5 w-5 flex-shrink-0", active ? "text-blue-600" : "text-gray-500", className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);
const IconAdministration = ({ className, active, color }: { className?: string; active?: boolean; color?: string }) => (
  <svg
    className={cn("h-5 w-5 flex-shrink-0", !color && (active ? "text-blue-600" : "text-gray-500"), className)}
    style={color ? { color } : undefined}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);
const iconStrokeStyle = (active: boolean) => ({ color: active ? "#0F4FDB" : "#9EA6B3", strokeWidth: 2 });

const IconEmployees = ({ className, active }: { className?: string; active?: boolean }) => (
  <svg className={cn("h-5 w-5 flex-shrink-0", className)} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={iconStrokeStyle(!!active)}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);
const IconCompanies = ({ className, active }: { className?: string; active?: boolean }) => (
  <svg className={cn("h-5 w-5 flex-shrink-0", className)} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={iconStrokeStyle(!!active)}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);
const IconAccounts = ({ className, active }: { className?: string; active?: boolean }) => (
  <svg className={cn("h-5 w-5 flex-shrink-0", className)} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={iconStrokeStyle(!!active)}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);
const IconTransaction = ({ className, active }: { className?: string; active?: boolean }) => (
  <svg className={cn("h-5 w-5 flex-shrink-0", className)} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={iconStrokeStyle(!!active)}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
  </svg>
);
const IconDocument = ({ className, active }: { className?: string; active?: boolean }) => (
  <svg className={cn("h-5 w-5 flex-shrink-0", className)} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={iconStrokeStyle(!!active)}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);
const IconShield = ({ className, active }: { className?: string; active?: boolean }) => (
  <svg className={cn("h-5 w-5 flex-shrink-0", className)} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={iconStrokeStyle(!!active)}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);
const IconWallet = ({ className, active }: { className?: string; active?: boolean }) => (
  <svg className={cn("h-5 w-5 flex-shrink-0", className)} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={iconStrokeStyle(!!active)}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);
const IconSettings = ({ className, active }: { className?: string; active?: boolean }) => (
  <svg className={cn("h-5 w-5 flex-shrink-0", className)} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={iconStrokeStyle(!!active)}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const IconChevronDown = ({ open }: { open: boolean }) => (
  <svg className={cn("h-4 w-4 flex-shrink-0 text-gray-500 transition-transform", !open && "rotate-180")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const adminNavSections = [
  {
    title: "Management",
    SectionIcon: IconManagement,
    items: [
      { label: "Employees", href: ROUTES.admin.employees, Icon: IconEmployees },
      { label: "Companies", href: ROUTES.admin.companies, Icon: IconCompanies },
      { label: "Accounts", href: ROUTES.admin.accounts, Icon: IconAccounts },
      { label: "Transaction", href: ROUTES.admin.transactions, Icon: IconTransaction },
    ],
  },
  {
    title: "Administration",
    SectionIcon: IconAdministration,
    iconColor: "#0F50DB",
    items: [
      { label: "Admin Activity Log", href: ROUTES.admin.activityLogs, Icon: IconDocument },
      { label: "Client Activity Log", href: ROUTES.admin.clientActivityLogs, Icon: IconDocument },
      { label: "Administrators", href: ROUTES.admin.administrators, Icon: IconShield },
      { label: "Wallet Summary", href: ROUTES.admin.wallet, Icon: IconWallet },
      { label: "Admin Wallet", href: ROUTES.admin.adminWallet, Icon: IconWallet },
      { label: "Documents", href: ROUTES.admin.documents, Icon: IconDocument },
      { label: "Settings", href: ROUTES.admin.settings, Icon: IconSettings },
    ],
  },
];

const navItems: Record<Role, { label: string; href: string }[]> = {
  admin: [], // admin uses adminNavSections
  employer: [
    { label: "Dashboard", href: ROUTES.employer.dashboard },
    { label: "People", href: ROUTES.employer.people },
    { label: "Payroll", href: ROUTES.employer.payroll },
    { label: "Payments", href: ROUTES.employer.payments },
    { label: "Bulk Payouts", href: ROUTES.employer.bulkPayouts },
    { label: "Transfers", href: ROUTES.employer.transfers },
    { label: "Reports", href: ROUTES.employer.reports },
    { label: "Settings", href: ROUTES.employer.settings },
  ],
  employee: [
    { label: "Dashboard", href: ROUTES.employee.dashboard },
    { label: "Leave", href: ROUTES.employee.leave },
    { label: "Reports", href: ROUTES.employee.reports },
    { label: "Settings", href: ROUTES.employee.settings },
  ],
};

const loginUrls: Record<Role, string> = {
  admin: "/admin/login",
  employer: "/user/login",
  employee: "/employee/login",
};

const cookieNames: Record<Role, string> = {
  admin: "admin-auth",
  employer: "employer-auth",
  employee: "employee-auth",
};

interface SidebarProps {
  role: Role;
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [managementOpen, setManagementOpen] = useState(true);
  const [administrationOpen, setAdministrationOpen] = useState(true);
  const adminStore = useAdminAuthStore();
  const employerStore = useEmployerAuthStore();
  const employeeStore = useEmployeeAuthStore();
  const storeMap = { admin: adminStore, employer: employerStore, employee: employeeStore };
  const store = storeMap[role];

  function handleLogout() {
    store.clearAuth();
    document.cookie = `${cookieNames[role]}=; path=/; max-age=0`;
    router.push(loginUrls[role]);
  }

  const isAdmin = role === "admin";
  const sectionOpen = { Management: managementOpen, Administration: administrationOpen };
  const setSectionOpen = (title: string, open: boolean) => {
    if (title === "Management") setManagementOpen(open);
    else setAdministrationOpen(open);
  };

  return (
    <aside
      className="flex h-full min-h-screen flex-shrink-0 flex-col border-r border-[#DFDFDF] bg-[#FFFFFF] opacity-100"
    >
      {/* Logo */}
      <div className="flex flex-col px-6 pt-6 pb-4">
        <Link
          href={isAdmin ? ROUTES.admin.dashboard : role === "employer" ? ROUTES.employer.dashboard : ROUTES.employee.dashboard}
          className="focus:outline-none"
        >
          <span className="text-xl font-bold text-blue-600">KaLoPay</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-hidden px-3 py-4">
        {isAdmin ? (
          <ul className="space-y-5">
            {adminNavSections.map((section) => {
              const isOpen = sectionOpen[section.title as keyof typeof sectionOpen];
              const SectionIcon = section.SectionIcon;
              const hasActive = section.items.some((i) => pathname === i.href);
              return (
                <li key={section.title}>
                  <button
                    type="button"
                    onClick={() => setSectionOpen(section.title, !isOpen)}
                    className="flex w-full items-center justify-between gap-2 rounded-lg pl-2 pr-3 py-2.5 text-left transition-colors hover:bg-gray-100"
                  >
                    <span
                      className="flex items-center gap-2"
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 500,
                        fontStyle: "normal",
                        fontSize: "13.6px",
                        lineHeight: "24px",
                        letterSpacing: "0%",
                        textAlign: "center",
                        verticalAlign: "middle",
                        // @ts-expect-error leading-trim is draft CSS
                        leadingTrim: "none",
                      }}
                    >
                      <SectionIcon active={hasActive} color={section.iconColor} />
                      <span className="sidebar-nav-section-label">{section.title}</span>
                    </span>
                    <IconChevronDown open={isOpen} />
                  </button>
                  {isOpen && (
                    <ul className="mt-1.5 space-y-1 pl-4">
                      {section.items.map((item) => {
                        const active =
                          pathname === item.href ||
                          (item.href.length > 1 && pathname.startsWith(item.href));
                        const ItemIcon = item.Icon;
                        return (
                          <li key={`${section.title}-${item.label}`}>
                            <Link
                              href={item.href}
                              className={cn(
                                "flex items-center gap-2 rounded-lg px-3 py-2 transition-colors",
                                "font-normal text-[11.9px] leading-5",
                                active
                                  ? "bg-[#DEEEFF] text-[#0F4FDB] hover:bg-[#D0E4FF]"
                                  : "text-[#4B5563] hover:bg-gray-100 hover:text-gray-900"
                              )}
                              style={{
                                fontFamily: "Inter, sans-serif",
                                fontStyle: "normal",
                                letterSpacing: "0%",
                                textAlign: "center",
                                verticalAlign: "middle",
                                // @ts-expect-error leading-trim is draft CSS
                                leadingTrim: "none",
                              }}
                            >
                              <ItemIcon active={active} />
                              {item.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <ul className="space-y-1">
            {navItems[role].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-3 pt-1">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          <svg className="h-5 w-5 shrink-0 text-[#0F4FDB]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
}