"use client";

import LoginForm from "@/components/auth/LoginForm";
import { useEmployerLogin } from "@/hooks/auth/useEmployerAuth";
import { useEmployerAuthStore } from "@/store/employerAuthStore";
import { ROUTES } from "@/lib/constants/routes";

export default function UserLoginPage() {
  const { setAuth } = useEmployerAuthStore();
  const loginMutation = useEmployerLogin();

  return (
    <LoginForm
      role="employer"
      onLogin={(email, password) => loginMutation.mutateAsync({ email, password })}
      onSetAuth={setAuth}
      dashboardUrl={ROUTES.employer.dashboard}
      forgotPasswordUrl={ROUTES.employer.forgotPassword}
      signupUrl={ROUTES.employer.signup}
      twoFAUrl={ROUTES.employer.twoFA}
    />
  );
}
