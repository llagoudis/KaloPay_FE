"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";

const inputClass =
  "w-full rounded-lg border border-[var(--color-dash-icon-bg)] bg-[#0D1117] px-3 py-2 text-sm text-white placeholder:text-dash-secondary focus:border-[var(--color-dash-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-dash-accent)]";
const labelClass = "mb-1.5 block text-sm font-medium text-dash-secondary";

/** Settings page – Figma Payroll (node 337-4806). Dashboard design system. */
export default function EmployerSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    companyName: "Acme Corp",
    email: "admin@acme.com",
    phone: "+1 555 0100",
  });
  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [notifications, setNotifications] = useState({
    payrollReminders: true,
    paymentAlerts: true,
    weeklyReport: false,
  });

  function updateProfile(field: string, value: string) {
    setProfile((p) => ({ ...p, [field]: value }));
  }
  function updateSecurity(field: string, value: string) {
    setSecurity((s) => ({ ...s, [field]: value }));
  }
  function toggleNotification(key: keyof typeof notifications) {
    setNotifications((n) => ({ ...n, [key]: !n[key] }));
  }

  async function handleSaveProfile() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
  }
  async function handleSavePassword() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSecurity({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setSaving(false);
  }

  return (
    <div className="min-h-full w-full bg-dash-page" data-dashboard-theme>
      <div className="dash-shell pb-8 pt-8">
        <div className="mx-auto w-full max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white">Settings</h1>
          <p className="mt-1 text-sm text-dash-secondary">
            Manage your account and preferences.
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile / Company */}
          <section className="rounded-xl bg-dash-card p-6">
            <h2 className="dash-card-section-title dash-card-section-title--inverse mb-4">Company &amp; Profile</h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Company Name</label>
                <input
                  type="text"
                  value={profile.companyName}
                  onChange={(e) => updateProfile("companyName", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => updateProfile("email", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => updateProfile("phone", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="rounded-lg bg-[var(--color-dash-accent)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </div>
            </div>
          </section>

          {/* Security */}
          <section className="rounded-xl bg-dash-card p-6">
            <h2 className="dash-card-section-title dash-card-section-title--inverse mb-4">Change Password</h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Current password</label>
                <input
                  type="password"
                  value={security.currentPassword}
                  onChange={(e) => updateSecurity("currentPassword", e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>New password</label>
                <input
                  type="password"
                  value={security.newPassword}
                  onChange={(e) => updateSecurity("newPassword", e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Confirm new password</label>
                <input
                  type="password"
                  value={security.confirmPassword}
                  onChange={(e) => updateSecurity("confirmPassword", e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSavePassword}
                  disabled={saving}
                  className="rounded-lg bg-[var(--color-dash-accent)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? "Updating…" : "Update password"}
                </button>
              </div>
            </div>
          </section>

          {/* Notifications */}
          <section className="rounded-xl bg-dash-card p-6">
            <h2 className="dash-card-section-title dash-card-section-title--inverse mb-4">Notifications</h2>
            <div className="space-y-4">
              {[
                { key: "payrollReminders" as const, label: "Payroll reminders" },
                { key: "paymentAlerts" as const, label: "Payment alerts" },
                { key: "weeklyReport" as const, label: "Weekly summary report" },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-white">{label}</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notifications[key]}
                    onClick={() => toggleNotification(key)}
                    className={cn(
                      "relative h-6 w-11 rounded-full transition-colors",
                      notifications[key] ? "bg-[var(--color-dash-accent)]" : "bg-[var(--color-dash-icon-bg)]"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-1 h-4 w-4 rounded-full bg-white transition-transform",
                        notifications[key] ? "left-6" : "left-1"
                      )}
                    />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
        </div>
        </div>
    </div>
  );
}
