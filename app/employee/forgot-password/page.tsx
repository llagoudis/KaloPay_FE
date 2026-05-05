"use client";

import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { useEmployeeForgotPassword } from "@/hooks/auth/useEmployeeAuth";
import { ROUTES } from "@/lib/constants/routes";

export default function EmployeeForgotPasswordPage() {
  const forgotMutation = useEmployeeForgotPassword();

  return (
    <ForgotPasswordForm
      role="employee"
      onSubmit={(email) => forgotMutation.mutateAsync(email)}
      loginUrl={ROUTES.employee.login}
      resetPasswordUrl={ROUTES.employee.resetPassword}
    />
  );
}
