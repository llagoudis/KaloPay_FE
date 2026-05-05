"use client";

import LoginForm from "@/components/auth/LoginForm";
import { useEmployeeLogin } from "@/hooks/auth/useEmployeeAuth";
import { useEmployeeAuthStore } from "@/store/employeeAuthStore";
import { ROUTES } from "@/lib/constants/routes";

export default function EmployeeLoginPage() {
  const { setAuth } = useEmployeeAuthStore();
  const loginMutation = useEmployeeLogin();

  return (
    <LoginForm
      role="employee"
      onLogin={(email, password) => loginMutation.mutateAsync({ email, password })}
      onSetAuth={setAuth}
      dashboardUrl={ROUTES.employee.dashboard}
      forgotPasswordUrl={ROUTES.employee.forgotPassword}
      signupUrl={ROUTES.employee.signup}
      twoFAUrl={ROUTES.employee.twoFA}
    />
  );
}
