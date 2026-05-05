"use client";

import { cn } from "@/lib/utils/cn";

interface AddPeoplePopupProps {
  open: boolean;
  onClose: () => void;
  onEmployee: () => void;
  onMassImport: () => void;
}

/** Add People modal – Figma Payroll (node 80-1860). */
export default function AddPeoplePopup({
  open,
  onClose,
  onEmployee,
  onMassImport,
}: AddPeoplePopupProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:px-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[rgba(130,150,173,0.65)]"
        aria-hidden
        onClick={onClose}
      />

      {/* Modal card */}
      <div className="add-people-modal relative w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#e5e7eb] px-6 py-4 sm:px-7 sm:py-5">
          <h2 className="dash-card-section-title mb-0">Add people</h2>
          <button
            type="button"
            onClick={onClose}
            className="-mr-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="space-y-4 px-6 py-6 sm:px-7 sm:py-7">
          {/* Employee option */}
          <button
            type="button"
            onClick={onEmployee}
            className={cn(
              "flex w-full items-center justify-between rounded-xl border px-4 py-4 text-left transition-colors",
              "border-[#e5e7eb] bg-white"
            )}
          >
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <span className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center text-[#0f50db]" aria-hidden>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="8" width="20" height="13" rx="2" />
                  <path d="M9 8V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v3" />
                  <line x1="2" y1="14" x2="22" y2="14" />
                </svg>
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">Employee</p>
                <p className="mt-1 text-xs text-gray-500">
                  A person who is employed by an organization for a wage or salary.
                </p>
              </div>
            </div>
            <span className="ml-3 shrink-0 text-gray-400">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </span>
          </button>

          <div className="text-center text-xs font-medium text-[#6b7280]">
            or
          </div>

          {/* Mass import option */}
          <button
            type="button"
            onClick={onMassImport}
            className="flex w-full items-center justify-between rounded-xl border border-[#e5e7eb] bg-white px-4 py-4 text-left transition-colors hover:bg-[#f9fafb]"
          >
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <span className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center text-[#8B5CF6]" aria-hidden>
                {/* Multiple people icon – three figure outlines, bright purple */}
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">Mass import</p>
                <p className="mt-1 text-xs text-gray-500">
                  Add workers in bulk with our spreadsheet import feature.
                </p>
              </div>
            </div>
            <span className="ml-3 shrink-0 text-gray-400">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}