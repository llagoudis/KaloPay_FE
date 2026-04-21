"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import PasswordInput from "./PasswordInput";
import OtpInput from "./OtpInput";
import AuthLayout from "./AuthLayout";

interface ResetPasswordFormProps {
  role: "admin" | "employer" | "employee";
  onReset: (code: string, email: string, newPassword: string) => Promise<unknown>;
  loginUrl: string;
}

export default function ResetPasswordForm({
  role,
  onReset,
  loginUrl,
}: ResetPasswordFormProps) {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [emailInput, setEmailInput] = useState(email);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!emailInput.trim()) {
      setError("Email is required.");
      return;
    }
    if (!code.trim() || code.length < 6) {
      setError("Please enter the 6-digit reset code.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      setError("Password must include uppercase, lowercase, and a number.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await onReset(code, emailInput, password);
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout
        role={role}
        title="Password reset!"
        subtitle="Your password has been reset successfully"
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
            You can now sign in with your new password.
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
      title="Reset your password"
      subtitle="Enter the code sent to your email and create a new password"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
            <svg className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {!email && (
          <Input
            label="Email address"
            type="email"
            placeholder="name@company.com"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            autoComplete="email"
            required
          />
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reset code
          </label>
          <OtpInput
            onComplete={(val) => setCode(val)}
            disabled={loading}
          />
        </div>

        <PasswordInput
          label="New password"
          placeholder="Create a strong password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
        />

        <PasswordInput
          label="Confirm new password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          required
        />

        <Button
          type="submit"
          loading={loading}
          className="w-full"
          size="lg"
        >
          Reset password
        </Button>

        <Link href={loginUrl} className="block">
          <Button type="button" variant="ghost" className="w-full" size="lg">
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to sign in
          </Button>
        </Link>
      </form>
    </AuthLayout>
  );
}
