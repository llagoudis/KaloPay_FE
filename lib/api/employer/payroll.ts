import { apiClient } from "@/lib/api/client";

export type PayrollEmployee = {
  id: number;
  name: string;
  jobTitle: string;
  department: string;
  country: string;
  currency: string;
  annualSalary: number;
  monthlyGross: number;
  hasBank: boolean;
};

export type FundingStatus = {
  required: number;
  available: number;
  sufficient: boolean;
  currency: string;
};

export type RunPayrollInput = {
  period?: string;
  paymentDate?: string;
  description?: string;
  execute?: boolean;
  employees: {
    id: number;
    gross: number;
    overtime?: number;
    bonuses?: number;
    commissions?: number;
    expenses?: number;
    unpaidDays?: number;
  }[];
};

export type PayrollRunLine = {
  employeeId: number;
  gross: number;
  deductions: number;
  net: number;
  employerCost: number;
  incomeTax: number;
  social: number;
  health: number;
};

export type PayrollRunResult = {
  batchId: number;
  batchRef: string;
  status: string;
  summary: {
    totalGross: number;
    totalNet: number;
    totalEmployerCost: number;
    employeeCount: number;
  };
  lines: PayrollRunLine[];
};

export const payrollApi = {
  listEmployees: (token: string) =>
    apiClient<{ employees: PayrollEmployee[] }>(`/employer/payroll/employees`, { token }),

  fundingStatus: (token: string, required: number) =>
    apiClient<FundingStatus>(`/employer/payroll/funding-status?required=${required}`, { token }),

  run: (token: string, data: RunPayrollInput) =>
    apiClient<PayrollRunResult>(`/employer/payroll/run`, { token, method: "POST", body: data }),
};
