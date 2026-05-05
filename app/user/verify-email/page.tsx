"use client";

import { Suspense } from "react";
import VerifyEmailForm from "@/components/auth/VerifyEmailForm";
import { useEmployerVerifyEmail, useEmployerResendVerification } from "@/hooks/auth/useEmployerAuth";
import { ROUTES } from "@/lib/constants/routes";

function VerifyEmailContent() {
  const verifyMutation = useEmployerVerifyEmail();
  const resendMutation = useEmployerResendVerification();

  return (
    <VerifyEmailForm
      role="employer"
      onVerify={(code, email) => verifyMutation.mutateAsync({ code, email })}
      onResend={(email) => resendMutation.mutateAsync(email)}
      loginUrl={ROUTES.employer.login}
    />
  );
}

export default function EmployerVerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
