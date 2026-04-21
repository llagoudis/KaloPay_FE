"use client";

import LoginForm from "@/components/auth/LoginForm";
import { useAdminLogin } from "@/hooks/auth/useAdminAuth";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import { ROUTES } from "@/lib/constants/routes";

export default function AdminLoginPage() {
  const { setAuth } = useAdminAuthStore();
  const loginMutation = useAdminLogin();

  return (
    <LoginForm
      role="admin"
      onLogin={(email, password) => loginMutation.mutateAsync({ email, password })}
      onSetAuth={setAuth}
      dashboardUrl={ROUTES.admin.dashboard}
      forgotPasswordUrl={ROUTES.admin.forgotPassword}
      signupUrl={ROUTES.admin.signup}
      twoFAUrl={ROUTES.admin.twoFA}
    />
  );
}
