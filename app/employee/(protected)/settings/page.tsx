"use client";

import { useState } from "react";
import { useEmployeeAuthStore } from "@/store/employeeAuthStore";

export default function EmployeeSettingsPage() {
  const user = useEmployeeAuthStore((s) => s.user);
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);
  const [passwordErr, setPasswordErr] = useState<string | null>(null);

  const saveProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSavedMsg("Profile saved locally. Sync to backend will be enabled in the next release.");
    setTimeout(() => setSavedMsg(null), 4000);
  };

  const changePassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordErr(null);
    setPasswordMsg(null);
    if (!currentPassword || !newPassword) {
      setPasswordErr("Please fill both password fields.");
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
    setPasswordMsg("Password update flow ready — backend hook will be wired in the next release.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setPasswordMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-slate-900">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">Account Settings</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          Update your personal info and password.
        </p>
      </div>

      <form
        onSubmit={saveProfile}
        className="space-y-4 rounded-xl bg-white p-6 shadow-sm dark:bg-slate-900"
      >
        <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">Profile</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full name">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={INPUT_CLASS}
            />
          </Field>
        </div>
        {savedMsg ? (
          <div className="rounded-md bg-green-50 p-2 text-sm text-green-700 dark:bg-green-900/40 dark:text-green-200">
            {savedMsg}
          </div>
        ) : null}
        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Save Profile
          </button>
        </div>
      </form>

      <form
        onSubmit={changePassword}
        className="space-y-4 rounded-xl bg-white p-6 shadow-sm dark:bg-slate-900"
      >
        <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">Change Password</h2>
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
          <div className="rounded-md bg-red-50 p-2 text-sm text-red-700 dark:bg-red-900/40 dark:text-red-200">
            {passwordErr}
          </div>
        ) : null}
        {passwordMsg ? (
          <div className="rounded-md bg-green-50 p-2 text-sm text-green-700 dark:bg-green-900/40 dark:text-green-200">
            {passwordMsg}
          </div>
        ) : null}
        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Update Password
          </button>
        </div>
      </form>
    </div>
  );
}

const INPUT_CLASS =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
        {label}
      </span>
      {children}
    </label>
  );
}
