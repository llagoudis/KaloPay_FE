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

export async function employeeLogin(email: string, password: string) {
  // TEMP: bypass auth for demo/testing.
  void email;
  void password;
  return mockLogin("employee");
}

export async function employeeLogout() {
  const res = await fetch(`${API_BASE_URL}/employee/auth/logout`, { method: "POST" });
  if (!res.ok) throw new Error("Logout failed");
  return res.json();
}

export async function employeeForgotPassword(email: string) {
  return withMockFallback(async () => {
    const res = await fetch(`${API_BASE_URL}/employee/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error("Request failed");
    return res.json();
  }, () => mockForgotPassword());
}

export async function employeeVerify2FA(code: string) {
  return withMockFallback(async () => {
    const res = await fetch(`${API_BASE_URL}/employee/auth/2fa/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    if (!res.ok) throw new Error("2FA verification failed");
    return res.json();
  }, () => mockVerify2FA("employee"));
}

export async function employeeSignup(data: { name: string; email: string; password: string }) {
  // TEMP: bypass signup backend for demo/testing.
  void data;
  return mockSignup();
}

export async function employeeVerifyEmail(code: string, email: string) {
  return withMockFallback(async () => {
    const res = await fetch(`${API_BASE_URL}/employee/auth/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, email }),
    });
    if (!res.ok) throw new Error("Verification failed");
    return res.json();
  }, () => mockVerifyEmail());
}

export async function employeeResendVerification(email: string) {
  return withMockFallback(async () => {
    const res = await fetch(`${API_BASE_URL}/employee/auth/resend-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error("Resend failed");
    return res.json();
  }, () => mockResendVerification());
}
