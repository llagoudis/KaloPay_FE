"use client";

import UserReportsScreen from "@/components/user/reports/UserReportsScreen";

/**
 * Main nav "Reports" → general Reports dashboard:
 * People section, Compensation section, Available Reports list.
 * Payroll-specific reports live under Payroll → Payroll Reports (/user/payroll/reports).
 */
export default function ReportsPage() {
  return <UserReportsScreen />;
}
