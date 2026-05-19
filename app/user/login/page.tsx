"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/shared/Logo";
import { useEmployerAuthStore } from "@/store/employerAuthStore";
import { employerLogin } from "@/lib/api/employer/auth";
import { ROUTES } from "@/lib/constants/routes";

/** Employer login – Figma Payroll (node 337-4752). Dashboard theme: dark bg, card form, accent blue. */
export default function EmployerLoginPage() {
  const router = useRouter();
  const { setAuth } = useEmployerAuthStore();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await employerLogin(form.email, form.password);
      setAuth(data.user, data.token);
      router.push(ROUTES.employer.dashboard);
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 py-12 bg-dash-page"
      data-dashboard-theme
    >
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo href={ROUTES.employer.login} variant="dark" accentColor="#4A90E2" />
        </div>
        <p className="mb-6 text-center text-sm text-dash-secondary">Employer Portal</p>

        <div className="rounded-xl bg-dash-card p-8 shadow-xl">
          <h1 className="mb-6 text-2xl font-semibold text-white">Sign in</h1>
          {error && (
            <div className="mb-4 rounded-lg bg-[#450a0a]/50 border border-[#f87171]/30 px-4 py-3 text-sm text-[#f87171]">
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
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoFocus
                className="w-full rounded-lg border border-[var(--color-dash-icon-bg)] bg-[#0D1117] px-3 py-2.5 text-sm text-white placeholder:text-dash-secondary focus:border-[#4A90E2] focus:outline-none focus:ring-1 focus:ring-[#4A90E2]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-dash-secondary">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                className="w-full rounded-lg border border-[var(--color-dash-icon-bg)] bg-[#0D1117] px-3 py-2.5 text-sm text-white placeholder:text-dash-secondary focus:border-[#4A90E2] focus:outline-none focus:ring-1 focus:ring-[#4A90E2]"
              />
              <div className="mt-1.5 text-right">
                <Link
                  href={ROUTES.employer.forgotPassword}
                  className="text-sm font-medium text-[#4A90E2] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
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
                  Signing in…
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-dash-secondary">
          Not an employer?{" "}
          <Link
            href="/employee/login"
            className="font-medium text-[#4A90E2] hover:underline"
          >
            Employee login
          </Link>
        </p>
      </div>
    </div>
  );
}
