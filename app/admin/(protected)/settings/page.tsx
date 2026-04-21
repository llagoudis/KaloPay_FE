"use client";

import { useState, useEffect, useCallback } from "react";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import {
  getProfile,
  updateProfile,
  changePassword,
  toggle2FA,
  type AdminProfile,
} from "@/lib/api/admin/settings";

export default function AdminSettingsPage() {
  const token = useAdminAuthStore((s) => s.token);
  const setAuth = useAdminAuthStore((s) => s.setAuth);
  const user = useAdminAuthStore((s) => s.user);

  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);

  const [toggling2FA, setToggling2FA] = useState(false);
  const [twoFAMsg, setTwoFAMsg] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await getProfile(token);
      setProfile(res.profile);
      setName(res.profile.name ?? "");
      setEmail(res.profile.email ?? "");
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || savingProfile) return;
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      const res = await updateProfile(token, { name, email });
      setProfile(res.profile);
      // Sync the auth store so the header/sidebar reflect new info
      if (user) {
        setAuth({ ...user, name: res.profile.name, email: res.profile.email }, token);
      }
      setProfileMsg("Profile updated successfully.");
    } catch (err) {
      setProfileMsg(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || savingPassword) return;
    if (newPassword.length < 8) {
      setPasswordMsg("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg("New passwords do not match");
      return;
    }
    setSavingPassword(true);
    setPasswordMsg(null);
    try {
      await changePassword(token, { currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMsg("Password changed successfully.");
    } catch (err) {
      setPasswordMsg(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleToggle2FA = async () => {
    if (!token || !profile || toggling2FA) return;
    setToggling2FA(true);
    setTwoFAMsg(null);
    try {
      const res = await toggle2FA(token, !profile.two_factor_enabled);
      setProfile({ ...profile, two_factor_enabled: res.twoFactorEnabled });
      setTwoFAMsg(`Two-factor auth ${res.twoFactorEnabled ? "enabled" : "disabled"}.`);
    } catch (err) {
      setTwoFAMsg(err instanceof Error ? err.message : "Failed to toggle 2FA");
    } finally {
      setToggling2FA(false);
    }
  };

  const inputClass = "h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";
  const labelClass = "mb-1 block text-sm font-medium text-gray-700";
  const cardClass = "admin-page-panel w-full rounded-[10px] bg-white p-6";
  const sectionTitle = "mb-4 text-lg font-semibold text-gray-900";

  return (
    <div className="w-full space-y-6">
      <div className="admin-page-title-strip w-full rounded-[10px] bg-white" style={{ padding: "24px" }}>
        <h1
          className="admin-page-heading align-middle font-semibold"
          style={{
            fontFamily: "var(--font-poppins), Poppins, sans-serif",
            fontWeight: 600,
            fontSize: "24px",
            lineHeight: "26px",
            letterSpacing: "0px",
            color: "#0E1620",
          }}
        >
          Settings
        </h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Profile */}
          <form onSubmit={handleSaveProfile} className={cardClass}>
            <h2 className={sectionTitle}>Profile</h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              {profileMsg && (
                <p className={`text-sm ${profileMsg.includes("success") ? "text-green-600" : "text-red-600"}`}>
                  {profileMsg}
                </p>
              )}
              <button
                type="submit"
                disabled={savingProfile}
                className="rounded-lg bg-[#0F50DB] px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#0D46C3] disabled:opacity-50"
              >
                {savingProfile ? "Saving..." : "Save profile"}
              </button>
            </div>
          </form>

          {/* Two-Factor */}
          <div className={cardClass}>
            <h2 className={sectionTitle}>Two-Factor Authentication</h2>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Status:{" "}
                <span className={`font-semibold ${profile?.two_factor_enabled ? "text-green-600" : "text-gray-700"}`}>
                  {profile?.two_factor_enabled ? "Enabled" : "Disabled"}
                </span>
              </p>
              <p className="text-sm text-gray-500">
                When enabled, you&apos;ll be asked for a verification code in addition to your password at login.
              </p>
              {twoFAMsg && (
                <p className={`text-sm ${twoFAMsg.includes("Failed") ? "text-red-600" : "text-green-600"}`}>
                  {twoFAMsg}
                </p>
              )}
              <button
                type="button"
                onClick={handleToggle2FA}
                disabled={toggling2FA}
                className={`rounded-lg px-5 py-2 text-sm font-medium text-white shadow-sm disabled:opacity-50 ${
                  profile?.two_factor_enabled
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-[#0F50DB] hover:bg-[#0D46C3]"
                }`}
              >
                {toggling2FA
                  ? "Updating..."
                  : profile?.two_factor_enabled
                  ? "Disable 2FA"
                  : "Enable 2FA"}
              </button>
            </div>
          </div>

          {/* Change Password */}
          <form onSubmit={handleChangePassword} className={`${cardClass} lg:col-span-2`}>
            <h2 className={sectionTitle}>Change Password</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className={labelClass}>Current password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={inputClass}
                  autoComplete="current-password"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>New password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={inputClass}
                  autoComplete="new-password"
                  required
                  minLength={8}
                />
              </div>
              <div>
                <label className={labelClass}>Confirm new password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClass}
                  autoComplete="new-password"
                  required
                  minLength={8}
                />
              </div>
            </div>
            {passwordMsg && (
              <p className={`mt-3 text-sm ${passwordMsg.includes("success") ? "text-green-600" : "text-red-600"}`}>
                {passwordMsg}
              </p>
            )}
            <div className="mt-4">
              <button
                type="submit"
                disabled={savingPassword}
                className="rounded-lg bg-[#0F50DB] px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#0D46C3] disabled:opacity-50"
              >
                {savingPassword ? "Saving..." : "Change password"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
