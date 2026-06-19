"use client";

import { useEffect, useState } from "react";
import {
  useChangeMyPassword,
  useMyProfile,
  useUpdateMyProfile,
} from "@/hooks/employee/useEmployeeData";

const INPUT =
  "w-full h-[46px] rounded-lg border border-gray-300 bg-white px-3.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#0F50DB] focus:outline-none focus:ring-1 focus:ring-[#0F50DB] disabled:bg-gray-50 disabled:opacity-70";

function PasswordField({
  label, required, placeholder, readOnly, value, onChange,
}: {
  label: string; required?: boolean; placeholder?: string;
  readOnly?: boolean; value: string; onChange?: (v: string) => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}{required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      <div className="relative flex items-center">
        <input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          readOnly={readOnly}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className={`${INPUT} pr-12 ${readOnly ? "bg-gray-50 opacity-70" : ""}`}
        />
        {!readOnly && (
          <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide" : "Show"}
            className="absolute right-2 inline-flex h-8 w-9 items-center justify-center rounded-md bg-gray-100 text-gray-500 hover:bg-gray-200">
            {show ? (
              <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            ) : (
              <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            )}
          </button>
        )}
      </div>
    </div>
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

  const initials = profile?.name
    ? profile.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  const saveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProfileErr(null); setProfileMsg(null);
    try {
      await updateMut.mutateAsync({ name, phone, city, country, iban, bankName });
      setProfileMsg("Profile saved.");
      setTimeout(() => setProfileMsg(null), 3000);
    } catch (err) { setProfileErr((err as Error).message); }
  };

  const changePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordErr(null); setPasswordMsg(null);
    if (!currentPassword || !newPassword) { setPasswordErr("Both password fields are required."); return; }
    if (newPassword.length < 8) { setPasswordErr("New password must be at least 8 characters."); return; }
    if (newPassword !== confirmPassword) { setPasswordErr("New password and confirmation do not match."); return; }
    try {
      await passwordMut.mutateAsync({ currentPassword, newPassword });
      setPasswordMsg("Password updated.");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      setTimeout(() => setPasswordMsg(null), 3000);
    } catch (err) { setPasswordErr((err as Error).message); }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Heading */}
      <div className="rounded-xl border border-gray-200 bg-white px-7 py-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">Account Settings</h1>
        <p className="mt-1.5 text-sm text-gray-500">Manage your personal details and account security.</p>
      </div>

      {/* Personal Details */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-2.5 border-b border-gray-200 px-7 py-[22px]">
          <svg className="text-gray-400" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <h2 className="text-[18px] font-semibold text-gray-900">Personal Details</h2>
        </div>

        <form onSubmit={saveProfile} className="px-7 py-6">
          {/* Identity row */}
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#dbeafe] text-xl font-semibold text-[#0F50DB]">
              {initials}
            </div>
            <div>
              <p className="text-[18px] font-semibold text-gray-900">{profile?.name ?? "—"}</p>
              <p className="mb-2 text-sm text-gray-500">{profile?.jobTitle ?? "—"} · {profile?.department ?? "—"}</p>
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">KYC Approved</span>
            </div>
          </div>

          <p className="mb-3.5 text-[13px] text-gray-500"><span className="text-red-500">*</span> Required</p>
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Full name <span className="text-red-500">*</span></label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className={INPUT} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Employee email <span className="text-red-500">*</span></label>
              <input type="email" value={profile?.email ?? ""} disabled className={INPUT} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Phone</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={INPUT} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Country</label>
              <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className={INPUT} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">City</label>
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className={INPUT} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Bank name</label>
              <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} className={INPUT} />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">IBAN</label>
              <input type="text" value={iban} onChange={(e) => setIban(e.target.value)} className={INPUT} />
            </div>
          </div>

          {profileErr && <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{profileErr}</div>}
          {profileMsg && <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{profileMsg}</div>}

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-200 pt-5">
            <button type="button" className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={updateMut.isPending}
              className="rounded-lg bg-[#0F50DB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0D46C3] disabled:opacity-60">
              {updateMut.isPending ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </section>

      {/* Change Password */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-2.5 border-b border-gray-200 px-7 py-[22px]">
          <svg className="text-gray-400" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <h2 className="text-[18px] font-semibold text-gray-900">Change Password</h2>
        </div>

        <form onSubmit={changePassword} className="px-7 py-6">
          <p className="mb-5 text-sm text-gray-500">
            To ensure the security of your account, please create a strong, unique password that is easy for you to remember.
          </p>

          <div className="grid grid-cols-1 gap-x-7 gap-y-5 sm:grid-cols-2">
            <PasswordField label="Username" readOnly value={profile?.email ?? ""} />
            <PasswordField label="Current Password" required placeholder="Enter Current Password" value={currentPassword} onChange={setCurrentPassword} />
            <PasswordField label="New Password" required placeholder="Enter New Password" value={newPassword} onChange={setNewPassword} />
            <PasswordField label="Confirm New Password" required placeholder="Confirm New Password" value={confirmPassword} onChange={setConfirmPassword} />
          </div>

          <p className="mt-4 max-w-lg text-[13px] text-gray-400">
            For a strong password, please use a hard to guess combination of text with upper and lower case characters, symbols and numbers.
          </p>

          {passwordErr && <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{passwordErr}</div>}
          {passwordMsg && <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{passwordMsg}</div>}

          <div className="mt-6 flex items-center justify-between gap-4 border-t border-gray-200 pt-5">
            <span className="text-[13px] text-gray-400"><span className="text-red-500">*</span> Required</span>
            <div className="flex gap-3">
              <button type="button" className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={passwordMut.isPending}
                className="rounded-lg bg-[#0F50DB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0D46C3] disabled:opacity-60">
                {passwordMut.isPending ? "Updating…" : "Save"}
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
