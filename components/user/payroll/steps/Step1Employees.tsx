"use client";

import { useState } from "react";
import SearchBar from "@/components/shared/SearchBar";

const mockEmployees = [
  { id: "E001", name: "John Doe", department: "Engineering", salary: 2800 },
  { id: "E002", name: "Jane Smith", department: "Product", salary: 2950 },
  { id: "E003", name: "Bob Wilson", department: "Engineering", salary: 2750 },
  { id: "E004", name: "Alice Brown", department: "Design", salary: 2600 },
  { id: "E005", name: "Charlie Davis", department: "Operations", salary: 2400 },
];

type Step1EmployeesProps = {
  onNext: () => void;
  onCancel: () => void;
};

export default function Step1Employees({ onNext, onCancel }: Step1EmployeesProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(["E001", "E002", "E003"]));
  const [search, setSearch] = useState("");

  const filtered = mockEmployees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.id.toLowerCase().includes(search.toLowerCase())
  );

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((e) => e.id)));
    }
  }

  return (
    <>
      <div className="border-b border-theme-subtle px-6 py-5">
        <h2 className="dash-card-section-title dash-card-section-title--inverse">Select employees</h2>
        <p className="mt-1 text-sm text-muted">Choose who to include in this payroll run.</p>
      </div>
      <div className="border-b border-theme-subtle px-6 py-4">
        <SearchBar
          placeholder="Search by name or ID..."
          onSearch={setSearch}
          className="max-w-sm"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-theme-subtle text-left text-xs font-medium uppercase tracking-wide text-muted">
              <th className="px-6 py-4">
                <input
                  type="checkbox"
                  checked={filtered.length > 0 && selected.size === filtered.length}
                  onChange={toggleAll}
                  className="h-4 w-4 rounded border-[var(--color-border-subtle)] bg-brand-surface text-gold-light focus:ring-gold-light"
                />
              </th>
              <th className="px-6 py-4">Employee ID</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Department</th>
              <th className="px-6 py-4">Salary</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border-subtle)]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-muted">
                  No employees found.
                </td>
              </tr>
            ) : (
              filtered.map((emp) => (
                <tr
                  key={emp.id}
                  className="hover:bg-[var(--color-border-subtle)]"
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selected.has(emp.id)}
                      onChange={() => toggle(emp.id)}
                      className="h-4 w-4 rounded border-[var(--color-border-subtle)] bg-brand-surface text-gold-light focus:ring-gold-light"
                    />
                  </td>
                  <td className="px-6 py-4 font-medium text-white">{emp.id}</td>
                  <td className="px-6 py-4 text-white">{emp.name}</td>
                  <td className="px-6 py-4 text-muted">{emp.department}</td>
                  <td className="px-6 py-4 font-medium text-white">
                    ${emp.salary.toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end gap-3 border-t border-theme-subtle px-6 py-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn-theme-outline rounded-lg border px-4 py-2 text-sm font-medium"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={selected.size === 0}
          className="inline-flex items-center justify-center rounded-lg bg-gold-light px-4 py-2 text-sm font-medium text-brand-navy transition hover:opacity-90 disabled:opacity-50"
        >
          Next: Calculate
        </button>
      </div>
    </>
  );
}
