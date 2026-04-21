"use client";

import SignupForm from "@/components/auth/SignupForm";
import { useAdminSignup } from "@/hooks/auth/useAdminAuth";
import { ROUTES } from "@/lib/constants/routes";

export default function AdminSignupPage() {
  const signupMutation = useAdminSignup();

  return (
    <SignupForm
      role="admin"
      onSignup={(data) => signupMutation.mutateAsync(data)}
      loginUrl={ROUTES.admin.login}
      verifyEmailUrl={ROUTES.admin.verifyEmail}
    />
  );
}
