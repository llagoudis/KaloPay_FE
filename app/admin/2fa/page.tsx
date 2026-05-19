"use client";

import TwoFactorForm from "@/components/auth/TwoFactorForm";
import { adminVerify2FA } from "@/lib/api/admin/auth";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import { ROUTES } from "@/lib/constants/routes";

export default function Admin2FAPage() {
  const { setAuth } = useAdminAuthStore();

  return (
    <TwoFactorForm
      role="admin"
      onVerify={adminVerify2FA}
      onSetAuth={setAuth}
      dashboardUrl={ROUTES.admin.dashboard}
      loginUrl={ROUTES.admin.login}
    />
  );
}
