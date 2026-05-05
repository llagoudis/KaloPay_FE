"use client";

import SignupForm from "@/components/auth/SignupForm";
import { useEmployerSignup } from "@/hooks/auth/useEmployerAuth";
import { ROUTES } from "@/lib/constants/routes";

export default function EmployerSignupPage() {
  const signupMutation = useEmployerSignup();

  return (
    <SignupForm
      role="employer"
      onSignup={(data) => signupMutation.mutateAsync(data)}
      loginUrl={ROUTES.employer.login}
      verifyEmailUrl={ROUTES.employer.verifyEmail}
    />
  );
}
