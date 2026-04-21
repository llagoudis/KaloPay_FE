"use client";

import TwoFactorForm from "@/components/auth/TwoFactorForm";
import { useAdminVerify2FA } from "@/hooks/auth/useAdminAuth";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import { ROUTES } from "@/lib/constants/routes";

export default function Admin2FAPage() {
  const { setAuth } = useAdminAuthStore();
  const verify2FAMutation = useAdminVerify2FA();

  return (
    <TwoFactorForm
      role="admin"
      onVerify={(code) => verify2FAMutation.mutateAsync(code)}
      onSetAuth={setAuth}
      dashboardUrl={ROUTES.admin.dashboard}
      loginUrl={ROUTES.admin.login}
    />
  );
}
