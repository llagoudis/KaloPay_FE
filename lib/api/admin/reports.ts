import { apiClient } from "@/lib/api/client";

export interface ReportParams {
  company?: string;
  employee?: string;
  from?: string;
  to?: string;
  period?: string;
}

export function generatePayrollReport(token: string, params: ReportParams) {
  return apiClient<{ url?: string; data?: unknown }>("/admin/reports/payroll", {
    token,
    method: "POST",
    body: params,
  });
}

export function generateMonthlyReport(token: string, params: ReportParams) {
  return apiClient<{ url?: string; data?: unknown }>("/admin/reports/monthly", {
    token,
    method: "POST",
    body: params,
  });
}

export function generatePeriodReport(token: string, params: ReportParams) {
  return apiClient<{ url?: string; data?: unknown }>("/admin/reports/period", {
    token,
    method: "POST",
    body: params,
  });
}

export function generateAnnualReport(token: string, params: ReportParams) {
  return apiClient<{ url?: string; data?: unknown }>("/admin/reports/annual", {
    token,
    method: "POST",
    body: params,
  });
}
