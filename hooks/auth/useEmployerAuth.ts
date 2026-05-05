"use client";

import { useMutation } from "@tanstack/react-query";
import {
  employerLogin,
  employerSignup,
  employerVerifyEmail,
  employerResendVerification,
  employerForgotPassword,
  employerVerify2FA,
  employerResetPassword,
  employerGetMe,
  employerLogout,
} from "@/lib/api/employer/auth";

export function useEmployerLogin() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      employerLogin(email, password),
  });
}

export function useEmployerSignup() {
  return useMutation({
    mutationFn: (data: { name: string; email: string; password: string }) =>
      employerSignup(data),
  });
}

export function useEmployerVerifyEmail() {
  return useMutation({
    mutationFn: ({ code, email }: { code: string; email: string }) =>
      employerVerifyEmail(code, email),
  });
}

export function useEmployerResendVerification() {
  return useMutation({
    mutationFn: (email: string) => employerResendVerification(email),
  });
}

export function useEmployerForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => employerForgotPassword(email),
  });
}

export function useEmployerVerify2FA() {
  return useMutation({
    mutationFn: (code: string) => employerVerify2FA(code),
  });
}

export function useEmployerResetPassword() {
  return useMutation({
    mutationFn: ({ code, email, newPassword }: { code: string; email: string; newPassword: string }) =>
      employerResetPassword(code, email, newPassword),
  });
}

export function useEmployerGetMe() {
  return useMutation({
    mutationFn: (token: string) => employerGetMe(token),
  });
}

export function useEmployerLogout() {
  return useMutation({
    mutationFn: () => employerLogout(),
  });
}
