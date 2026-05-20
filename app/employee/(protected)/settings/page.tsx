"use client";

import { useEffect, useState } from "react";
import {
  useChangeMyPassword,
  useMyProfile,
  useUpdateMyProfile,
} from "@/hooks/employee/useEmployeeData";

const INPUT_CLASS =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">{label}</span>
      {children}
    </label>
  );
}

export default function EmployeeSettingsPage() {
  const { data: profileData } = useMyProfile();
  const updateMut = useUpdateMyProfile();
  const passwordMut = useChangeMyPassword();
  const profile = profileData?.profile;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [iban, setIban] = useState("");
  const [bankName, setBankName] = useState("");

  useEffect(() => {
    if (!profile) return;
    setName(profile.name ?? "");
    setPhone(profile.phone ?? "");
    setCity(profile.city ?? "");
    setCountry(profile.country ?? "");
    setIban(profile.iban ?? "");
    setBankName(profile.bankName ?? "");
  }, [profile]);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [profileErr, setProfileErr] = useState<string | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);
  const [passwordErr, setPasswordErr] = useState<string | null>(null);

  const saveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProfileErr(null);
    setProfileMsg(null);
    try {
      await updateMut.mutateAsync({ name, phone, city, country, iban, bankName });
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
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-slate-900">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">Account Settings</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          Update your profile and change your password. Changes save to your account immediately.
        </p>
      </div>

      <form
        onSubmit={saveProfile}
        className="space-y-4 rounded-xl bg-white p-6 shadow-sm dark:bg-slate-900"
      >
        <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">Profile</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full name">
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={INPUT_CLASS} />
          </Field>
          <Field label="Email">
            <input type="email" value={profile?.email ?? ""} disabled className={`${INPUT_CLASS} opacity-70`} />
          </Field>
          <Field label="Phone">
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={INPUT_CLASS} />
          </Field>
          <Field label="Country">
            <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className={INPUT_CLASS} />
          </Field>
          <Field label="City">
            <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className={INPUT_CLASS} />
          </Field>
          <Field label="Bank name">
            <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} className={INPUT_CLASS} />
          </Field>
          <Field label="IBAN">
            <input type="text" value={iban} onChange={(e) => setIban(e.target.value)} className={INPUT_CLASS} />
          </Field>
          <Field label="Job title">
            <input type="text" value={profile?.jobTitle ?? ""} disabled className={`${INPUT_CLASS} opacity-70`} />
          </Field>
        </div>
        {profileErr ? (
          <div className="rounded-md bg-red-50 p-2 text-sm text-red-700 dark:bg-red-900/40 dark:text-red-200">{profileErr}</div>
        ) : null}
        {profileMsg ? (
          <div className="rounded-md bg-green-50 p-2 text-sm text-green-700 dark:bg-green-900/40 dark:text-green-200">{profileMsg}</div>
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
          <div className="rounded-md bg-red-50 p-2 text-sm text-red-700 dark:bg-red-900/40 dark:text-red-200">{passwordErr}</div>
        ) : null}
        {passwordMsg ? (
          <div className="rounded-md bg-green-50 p-2 text-sm text-green-700 dark:bg-green-900/40 dark:text-green-200">{passwordMsg}</div>
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
