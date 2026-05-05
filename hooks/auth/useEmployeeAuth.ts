"use client";

import { useMutation } from "@tanstack/react-query";
import {
  employeeLogin,
  employeeSignup,
  employeeVerifyEmail,
  employeeResendVerification,
  employeeForgotPassword,
  employeeVerify2FA,
  employeeResetPassword,
  employeeGetMe,
  employeeLogout,
} from "@/lib/api/employee/auth";

export function useEmployeeLogin() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      employeeLogin(email, password),
  });
}

export function useEmployeeSignup() {
  return useMutation({
    mutationFn: (data: { name: string; email: string; password: string }) =>
      employeeSignup(data),
  });
}

export function useEmployeeVerifyEmail() {
  return useMutation({
    mutationFn: ({ code, email }: { code: string; email: string }) =>
      employeeVerifyEmail(code, email),
  });
}

export function useEmployeeResendVerification() {
  return useMutation({
    mutationFn: (email: string) => employeeResendVerification(email),
  });
}

export function useEmployeeForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => employeeForgotPassword(email),
  });
}

export function useEmployeeVerify2FA() {
  return useMutation({
    mutationFn: (code: string) => employeeVerify2FA(code),
  });
}

export function useEmployeeResetPassword() {
  return useMutation({
    mutationFn: ({ code, email, newPassword }: { code: string; email: string; newPassword: string }) =>
      employeeResetPassword(code, email, newPassword),
  });
}

export function useEmployeeGetMe() {
  return useMutation({
    mutationFn: (token: string) => employeeGetMe(token),
  });
}

export function useEmployeeLogout() {
  return useMutation({
    mutationFn: () => employeeLogout(),
  });
}
