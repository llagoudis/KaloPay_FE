"use client";

import { Suspense } from "react";
import VerifyEmailForm from "@/components/auth/VerifyEmailForm";
import { useEmployeeVerifyEmail, useEmployeeResendVerification } from "@/hooks/auth/useEmployeeAuth";
import { ROUTES } from "@/lib/constants/routes";

function VerifyEmailContent() {
  const verifyMutation = useEmployeeVerifyEmail();
  const resendMutation = useEmployeeResendVerification();

  return (
    <VerifyEmailForm
      role="employee"
      onVerify={(code, email) => verifyMutation.mutateAsync({ code, email })}
      onResend={(email) => resendMutation.mutateAsync(email)}
      loginUrl={ROUTES.employee.login}
    />
  );
}

export default function EmployeeVerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
