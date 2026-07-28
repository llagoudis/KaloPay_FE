"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";
import {
  useEmployerProfile,
  useUpdateProfile,
  useChangePassword,
} from "@/hooks/employer/useUserPanel";
import { useEmployerAuthStore } from "@/store/employerAuthStore";
import { getNotifPrefs, putNotifPrefs } from "@/lib/api/employer/appFeatures";

const EMPLOYER_NOTIF_PATH = "/employer/settings/notifications";

const inputClass =
  "settings-input w-full rounded-lg border border-[var(--color-dash-icon-bg)] bg-[var(--color-dash-icon-bg)] px-3 py-2 text-sm text-dash-primary placeholder:text-dash-secondary focus:border-[var(--color-dash-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-dash-accent)]";
const labelClass = "settings-label mb-1.5 block text-sm font-medium text-dash-secondary";

export default function EmployerSettingsPage() {
  const { data, isLoading } = useEmployerProfile();
  const updateMutation = useUpdateProfile();
  const passwordMutation = useChangePassword();

  const [profile, setProfile] = useState({ name: "", companyName: "", companyEmail: "", companyPhone: "" });
  const [profileMsg, setProfileMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [security, setSecurity] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordMsg, setPasswordMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const NOTIFICATIONS_STORAGE_KEY = "kp_employer_notifications";
  const defaultNotifications = { payrollReminders: true, paymentAlerts: true, weeklyReport: false };
  const [notifications, setNotifications] = useState(defaultNotifications);
  const [notificationsMsg, setNotificationsMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const notifToken = useEmployerAuthStore((s) => s.token);

  // Load persisted notifications: local cache first, then the server.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") setNotifications((n) => ({ ...n, ...parsed }));
      }
    } catch {
      /* ignore corrupt storage */
    }
    if (!notifToken) return;
    let alive = true;
    getNotifPrefs(EMPLOYER_NOTIF_PATH, notifToken)
      .then((res) => {
        const d = res?.data as Partial<typeof defaultNotifications> | null;
        if (alive && d && typeof d === "object") setNotifications((n) => ({ ...n, ...d }));
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [notifToken]);

  useEffect(() => {
    if (data?.profile) {
      setProfile({
        name: data.profile.name ?? "",
        companyName: data.profile.companyName ?? "",
        companyEmail: data.profile.companyEmail ?? "",
        companyPhone: data.profile.companyPhone ?? "",
      });
    }
  }, [data]);

  function updateProfile(field: keyof typeof profile, value: string) {
    setProfile((p) => ({ ...p, [field]: value }));
  }
  function updateSecurity(field: keyof typeof security, value: string) {
    setSecurity((s) => ({ ...s, [field]: value }));
  }
  function toggleNotification(key: keyof typeof notifications) {
    setNotifications((n) => ({ ...n, [key]: !n[key] }));
    setNotificationsMsg(null);
  }

  async function handleSaveNotifications() {
    setNotificationsMsg(null);
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
      if (notifToken) await putNotifPrefs(EMPLOYER_NOTIF_PATH, notifToken, notifications);
      setNotificationsMsg({ type: "ok", text: "Saved" });
    } catch (e) {
      setNotificationsMsg({ type: "err", text: (e as Error).message ?? "Save failed" });
    }
  }

  async function handleSaveProfile() {
    setProfileMsg(null);
    try {
      await updateMutation.mutateAsync({
        name: profile.name,
        companyName: profile.companyName,
        companyEmail: profile.companyEmail,
        companyPhone: profile.companyPhone,
      });
      setProfileMsg({ type: "ok", text: "Saved" });
    } catch (e) {
      setProfileMsg({ type: "err", text: (e as Error).message ?? "Save failed" });
    }
  }

  async function handleSavePassword() {
    setPasswordMsg(null);
    if (security.newPassword !== security.confirmPassword) {
      setPasswordMsg({ type: "err", text: "Passwords do not match" });
      return;
    }
    if (security.newPassword.length < 6) {
      setPasswordMsg({ type: "err", text: "Password must be at least 6 characters" });
      return;
    }
    try {
      await passwordMutation.mutateAsync({
        currentPassword: security.currentPassword,
        newPassword: security.newPassword,
      });
      setSecurity({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordMsg({ type: "ok", text: "Password updated" });
    } catch (e) {
      setPasswordMsg({ type: "err", text: (e as Error).message ?? "Update failed" });
    }
  }

  return (
    <div className="min-h-full w-full bg-dash-page" data-dashboard-theme data-page="settings">
      <div className="dash-shell pb-8 pt-8">
        <div className="mx-auto w-full max-w-2xl">
          <div className="settings-header-card mb-6 rounded-xl bg-dash-card px-6 py-5">
            <h1 className="text-2xl font-semibold text-dash-primary">Settings</h1>
            <p className="mt-1 text-sm text-dash-secondary">Manage your account and preferences.</p>
          </div>

          <div className="space-y-6">
            <section className="rounded-xl bg-dash-card p-6">
              <h2 className="dash-card-section-title mb-4">Company &amp; Profile</h2>
              {isLoading ? (
                <p className="text-sm text-dash-secondary">Loading…</p>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Your Name</label>
                    <input type="text" value={profile.name} onChange={(e) => updateProfile("name", e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Company Name</label>
                    <input type="text" value={profile.companyName} onChange={(e) => updateProfile("companyName", e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Company Email</label>
                    <input type="email" value={profile.companyEmail} onChange={(e) => updateProfile("companyEmail", e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Company Phone</label>
                    <input type="tel" value={profile.companyPhone} onChange={(e) => updateProfile("companyPhone", e.target.value)} className={inputClass} />
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      disabled={updateMutation.isPending}
                      className="rounded-lg bg-[var(--color-dash-accent)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                    >
                      {updateMutation.isPending ? "Saving…" : "Save changes"}
                    </button>
                    {profileMsg && (
                      <span className={cn("text-sm", profileMsg.type === "ok" ? "text-green-500" : "text-red-500")}>
                        {profileMsg.text}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-xl bg-dash-card p-6">
              <h2 className="dash-card-section-title mb-4">Change Password</h2>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Current password</label>
                  <input type="password" value={security.currentPassword} onChange={(e) => updateSecurity("currentPassword", e.target.value)} placeholder="••••••••" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>New password</label>
                  <input type="password" value={security.newPassword} onChange={(e) => updateSecurity("newPassword", e.target.value)} placeholder="••••••••" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Confirm new password</label>
                  <input type="password" value={security.confirmPassword} onChange={(e) => updateSecurity("confirmPassword", e.target.value)} placeholder="••••••••" className={inputClass} />
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleSavePassword}
                    disabled={passwordMutation.isPending || !security.currentPassword || !security.newPassword}
                    className="rounded-lg bg-[var(--color-dash-accent)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                  >
                    {passwordMutation.isPending ? "Updating…" : "Update password"}
                  </button>
                  {passwordMsg && (
                    <span className={cn("text-sm", passwordMsg.type === "ok" ? "text-green-500" : "text-red-500")}>
                      {passwordMsg.text}
                    </span>
                  )}
                </div>
              </div>
            </section>

            <section className="rounded-xl bg-dash-card p-6">
              <h2 className="dash-card-section-title mb-4">Notifications</h2>
              <div className="space-y-4">
                {[
                  { key: "payrollReminders" as const, label: "Payroll reminders" },
                  { key: "paymentAlerts" as const, label: "Payment alerts" },
                  { key: "weeklyReport" as const, label: "Weekly summary report" },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="notifications-label text-sm text-dash-primary">{label}</span>
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
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleSaveNotifications}
                    className="rounded-lg bg-[var(--color-dash-accent)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                  >
                    Save
                  </button>
                  {notificationsMsg && (
                    <span className={cn("text-sm", notificationsMsg.type === "ok" ? "text-green-500" : "text-red-500")}>
                      {notificationsMsg.text}
                    </span>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
