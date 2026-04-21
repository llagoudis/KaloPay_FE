"use client";

import { Suspense } from "react";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { useAdminResetPassword } from "@/hooks/auth/useAdminAuth";
import { ROUTES } from "@/lib/constants/routes";

function ResetPasswordContent() {
  const resetMutation = useAdminResetPassword();

  return (
    <ResetPasswordForm
      role="admin"
      onReset={(code, email, newPassword) =>
        resetMutation.mutateAsync({ code, email, newPassword })
      }
      loginUrl={ROUTES.admin.login}
    />
  );
}

export default function AdminResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
