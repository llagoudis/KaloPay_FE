"use client";

import Link from "next/link";
import { useMyProfile } from "@/hooks/employee/useEmployeeData";

const ACTIONS = [
  { title: "Apply for Leave", desc: "Submit a new time-off request to your employer.", icon: "calendar", href: "/employee/leave" },
  { title: "Reports", desc: "Download or view your monthly payslips and tax documents.", icon: "doc", href: "/employee/reports" },
  { title: "Account Settings", desc: "Update your personal info and password.", icon: "gear", href: "/employee/settings" },
  { title: "Leave Calendar", desc: "See approved time-off on a calendar view.", icon: "calendar", href: "/employee/leave/calendar" },
  { title: "Need help?", desc: "Contact your employer or HR for any payroll questions.", icon: "help", href: "/employee/settings" },
];

export default function EmployeeDashboardPage() {
  const { data: profileData } = useMyProfile();
  const profile = profileData?.profile;

  const initials = profile?.name
    ? profile.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  const firstName = profile?.name?.split(" ")[0] ?? "there";

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">Welcome, {firstName} 👋</h1>
        <p className="mt-1.5 text-sm text-gray-500">Here&apos;s your KaloPay employee portal.</p>
      </div>

      {/* 3-col grid: profile card + 5 action tiles */}
      <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
        {/* Profile card */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#dbeafe] text-base font-semibold text-[#0F50DB]">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-gray-900">{profile?.name ?? "—"}</p>
              <p className="truncate text-sm text-gray-500">{profile?.email ?? "—"}</p>
            </div>
          </div>
          <dl className="mt-5 flex flex-col gap-2.5 text-sm">
            <ProfileRow label="Role" value="Employee" />
            <ProfileRow label="Department" value={profile?.department ?? "—"} />
            <ProfileRow
              label="KYC"
              value={
                <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                  Approved
                </span>
              }
            />
          </dl>
        </div>

        {/* Action tiles */}
        {ACTIONS.map((a) => (
          <Link
            key={a.title}
            href={a.href}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#EEF2FF] text-[#0F50DB]">
              <ActionIcon name={a.icon} />
            </span>
            <p className="text-base font-semibold text-gray-900">{a.title}</p>
            <p className="mt-1 text-sm text-gray-500">{a.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-medium text-gray-900">{value}</dd>
    </div>
  );
}

function ActionIcon({ name }: { name: string }) {
  if (name === "calendar")
    return (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    );
  if (name === "doc")
    return (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
      </svg>
    );
  if (name === "gear")
    return (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    );
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
