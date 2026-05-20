"use client";

import Link from "next/link";
import { useEmployeeAuthStore } from "@/store/employeeAuthStore";

export default function EmployeeDashboardPage() {
  const user = useEmployeeAuthStore((s) => s.user);

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-slate-900">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">
          Welcome{user?.name ? `, ${user.name.split(" ")[0]}` : ""} 👋
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          Here&apos;s your KaloPay employee portal.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ProfileCard user={user} />
        <ActionCard
          title="Apply for Leave"
          description="Submit a new time-off request to your employer."
          href="/employee/leave"
          icon="calendar"
        />
        <ActionCard
          title="My Payslips"
          description="Download or view your monthly pay statements."
          href="/employee/reports"
          icon="document"
        />
        <ActionCard
          title="Account Settings"
          description="Update your personal info and password."
          href="/employee/settings"
          icon="settings"
        />
        <ActionCard
          title="Leave Calendar"
          description="See approved time-off on a calendar view."
          href="/employee/leave/calendar"
          icon="calendar"
        />
        <ActionCard
          title="Need help?"
          description="Contact your employer or HR for any payroll questions."
          href="/employee/settings"
          icon="help"
        />
      </div>
    </div>
  );
}

function ProfileCard({ user }: { user: ReturnType<typeof useEmployeeAuthStore.getState>["user"] }) {
  if (!user) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-slate-900">
        <p className="text-sm text-gray-500 dark:text-slate-400">Loading profile…</p>
      </div>
    );
  }
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg font-semibold text-blue-700">
          {(user.name ?? "?")
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")}
        </div>
        <div>
          <p className="text-base font-semibold text-gray-900 dark:text-slate-100">{user.name}</p>
          <p className="text-sm text-gray-500 dark:text-slate-400">{user.email}</p>
        </div>
      </div>
      <dl className="mt-4 space-y-2 text-sm">
        <Row label="Role" value={user.role} />
      </dl>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-gray-500 dark:text-slate-400">{label}</dt>
      <dd className="font-medium text-gray-900 dark:text-slate-100">{value ?? "—"}</dd>
    </div>
  );
}

function ActionCard({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: "calendar" | "document" | "settings" | "help";
}) {
  return (
    <Link
      href={href}
      className="block rounded-xl bg-white p-6 shadow-sm transition hover:shadow-md dark:bg-slate-900 dark:hover:bg-slate-800"
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
        <Icon name={icon} />
      </div>
      <p className="text-base font-semibold text-gray-900 dark:text-slate-100">{title}</p>
      <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">{description}</p>
    </Link>
  );
}

function Icon({ name }: { name: "calendar" | "document" | "settings" | "help" }) {
  const paths: Record<typeof name, React.ReactNode> = {
    calendar: (
      <>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </>
    ),
    document: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </>
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </>
    ),
  };
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}
