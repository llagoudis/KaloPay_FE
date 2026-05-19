"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/shared/Logo";
import { employerVerify2FA } from "@/lib/api/employer/auth";
import { ROUTES } from "@/lib/constants/routes";

/** 2FA page – Figma Payroll (node 337-4764). Same theme as login: dark bg, card, accent blue. */
export default function Employer2FAPage() {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  function handleChange(index: number, value: string) {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) inputs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter the full 6-digit code.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await employerVerify2FA(code);
      router.push(ROUTES.employer.dashboard);
    } catch {
      setError("Invalid authentication code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center bg-dash-page px-4 py-12"
      data-dashboard-theme
    >
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo href={ROUTES.employer.login} variant="dark" accentColor="#4A90E2" />
        </div>
        <p className="mb-6 text-center text-sm text-dash-secondary">Employer Portal</p>

        <div className="rounded-xl bg-dash-card p-8 shadow-xl text-center">
          <div className="mb-4 text-4xl">🔐</div>
          <h1 className="mb-1 text-2xl font-semibold text-white">Two-factor authentication</h1>
          <p className="mb-6 text-sm text-dash-secondary">
            Enter the 6-digit code from your authenticator app.
          </p>
          {error && (
            <div className="mb-4 rounded-lg border border-[#f87171]/30 bg-[#450a0a]/50 px-4 py-3 text-sm text-[#f87171]">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-6 flex justify-center gap-3">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="h-12 w-12 rounded-lg border border-[var(--color-dash-icon-bg)] bg-[#0D1117] text-center text-xl font-semibold text-white focus:border-[#4A90E2] focus:outline-none focus:ring-1 focus:ring-[#4A90E2]"
                />
              ))}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#4A90E2] px-6 py-3 text-base font-medium text-white transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#4A90E2] focus:ring-offset-2 focus:ring-offset-[#0D1117] disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Verifying…
                </span>
              ) : (
                "Verify"
              )}
            </button>
          </form>
          <p className="mt-4 text-sm text-dash-secondary">
            Lost access to your authenticator?{" "}
            <button type="button" className="font-medium text-[#4A90E2] hover:underline">
              Use backup code
            </button>
          </p>
          <p className="mt-3">
            <Link
              href={ROUTES.employer.login}
              className="text-sm font-medium text-[#4A90E2] hover:underline"
            >
              ← Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
