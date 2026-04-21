"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import OtpInput from "./OtpInput";
import AuthLayout from "./AuthLayout";

interface TwoFactorFormProps {
  role: "admin" | "employer" | "employee";
  onVerify: (code: string) => Promise<{ user: unknown; token: string }>;
  onSetAuth: (user: never, token: string) => void;
  dashboardUrl: string;
  loginUrl: string;
}

export default function TwoFactorForm({
  role,
  onVerify,
  onSetAuth,
  dashboardUrl,
  loginUrl,
}: TwoFactorFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async (code: string) => {
    setError("");
    setLoading(true);
    try {
      const res = await onVerify(code);
      onSetAuth(res.user as never, res.token);
      router.push(dashboardUrl);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Invalid authentication code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      role={role}
      title="Two-factor authentication"
      subtitle="Enter the 6-digit code from your authenticator app"
    >
      <div className="space-y-6">
        {/* Decorative icon */}
        <div className="flex justify-center">
          <div className="h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center">
            <svg className="h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 text-center">
            {error}
          </div>
        )}

        <OtpInput onComplete={handleVerify} error={error ? " " : undefined} disabled={loading} />

        {loading && (
          <div className="flex justify-center">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Verifying...
            </div>
          </div>
        )}

        <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
          <div className="flex gap-3">
            <svg className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
            <div className="text-xs text-gray-500 space-y-1">
              <p>Open your authenticator app (Google Authenticator, Authy, etc.) and enter the 6-digit code.</p>
              <p>If you&apos;ve lost access to your authenticator, contact support for help.</p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => router.push(loginUrl)}
          className="w-full text-center text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to sign in
          </span>
        </button>
      </div>
    </AuthLayout>
  );
}
