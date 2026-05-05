"use client";

import SignupForm from "@/components/auth/SignupForm";
import { useEmployeeSignup } from "@/hooks/auth/useEmployeeAuth";
import { ROUTES } from "@/lib/constants/routes";

export default function EmployeeSignupPage() {
  const signupMutation = useEmployeeSignup();

  return (
    <SignupForm
      role="employee"
      onSignup={(data) => signupMutation.mutateAsync(data)}
      loginUrl={ROUTES.employee.login}
      verifyEmailUrl={ROUTES.employee.verifyEmail}
    />
  );
}
