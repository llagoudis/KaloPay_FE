"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils/cn";

export type EditEmploymentForm = {
  jobTitle: string;
  group: string;
  department: string;
  lineManagerEmail: string;
  startDate: string;
  employmentType: string;
  status: string;
  employeeId: string;
  seniorityLevel: string;
  departmentRole: string;
  workLocationCountry: string;
  terminationDate: string;
};

const COUNTRIES = [
  { value: "AF", label: "Afghanistan" }, { value: "AL", label: "Albania" }, { value: "DZ", label: "Algeria" },
  { value: "AR", label: "Argentina" }, { value: "AM", label: "Armenia" }, { value: "AU", label: "Australia" },
  { value: "AT", label: "Austria" }, { value: "AZ", label: "Azerbaijan" }, { value: "BH", label: "Bahrain" },
  { value: "BD", label: "Bangladesh" }, { value: "BE", label: "Belgium" }, { value: "BA", label: "Bosnia and Herzegovina" },
  { value: "BR", label: "Brazil" }, { value: "BG", label: "Bulgaria" }, { value: "CA", label: "Canada" },
  { value: "CL", label: "Chile" }, { value: "CN", label: "China" }, { value: "CO", label: "Colombia" },
  { value: "HR", label: "Croatia" }, { value: "CY", label: "Cyprus" }, { value: "CZ", label: "Czech Republic" },
  { value: "DK", label: "Denmark" }, { value: "EG", label: "Egypt" }, { value: "EE", label: "Estonia" },
  { value: "FI", label: "Finland" }, { value: "FR", label: "France" }, { value: "GE", label: "Georgia" },
  { value: "DE", label: "Germany" }, { value: "GH", label: "Ghana" }, { value: "GR", label: "Greece" },
  { value: "HU", label: "Hungary" }, { value: "IN", label: "India" }, { value: "ID", label: "Indonesia" },
  { value: "IQ", label: "Iraq" }, { value: "IE", label: "Ireland" }, { value: "IL", label: "Israel" },
  { value: "IT", label: "Italy" }, { value: "JP", label: "Japan" }, { value: "JO", label: "Jordan" },
  { value: "KZ", label: "Kazakhstan" }, { value: "KE", label: "Kenya" }, { value: "KW", label: "Kuwait" },
  { value: "LV", label: "Latvia" }, { value: "LB", label: "Lebanon" }, { value: "LT", label: "Lithuania" },
  { value: "LU", label: "Luxembourg" }, { value: "MY", label: "Malaysia" }, { value: "MT", label: "Malta" },
  { value: "MX", label: "Mexico" }, { value: "MA", label: "Morocco" }, { value: "NP", label: "Nepal" },
  { value: "NL", label: "Netherlands" }, { value: "NZ", label: "New Zealand" }, { value: "NG", label: "Nigeria" },
  { value: "NO", label: "Norway" }, { value: "OM", label: "Oman" }, { value: "PK", label: "Pakistan" },
  { value: "PE", label: "Peru" }, { value: "PH", label: "Philippines" }, { value: "PL", label: "Poland" },
  { value: "PT", label: "Portugal" }, { value: "QA", label: "Qatar" }, { value: "RO", label: "Romania" },
  { value: "RU", label: "Russia" }, { value: "SA", label: "Saudi Arabia" }, { value: "RS", label: "Serbia" },
  { value: "SG", label: "Singapore" }, { value: "SK", label: "Slovakia" }, { value: "SI", label: "Slovenia" },
  { value: "ZA", label: "South Africa" }, { value: "KR", label: "South Korea" }, { value: "ES", label: "Spain" },
  { value: "LK", label: "Sri Lanka" }, { value: "SE", label: "Sweden" }, { value: "CH", label: "Switzerland" },
  { value: "TH", label: "Thailand" }, { value: "TN", label: "Tunisia" }, { value: "TR", label: "Turkey" },
  { value: "UA", label: "Ukraine" }, { value: "AE", label: "United Arab Emirates" },
  { value: "UK", label: "United Kingdom" }, { value: "US", label: "United States" },
  { value: "UZ", label: "Uzbekistan" }, { value: "VN", label: "Vietnam" },
];

const defaultForm: EditEmploymentForm = {
  jobTitle: "",
  group: "",
  department: "",
  lineManagerEmail: "",
  startDate: "",
  employmentType: "",
  status: "",
  employeeId: "",
  seniorityLevel: "",
  departmentRole: "",
  workLocationCountry: "",
  terminationDate: "",
};

interface EditEmploymentModalProps {
  open: boolean;
  onClose: () => void;
  initialValues?: Partial<EditEmploymentForm>;
  onSave?: (values: EditEmploymentForm) => void;
}

/** Edit Employment & Role Details modal – Figma 124-5550. Backdrop #002B5775. */
export default function EditEmploymentModal({
  open,
  onClose,
  initialValues,
  onSave,
}: EditEmploymentModalProps) {
  const [form, setForm] = useState<EditEmploymentForm>(defaultForm);
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

  function update(field: keyof EditEmploymentForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSave() {
    onSave?.(form);
    onClose();
  }

  const inputClass =
    "w-full rounded-lg border border-[#DFDFDF] bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[var(--color-dash-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-dash-accent)] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400";
  const labelClass =
    "edit-personal-label mb-1.5 block text-base font-medium text-gray-700 dark:text-slate-200";

  const SelectField = ({
    label,
    required,
    value,
    onChange,
    options,
    placeholder = "Select",
    selectClassName,
  }: {
    label: string;
    required?: boolean;
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
    placeholder?: string;
    selectClassName?: string;
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
          className={cn(inputClass, "edit-personal-dropdown-border", selectClassName)}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
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

  const DateField = ({ label, required, value, onChange }: { label: string; required?: boolean; value: string; onChange: (v: string) => void }) => (
    <div>
      <label className={labelClass}>
        {label}
        {required && <span className="edit-personal-asterisk"> *</span>}
      </label>
      <div className="relative w-full max-w-[364px]">
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(inputClass, "pr-10")}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" aria-hidden style={{ color: "#878787" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
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
        <div className="edit-personal-details-modal edit-modal-container fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-[calc(100%-2rem)] max-w-4xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl shadow-xl edit-modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-employment-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between px-4 py-4 edit-modal-header sm:px-6">
          <h2 id="edit-employment-title" className="dash-card-section-title">
            Edit Employment & Role Details
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
            <div>
              <label className={labelClass}>Job title</label>
              <input
                type="text"
                value={form.jobTitle}
                onChange={(e) => update("jobTitle", e.target.value)}
                placeholder="Enter job title"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Employee ID</label>
              <input
                type="text"
                value={form.employeeId}
                onChange={(e) => update("employeeId", e.target.value)}
                placeholder="Enter Employee ID"
                className={inputClass}
              />
            </div>
            <SelectField
              label="Group (optional)"
              value={form.group}
              onChange={(v) => update("group", v)}
              options={[
                { value: "Product Engineering", label: "Product Engineering" },
                { value: "Operations", label: "Operations" },
              ]}
            />
            <SelectField
              label="Seniority level"
              value={form.seniorityLevel}
              onChange={(v) => update("seniorityLevel", v)}
              options={[
                { value: "L5", label: "L5 (Senior)" },
                { value: "L4", label: "L4" },
                { value: "L3", label: "L3" },
              ]}
            />
            <SelectField
              label="Department"
              value={form.department}
              onChange={(v) => update("department", v)}
              options={[
                { value: "Technology", label: "Technology" },
                { value: "HR", label: "HR" },
                { value: "Finance", label: "Finance" },
              ]}
            />
            <div>
              <label className={labelClass}>Department role</label>
              <input
                type="text"
                value={form.departmentRole}
                onChange={(e) => update("departmentRole", e.target.value)}
                placeholder="Enter department role"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Line Manager email</label>
              <input
                type="email"
                value={form.lineManagerEmail}
                onChange={(e) => update("lineManagerEmail", e.target.value)}
                placeholder="Enter direct manager email"
                className={inputClass}
              />
            </div>
            <SelectField
              label="Work Location/Country"
              value={form.workLocationCountry}
              onChange={(v) => update("workLocationCountry", v)}
              options={COUNTRIES}
              placeholder="Select country"
            />
            <DateField label="Start Date" required value={form.startDate} onChange={(v) => update("startDate", v)} />
            <DateField label="Termination date" value={form.terminationDate} onChange={(v) => update("terminationDate", v)} />
            <SelectField
              label="Employment type"
              required
              value={form.employmentType}
              onChange={(v) => update("employmentType", v)}
              options={[
                { value: "full-time", label: "Full-Time" },
                { value: "part-time", label: "Part-Time" },
                { value: "contract", label: "Contract" },
              ]}
            />
            <div className="edit-personal-details-modal-status-input w-full sm:col-span-2">
            <SelectField
              label="Status"
              required
              value={form.status}
              onChange={(v) => update("status", v)}
              options={[
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
                { value: "on-leave", label: "On Leave" },
              ]}
              selectClassName="edit-personal-details-modal-status-select"
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
