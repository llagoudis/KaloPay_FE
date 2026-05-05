"use client";

import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { useEmployerForgotPassword } from "@/hooks/auth/useEmployerAuth";
import { ROUTES } from "@/lib/constants/routes";

export default function UserForgotPasswordPage() {
  const forgotMutation = useEmployerForgotPassword();

  return (
    <ForgotPasswordForm
      role="employer"
      onSubmit={(email) => forgotMutation.mutateAsync(email)}
      loginUrl={ROUTES.employer.login}
      resetPasswordUrl={ROUTES.employer.resetPassword}
    />
  );
}
