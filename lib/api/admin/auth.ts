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

export async function adminLogin(email: string, password: string) {
  // TEMP: bypass auth for demo/testing.
  void email;
  void password;
  return mockLogin("admin");
}

export async function adminLogout() {
  const res = await fetch(`${API_BASE_URL}/admin/auth/logout`, { method: "POST" });
  if (!res.ok) throw new Error("Logout failed");
  return res.json();
}

export async function adminForgotPassword(email: string) {
  return withMockFallback(async () => {
    const res = await fetch(`${API_BASE_URL}/admin/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error("Request failed");
    return res.json();
  }, () => mockForgotPassword());
}

export async function adminVerify2FA(code: string) {
  return withMockFallback(async () => {
    const res = await fetch(`${API_BASE_URL}/admin/auth/2fa/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    if (!res.ok) throw new Error("2FA verification failed");
    return res.json();
  }, () => mockVerify2FA("admin"));
}

export async function adminSignup(data: { name: string; email: string; password: string }) {
  // TEMP: bypass signup backend for demo/testing.
  void data;
  return mockSignup();
}

export async function adminVerifyEmail(code: string, email: string) {
  return withMockFallback(async () => {
    const res = await fetch(`${API_BASE_URL}/admin/auth/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, email }),
    });
    if (!res.ok) throw new Error("Verification failed");
    return res.json();
  }, () => mockVerifyEmail());
}

export async function adminResendVerification(email: string) {
  return withMockFallback(async () => {
    const res = await fetch(`${API_BASE_URL}/admin/auth/resend-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error("Resend failed");
    return res.json();
  }, () => mockResendVerification());
}
