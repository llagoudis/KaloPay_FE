"use client";

import { Suspense } from "react";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { useEmployeeResetPassword } from "@/hooks/auth/useEmployeeAuth";
import { ROUTES } from "@/lib/constants/routes";

function ResetPasswordContent() {
  const resetMutation = useEmployeeResetPassword();

  return (
    <ResetPasswordForm
      role="employee"
      onReset={(code, email, newPassword) =>
        resetMutation.mutateAsync({ code, email, newPassword })
      }
      loginUrl={ROUTES.employee.login}
    />
  );
}

export default function EmployeeResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
