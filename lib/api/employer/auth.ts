import { API_BASE_URL } from "@/lib/constants/config";
import {
  withMockFallback,
  mockLogin,
  mockSignup,
  mockForgotPassword,
  mockVerify2FA,
  mockVerifyEmail,
  mockResendVerification,
} from "@/lib/api/mockAuth";

export async function employerLogin(email: string, password: string) {
  // TEMP: bypass auth for demo/testing.
  void email;
  void password;
  return mockLogin("employer");
}

export async function employerLogout() {
  const res = await fetch(`${API_BASE_URL}/employer/auth/logout`, { method: "POST" });
  if (!res.ok) throw new Error("Logout failed");
  return res.json();
}

export async function employerForgotPassword(email: string) {
  return withMockFallback(async () => {
    const res = await fetch(`${API_BASE_URL}/employer/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error("Request failed");
    return res.json();
  }, () => mockForgotPassword());
}

export async function employerVerify2FA(code: string) {
  return withMockFallback(async () => {
    const res = await fetch(`${API_BASE_URL}/employer/auth/2fa/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    if (!res.ok) throw new Error("2FA verification failed");
    return res.json();
  }, () => mockVerify2FA("employer"));
}

export async function employerSignup(data: { name: string; email: string; password: string }) {
  // TEMP: bypass signup backend for demo/testing.
  void data;
  return mockSignup();
}

export async function employerVerifyEmail(code: string, email: string) {
  return withMockFallback(async () => {
    const res = await fetch(`${API_BASE_URL}/employer/auth/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, email }),
    });
    if (!res.ok) throw new Error("Verification failed");
    return res.json();
  }, () => mockVerifyEmail());
}

export async function employerResendVerification(email: string) {
  return withMockFallback(async () => {
    const res = await fetch(`${API_BASE_URL}/employer/auth/resend-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error("Resend failed");
    return res.json();
  }, () => mockResendVerification());
}

export async function employerResetPassword(code: string, email: string, newPassword: string) {
  const res = await fetch(`${API_BASE_URL}/employer/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, email, newPassword }),
  });
  if (!res.ok) throw new Error("Reset failed");
  return res.json();
}

export async function employerGetMe(token: string) {
  const res = await fetch(`${API_BASE_URL}/employer/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}
