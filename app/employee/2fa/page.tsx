"use client";

import TwoFactorForm from "@/components/auth/TwoFactorForm";
import { useEmployeeVerify2FA } from "@/hooks/auth/useEmployeeAuth";
import { useEmployeeAuthStore } from "@/store/employeeAuthStore";
import { ROUTES } from "@/lib/constants/routes";

export default function Employee2FAPage() {
  const { setAuth } = useEmployeeAuthStore();
  const verify2FAMutation = useEmployeeVerify2FA();

  return (
    <TwoFactorForm
      role="employee"
      onVerify={(code) => verify2FAMutation.mutateAsync(code)}
      onSetAuth={setAuth}
      dashboardUrl={ROUTES.employee.dashboard}
      loginUrl={ROUTES.employee.login}
    />
  );
}
