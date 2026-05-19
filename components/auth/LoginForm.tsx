"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import PasswordInput from "./PasswordInput";
import AuthLayout from "./AuthLayout";

interface LoginFormProps {
  role: "admin" | "employer" | "employee";
  onLogin: (email: string, password: string) => Promise<{ user: unknown; token: string; requires2FA?: boolean }>;
  onSetAuth: (user: never, token: string) => void;
  dashboardUrl: string;
  forgotPasswordUrl: string;
  signupUrl?: string;
  twoFAUrl: string;
}

export default function LoginForm({
  role,
  onLogin,
  onSetAuth,
  dashboardUrl,
  forgotPasswordUrl,
  signupUrl,
  twoFAUrl,
}: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await onLogin(email, password);
      if (res.requires2FA) {
        router.push(twoFAUrl);
      } else {
        onSetAuth(res.user as never, res.token);
        router.push(dashboardUrl);
      }
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      role={role}
      title="Welcome back"
      subtitle="Enter your credentials to access your account"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
            <svg className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <Input
          label="Email address"
          type="email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />

        <PasswordInput
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">Remember me</span>
          </label>
          <Link
            href={forgotPasswordUrl}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          loading={loading}
          className="w-full"
          size="lg"
        >
          Sign in
        </Button>

        {signupUrl && (
          <p className="text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link
              href={signupUrl}
              className="font-medium text-blue-600 hover:text-blue-700"
            >
              Create account
            </Link>
          </p>
        )}
      </form>
    </AuthLayout>
  );
}
