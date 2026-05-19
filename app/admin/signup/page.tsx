"use client";

import SignupForm from "@/components/auth/SignupForm";
import { adminSignup } from "@/lib/api/admin/auth";
import { ROUTES } from "@/lib/constants/routes";

export default function AdminSignupPage() {
  return (
    <SignupForm
      role="admin"
      onSignup={adminSignup}
      loginUrl={ROUTES.admin.login}
      verifyEmailUrl={ROUTES.admin.verifyEmail}
    />
  );
}
