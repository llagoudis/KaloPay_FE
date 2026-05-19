"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { ROUTES } from "@/lib/constants/routes";

export default function EmployerVerifyEmailPage() {
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
    if (code.length < 6) { setError("Please enter the full 6-digit code."); return; }
    setError("");
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      router.push(ROUTES.employer.dashboard);
    } catch {
      setError("Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="text-3xl font-bold text-blue-600">KaloPay</span>
          <p className="mt-1 text-sm text-gray-500">Employer Portal</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center">
          <div className="mb-4 text-4xl">✉️</div>
          <h1 className="mb-1 text-2xl font-semibold text-gray-900">Verify your email</h1>
          <p className="mb-6 text-sm text-gray-500">Enter the 6-digit code we sent to your email.</p>
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-6 flex justify-center gap-3">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="h-12 w-12 rounded-lg border border-gray-300 text-center text-xl font-semibold text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              ))}
            </div>
            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Verify email
            </Button>
          </form>
          <p className="mt-4 text-sm text-gray-500">
            Didn't receive a code?{" "}
            <button className="font-medium text-blue-600 hover:underline">Resend</button>
          </p>
        </div>
      </div>
    </div>
  );
}
