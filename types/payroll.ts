export interface PayrollRun {
  id: string;
  companyId: string;
  period: string;
  totalAmount: number;
  currency: string;
  employeeCount: number;
  status: "draft" | "pending" | "processing" | "completed" | "failed";
  createdAt: string;
  executedAt?: string;
}

export interface PayrollItem {
  id: string;
  payrollRunId: string;
  employeeId: string;
  employeeName: string;
  grossSalary: number;
  deductions: number;
  netSalary: number;
  currency: string;
}
