"use client";

import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { useAdminForgotPassword } from "@/hooks/auth/useAdminAuth";
import { ROUTES } from "@/lib/constants/routes";

export default function AdminForgotPasswordPage() {
  const forgotMutation = useAdminForgotPassword();

  return (
    <ForgotPasswordForm
      role="admin"
      onSubmit={(email) => forgotMutation.mutateAsync(email)}
      loginUrl={ROUTES.admin.login}
      resetPasswordUrl={ROUTES.admin.resetPassword}
    />
  );
}
