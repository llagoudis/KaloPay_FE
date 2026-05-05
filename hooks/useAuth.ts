"use client";

import { useAdminAuthStore } from "@/store/adminAuthStore";
import { useEmployerAuthStore } from "@/store/employerAuthStore";
import { useEmployeeAuthStore } from "@/store/employeeAuthStore";

type Role = "admin" | "employer" | "employee";

export function useAuth(role: Role) {
  const admin = useAdminAuthStore();
  const employer = useEmployerAuthStore();
  const employee = useEmployeeAuthStore();

  if (role === "admin") return admin;
  if (role === "employer") return employer;
  return employee;
}
