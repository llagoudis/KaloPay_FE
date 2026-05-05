"use client";

type Step2CalculateProps = {
  onNext: () => void;
  onBack: () => void;
};

export default function Step2Calculate({ onNext, onBack }: Step2CalculateProps) {
  return (
    <>
      <div className="border-b border-theme-subtle px-6 py-5">
        <h2 className="dash-card-section-title dash-card-section-title--inverse">Calculate payroll</h2>
        <p className="mt-1 text-sm text-muted">Review deductions and totals.</p>
      </div>
      <div className="px-6 py-8 text-center text-muted">
        Calculation summary will appear here.
      </div>
      <div className="flex justify-end gap-3 border-t border-theme-subtle px-6 py-4">
        <button
          type="button"
          onClick={onBack}
          className="btn-theme-outline rounded-lg border px-4 py-2 text-sm font-medium"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center justify-center rounded-lg bg-gold-light px-4 py-2 text-sm font-medium text-brand-navy transition hover:opacity-90"
        >
          Next: Review
        </button>
      </div>
    </>
  );
}
