"use client";

import { Suspense } from "react";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { useEmployerResetPassword } from "@/hooks/auth/useEmployerAuth";
import { ROUTES } from "@/lib/constants/routes";

function ResetPasswordContent() {
  const resetMutation = useEmployerResetPassword();

  return (
    <ResetPasswordForm
      role="employer"
      onReset={(code, email, newPassword) =>
        resetMutation.mutateAsync({ code, email, newPassword })
      }
      loginUrl={ROUTES.employer.login}
    />
  );
}

export default function EmployerResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
