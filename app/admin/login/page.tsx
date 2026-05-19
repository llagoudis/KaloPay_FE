"use client";

import LoginForm from "@/components/auth/LoginForm";
import { adminLogin } from "@/lib/api/admin/auth";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import { ROUTES } from "@/lib/constants/routes";

export default function AdminLoginPage() {
  const { setAuth } = useAdminAuthStore();

  return (
    <LoginForm
      role="admin"
      onLogin={adminLogin}
      onSetAuth={setAuth}
      dashboardUrl={ROUTES.admin.dashboard}
      forgotPasswordUrl={ROUTES.admin.forgotPassword}
      signupUrl={ROUTES.admin.signup}
      twoFAUrl={ROUTES.admin.twoFA}
    />
  );
}
