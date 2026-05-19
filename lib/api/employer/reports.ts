import { apiClient } from "@/lib/api/client";

export type PeopleStats = {
  headcount: number;
  starters: number;
  leavers: number;
  terminations: number;
  topCountry: string;
  headcountChart: number[];
  startersChart: number[];
  from: string;
  to: string;
};

export type CompensationStats = {
  totalCompensation: number;
  highestMonth: number;
  lowestMonth: number;
  avgMonthly: number;
  avgMonthlyChart: number[];
  totalCompensationChart: number[];
};

export type PayrollSummaryRow = {
  paymentRef: string;
  employee: string;
  role: string;
  department: string;
  grossPay: number;
  taxDeductions: number;
  netPay: number;
  currency: string;
  status: string;
};

export type PayrollSummary = {
  period: string;
  metrics: {
    totalPayroll: number;
    activeEmployees: number;
    totalTaxes: number;
    employerCost: number;
  };
  rows: PayrollSummaryRow[];
};

export type TaxRow = {
  paymentRef: string;
  employee: string;
  department: string;
  socialInsurance: number;
  healthFund: number;
  incomeTax: number;
  totalDeductions: number;
  currency: string;
};

export type EmployerCostRow = {
  department: string;
  employees: number;
  grossPayroll: number;
  employerSocialInsurance: number;
  benefitsAndBonuses: number;
  totalCost: number;
};

export type AuditLogRow = {
  id: number;
  timestamp: string;
  name: string;
  role: string;
  action: string;
  details: string;
  ipAddress: string;
};

export type RegulatoryMonthlyRow = {
  id: number;
  formType: string;
  formName: string;
  description: string | null;
  period: string;
  dueDate: string;
  status: string;
  submittedDate: string | null;
  amount: number | null;
  currency: string | null;
  employeeCount: number | null;
};

export type RegulatoryDeclarationRow = {
  id: number;
  formType: string;
  formName: string;
  description: string | null;
  period: string;
  dueDate: string;
  status: string;
  submittedDate: string | null;
};

export type Regulatory = {
  monthly: RegulatoryMonthlyRow[];
  declarations: RegulatoryDeclarationRow[];
};

const path = "/employer/reports";

export const reportsApi = {
  getPeopleStats: (token: string) => apiClient<PeopleStats>(`${path}/people`, { token }),
  getCompensationStats: (token: string) => apiClient<CompensationStats>(`${path}/compensation`, { token }),
  getPayrollSummary: (token: string, period?: string) =>
    apiClient<PayrollSummary>(`${path}/payroll-summary${period ? `?period=${period}` : ""}`, { token }),
  getTaxBreakdown: (token: string, period?: string) =>
    apiClient<{ period: string; rows: TaxRow[] }>(`${path}/tax-breakdown${period ? `?period=${period}` : ""}`, { token }),
  getEmployerCost: (token: string, period?: string) =>
    apiClient<{ period: string; rows: EmployerCostRow[] }>(`${path}/employer-cost${period ? `?period=${period}` : ""}`, { token }),
  getAuditLogs: (token: string, limit = 50) =>
    apiClient<{ rows: AuditLogRow[] }>(`${path}/audit-logs?limit=${limit}`, { token }),
  getRegulatory: (token: string) => apiClient<Regulatory>(`${path}/regulatory`, { token }),
};
