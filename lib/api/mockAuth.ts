// Mock auth helpers for testing UI flows without a backend.
// Enabled automatically when the real API is unreachable.

import type { AuthUser } from "@/types/auth";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const MOCK_USERS: Record<string, AuthUser> = {
  admin: { id: "1", email: "admin@kalopay.com", name: "Admin User", role: "admin" },
  employer: { id: "2", email: "employer@kalopay.com", name: "Jane Smith", role: "employer" },
  employee: { id: "3", email: "employee@kalopay.com", name: "John Doe", role: "employee" },
};

export async function mockLogin(role: "admin" | "employer" | "employee") {
  await delay(800);
  return {
    user: MOCK_USERS[role],
    token: `mock-token-${role}-${Date.now()}`,
    requires2FA: false,
  };
}

export async function mockSignup() {
  await delay(1000);
  return { message: "Account created. Please verify your email." };
}

export async function mockForgotPassword() {
  await delay(800);
  return { message: "Reset link sent." };
}

export async function mockVerify2FA(role: "admin" | "employer" | "employee") {
  await delay(800);
  return {
    user: MOCK_USERS[role],
    token: `mock-token-${role}-${Date.now()}`,
  };
}

export async function mockVerifyEmail() {
  await delay(800);
  return { message: "Email verified." };
}

export async function mockResendVerification() {
  await delay(600);
  return { message: "Code resent." };
}

/**
 * Wraps a real API call with a mock fallback.
 * If the real API throws a network/fetch error, falls back to the mock fn.
 * In production, the mock is never used.
 */
export async function withMockFallback<T>(
  realFn: () => Promise<T>,
  mockFn: () => Promise<T>
): Promise<T> {
  try {
    return await realFn();
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[KaloPay] API unreachable — using mock data for demo", err);
      return mockFn();
    }
    throw err;
  }
}
