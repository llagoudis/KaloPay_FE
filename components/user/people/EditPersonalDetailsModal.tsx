"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils/cn";

export type EditPersonalForm = {
  name: string;
  middleName: string;
  surname: string;
  personalEmail: string;
  workEmail: string;
  nationality: string;
  dateOfBirth: string;
  gender: string;
  maritalStatus: string;
  nationalIdNumber: string;
  passportNumber: string;
  primaryCountryCode: string;
  primaryContact: string;
  emergencyCountryCode: string;
  emergencyContact: string;
  nationalInsuranceNo: string;
  tic: string;
  dependants: string;
  workPermitVisa: string;
  residencePermitExpiry: string;
};

const defaultForm: EditPersonalForm = {
  name: "",
  middleName: "",
  surname: "",
  personalEmail: "",
  workEmail: "",
  nationality: "",
  dateOfBirth: "",
  gender: "",
  maritalStatus: "",
  nationalIdNumber: "",
  passportNumber: "",
  primaryCountryCode: "+977",
  primaryContact: "",
  emergencyCountryCode: "+977",
  emergencyContact: "",
  nationalInsuranceNo: "",
  tic: "",
  dependants: "",
  workPermitVisa: "",
  residencePermitExpiry: "",
};

const COUNTRY_PHONE_OPTIONS = [
  "+1", "+7", "+20", "+27", "+30", "+31", "+32", "+33", "+34", "+36", "+39", "+40",
  "+41", "+43", "+44", "+45", "+46", "+47", "+48", "+49", "+51", "+52", "+54", "+55",
  "+56", "+57", "+60", "+61", "+62", "+63", "+64", "+65", "+66", "+81", "+82", "+84",
  "+86", "+90", "+91", "+92", "+94", "+98", "+212", "+213", "+216", "+233", "+234",
  "+254", "+351", "+352", "+353", "+355", "+356", "+357", "+358", "+359", "+370",
  "+371", "+372", "+374", "+375", "+380", "+381", "+385", "+386", "+387", "+420",
  "+421", "+966", "+971", "+972", "+974", "+977", "+994", "+995", "+998",
];

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

interface EditPersonalDetailsModalProps {
  open: boolean;
  onClose: () => void;
  initialValues?: Partial<EditPersonalForm>;
  onSave?: (values: EditPersonalForm) => void;
}

/** Edit Personal Details modal – Figma 124-4121. Backdrop #002B5775. */
export default function EditPersonalDetailsModal({
  open,
  onClose,
  initialValues,
  onSave,
}: EditPersonalDetailsModalProps) {
  const [form, setForm] = useState<EditPersonalForm>(defaultForm);
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

  function update(field: keyof EditPersonalForm, value: string) {
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

  return (
    <>
      {/* Backdrop – Figma #002B5775 */}
      <div
        className="fixed inset-0 z-50"
        style={{ backgroundColor: "#002B5775" }}
        aria-hidden
        onClick={onClose}
      />
      <div
        className="edit-personal-details-modal edit-modal-container fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-[calc(100vw-1.5rem)] max-w-4xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl shadow-xl edit-modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-personal-details-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between px-6 py-4 edit-modal-header">
          <h2 id="edit-personal-details-title" className="dash-card-section-title">
            Edit Personal Details
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

        <div className="max-h-[calc(90vh-11rem)] min-h-0 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="grid grid-cols-1 gap-6 sm:col-span-2 sm:grid-cols-3">
              <div>
                <label className={labelClass}>Name <span className="edit-personal-asterisk">*</span></label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Enter name"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Middle name</label>
                <input
                  type="text"
                  value={form.middleName}
                  onChange={(e) => update("middleName", e.target.value)}
                  placeholder="Enter last name"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Surname <span className="edit-personal-asterisk">*</span></label>
                <input
                  type="text"
                  value={form.surname}
                  onChange={(e) => update("surname", e.target.value)}
                  placeholder="Enter surname"
                  className={inputClass}
                />
              </div>
            </div>
            <div className="sm:col-span-2" />
            <div className="relative w-full max-w-[364px]">
              <label className={labelClass}>Personal email <span className="edit-personal-asterisk">*</span></label>
              <input
                type="email"
                value={form.personalEmail}
                onChange={(e) => update("personalEmail", e.target.value)}
                placeholder="Enter your personal email"
                className={cn(inputClass, "pr-10")}
              />
              <span className="absolute right-3 top-9 text-gray-400" aria-hidden>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>
            </div>
            <div className="relative w-full max-w-[364px]">
              <label className={labelClass}>Work email <span className="edit-personal-asterisk">*</span></label>
              <input
                type="email"
                value={form.workEmail}
                onChange={(e) => update("workEmail", e.target.value)}
                placeholder="Enter your work email"
                className={cn(inputClass, "pr-10")}
              />
              <span className="absolute right-3 top-9 text-gray-400" aria-hidden>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>
            </div>
            <div>
              <label className={labelClass}>Nationality <span className="edit-personal-asterisk">*</span></label>
              <div className="edit-personal-select-wrap relative">
                <select
                  value={form.nationality}
                  onChange={(e) => update("nationality", e.target.value)}
                  className={cn(inputClass, "edit-personal-dropdown-border")}
                >
                  <option value="">Select nationality</option>
                  {COUNTRIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                <span className="edit-personal-dropdown-chevron" aria-hidden>
                  <svg viewBox="0 0 12 6" width="12" height="6" fill="none" stroke="#878787dd" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 6, opacity: 1 }}>
                    <polyline points="2 0 6 6 10 0" />
                  </svg>
                </span>
              </div>
            </div>
            <div>
              <label className={labelClass}>Date of birth <span className="edit-personal-asterisk">*</span></label>
              <div className="relative w-full max-w-[364px]">
                <input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => update("dateOfBirth", e.target.value)}
                  className={cn(inputClass, "pr-10", !form.dateOfBirth && "edit-personal-date-empty")}
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
            <div>
              <label className={labelClass}>Gender <span className="edit-personal-asterisk">*</span></label>
              <div className="edit-personal-select-wrap relative">
                <select
                  required
                  value={form.gender}
                  onChange={(e) => update("gender", e.target.value)}
                  className={cn(inputClass, "edit-personal-dropdown-border")}
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <span className="edit-personal-dropdown-chevron" aria-hidden>
                  <svg viewBox="0 0 12 6" width="12" height="6" fill="none" stroke="#878787dd" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 6, opacity: 1 }}>
                    <polyline points="2 0 6 6 10 0" />
                  </svg>
                </span>
              </div>
            </div>
            <div>
              <label className={labelClass}>Marital Status <span className="edit-personal-asterisk">*</span></label>
              <div className="edit-personal-select-wrap relative">
                <select
                  required
                  value={form.maritalStatus}
                  onChange={(e) => update("maritalStatus", e.target.value)}
                  className={cn(inputClass, "edit-personal-dropdown-border")}
                >
                  <option value="">Select</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                </select>
                <span className="edit-personal-dropdown-chevron" aria-hidden>
                  <svg viewBox="0 0 12 6" width="12" height="6" fill="none" stroke="#878787dd" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 6, opacity: 1 }}>
                    <polyline points="2 0 6 6 10 0" />
                  </svg>
                </span>
              </div>
            </div>
            <div>
              <label className={labelClass}>National ID Number <span className="edit-personal-asterisk">*</span></label>
              <input
                type="text"
                value={form.nationalIdNumber}
                onChange={(e) => update("nationalIdNumber", e.target.value)}
                placeholder="Enter National ID Number"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Passport Number <span className="edit-personal-asterisk">*</span></label>
              <input
                type="text"
                value={form.passportNumber}
                onChange={(e) => update("passportNumber", e.target.value)}
                placeholder="Enter Passport Number"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Primary contact no <span className="edit-personal-asterisk">*</span></label>
              <div className="edit-personal-contact-combo flex w-full max-w-[364px] items-center overflow-hidden rounded-lg border border-[#DFDFDF]" style={{ borderRadius: 8, minHeight: 30 }}>
                <div className="flex shrink-0 items-center gap-1.5 border-r border-[#DFDFDF] py-2 pl-3 pr-2" style={{ minWidth: 110 }}>
                  <select
                    value={form.primaryCountryCode}
                    onChange={(e) => update("primaryCountryCode", e.target.value)}
                    className="edit-personal-contact-country-select min-w-[3.5rem] border-0 bg-transparent p-0 text-sm focus:ring-0"
                    aria-label="Country code"
                  >
                    {COUNTRY_PHONE_OPTIONS.map((code) => (
                      <option key={code} value={code}>{code}</option>
                    ))}
                  </select>
                  <span className="pointer-events-none shrink-0 text-[#878787]" aria-hidden>
                    <svg viewBox="0 0 12 6" width="12" height="6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="2 0 6 6 10 0" />
                    </svg>
                  </span>
                </div>
                <input
                  type="tel"
                  value={form.primaryContact}
                  onChange={(e) => update("primaryContact", e.target.value)}
                  placeholder="123 456 7890"
                  className={cn(inputClass, "min-w-0 flex-1 rounded-none border-0 border-l-0 py-2 pl-3 pr-4 focus:ring-0")}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Emergency contact no <span className="edit-personal-asterisk">*</span></label>
              <div className="edit-personal-contact-combo flex w-full max-w-[364px] items-center overflow-hidden rounded-lg border border-[#DFDFDF]" style={{ borderRadius: 8, minHeight: 30 }}>
                <div className="flex shrink-0 items-center gap-1.5 border-r border-[#DFDFDF] py-2 pl-3 pr-2" style={{ minWidth: 110 }}>
                  <select
                    value={form.emergencyCountryCode}
                    onChange={(e) => update("emergencyCountryCode", e.target.value)}
                    className="edit-personal-contact-country-select min-w-[3.5rem] border-0 bg-transparent p-0 text-sm focus:ring-0"
                    aria-label="Country code"
                  >
                    {COUNTRY_PHONE_OPTIONS.map((code) => (
                      <option key={code} value={code}>{code}</option>
                    ))}
                  </select>
                  <span className="pointer-events-none shrink-0 text-[#878787]" aria-hidden>
                    <svg viewBox="0 0 12 6" width="12" height="6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="2 0 6 6 10 0" />
                    </svg>
                  </span>
                </div>
                <input
                  type="tel"
                  value={form.emergencyContact}
                  onChange={(e) => update("emergencyContact", e.target.value)}
                  placeholder="123 456 7890"
                  className={cn(inputClass, "min-w-0 flex-1 rounded-none border-0 border-l-0 py-2 pl-3 pr-4 focus:ring-0")}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>National insurance no <span className="edit-personal-asterisk">*</span></label>
              <input
                type="text"
                value={form.nationalInsuranceNo}
                onChange={(e) => update("nationalInsuranceNo", e.target.value)}
                placeholder="Enter national insurance no"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>TIC (Tax Identification code)</label>
              <input
                type="text"
                value={form.tic}
                onChange={(e) => update("tic", e.target.value)}
                placeholder="Enter TIC"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Dependants <span className="edit-personal-asterisk">*</span></label>
              <div className="edit-personal-select-wrap relative">
                <select
                  required
                  value={form.dependants}
                  onChange={(e) => update("dependants", e.target.value)}
                  className={cn(inputClass, "edit-personal-dropdown-border")}
                >
                  <option value="">Select</option>
                  <option value="0">0</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3+">3+</option>
                </select>
                <span className="edit-personal-dropdown-chevron" aria-hidden>
                  <svg viewBox="0 0 12 6" width="12" height="6" fill="none" stroke="#878787dd" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 6, opacity: 1 }}>
                    <polyline points="2 0 6 6 10 0" />
                  </svg>
                </span>
              </div>
            </div>
            <div>
              <label className={labelClass}>Work permit/Visa</label>
              <div className="edit-personal-select-wrap relative">
                <select
                  value={form.workPermitVisa}
                  onChange={(e) => update("workPermitVisa", e.target.value)}
                  className={cn(
                    inputClass,
                    "edit-personal-dropdown-border",
                    !form.workPermitVisa && "edit-personal-select-empty-value"
                  )}
                >
                  <option value="">Select</option>
                </select>
                <span className="edit-personal-dropdown-chevron" aria-hidden>
                  <svg viewBox="0 0 12 6" width="12" height="6" fill="none" stroke="#878787dd" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 6, opacity: 1 }}>
                    <polyline points="2 0 6 6 10 0" />
                  </svg>
                </span>
              </div>
            </div>
            <div>
              <label className={labelClass}>Residence Permit Expiry <span className="edit-personal-asterisk">*</span></label>
              <div className="relative w-full max-w-[364px]">
                <input
                  type="date"
                  value={form.residencePermitExpiry}
                  onChange={(e) => update("residencePermitExpiry", e.target.value)}
                  className={cn(inputClass, "pr-10", !form.residencePermitExpiry && "edit-personal-date-empty")}
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
