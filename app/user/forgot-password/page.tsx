"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/shared/Logo";
import { employerForgotPassword } from "@/lib/api/employer/auth";
import { ROUTES } from "@/lib/constants/routes";

/** Forgot password – Figma Payroll (node 337-4754). Same theme as login: dark bg, card, accent blue. */
export default function EmployerForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await employerForgotPassword(email);
      setSent(true);
    } catch {
      setError("Failed to send reset email. Please try again.");
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

        <div className="rounded-xl bg-dash-card p-8 shadow-xl">
          {sent ? (
            <div className="text-center">
              <div className="mb-4 text-4xl">✉️</div>
              <h1 className="mb-2 text-xl font-semibold text-white">Check your email</h1>
              <p className="mb-6 text-sm text-dash-secondary">
                We sent a reset link to <strong className="text-white">{email}</strong>
              </p>
              <Link
                href={ROUTES.employer.login}
                className="text-sm font-medium text-[#4A90E2] hover:underline"
              >
                ← Back to login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="mb-2 text-2xl font-semibold text-white">Forgot password?</h1>
              <p className="mb-6 text-sm text-dash-secondary">
                Enter your email and we&apos;ll send a reset link.
              </p>
              {error && (
                <div className="mb-4 rounded-lg border border-[#f87171]/30 bg-[#450a0a]/50 px-4 py-3 text-sm text-[#f87171]">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-dash-secondary">
                    Email address
                  </label>
                  <input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    className="w-full rounded-lg border border-[var(--color-dash-icon-bg)] bg-[#0D1117] px-3 py-2.5 text-sm text-white placeholder:text-dash-secondary focus:border-[#4A90E2] focus:outline-none focus:ring-1 focus:ring-[#4A90E2]"
                  />
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
                      Sending…
                    </span>
                  ) : (
                    "Send reset link"
                  )}
                </button>
              </form>
              <div className="mt-4 text-center">
                <Link
                  href={ROUTES.employer.login}
                  className="text-sm font-medium text-[#4A90E2] hover:underline"
                >
                  ← Back to login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
