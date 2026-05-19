import { apiClient } from "@/lib/api/client";

export type Wallet = {
  id: number;
  currency: string;
  type: string;
  balance: string;
  address: string | null;
  holder: string | null;
};

export type MonthlyStats = {
  totalPayments: { amount: number; deltaPct: number };
  activeEmployees: { count: number; deltaCount: number };
};

export type Period = "thisYear" | "lastYear" | "thisMonth" | "lastMonth";

export type PayrollExpenses = {
  period: Period;
  dataPoints: number[];
  maxY: number;
};

export type Batch = {
  id: number;
  batchRef: string;
  payPeriod: string;
  totalAmount: number;
  currency: string;
  paymentDate: string;
  status: string;
  employeeCount: number;
};

export type Payment = {
  id: number;
  paymentRef: string;
  employee: string;
  amount: number;
  currency: string;
  status: string;
  paymentDate: string;
};

export type BatchDetails = { batch: Batch; payments: Payment[] };

const path = "/employer/dashboard";

export const dashboardApi = {
  getWallets: (token: string) =>
    apiClient<{ wallets: Wallet[] }>(`${path}/wallets`, { token }),

  getMonthlyStats: (token: string) =>
    apiClient<MonthlyStats>(`${path}/stats`, { token }),

  getPayrollExpenses: (token: string, period: Period) =>
    apiClient<PayrollExpenses>(`${path}/payroll-expenses?period=${period}`, { token }),

  getPayrollBatches: (token: string, limit = 3) =>
    apiClient<{ batches: Batch[] }>(`${path}/payroll-batches?limit=${limit}`, { token }),

  getBatchDetails: (token: string, id: number) =>
    apiClient<BatchDetails>(`${path}/payroll-batches/${id}`, { token }),
};
