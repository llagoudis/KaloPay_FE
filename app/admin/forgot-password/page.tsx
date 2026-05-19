"use client";

import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { adminForgotPassword } from "@/lib/api/admin/auth";
import { ROUTES } from "@/lib/constants/routes";

export default function AdminForgotPasswordPage() {
  return (
    <ForgotPasswordForm
      role="admin"
      onSubmit={adminForgotPassword}
      loginUrl={ROUTES.admin.login}
    />
  );
}
