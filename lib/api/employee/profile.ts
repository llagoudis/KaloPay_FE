import { apiClient } from "@/lib/api/client";

export interface EmployeeProfile {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  createdAt: string;
  companyId: number | null;
  companyName: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  nationality: string | null;
  dateOfBirth: string | null;
  jobTitle: string | null;
  department: string | null;
  employmentType: string | null;
  employeeStatus: string | null;
  contractStart: string | null;
  contractEnd: string | null;
  paymentCurrencyCode: string | null;
  grossAnnualSalary: number | string | null;
  country: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  iban: string | null;
  swiftBic: string | null;
  bankName: string | null;
}

export interface Payslip {
  id: number;
  ref: string;
  batchRef: string | null;
  period: string | null;
  amount: number;
  currency: string;
  status: string;
  paymentDate: string | null;
}

export function getEmployeeProfile(token: string) {
  return apiClient<{ profile: EmployeeProfile }>("/employee/me", { token });
}

export function updateEmployeeProfile(
  token: string,
  data: Partial<Record<keyof EmployeeProfile | "name", string>>
) {
  return apiClient<{ profile: EmployeeProfile }>("/employee/me", {
    method: "PUT",
    token,
    body: data,
  });
}

export function changeEmployeePassword(
  token: string,
  data: { currentPassword: string; newPassword: string }
) {
  return apiClient<{ message: string }>("/employee/me/password", {
    method: "POST",
    token,
    body: data,
  });
}

export function listEmployeePayslips(token: string) {
  return apiClient<{ payslips: Payslip[] }>("/employee/payslips", { token });
}
