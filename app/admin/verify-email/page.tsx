"use client";

import { Suspense } from "react";
import VerifyEmailForm from "@/components/auth/VerifyEmailForm";
import { useAdminVerifyEmail, useAdminResendVerification } from "@/hooks/auth/useAdminAuth";
import { ROUTES } from "@/lib/constants/routes";

function VerifyEmailContent() {
  const verifyMutation = useAdminVerifyEmail();
  const resendMutation = useAdminResendVerification();

  return (
    <VerifyEmailForm
      role="admin"
      onVerify={(code, email) => verifyMutation.mutateAsync({ code, email })}
      onResend={(email) => resendMutation.mutateAsync(email)}
      loginUrl={ROUTES.admin.login}
    />
  );
}

export default function AdminVerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
