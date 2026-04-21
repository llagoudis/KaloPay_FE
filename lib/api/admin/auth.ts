import { API_BASE_URL } from "@/lib/constants/config";
import { apiClient } from "@/lib/api/client";
import type { AuthUser } from "@/types/auth";
import {
  withMockFallback,
  mockForgotPassword,
  mockVerify2FA,
  mockVerifyEmail,
  mockResendVerification,
} from "@/lib/api/mockAuth";

interface MessageResponse {
  message: string;
}

export async function adminLogin(email: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Login failed");
  return data;
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
  const res = await fetch(`${API_BASE_URL}/admin/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || "Signup failed");
  return json;
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

export function adminResetPassword(code: string, email: string, newPassword: string) {
  return apiClient<MessageResponse>("/admin/auth/reset-password", {
    method: "POST",
    body: { code, email, newPassword },
  });
}

export function adminGetMe(token: string) {
  return apiClient<{ user: AuthUser }>("/admin/auth/me", {
    method: "GET",
    token,
  });
}
