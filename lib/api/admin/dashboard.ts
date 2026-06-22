import { apiClient } from "@/lib/api/client";

export interface DashboardStats {
  totalCompanies: number;
  totalEmployees: number;
  ytdPayroll: number;
  nextMonthPayroll: number;
  monthlyRevenue: number;
  baseFeeTotal: number;
  perEmpTotal: number;
  balances: { code: string; label: string; amount: number; color: string }[];
  clients: { company: string; employees: number; payroll: number; baseFee: number; perEmp: number; charge: number }[];
  payrollTrend: { labels: string[]; gross: number[]; net: number[] };
}

export function getDashboardStats(token: string) {
  return apiClient<DashboardStats>("/admin/dashboard", { token });
}
