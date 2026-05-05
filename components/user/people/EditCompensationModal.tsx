"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils/cn";

export type EditCompensationForm = {
  paymentMethod: string;
  paymentCurrencyCode: string;
  grossAnnualSalary: string;
  compensationType: string;
  paymentPreference: string;
  workingHours: string;
  shiftSchedule: string;
  workingDaysPerWeek: string;
  probationPeriod: string;
  noticePeriod: string;
};

const CURRENCIES = [
  "AED", "ARS", "AUD", "AZN", "BDT", "BGN", "BHD", "BRL", "CAD", "CHF", "CLP",
  "CNY", "COP", "CZK", "DKK", "DZD", "EGP", "EUR", "GBP", "GEL", "HUF", "IDR",
  "ILS", "INR", "JPY", "KES", "KRW", "KWD", "KZT", "MAD", "MXN", "MYR", "NGN",
  "NOK", "NPR", "NZD", "OMR", "PEN", "PHP", "PKR", "PLN", "QAR", "RON", "RUB",
  "SAR", "SEK", "SGD", "THB", "TRY", "UAH", "USD", "UZS", "VND", "ZAR",
];

const defaultForm: EditCompensationForm = {
  paymentMethod: "",
  paymentCurrencyCode: "",
  grossAnnualSalary: "",
  compensationType: "",
  paymentPreference: "",
  workingHours: "",
  shiftSchedule: "",
  workingDaysPerWeek: "",
  probationPeriod: "",
  noticePeriod: "",
};

interface EditCompensationModalProps {
  open: boolean;
  onClose: () => void;
  initialValues?: Partial<EditCompensationForm>;
  onSave?: (values: EditCompensationForm) => void;
}

/** Edit Compensation & Payment modal – Figma 124-5879. Backdrop #002B5775. */
export default function EditCompensationModal({
  open,
  onClose,
  initialValues,
  onSave,
}: EditCompensationModalProps) {
  const [form, setForm] = useState<EditCompensationForm>(defaultForm);
  const prevOpenRef = useRef(false);

  useEffect(() => {
    if (open) {
      if (!prevOpenRef.current && initialValues) {
        setForm({ ...defaultForm, ...initialValues });
      }
    } else {
      setForm(defaultForm);
    }
    prevOpenRef.current = open;
  }, [open, initialValues]);

  if (!open) return null;

  function update(field: keyof EditCompensationForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSave() {
    onSave?.(form);
    onClose();
  }

  const inputClass =
    "w-full rounded-lg border border-[#DFDFDF] px-3 py-2 text-sm focus:border-[var(--color-dash-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-dash-accent)]";
  const labelClass =
    "edit-personal-label mb-1.5 block text-base font-medium text-gray-700";

  const SelectField = ({
    label,
    required,
    value,
    onChange,
    options,
    placeholder = "Select",
  }: {
    label: string;
    required?: boolean;
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
    placeholder?: string;
  }) => (
    <div>
      <label className={labelClass}>
        {label}
        {required && <span className="edit-personal-asterisk"> *</span>}
      </label>
      <div className="edit-personal-select-wrap relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(inputClass, "edit-personal-dropdown-border")}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span className="edit-personal-dropdown-chevron" aria-hidden>
          <svg viewBox="0 0 12 6" width="12" height="6" fill="none" stroke="#878787dd" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 6, opacity: 1 }}>
            <polyline points="2 0 6 6 10 0" />
          </svg>
        </span>
      </div>
    </div>
  );

  return (
    <>
      <div
        className="fixed inset-0 z-50"
        style={{ backgroundColor: "#002B5775" }}
        aria-hidden
        onClick={onClose}
      />
      <div
        className="edit-personal-details-modal edit-modal-container fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-[calc(100%-2rem)] max-w-4xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl shadow-xl edit-modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-compensation-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between px-4 py-4 edit-modal-header sm:px-6">
          <h2 id="edit-compensation-title" className="dash-card-section-title">
            Edit Compensation & Payment
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="max-h-[calc(90vh-11rem)] min-h-0 overflow-y-auto px-4 py-5 sm:px-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <SelectField
              label="Payment method"
              value={form.paymentMethod}
              onChange={(v) => update("paymentMethod", v)}
              options={[
                { value: "Bank Transfer", label: "Bank Transfer" },
                { value: "Cash", label: "Cash" },
                { value: "Crypto", label: "Crypto" },
                { value: "Other", label: "Other" },
              ]}
              placeholder="Select"
            />
            <div>
              <label className={labelClass}>Payment currency code <span className="edit-personal-asterisk">*</span></label>
              <div className="edit-personal-select-wrap relative">
                <select
                  value={form.paymentCurrencyCode}
                  onChange={(e) => update("paymentCurrencyCode", e.target.value)}
                  className={cn(inputClass, "edit-personal-dropdown-border")}
                >
                  <option value="">Select currency</option>
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <span className="edit-personal-dropdown-chevron" aria-hidden>
                  <svg viewBox="0 0 12 6" width="12" height="6" fill="none" stroke="#878787dd" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 6, opacity: 1 }}>
                    <polyline points="2 0 6 6 10 0" />
                  </svg>
                </span>
              </div>
            </div>
            <div>
              <label className={labelClass}>Gross annual salary <span className="edit-personal-asterisk">*</span></label>
              <input
                type="text"
                value={form.grossAnnualSalary}
                onChange={(e) => update("grossAnnualSalary", e.target.value)}
                placeholder="Enter gross annual salary"
                className={inputClass}
              />
            </div>
            <SelectField
              label="Compensation type"
              required
              value={form.compensationType}
              onChange={(v) => update("compensationType", v)}
              options={[
                { value: "Salary", label: "Salary" },
                { value: "Salary + Bonus", label: "Salary + Bonus" },
                { value: "Contract", label: "Contract" },
                { value: "Hourly", label: "Hourly" },
              ]}
              placeholder="Select"
            />
            <SelectField
              label="Payment Preference"
              value={form.paymentPreference}
              onChange={(v) => update("paymentPreference", v)}
              options={[
                { value: "Monthly", label: "Monthly" },
                { value: "Bi-weekly", label: "Bi-weekly" },
                { value: "Weekly", label: "Weekly" },
                { value: "-", label: "-" },
              ]}
              placeholder="Select"
            />
            <div>
              <label className={labelClass}>Working Hours <span className="edit-personal-asterisk">*</span></label>
              <input
                type="text"
                value={form.workingHours}
                onChange={(e) => update("workingHours", e.target.value)}
                placeholder="Enter working hours"
                className={inputClass}
              />
            </div>
            <SelectField
              label="Shift schedule"
              value={form.shiftSchedule}
              onChange={(v) => update("shiftSchedule", v)}
              options={[
                { value: "Standard (9-5)", label: "Standard (9-5)" },
                { value: "Night shift", label: "Night shift" },
                { value: "Flexible", label: "Flexible" },
                { value: "-", label: "-" },
              ]}
              placeholder="Select"
            />
            <div>
              <label className={labelClass}>Working days per week <span className="edit-personal-asterisk">*</span></label>
              <input
                type="text"
                value={form.workingDaysPerWeek}
                onChange={(e) => update("workingDaysPerWeek", e.target.value)}
                placeholder="Enter working days per week"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Probation period <span className="edit-personal-asterisk">*</span></label>
              <input
                type="text"
                value={form.probationPeriod}
                onChange={(e) => update("probationPeriod", e.target.value)}
                placeholder="Enter probation period"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Notice period <span className="edit-personal-asterisk">*</span></label>
              <input
                type="text"
                value={form.noticePeriod}
                onChange={(e) => update("noticePeriod", e.target.value)}
                placeholder="Enter notice period"
                className={inputClass}
              />
            </div>
          </div>
          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#d1d5db] bg-white px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#f9fafb]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="edit-personal-save-btn rounded-lg px-4 py-2 text-white hover:opacity-90"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
