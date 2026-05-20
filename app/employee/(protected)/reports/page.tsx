"use client";

import { useMyPayslips, useMyProfile } from "@/hooks/employee/useEmployeeData";
import type { Payslip } from "@/lib/api/employee/profile";

function fmtMoney(n: number, currency: string) {
  return n.toLocaleString("en-US", { style: "currency", currency: currency || "USD", maximumFractionDigits: 2 });
}

function downloadCsv(filename: string, payslip: Payslip) {
  const rows = [
    ["Period", "Reference", "Batch", "Amount", "Currency", "Status", "Payment Date"],
    [
      payslip.period ?? "",
      payslip.ref ?? "",
      payslip.batchRef ?? "",
      payslip.amount ?? 0,
      payslip.currency ?? "",
      payslip.status ?? "",
      payslip.paymentDate ?? "",
    ],
  ];
  const escape = (v: string | number) => {
    const s = String(v ?? "");
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
  const { data: payslipData, isLoading, error } = useMyPayslips();
  const { data: profileData } = useMyProfile();
  const payslips = payslipData?.payslips ?? [];
  const profile = profileData?.profile;

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-slate-900">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">My Payslips</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          Pay statements from your employer&apos;s payroll runs.
          {profile?.name ? <> Showing for <span className="font-medium">{profile.name}</span>.</> : null}
        </p>
      </div>

      <div className="rounded-xl bg-white shadow-sm dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs uppercase text-gray-500 dark:border-slate-700 dark:text-slate-400">
                <th className="px-4 py-3">Period</th>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Payment Date</th>
                <th className="px-4 py-3 text-right">Download</th>
              </tr>
            </thead>
            <tbody>
              {error ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm text-red-600">
                    Failed to load payslips: {(error as Error).message}
                  </td>
                </tr>
              ) : isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-slate-400">
                    Loading payslips…
                  </td>
                </tr>
              ) : payslips.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-slate-400">
                    No payslips yet — your employer hasn&apos;t run payroll for you yet.
                  </td>
                </tr>
              ) : (
                payslips.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100 dark:border-slate-800">
                    <td className="px-4 py-3 text-gray-900 dark:text-slate-100">{p.period ?? "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700 dark:text-slate-300">{p.ref}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-slate-100">
                      {fmtMoney(p.amount, p.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          p.status === "completed"
                            ? "rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/40 dark:text-green-300"
                            : p.status === "failed"
                            ? "rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-900/40 dark:text-red-300"
                            : "rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                        }
                      >
                        {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-slate-200">{p.paymentDate?.slice(0, 10) ?? "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => downloadCsv(`payslip-${p.ref}.csv`, p)}
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                      >
                        CSV
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
