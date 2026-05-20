"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { useAdminAuthStore } from "@/store/adminAuthStore";

interface AdminProfile {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  two_factor_enabled?: boolean;
  is_email_verified?: boolean;
  created_at?: string;
}

function useAdminToken() {
  return useAdminAuthStore((s) => s.token);
}

function useAdminProfile() {
  const token = useAdminToken();
  return useQuery({
    queryKey: ["admin", "settings", "profile"],
    queryFn: () => apiClient<{ profile: AdminProfile }>("/admin/settings/profile", { token: token! }),
    enabled: !!token,
  });
}

function useUpdateAdminProfile() {
  const token = useAdminToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name?: string; email?: string; avatar?: string }) =>
      apiClient<{ profile: AdminProfile }>("/admin/settings/profile", {
        method: "PUT",
        token: token!,
        body: data,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "settings", "profile"] });
    },
  });
}

function useChangeAdminPassword() {
  const token = useAdminToken();
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      apiClient<{ message: string }>("/admin/settings/password", {
        method: "PUT",
        token: token!,
        body: data,
      }),
  });
}

const INPUT_CLASS =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      {children}
    </label>
  );
}

export default function AdminSettingsPage() {
  const { data, isLoading } = useAdminProfile();
  const updateMut = useUpdateAdminProfile();
  const passwordMut = useChangeAdminPassword();
  const profile = data?.profile;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [profileErr, setProfileErr] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    setName(profile.name ?? "");
    setEmail(profile.email ?? "");
  }, [profile]);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);
  const [passwordErr, setPasswordErr] = useState<string | null>(null);

  const saveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProfileErr(null);
    setProfileMsg(null);
    try {
      await updateMut.mutateAsync({ name, email });
      setProfileMsg("Profile saved.");
      setTimeout(() => setProfileMsg(null), 3000);
    } catch (err) {
      setProfileErr((err as Error).message);
    }
  };

  const changePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordErr(null);
    setPasswordMsg(null);
    if (!currentPassword || !newPassword) {
      setPasswordErr("Both password fields are required.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordErr("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordErr("New password and confirmation do not match.");
      return;
    }
    try {
      await passwordMut.mutateAsync({ currentPassword, newPassword });
      setPasswordMsg("Password updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordMsg(null), 3000);
    } catch (err) {
      setPasswordErr((err as Error).message);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="w-full rounded-[10px] bg-white p-6">
        <h1
          className="admin-page-heading font-semibold"
          style={{
            fontFamily: "var(--font-poppins), Poppins, sans-serif",
            fontWeight: 600,
            fontSize: "24px",
            color: "#0E1620",
          }}
        >
          Admin Settings
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your administrator profile and password.
        </p>
      </div>

      <form
        onSubmit={saveProfile}
        className="space-y-4 rounded-xl bg-white p-6 shadow-sm"
      >
        <h2 className="text-base font-semibold text-gray-900">Profile</h2>
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading profile…</p>
        ) : null}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Name">
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={INPUT_CLASS} />
          </Field>
          <Field label="Email">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={INPUT_CLASS} />
          </Field>
        </div>
        {profileErr ? (
          <div className="rounded-md bg-red-50 p-2 text-sm text-red-700">{profileErr}</div>
        ) : null}
        {profileMsg ? (
          <div className="rounded-md bg-green-50 p-2 text-sm text-green-700">{profileMsg}</div>
        ) : null}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={updateMut.isPending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {updateMut.isPending ? "Saving…" : "Save Profile"}
          </button>
        </div>
      </form>

      <form
        onSubmit={changePassword}
        className="space-y-4 rounded-xl bg-white p-6 shadow-sm"
      >
        <h2 className="text-base font-semibold text-gray-900">Change Password</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Current password">
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={INPUT_CLASS}
              autoComplete="current-password"
            />
          </Field>
          <Field label="New password">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={INPUT_CLASS}
              autoComplete="new-password"
            />
          </Field>
          <Field label="Confirm new password">
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={INPUT_CLASS}
              autoComplete="new-password"
            />
          </Field>
        </div>
        {passwordErr ? (
          <div className="rounded-md bg-red-50 p-2 text-sm text-red-700">{passwordErr}</div>
        ) : null}
        {passwordMsg ? (
          <div className="rounded-md bg-green-50 p-2 text-sm text-green-700">{passwordMsg}</div>
        ) : null}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={passwordMut.isPending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {passwordMut.isPending ? "Updating…" : "Update Password"}
          </button>
        </div>
      </form>
    </div>
  );
}
