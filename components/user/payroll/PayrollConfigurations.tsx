"use client";

import { useMemo, useState } from "react";
import { usePayrollEmployees } from "@/hooks/employer/useUserPanel";
import PayslipEditor, { derivePayslipEmployee, type PayslipEmployee } from "./PayslipEditor";

/**
 * Payroll Configurations — pick an employee, then edit their standing payslip
 * setup with the same {@link PayslipEditor} used in the batch flow (standalone
 * mode: no back button, batchRef "CONFIG").
 */
export default function PayrollConfigurations() {
  const { data, isLoading } = usePayrollEmployees();

  const employees = useMemo<PayslipEmployee[]>(
    () => (data?.employees ?? []).map((e, i) =>
      derivePayslipEmployee(
        { id: e.id, name: e.name, department: e.department, salary: e.monthlyGross, currency: e.currency },
        i,
      )
    ),
    [data],
  );

  // `selectedId` holds the user's explicit choice (null = "use default").
  const [selectedId, setSelectedId] = useState<number | null>(null);
  // Effective selection, derived during render: the chosen employee if still
  // present, otherwise the first available. No effect / no setState cascade.
  const selected =
    (selectedId != null ? employees.find((e) => e.id === selectedId) : undefined) ??
    employees[0] ??
    null;

  return (
    <div className="space-y-0">
      <div className="flex flex-wrap items-end justify-between gap-4 rounded-xl bg-[var(--dash-card,#fff)] px-6 py-5 shadow-sm ring-1 ring-gray-100">
        <div>
          <h2 className="text-xl font-semibold text-[#0E1620]">Payroll Configurations</h2>
          <p className="mt-1.5 text-[13.5px] text-gray-500">
            Per-employee payroll setup — configure earnings, deductions, contributions and vacations for each person.
          </p>
        </div>
        <div className="min-w-[280px]">
          <label className="mb-1.5 block text-[12.5px] font-medium text-gray-400">Employee</label>
          <select
            value={selected?.id ?? ""}
            onChange={(e) => setSelectedId(e.target.value ? Number(e.target.value) : null)}
            className="h-[42px] w-full rounded-lg border border-gray-200 bg-white px-3.5 text-sm text-[#0E1620] outline-none focus:border-[#0F50DB]"
          >
            {employees.length === 0 && <option value="">{isLoading ? "Loading employees…" : "No active employees"}</option>}
            {employees.map((e) => (
              <option key={e.id} value={e.id}>{e.name} — {e.department}</option>
            ))}
          </select>
        </div>
      </div>

      {selected ? (
        <PayslipEditor key={selected.id} employee={selected} employees={employees} batchRef="CONFIG" hideBack onSelect={(emp) => setSelectedId(emp.id)} />
      ) : (
        <div className="mt-5 rounded-xl bg-[var(--dash-card,#fff)] px-7 py-8 text-sm text-gray-400 shadow-sm ring-1 ring-gray-100">
          {isLoading ? "Loading employees…" : "No active employees to configure."}
        </div>
      )}
    </div>
  );
}
