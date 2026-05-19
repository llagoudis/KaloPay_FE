"use client";

import { Suspense } from "react";
import VerifyEmailForm from "@/components/auth/VerifyEmailForm";
import { adminVerifyEmail, adminResendVerification } from "@/lib/api/admin/auth";
import { ROUTES } from "@/lib/constants/routes";

function VerifyEmailContent() {
  return (
    <VerifyEmailForm
      role="admin"
      onVerify={adminVerifyEmail}
      onResend={adminResendVerification}
      loginUrl={ROUTES.admin.login}
    />
  );
}

export default function AdminVerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
