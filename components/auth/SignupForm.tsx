"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import PasswordInput from "./PasswordInput";
import AuthLayout from "./AuthLayout";

interface SignupFormProps {
  role: "admin" | "employer" | "employee";
  onSignup: (data: { name: string; email: string; password: string }) => Promise<unknown>;
  loginUrl: string;
  verifyEmailUrl: string;
}

export default function SignupForm({
  role,
  onSignup,
  loginUrl,
  verifyEmailUrl,
}: SignupFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    // TEMP: bypass signup validation for demo/testing.
    setFieldErrors({});
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validate()) return;

    setLoading(true);
    try {
      await onSignup({ name, email, password });
      router.push(`${verifyEmailUrl}?email=${encodeURIComponent(email)}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const getStrength = (): { label: string; color: string; width: string } => {
    if (!password) return { label: "", color: "", width: "w-0" };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 1) return { label: "Weak", color: "bg-red-500", width: "w-1/4" };
    if (score === 2) return { label: "Fair", color: "bg-yellow-500", width: "w-2/4" };
    if (score === 3) return { label: "Good", color: "bg-blue-500", width: "w-3/4" };
    return { label: "Strong", color: "bg-green-500", width: "w-full" };
  };

  const strength = getStrength();

  return (
    <AuthLayout
      role={role}
      title="Create your account"
      subtitle="Get started with KaloPay in minutes"
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

        <Input
          label="Full name"
          type="text"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={fieldErrors.name}
          autoComplete="name"
        />

        <Input
          label="Email address"
          type="email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
          autoComplete="email"
        />

        <div>
          <PasswordInput
            label="Password"
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
            autoComplete="new-password"
          />
          {password && (
            <div className="mt-2 space-y-1">
              <div className="h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`}
                />
              </div>
              <p className="text-xs text-gray-500">
                Password strength: <span className="font-medium">{strength.label}</span>
              </p>
            </div>
          )}
        </div>

        <PasswordInput
          label="Confirm password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={fieldErrors.confirmPassword}
          autoComplete="new-password"
        />

        <div>
          <label className="flex items-start gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">
              I agree to the{" "}
              <span className="text-blue-600 hover:text-blue-700 cursor-pointer">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="text-blue-600 hover:text-blue-700 cursor-pointer">
                Privacy Policy
              </span>
            </span>
          </label>
          {fieldErrors.terms && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.terms}</p>
          )}
        </div>

        <Button
          type="submit"
          loading={loading}
          className="w-full"
          size="lg"
        >
          Create account
        </Button>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            href={loginUrl}
            className="font-medium text-blue-600 hover:text-blue-700"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
