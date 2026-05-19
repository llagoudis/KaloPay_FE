"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DASHBOARD_ROUTES } from "@/components/user/dashboard/routes";
import { cn } from "@/lib/utils/cn";
import { useCreatePerson } from "@/hooks/employer/useUserPanel";

const STEPS = [
  { label: "Personal Details", status: (i: number, step: number) => (step === i ? "In-Progress" : i < step ? "Completed" : "Pending") },
  { label: "Address", status: (i: number, step: number) => (step === i ? "In-Progress" : i < step ? "Completed" : "Pending") },
  { label: "Employment & Role Details", status: (i: number, step: number) => (step === i ? "In-Progress" : i < step ? "Completed" : "Pending") },
  { label: "Compensation & Payment", status: (i: number, step: number) => (step === i ? "In-Progress" : i < step ? "Completed" : "Pending") },
  { label: "Bank & Wallet Details", status: (i: number, step: number) => (step === i ? "In-Progress" : i < step ? "Completed" : "Pending") },
];

const defaultPersonalForm = {
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

const defaultAddressForm = {
  streetName: "",
  streetNumber: "",
  flatApartmentNumber: "",
  floor: "",
  postalCode: "",
  provinceRegionState: "",
  city: "",
  country: "",
};

const defaultEmploymentForm = {
  jobTitle: "",
  employeeId: "",
  group: "",
  seniorityLevel: "",
  department: "",
  departmentRole: "",
  lineManagerEmail: "",
  workLocationCountry: "",
  startDate: "",
  terminationDate: "",
  employmentType: "",
  partTimePercentage: "",
  status: "",
};

const defaultCompensationForm = {
  paymentMethod: "",
  paymentPreference: "",
  compensationType: "",
  shiftSchedule: "",
  probationPeriod: "",
  paymentCurrencyCode: "",
  grossAnnualSalary: "",
  workingHours: "",
  workingDaysPerWeek: "",
  noticePeriod: "",
};

const defaultBankWalletForm = {
  bankName: "",
  swiftBic: "",
  defaultPaymentMethod: "",
  digitalWalletAddress: "",
  bankAddress: "",
  iban: "",
  currencyPreference: "",
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

const PHONE_CODES = [
  "+1", "+7", "+20", "+27", "+30", "+31", "+32", "+33", "+34", "+36", "+39", "+40",
  "+41", "+43", "+44", "+45", "+46", "+47", "+48", "+49", "+51", "+52", "+54", "+55",
  "+56", "+57", "+60", "+61", "+62", "+63", "+64", "+65", "+66", "+81", "+82", "+84",
  "+86", "+90", "+91", "+92", "+94", "+98", "+212", "+213", "+216", "+233", "+234",
  "+254", "+351", "+352", "+353", "+355", "+356", "+357", "+358", "+359", "+370",
  "+371", "+372", "+374", "+375", "+380", "+381", "+385", "+386", "+387", "+420",
  "+421", "+966", "+971", "+972", "+974", "+977", "+994", "+995", "+998",
];

const CURRENCIES = [
  "AED", "ARS", "AUD", "AZN", "BDT", "BGN", "BHD", "BRL", "CAD", "CHF", "CLP",
  "CNY", "COP", "CZK", "DKK", "DZD", "EGP", "EUR", "GBP", "GEL", "GHS", "HUF",
  "IDR", "ILS", "INR", "IQD", "IRR", "JOD", "JPY", "KES", "KRW", "KWD", "KZT",
  "LBP", "LKR", "MAD", "MXN", "MYR", "NGN", "NOK", "NPR", "NZD", "OMR", "PEN",
  "PHP", "PKR", "PLN", "QAR", "RON", "RUB", "SAR", "SEK", "SGD", "THB", "TND",
  "TRY", "TWD", "UAH", "USD", "UZS", "VND", "ZAR",
];

const WORK_VISA_TYPES = [
  "Work Permit", "Skilled Worker Visa", "H-1B Visa (US)", "EU Blue Card",
  "Intra-company Transfer", "Employer Sponsored Visa", "Tier 2 Visa (UK)",
  "Self-employed Visa", "Student Visa (with work rights)", "Permanent Residency",
  "No Visa Required",
];

/** Empty: CSS hides native mm/dd/yyyy; overlay shows “Select” only (no add-employee-field-muted — its !important color was defeating transparency). */
function AddEmployeeDateField({
  label,
  value,
  onChange,
  inputClassName,
  labelClassName,
  mutedIfEmptyClass,
}: {
  label: ReactNode;
  value: string;
  onChange: (v: string) => void;
  inputClassName: string;
  labelClassName: string;
  mutedIfEmptyClass: (v: string) => string;
}) {
  const empty = value.trim() === "";
  return (
    <div>
      <label className={labelClassName}>{label}</label>
      <div className="relative">
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            inputClassName,
            empty ? "add-employee-date-empty" : mutedIfEmptyClass(value)
          )}
        />
        {empty && (
          <span className="add-employee-infield-hint-text pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2" aria-hidden>
            Select
          </span>
        )}
      </div>
    </div>
  );
}

/** Required field asterisk – Poppins 500, 16px, line-height 20px, #FF0000 */
const REQUIRED_MARK = (
  <>
    {" "}
    <span className="inline align-middle text-[16px] font-medium leading-5 tracking-normal text-[#FF0000] [font-family:var(--font-poppins),Poppins,sans-serif]">
      *
    </span>
  </>
);

/** Add an Employee – Figma 82-2550: 5-step wizard, first step Personal Details. */
export default function AddEmployeePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [personalForm, setPersonalForm] = useState(defaultPersonalForm);
  const [addressForm, setAddressForm] = useState(defaultAddressForm);
  const [employmentForm, setEmploymentForm] = useState(defaultEmploymentForm);
  const [compensationForm, setCompensationForm] = useState(defaultCompensationForm);
  const [bankWalletForm, setBankWalletForm] = useState(defaultBankWalletForm);

  function update(field: keyof typeof defaultPersonalForm, value: string) {
    setPersonalForm((prev) => ({ ...prev, [field]: value }));
  }
  function updateAddress(field: keyof typeof defaultAddressForm, value: string) {
    setAddressForm((prev) => ({ ...prev, [field]: value }));
  }
  function updateEmployment(field: keyof typeof defaultEmploymentForm, value: string) {
    setEmploymentForm((prev) => ({ ...prev, [field]: value }));
  }
  function updateCompensation(field: keyof typeof defaultCompensationForm, value: string) {
    setCompensationForm((prev) => ({ ...prev, [field]: value }));
  }
  function updateBankWallet(field: keyof typeof defaultBankWalletForm, value: string) {
    setBankWalletForm((prev) => ({ ...prev, [field]: value }));
  }

  const createMutation = useCreatePerson();

  async function handleSubmit() {
    setLoading(true);
    try {
      const firstName = personalForm.name.trim();
      const lastName = personalForm.surname.trim();
      const email = (personalForm.workEmail || personalForm.personalEmail).trim();
      if (!firstName || !lastName || !email) {
        alert("First name, surname, and an email are required");
        return;
      }
      const countryCode = addressForm.country || employmentForm.workLocationCountry;
      const country = COUNTRIES.find((c) => c.value === countryCode)?.label ?? countryCode ?? null;

      const result = await createMutation.mutateAsync({
        // Personal
        firstName,
        middleName: personalForm.middleName || null,
        lastName,
        email,
        personalEmail: personalForm.personalEmail || null,
        workEmail: personalForm.workEmail || null,
        nationality: personalForm.nationality || null,
        dateOfBirth: personalForm.dateOfBirth || null,
        gender: personalForm.gender || null,
        maritalStatus: personalForm.maritalStatus || null,
        nationalIdNumber: personalForm.nationalIdNumber || null,
        passportNumber: personalForm.passportNumber || null,
        primaryCountryCode: personalForm.primaryCountryCode || null,
        primaryPhone: personalForm.primaryContact || null,
        emergencyCountryCode: personalForm.emergencyCountryCode || null,
        emergencyPhone: personalForm.emergencyContact || null,
        nationalInsuranceNo: personalForm.nationalInsuranceNo || null,
        tic: personalForm.tic || null,
        dependants: personalForm.dependants || null,
        workPermitVisa: personalForm.workPermitVisa || null,
        residencePermitExpiry: personalForm.residencePermitExpiry || null,
        // Address
        streetName: addressForm.streetName || null,
        streetNo: addressForm.streetNumber || null,
        flatApartmentNo: addressForm.flatApartmentNumber || null,
        floor: addressForm.floor || null,
        postalCode: addressForm.postalCode || null,
        city: addressForm.city || null,
        province: addressForm.provinceRegionState || null,
        country,
        // Employment
        employeeIdExternal: employmentForm.employeeId || null,
        groupName: employmentForm.group || null,
        seniorityLevel: employmentForm.seniorityLevel || null,
        departmentRole: employmentForm.departmentRole || null,
        lineManagerEmail: employmentForm.lineManagerEmail || null,
        workLocationCountry: employmentForm.workLocationCountry || null,
        partTimePercentage: employmentForm.partTimePercentage || null,
        jobTitle: employmentForm.jobTitle || undefined,
        department: employmentForm.department || undefined,
        employmentType: employmentForm.employmentType || undefined,
        employeeStatus: employmentForm.status || "active",
        contractStart: employmentForm.startDate || undefined,
        contractEnd: employmentForm.terminationDate || undefined,
        // Compensation
        paymentMethod: compensationForm.paymentMethod || null,
        paymentPreference: compensationForm.paymentPreference || null,
        compensationType: compensationForm.compensationType || null,
        shiftSchedule: compensationForm.shiftSchedule || null,
        probationPeriod: compensationForm.probationPeriod || null,
        workingHours: compensationForm.workingHours || null,
        workingDaysPerWeek: compensationForm.workingDaysPerWeek || null,
        noticePeriod: compensationForm.noticePeriod || null,
        grossAnnualSalary: compensationForm.grossAnnualSalary
          ? Number(compensationForm.grossAnnualSalary)
          : undefined,
        paymentCurrencyCode: compensationForm.paymentCurrencyCode || undefined,
        // Bank/Wallet
        bankName: bankWalletForm.bankName || null,
        bankAddress: bankWalletForm.bankAddress || null,
        swiftBic: bankWalletForm.swiftBic || null,
        iban: bankWalletForm.iban || null,
        defaultPaymentMethod: bankWalletForm.defaultPaymentMethod || null,
        currencyPreference: bankWalletForm.currencyPreference || null,
        digitalWalletAddress: bankWalletForm.digitalWalletAddress || null,
      });

      router.push(DASHBOARD_ROUTES.personDetail(String(result.id)));
    } catch (e) {
      alert((e as Error).message ?? "Failed to create employee");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-[#DFDFDF] bg-transparent px-3 py-2 align-middle text-[16px] font-medium leading-5 tracking-normal text-[#1F2937] placeholder:font-normal placeholder:text-[14px] placeholder:leading-[100%] placeholder:tracking-normal placeholder:text-[color:var(--color-add-employee-date-icon)] placeholder:[font-family:var(--font-poppins),Poppins,sans-serif] [font-family:var(--font-poppins),Poppins,sans-serif] focus:outline-none dark:border-[#DFDFDF] dark:text-[#1F2937] dark:placeholder:font-normal dark:placeholder:text-[14px] dark:placeholder:leading-[100%] dark:placeholder:tracking-normal dark:placeholder:text-[color:var(--color-add-employee-date-icon)] dark:placeholder:[font-family:var(--font-poppins),Poppins,sans-serif]";
  /** Empty select / date: muted #A8AABC (see globals .add-employee-field-muted) */
  const mutedIfEmpty = (value: string) => (value.trim() === "" ? "add-employee-field-muted" : "");
  const labelClass =
    "add-employee-label mb-1.5 block align-middle text-[16px] font-medium leading-5 tracking-normal text-[#1F2937] [font-family:var(--font-poppins),Poppins,sans-serif]";

  return (
    <div className="min-h-full w-full bg-dash-page" data-dashboard-theme data-page="add-employee">
      <div className="dash-shell pb-6 pt-10">
        {/* Header card: back arrow (shaft + arrowhead) + title, no hover */}
        <div className="add-employee-header-card mb-6 rounded-xl border border-[#f5f6fa] bg-[#f5f6fa] px-6 py-5">
          <div className="flex items-center gap-3">
            <Link
              href={DASHBOARD_ROUTES.people}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#000000] hover:bg-[#e5e7eb]"
              aria-label="Back"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" />
                <path d="m12 19-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="align-middle text-[24px] font-semibold leading-[100%] tracking-[-0.01em] text-[#000000] [font-family:var(--font-poppins),Poppins,sans-serif]">
              Add an Employee
            </h1>
          </div>
        </div>

        {/* Stepper: line 1→2, 2→3, 3→4, 4→5; har icon apni heading ke seedha upar */}
        <div className="add-employee-stepper-card mb-8 overflow-x-auto rounded-xl bg-[#f5f6fa] p-6">
          {/* Row 1: har cell mein line + circle + line, circle center pe taaki heading ke upar ho */}
          <div className="flex min-w-[700px] w-full items-center">
            {STEPS.map((s, i) => {
              const isActive = step === i;
              const isCompleted = i < step;
              const isPending = i > step;
              return (
                <div key={`row1-${s.label}`} className="flex flex-1 items-center min-w-0">
                  {i === 0 ? (
                    <div className="flex-1 min-w-0 shrink" aria-hidden />
                  ) : (
                    <div
                      className={cn(
                        "add-employee-stepper-connector h-1 flex-1 min-w-[8px] shrink",
                        step >= i
                          ? "add-employee-stepper-connector--completed bg-[var(--color-dash-accent)]"
                          : "bg-[#CCCCCC]"
                      )}
                      aria-hidden
                    />
                  )}
                  <div
                    className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                      isActive &&
                        "border-[5.33px] border-white bg-[#2563eb] text-white shadow-[0_0_0_1px_#1e40af,0_2px_8px_rgba(37,99,235,0.35)]",
                      isCompleted &&
                        "bg-[#2563eb] text-white",
                      isPending &&
                        "add-employee-step-pending border-[5.33px] border-[#CCCCCC] bg-transparent text-[#d4d4d4]"
                    )}
                  >
                    {isCompleted ? "✓" : i + 1}
                  </div>
                  {i < STEPS.length - 1 ? (
                    <div
                      className={cn(
                        "add-employee-stepper-connector h-1 flex-1 min-w-[8px] shrink",
                        step > i
                          ? "add-employee-stepper-connector--completed bg-[var(--color-dash-accent)]"
                          : "bg-[#CCCCCC]"
                      )}
                      aria-hidden
                    />
                  ) : (
                    <div className="flex-1 min-w-0 shrink" aria-hidden />
                  )}
                </div>
              );
            })}
          </div>
          {/* Row 2: heading + status har icon ke neeche (centered) */}
          <div className="flex min-w-[700px] w-full mt-3">
            {STEPS.map((s, i) => {
              const statusLabel = s.status(i, step);
              return (
                <div key={s.label} className="flex min-w-0 flex-1 flex-col items-center gap-[10px]">
                  <span className="add-employee-stepper-label min-w-0 text-center text-[11px] font-medium leading-tight tracking-normal text-[#000000] [font-family:var(--font-poppins),Poppins,sans-serif]">
                    {s.label}
                  </span>
                  <span
                    className={cn(
                      "add-employee-status-pill inline-flex items-center justify-center whitespace-nowrap",
                      statusLabel === "Pending" &&
                        "box-border h-[22px] shrink-0 rounded-[8px] border border-solid border-[#A8AABC] py-1 px-2.5 text-[10px] font-normal leading-[100%] tracking-normal text-[#A8AABC] [font-family:var(--font-poppins),Poppins,sans-serif]",
                      statusLabel === "In-Progress" &&
                        "box-border h-[22px] shrink-0 rounded-[8px] bg-[#E9F4FF] py-1 px-2.5 text-[10px] font-medium leading-[100%] tracking-normal text-[#0F4FDB] [font-family:var(--font-poppins),Poppins,sans-serif]",
                      statusLabel === "Completed" &&
                        "box-border inline-flex h-[22px] shrink-0 items-center justify-center rounded-[8px] bg-[#DFFFFE] px-2.5 py-1 text-[10px] font-medium leading-[100%] tracking-normal text-[#35CAC3] [font-family:var(--font-poppins),Poppins,sans-serif]"
                    )}
                    data-status={statusLabel === "In-Progress" ? "in-progress" : statusLabel === "Completed" ? "completed" : "pending"}
                  >
                    {statusLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <section className="add-employee-form-section rounded-xl bg-[#f5f6fa] p-6 sm:p-8">
          {step === 0 && (
            <div className="space-y-6">
              <h2 className="dash-card-section-title">Personal Details</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="grid grid-cols-1 gap-6 sm:col-span-2 sm:grid-cols-3">
                  <div>
                    <label className={labelClass}>Name{REQUIRED_MARK}</label>
                    <input
                      type="text"
                      value={personalForm.name}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder="Enter name"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Middle name</label>
                    <input
                      type="text"
                      value={personalForm.middleName}
                      onChange={(e) => update("middleName", e.target.value)}
                      placeholder="Enter last name"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Surname{REQUIRED_MARK}</label>
                    <input
                      type="text"
                      value={personalForm.surname}
                      onChange={(e) => update("surname", e.target.value)}
                      placeholder="Enter surname"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="sm:col-span-2" />
                <div className="relative">
                  <label className={labelClass}>Personal email{REQUIRED_MARK}</label>
                  <input
                    type="email"
                    value={personalForm.personalEmail}
                    onChange={(e) => update("personalEmail", e.target.value)}
                    placeholder="Enter your personal email"
                    className={cn(inputClass, "pr-10")}
                  />
                  <span className="absolute right-3 top-9 text-gray-400 add-employee-icon-muted" aria-hidden>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </span>
                </div>
                <div className="relative">
                  <label className={labelClass}>Work email{REQUIRED_MARK}</label>
                  <input
                    type="email"
                    value={personalForm.workEmail}
                    onChange={(e) => update("workEmail", e.target.value)}
                    placeholder="Enter your work email"
                    className={cn(inputClass, "pr-10")}
                  />
                  <span className="absolute right-3 top-9 text-gray-400 add-employee-icon-muted" aria-hidden>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </span>
                </div>
                <div>
                  <label className={labelClass}>Nationality{REQUIRED_MARK}</label>
                  <select
                    value={personalForm.nationality}
                    onChange={(e) => update("nationality", e.target.value)}
                    className={cn(inputClass, mutedIfEmpty(personalForm.nationality))}
                  >
                    <option value="">Select nationality</option>
                    {COUNTRIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <AddEmployeeDateField
                  label={
                    <>
                      Date of birth{REQUIRED_MARK}
                    </>
                  }
                  value={personalForm.dateOfBirth}
                  onChange={(v) => update("dateOfBirth", v)}
                  inputClassName={inputClass}
                  labelClassName={labelClass}
                  mutedIfEmptyClass={mutedIfEmpty}
                />
                <div>
                  <label className={labelClass}>Gender{REQUIRED_MARK}</label>
                  <select
                    value={personalForm.gender}
                    onChange={(e) => update("gender", e.target.value)}
                    className={cn(inputClass, mutedIfEmpty(personalForm.gender))}
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Marital Status{REQUIRED_MARK}</label>
                  <select
                    value={personalForm.maritalStatus}
                    onChange={(e) => update("maritalStatus", e.target.value)}
                    className={cn(inputClass, mutedIfEmpty(personalForm.maritalStatus))}
                  >
                    <option value="">Select</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>National ID Number{REQUIRED_MARK}</label>
                  <input
                    type="text"
                    value={personalForm.nationalIdNumber}
                    onChange={(e) => update("nationalIdNumber", e.target.value)}
                    placeholder="Enter National ID Number"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Passport Number{REQUIRED_MARK}</label>
                  <input
                    type="text"
                    value={personalForm.passportNumber}
                    onChange={(e) => update("passportNumber", e.target.value)}
                    placeholder="Enter Passport Number"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Primary contact no{REQUIRED_MARK}</label>
                  <div className="flex gap-2">
                    <select
                      value={personalForm.primaryCountryCode}
                      onChange={(e) => update("primaryCountryCode", e.target.value)}
                      className={cn(inputClass, "w-24 shrink-0")}
                    >
                      {PHONE_CODES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input
                      type="tel"
                      value={personalForm.primaryContact}
                      onChange={(e) => update("primaryContact", e.target.value)}
                      placeholder="980-00-000-00"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Emergency contact no{REQUIRED_MARK}</label>
                  <div className="flex gap-2">
                    <select
                      value={personalForm.emergencyCountryCode}
                      onChange={(e) => update("emergencyCountryCode", e.target.value)}
                      className={cn(inputClass, "w-24 shrink-0")}
                    >
                      {PHONE_CODES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input
                      type="tel"
                      value={personalForm.emergencyContact}
                      onChange={(e) => update("emergencyContact", e.target.value)}
                      placeholder="980-00-000-00"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>National insurance no{REQUIRED_MARK}</label>
                  <input
                    type="text"
                    value={personalForm.nationalInsuranceNo}
                    onChange={(e) => update("nationalInsuranceNo", e.target.value)}
                    placeholder="Enter national insurance no"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>TIC (Tax Identification code)</label>
                  <input
                    type="text"
                    value={personalForm.tic}
                    onChange={(e) => update("tic", e.target.value)}
                    placeholder="Enter TIC"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Dependants{REQUIRED_MARK}</label>
                  <select
                    value={personalForm.dependants}
                    onChange={(e) => update("dependants", e.target.value)}
                    className={cn(inputClass, mutedIfEmpty(personalForm.dependants))}
                  >
                    <option value="" />
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3+">3+</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Work permit/Visa</label>
                  <select
                    value={personalForm.workPermitVisa}
                    onChange={(e) => update("workPermitVisa", e.target.value)}
                    className={cn(inputClass, mutedIfEmpty(personalForm.workPermitVisa))}
                  >
                    <option value="">Select</option>
                    {WORK_VISA_TYPES.map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <AddEmployeeDateField
                  label={
                    <>
                      Residence Permit Expiry{REQUIRED_MARK}
                    </>
                  }
                  value={personalForm.residencePermitExpiry}
                  onChange={(v) => update("residencePermitExpiry", v)}
                  inputClassName={inputClass}
                  labelClassName={labelClass}
                  mutedIfEmptyClass={mutedIfEmpty}
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <h2 className="dash-card-section-title">Address</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Left column */}
                <div className="space-y-6">
                  <div>
                    <label className={labelClass}>Street name{REQUIRED_MARK}</label>
                    <input
                      type="text"
                      value={addressForm.streetName}
                      onChange={(e) => updateAddress("streetName", e.target.value)}
                      placeholder="Enter street name."
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Flat/Apartment number (if applicable)</label>
                    <input
                      type="text"
                      value={addressForm.flatApartmentNumber}
                      onChange={(e) => updateAddress("flatApartmentNumber", e.target.value)}
                      placeholder="Enter flat/apartment number."
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Postal code{REQUIRED_MARK}</label>
                    <input
                      type="text"
                      value={addressForm.postalCode}
                      onChange={(e) => updateAddress("postalCode", e.target.value)}
                      placeholder="Enter postal code."
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>City{REQUIRED_MARK}</label>
                    <input
                      type="text"
                      value={addressForm.city}
                      onChange={(e) => updateAddress("city", e.target.value)}
                      placeholder="Enter city."
                      className={inputClass}
                    />
                  </div>
                </div>
                {/* Right column */}
                <div className="space-y-6">
                  <div>
                    <label className={labelClass}>Street number{REQUIRED_MARK}</label>
                    <input
                      type="text"
                      value={addressForm.streetNumber}
                      onChange={(e) => updateAddress("streetNumber", e.target.value)}
                      placeholder="Enter street number."
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Floor</label>
                    <input
                      type="text"
                      value={addressForm.floor}
                      onChange={(e) => updateAddress("floor", e.target.value)}
                      placeholder="Enter floor."
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Province/region/state</label>
                    <input
                      type="text"
                      value={addressForm.provinceRegionState}
                      onChange={(e) => updateAddress("provinceRegionState", e.target.value)}
                      placeholder="Enter province/region/state."
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Country{REQUIRED_MARK}</label>
                    <select
                      value={addressForm.country}
                      onChange={(e) => updateAddress("country", e.target.value)}
                      className={cn(inputClass, mutedIfEmpty(addressForm.country))}
                    >
                      <option value="">Country</option>
                      {COUNTRIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="dash-card-section-title">Employment & Role Details</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Left column – Figma 90-4084 */}
                <div className="space-y-6">
                  <div>
                    <label className={labelClass}>Job title</label>
                    <input
                      type="text"
                      value={employmentForm.jobTitle}
                      onChange={(e) => updateEmployment("jobTitle", e.target.value)}
                      placeholder="Enter job title"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Group</label>
                    <select
                      value={employmentForm.group}
                      onChange={(e) => updateEmployment("group", e.target.value)}
                      className={cn(inputClass, mutedIfEmpty(employmentForm.group))}
                    >
                      <option value="">Select</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Department</label>
                    <select
                      value={employmentForm.department}
                      onChange={(e) => updateEmployment("department", e.target.value)}
                      className={cn(inputClass, mutedIfEmpty(employmentForm.department))}
                    >
                      <option value="">Select</option>
                      <option value="engineering">Engineering</option>
                      <option value="hr">HR</option>
                      <option value="finance">Finance</option>
                      <option value="operations">Operations</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Line Manager email</label>
                    <input
                      type="email"
                      value={employmentForm.lineManagerEmail}
                      onChange={(e) => updateEmployment("lineManagerEmail", e.target.value)}
                      placeholder="Enter direct manager email"
                      className={inputClass}
                    />
                  </div>
                  <AddEmployeeDateField
                    label={
                      <>
                        Start Date{REQUIRED_MARK}
                      </>
                    }
                    value={employmentForm.startDate}
                    onChange={(v) => updateEmployment("startDate", v)}
                    inputClassName={inputClass}
                    labelClassName={labelClass}
                    mutedIfEmptyClass={mutedIfEmpty}
                  />
                  <div>
                    <label className={labelClass}>Employment type{REQUIRED_MARK}</label>
                    <select
                      value={employmentForm.employmentType}
                      onChange={(e) => updateEmployment("employmentType", e.target.value)}
                      className={cn(inputClass, mutedIfEmpty(employmentForm.employmentType))}
                    >
                      <option value="">Select</option>
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                      <option value="intern">Intern</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Status{REQUIRED_MARK}</label>
                    <select
                      value={employmentForm.status}
                      onChange={(e) => updateEmployment("status", e.target.value)}
                      className={cn(inputClass, mutedIfEmpty(employmentForm.status))}
                    >
                      <option value="">Select</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="on-leave">On Leave</option>
                    </select>
                  </div>
                </div>
                {/* Right column – Figma 90-4084 */}
                <div className="space-y-6">
                  <div>
                    <label className={labelClass}>Employee ID</label>
                    <input
                      type="text"
                      value={employmentForm.employeeId}
                      onChange={(e) => updateEmployment("employeeId", e.target.value)}
                      placeholder="Enter Employee ID"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Seniority level</label>
                    <select
                      value={employmentForm.seniorityLevel}
                      onChange={(e) => updateEmployment("seniorityLevel", e.target.value)}
                      className={cn(inputClass, mutedIfEmpty(employmentForm.seniorityLevel))}
                    >
                      <option value="">Select</option>
                      <option value="junior">Junior</option>
                      <option value="mid">Mid</option>
                      <option value="senior">Senior</option>
                      <option value="lead">Lead</option>
                      <option value="manager">Manager</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Department role</label>
                    <input
                      type="text"
                      value={employmentForm.departmentRole}
                      onChange={(e) => updateEmployment("departmentRole", e.target.value)}
                      placeholder="Enter department role"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Work Location/Country</label>
                    <select
                      value={employmentForm.workLocationCountry}
                      onChange={(e) => updateEmployment("workLocationCountry", e.target.value)}
                      className={cn(inputClass, mutedIfEmpty(employmentForm.workLocationCountry))}
                    >
                      <option value="">Select</option>
                      {COUNTRIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <AddEmployeeDateField
                    label="Termination date"
                    value={employmentForm.terminationDate}
                    onChange={(v) => updateEmployment("terminationDate", v)}
                    inputClassName={inputClass}
                    labelClassName={labelClass}
                    mutedIfEmptyClass={mutedIfEmpty}
                  />
                  <div>
                    <label className={labelClass}>Part time percentage</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={employmentForm.partTimePercentage}
                      onChange={(e) => updateEmployment("partTimePercentage", e.target.value)}
                      placeholder="Enter part time percentage"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="dash-card-section-title">Compensation & Payment</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Left column – Figma 90-4479 */}
                <div className="space-y-6">
                  <div>
                    <label className={labelClass}>Payment method</label>
                    <select
                      value={compensationForm.paymentMethod}
                      onChange={(e) => updateCompensation("paymentMethod", e.target.value)}
                      className={cn(inputClass, mutedIfEmpty(compensationForm.paymentMethod))}
                    >
                      <option value="">Select</option>
                      <option value="bank-transfer">Bank Transfer</option>
                      <option value="wallet">Wallet</option>
                      <option value="cash">Cash</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Payment Preference{REQUIRED_MARK}</label>
                    <select
                      value={compensationForm.paymentPreference}
                      onChange={(e) => updateCompensation("paymentPreference", e.target.value)}
                      className={cn(inputClass, mutedIfEmpty(compensationForm.paymentPreference))}
                    >
                      <option value="">Select</option>
                      <option value="monthly">Monthly</option>
                      <option value="bi-weekly">Bi-weekly</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Compensation type{REQUIRED_MARK}</label>
                    <select
                      value={compensationForm.compensationType}
                      onChange={(e) => updateCompensation("compensationType", e.target.value)}
                      className={cn(inputClass, mutedIfEmpty(compensationForm.compensationType))}
                    >
                      <option value="">Select</option>
                      <option value="salary">Salary</option>
                      <option value="hourly">Hourly</option>
                      <option value="contract">Contract</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Shift schedule</label>
                    <select
                      value={compensationForm.shiftSchedule}
                      onChange={(e) => updateCompensation("shiftSchedule", e.target.value)}
                      className={cn(inputClass, mutedIfEmpty(compensationForm.shiftSchedule))}
                    >
                      <option value="">Select</option>
                      <option value="day">Day</option>
                      <option value="night">Night</option>
                      <option value="flexible">Flexible</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Probation period</label>
                    <select
                      value={compensationForm.probationPeriod}
                      onChange={(e) => updateCompensation("probationPeriod", e.target.value)}
                      className={cn(inputClass, mutedIfEmpty(compensationForm.probationPeriod))}
                    >
                      <option value="">Select</option>
                      <option value="0">None</option>
                      <option value="1">1 month</option>
                      <option value="3">3 months</option>
                      <option value="6">6 months</option>
                    </select>
                  </div>
                </div>
                {/* Right column – Figma 90-4479 */}
                <div className="space-y-6">
                  <div>
                    <label className={labelClass}>Payment currency code{REQUIRED_MARK}</label>
                    <select
                      value={compensationForm.paymentCurrencyCode}
                      onChange={(e) => updateCompensation("paymentCurrencyCode", e.target.value)}
                      className={cn(inputClass, mutedIfEmpty(compensationForm.paymentCurrencyCode))}
                    >
                      <option value="">Select</option>
                      {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Gross annual salary{REQUIRED_MARK}</label>
                    <input
                      type="number"
                      min={0}
                      value={compensationForm.grossAnnualSalary}
                      onChange={(e) => updateCompensation("grossAnnualSalary", e.target.value)}
                      placeholder="Enter gross annual salary"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Working Hours</label>
                    <input
                      type="text"
                      value={compensationForm.workingHours}
                      onChange={(e) => updateCompensation("workingHours", e.target.value)}
                      placeholder="Enter"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Working days per week</label>
                    <select
                      value={compensationForm.workingDaysPerWeek}
                      onChange={(e) => updateCompensation("workingDaysPerWeek", e.target.value)}
                      className={cn(inputClass, mutedIfEmpty(compensationForm.workingDaysPerWeek))}
                    >
                      <option value="">Select</option>
                      <option value="5">5</option>
                      <option value="6">6</option>
                      <option value="7">7</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Notice period</label>
                    <input
                      type="number"
                      min={0}
                      value={compensationForm.noticePeriod}
                      onChange={(e) => updateCompensation("noticePeriod", e.target.value)}
                      placeholder="Enter"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="dash-card-section-title">Bank & Wallet Details</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Left column – Figma 90-4740 */}
                <div className="space-y-6">
                  <div>
                    <label className={labelClass}>Bank name{REQUIRED_MARK}</label>
                    <input
                      type="text"
                      value={bankWalletForm.bankName}
                      onChange={(e) => updateBankWallet("bankName", e.target.value)}
                      placeholder="Enter bank name"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>SWIFT/BIC{REQUIRED_MARK}</label>
                    <input
                      type="text"
                      value={bankWalletForm.swiftBic}
                      onChange={(e) => updateBankWallet("swiftBic", e.target.value)}
                      placeholder="Enter SWIFT/BIC"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Default payment method (fiat or crypto)</label>
                    <input
                      type="text"
                      value={bankWalletForm.defaultPaymentMethod}
                      onChange={(e) => updateBankWallet("defaultPaymentMethod", e.target.value)}
                      placeholder="Enter"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Digital wallet address (if crypto)</label>
                    <input
                      type="text"
                      value={bankWalletForm.digitalWalletAddress}
                      onChange={(e) => updateBankWallet("digitalWalletAddress", e.target.value)}
                      placeholder="Enter Digital wallet address"
                      className={inputClass}
                    />
                  </div>
                </div>
                {/* Right column – Figma 90-4740 */}
                <div className="space-y-6">
                  <div>
                    <label className={labelClass}>Bank address{REQUIRED_MARK}</label>
                    <input
                      type="text"
                      value={bankWalletForm.bankAddress}
                      onChange={(e) => updateBankWallet("bankAddress", e.target.value)}
                      placeholder="Enter bank address"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>IBAN{REQUIRED_MARK}</label>
                    <input
                      type="text"
                      value={bankWalletForm.iban}
                      onChange={(e) => updateBankWallet("iban", e.target.value)}
                      placeholder="Enter IBAN"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Currency Preference</label>
                    <input
                      type="text"
                      value={bankWalletForm.currencyPreference}
                      onChange={(e) => updateBankWallet("currencyPreference", e.target.value)}
                      placeholder="Enter"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-between">
            <div>
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="add-employee-back-btn rounded-lg border border-[#d1d5db] bg-[#f3f4f6] px-4 py-2 text-sm font-medium text-[#374151] transition hover:bg-[#e5e7eb]"
                >
                  Back
                </button>
              )}
            </div>
            <div>
              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="inline-flex items-center justify-center rounded-lg bg-[var(--color-dash-accent)] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#0D46C3]"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-lg bg-[var(--color-dash-accent)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? "Adding…" : "Add Employee"}
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
