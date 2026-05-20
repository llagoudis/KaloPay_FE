"use client";

import { useMemo } from "react";
import { useEmployeeAuthStore } from "@/store/employeeAuthStore";

type Payslip = {
  id: string;
  period: string;
  gross: number;
  tax: number;
  net: number;
  currency: string;
  status: "Paid" | "Processing";
};

function placeholderPayslips(): Payslip[] {
  const now = new Date();
  const months: Payslip[] = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const period = `${d.toLocaleString("en-US", { month: "long" })} ${d.getFullYear()}`;
    months.push({
      id: `ps-${d.getFullYear()}-${d.getMonth() + 1}`,
      period,
      gross: 4500,
      tax: 980,
      net: 3520,
      currency: "USD",
      status: i === 0 ? "Processing" : "Paid",
    });
  }
  return months;
}

function fmtMoney(n: number, currency: string) {
  return n.toLocaleString("en-US", { style: "currency", currency, maximumFractionDigits: 2 });
}

function downloadCsv(filename: string, payslip: Payslip) {
  const rows = [
    ["Period", "Gross", "Tax", "Net", "Currency", "Status"],
    [payslip.period, payslip.gross, payslip.tax, payslip.net, payslip.currency, payslip.status],
  ];
  const escape = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = rows.map((r) => r.map(escape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function EmployeeReportsPage() {
  const user = useEmployeeAuthStore((s) => s.user);
  const payslips = useMemo(placeholderPayslips, []);

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-slate-900">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">My Payslips</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          Download monthly statements for the last six months.
          {user?.name ? <> Showing for <span className="font-medium">{user.name}</span>.</> : null}
        </p>
      </div>

      <div className="rounded-xl bg-white shadow-sm dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs uppercase text-gray-500 dark:border-slate-700 dark:text-slate-400">
                <th className="px-4 py-3">Period</th>
                <th className="px-4 py-3">Gross</th>
                <th className="px-4 py-3">Tax</th>
                <th className="px-4 py-3">Net</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Download</th>
              </tr>
            </thead>
            <tbody>
              {payslips.map((p) => (
                <tr key={p.id} className="border-b border-gray-100 dark:border-slate-800">
                  <td className="px-4 py-3 text-gray-900 dark:text-slate-100">{p.period}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-slate-200">{fmtMoney(p.gross, p.currency)}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-slate-200">{fmtMoney(p.tax, p.currency)}</td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-slate-100">{fmtMoney(p.net, p.currency)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        p.status === "Paid"
                          ? "rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/40 dark:text-green-300"
                          : "rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                      }
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => downloadCsv(`payslip-${p.id}.csv`, p)}
                      className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                    >
                      CSV
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-gray-500 dark:text-slate-400">
        Note: amounts shown are placeholders until your employer connects payroll. Actual figures
        will appear here once payroll has been run for your company.
      </p>
    </div>
  );
}
