"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import OtpInput from "./OtpInput";
import AuthLayout from "./AuthLayout";

interface VerifyEmailFormProps {
  role: "admin" | "employer" | "employee";
  onVerify: (code: string, email: string) => Promise<unknown>;
  onResend: (email: string) => Promise<unknown>;
  loginUrl: string;
}

export default function VerifyEmailForm({
  role,
  onVerify,
  onResend,
  loginUrl,
}: VerifyEmailFormProps) {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleVerify = async (code: string) => {
    setError("");
    setLoading(true);
    try {
      await onVerify(code, email);
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Invalid verification code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    setResendSuccess(false);
    try {
      await onResend(email);
      setResendSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not resend code. Try again later."
      );
    } finally {
      setResending(false);
    }
  };

  if (success) {
    return (
      <AuthLayout
        role={role}
        title="Email verified!"
        subtitle="Your email has been verified successfully"
      >
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <p className="text-center text-sm text-gray-600">
            Your account is now active. You can sign in to get started.
          </p>

          <Link href={loginUrl} className="block">
            <Button className="w-full" size="lg">
              Continue to sign in
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      role={role}
      title="Verify your email"
      subtitle={
        email
          ? `We've sent a 6-digit code to ${email}`
          : "Enter the verification code sent to your email"
      }
    >
      <div className="space-y-6">
        {/* Decorative icon */}
        <div className="flex justify-center">
          <div className="h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center">
            <svg className="h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 text-center">
            {error}
          </div>
        )}

        {resendSuccess && (
          <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 text-center">
            A new code has been sent to your email.
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

        <div className="text-center">
          <p className="text-sm text-gray-500">
            Didn&apos;t receive the code?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50"
            >
              {resending ? "Sending..." : "Resend code"}
            </button>
          </p>
        </div>

        <Link href={loginUrl} className="block">
          <Button type="button" variant="ghost" className="w-full" size="lg">
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to sign in
          </Button>
        </Link>
      </div>
    </AuthLayout>
  );
}
