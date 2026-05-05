"use client";

import Link from "next/link";
import { ROUTES } from "@/lib/constants/routes";

type Step4ExecuteProps = {
  onBack: () => void;
};

export default function Step4Execute({ onBack }: Step4ExecuteProps) {
  return (
    <>
      <div className="border-b border-theme-subtle px-6 py-5">
        <h2 className="dash-card-section-title dash-card-section-title--inverse">Execute</h2>
        <p className="mt-1 text-sm text-muted">Run payroll and send payments.</p>
      </div>
      <div className="px-6 py-8 text-center text-muted">
        Execute confirmation will appear here.
      </div>
      <div className="flex justify-end gap-3 border-t border-theme-subtle px-6 py-4">
        <button
          type="button"
          onClick={onBack}
          className="btn-theme-outline rounded-lg border px-4 py-2 text-sm font-medium"
        >
          Back
        </button>
        <Link href={ROUTES.employer.payroll}>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg bg-gold-light px-4 py-2 text-sm font-medium text-brand-navy transition hover:opacity-90"
          >
            Done
          </button>
        </Link>
      </div>
    </>
  );
}
