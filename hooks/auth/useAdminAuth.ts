"use client";

import { useMutation } from "@tanstack/react-query";
import {
  adminLogin,
  adminSignup,
  adminVerifyEmail,
  adminResendVerification,
  adminForgotPassword,
  adminVerify2FA,
  adminResetPassword,
  adminGetMe,
  adminLogout,
} from "@/lib/api/admin/auth";

export function useAdminLogin() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      adminLogin(email, password),
  });
}

export function useAdminSignup() {
  return useMutation({
    mutationFn: (data: { name: string; email: string; password: string }) =>
      adminSignup(data),
  });
}

export function useAdminVerifyEmail() {
  return useMutation({
    mutationFn: ({ code, email }: { code: string; email: string }) =>
      adminVerifyEmail(code, email),
  });
}

export function useAdminResendVerification() {
  return useMutation({
    mutationFn: (email: string) => adminResendVerification(email),
  });
}

export function useAdminForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => adminForgotPassword(email),
  });
}

export function useAdminVerify2FA() {
  return useMutation({
    mutationFn: (code: string) => adminVerify2FA(code),
  });
}

export function useAdminResetPassword() {
  return useMutation({
    mutationFn: ({ code, email, newPassword }: { code: string; email: string; newPassword: string }) =>
      adminResetPassword(code, email, newPassword),
  });
}

export function useAdminGetMe() {
  return useMutation({
    mutationFn: (token: string) => adminGetMe(token),
  });
}

export function useAdminLogout() {
  return useMutation({
    mutationFn: () => adminLogout(),
  });
}
