"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { generatePeriodReport } from "@/lib/api/admin/reports";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import Button from "@/components/ui/Button";

const REPORTS = ["Custom Period Summary", "Comparative Period Report"];

const INPUT_CLASS =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

export default function PeriodReportsPage() {
  const token = useAdminAuthStore((s) => s.token);
  const [selected, setSelected] = useState(REPORTS[0]);
  const [company, setCompany] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [success, setSuccess] = useState(false);

  const mut = useMutation({
    mutationFn: () => generatePeriodReport(token!, { company, from, to }),
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    },
  });

  return (
    <div className="w-full space-y-6">
      <div className="rounded-[10px] bg-white p-6">
        <h1 className="text-2xl font-semibold text-[#0E1620]">Period Reports</h1>
        <p className="mt-1 text-sm text-gray-500">
          Generate reports for a custom date range or compare two periods.
        </p>
      </div>

      {success && (
        <div className="rounded-xl bg-green-50 border border-green-200 px-5 py-3 text-sm text-green-700">
          Report generated successfully. Your download will begin shortly.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <h2 className="mb-4 text-base font-semibold text-gray-900">Available Reports</h2>
          <ul className="space-y-2">
            {REPORTS.map((r) => (
              <li key={r}>
                <button
                  type="button"
                  onClick={() => setSelected(r)}
                  className={`w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors ${
                    selected === r
                      ? "bg-[#0F50DB] text-white"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {r}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <h2 className="mb-4 text-base font-semibold text-gray-900">Configure: {selected}</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-400">
                  From
                </label>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-400">
                  To
                </label>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-400">
                Company
              </label>
              <input
                type="text"
                placeholder="Filter by company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="primary"
                size="md"
                loading={mut.isPending}
                onClick={() => mut.mutate()}
                className="flex-1"
              >
                Generate
              </Button>
              <Button variant="outline" size="md" className="flex-1">
                Export
              </Button>
            </div>
            {mut.isError && (
              <p className="text-sm text-red-600">{(mut.error as Error).message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
