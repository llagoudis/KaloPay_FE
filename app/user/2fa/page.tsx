"use client";

import TwoFactorForm from "@/components/auth/TwoFactorForm";
import { useEmployerVerify2FA } from "@/hooks/auth/useEmployerAuth";
import { useEmployerAuthStore } from "@/store/employerAuthStore";
import { ROUTES } from "@/lib/constants/routes";

export default function User2FAPage() {
  const { setAuth } = useEmployerAuthStore();
  const verify2FAMutation = useEmployerVerify2FA();

  return (
    <TwoFactorForm
      role="employer"
      onVerify={(code) => verify2FAMutation.mutateAsync(code)}
      onSetAuth={setAuth}
      dashboardUrl={ROUTES.employer.dashboard}
      loginUrl={ROUTES.employer.login}
    />
  );
}
