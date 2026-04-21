"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import { createEmployee } from "@/lib/api/admin/employees";
import { ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";
const LABEL_STYLE: React.CSSProperties = {
  fontFamily: "var(--font-poppins), Poppins, sans-serif",
  fontWeight: 500,
  fontSize: "16px",
  lineHeight: "20px",
  letterSpacing: "0%",
  color: "#1F2937",
};

const DROPDOWN_ARROW_COLOR = "#878787DD";

const SELECT_FIELD_STYLE = { border: "1px solid #E5E7EB", backgroundColor: "#FFFFFF" };

function SelectWithArrow({ children, className, ...props }: React.ComponentPropsWithoutRef<"select">) {
  return (
    <div className="relative">
      <select
        className={className}
        style={{ appearance: "none", paddingRight: "2.5rem", ...SELECT_FIELD_STYLE }}
        {...props}
      >
        {children}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={{ color: DROPDOWN_ARROW_COLOR }}>
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </span>
    </div>
  );
}

const STEPS = [
  { id: 1, label: "Personal Details" },
  { id: 2, label: "Address" },
  { id: 3, label: "Employment & Role Details" },
  { id: 4, label: "Compensation & Payment" },
  { id: 5, label: "Bank & Wallet Details" },
] as const;

export default function AdminAddEmployeePage() {
  const router = useRouter();
  const token = useAdminAuthStore((s) => s.token);
  const [submitting, setSubmitting] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [personalEmail, setPersonalEmail] = useState("");
  const [workEmail] = useState("");
  const [jobTitle] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [employmentType, setEmploymentType] = useState("");
  const [employeeStatus, setEmployeeStatus] = useState("");
  const [seniorityLevel, setSeniorityLevel] = useState("");
  const [department, setDepartment] = useState("");
  // Step 4: Compensation & Payment
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentPreference, setPaymentPreference] = useState("");
  const [compensationType, setCompensationType] = useState("");
  const [paymentCurrencyCode, setPaymentCurrencyCode] = useState("");
  const [grossAnnualSalary, setGrossAnnualSalary] = useState("");
  const [varComp1EffectiveDate, setVarComp1EffectiveDate] = useState("");
  const [varComp1Frequency, setVarComp1Frequency] = useState("");
  const [varComp1Type, setVarComp1Type] = useState("");
  const [varComp1Title, setVarComp1Title] = useState("");
  const [varComp1Amount, setVarComp1Amount] = useState("");
  // Step 5: Bank & Wallet Details
  const [bankName, setBankName] = useState("");
  const [bankAddress, setBankAddress] = useState("");
  const [swiftBic, setSwiftBic] = useState("");
  const [iban, setIban] = useState("");
  const [usdtErcWallet, setUsdtErcWallet] = useState("");
  const [usdcErcWallet, setUsdcErcWallet] = useState("");
  const [usdcPolyWallet, setUsdcPolyWallet] = useState("");
  const [btcWallet, setBtcWallet] = useState("");

  return (
    <div className="w-full space-y-6" data-page="add-employee">
      {/* Page title */}
      <div
        className="add-employee-header-card border border-gray-200 bg-white px-6 py-5 shadow-sm"
        style={{ borderRadius: "16px" }}
      >
        <h1
          className="admin-page-heading font-semibold"
          style={{
            fontFamily: "var(--font-poppins), Poppins, sans-serif",
            fontSize: "22px",
            lineHeight: "28px",
            color: "#0E1620",
          }}
        >
          Add New Individual
        </h1>
      </div>

      {/* Stepper — line: completed portion blue, baaki grey */}
      <div
        className="add-employee-stepper-card w-full overflow-x-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:overflow-visible"
        style={{ backgroundColor: "#F8F9FB" }}
      >
        {/* gap-0: line uses left/right 84px — extra flex gap breaks center-to-center on narrow scroll */}
        <div className="employee-stepper-row relative flex min-w-[860px] items-start justify-between gap-0 md:min-w-0">
          {/* Lines sirf 48px icon band me — center hamesha icon ke center se match (desktop + responsive scroll) */}
          <div
            className="pointer-events-none absolute left-0 right-0 top-0 z-0 h-12"
            aria-hidden
          >
            <div
              className="employee-stepper-track add-employee-stepper-connector absolute left-[84px] right-[84px] top-1/2 z-0 h-[5.33px] -translate-y-1/2 bg-[#F2F2F2]"
            />
            {currentStep >= 2 && (
              <div
                className="employee-stepper-progress absolute left-[84px] top-1/2 z-0 h-[5.33px] -translate-y-1/2 bg-[#0F50DB]"
                style={{
                  width: `calc((100% - 168px) * ${(currentStep - 1) / 4})`,
                }}
              />
            )}
          </div>
          {STEPS.map((step) => {
            const isActive = step.id === currentStep;
            const isPending = step.id > currentStep;
            const isCompleted = step.id < currentStep;
            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center text-center">
                <div className="relative flex flex-shrink-0" style={{ width: 48, height: 48 }}>
                  {/* Andar wala circle: 36x36, top 6px left 6px, border-radius 40px */}
                  <div
                    className={cn(
                      "add-employee-step-circle absolute flex items-center justify-center rounded-full",
                      isCompleted && "add-employee-step-circle--completed",
                      isActive && "add-employee-step-circle--active",
                      isPending && "add-employee-step-circle--pending"
                    )}
                    style={{
                      width: 36,
                      height: 36,
                      top: 6,
                      left: 6,
                      borderRadius: "40px",
                      opacity: 1,
                      border: isCompleted ? "2px solid #FFFFFF" : isActive ? "2px solid #2962FF" : "5.33px solid #F2F2F2",
                      boxShadow: isCompleted || isActive ? "0 0 0 2px #2962FF" : undefined,
                      backgroundColor: isCompleted ? "#2962FF" : "#FFFFFF",
                      fontFamily: "var(--font-poppins), Poppins, sans-serif",
                      fontWeight: 500,
                      fontSize: "24px",
                      lineHeight: "100%",
                      letterSpacing: "0%",
                      color: isCompleted ? "#FFFFFF" : isActive ? "#2962FF" : "#9CA3AF",
                    }}
                  >
                    {isCompleted ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      step.id
                    )}
                  </div>
                </div>
                <span
                  className="add-employee-stepper-label block whitespace-nowrap px-2 text-xs font-medium sm:text-sm md:px-0"
                  style={{
                    fontFamily: "var(--font-poppins), Poppins, sans-serif",
                    color: "#1F2937",
                    marginTop: "8px",
                  }}
                >
                  {step.label}
                </span>
                <span
                  className="add-employee-status-pill inline-flex whitespace-nowrap text-[10px] font-normal sm:text-xs"
                  data-status={isActive ? "in-progress" : isCompleted ? "completed" : "pending"}
                  style={{
                    fontFamily: "var(--font-poppins), Poppins, sans-serif",
                    fontWeight: isActive || isCompleted ? 500 : 400,
                    lineHeight: "100%",
                    letterSpacing: "0%",
                    padding: "4px 12px",
                    borderRadius: "8px",
                    backgroundColor: isActive ? "#EBF2FF" : isCompleted ? "#DFFFFE" : "#F3F4F6",
                    color: isActive ? "#2962FF" : isCompleted ? "#35CAC3" : "#A8AABC",
                    border: isActive || isCompleted ? undefined : "1px solid #A8AABC",
                    marginTop: "6px",
                  }}
                >
                  {isActive ? "In-Progress" : isCompleted ? "Completed" : "Pending"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form: Step 1 - Personal Details */}
      {currentStep === 1 && (
        <div className="add-employee-form-section rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2
            className="mb-6 font-semibold"
            style={{
              fontFamily: "var(--font-poppins), Poppins, sans-serif",
              fontSize: "18px",
              lineHeight: "24px",
              color: "#1F2937",
            }}
          >
            Personal Details
          </h2>
          <form
            className="employee-step-form grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              setCurrentStep(2);
            }}
          >
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                Legal first name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter first name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400"
              />
            </div>
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                Legal last name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400"
              />
            </div>
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                Personal email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your personal email"
                  value={personalEmail}
                  onChange={(e) => setPersonalEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-gray-900 placeholder-gray-400"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
              </div>
            </div>
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                Work email
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your work email"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-gray-900 placeholder-gray-400"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
              </div>
            </div>
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                Nationality
              </label>
              <SelectWithArrow className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 bg-white">
                <option value="">Select nationality</option>
                <option value="American">American</option>
              </SelectWithArrow>
            </div>
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                Date of birth <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Select"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-gray-900 placeholder-gray-400"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
              </div>
            </div>
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                Identification Type
              </label>
              <SelectWithArrow className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 bg-white">
                <option value="passport">Passport</option>
              </SelectWithArrow>
            </div>
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                Enter passport no <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter passport no"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400"
              />
            </div>
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                Primary contact no <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-1">
                <SelectWithArrow className="w-24 rounded-lg border border-gray-300 px-2 py-2 text-gray-900 bg-white">
                  <option value="+977">+977</option>
                </SelectWithArrow>
                <input
                  type="tel"
                  placeholder="980-00-000-00"
                  className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                Emergency contact no <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-1">
                <SelectWithArrow className="w-24 rounded-lg border border-gray-300 px-2 py-2 text-gray-900 bg-white">
                  <option value="+977">+977</option>
                </SelectWithArrow>
                <input
                  type="tel"
                  placeholder="980-00-000-00"
                  className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                National insurance no <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter national insurance no"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400"
              />
            </div>
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                TIC (Tax Identification code)
              </label>
              <input
                type="text"
                placeholder="Enter TIC"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end pt-6">
              <button
                type="submit"
                className="rounded-lg px-5 py-2.5 text-sm font-medium text-white"
                style={{ backgroundColor: "#0F50DB", borderRadius: "8px" }}
              >
                Next
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Step 2: Address — Figma 473-5361 */}
      {currentStep === 2 && (
        <div className="add-employee-form-section rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2
            className="mb-6 font-semibold"
            style={{
              fontFamily: "var(--font-poppins), Poppins, sans-serif",
              fontSize: "18px",
              lineHeight: "24px",
              color: "#1F2937",
            }}
          >
            Address
          </h2>
          <form
            className="employee-step-form grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              setCurrentStep(3);
            }}
          >
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                Street name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter street name"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400"
              />
            </div>
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                Street number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter street number"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400"
              />
            </div>
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                Flat/Appartment number (if applicable)
              </label>
              <input
                type="text"
                placeholder="Enter flat/appartment number"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400"
              />
            </div>
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                Floor <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter floor"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400"
              />
            </div>
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                Postal code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter postal code"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400"
              />
            </div>
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                Province/region/state
              </label>
              <input
                type="text"
                placeholder="Enter province/region/state"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400"
              />
            </div>
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter city"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400"
              />
            </div>
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                Select country
              </label>
              <SelectWithArrow className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 bg-white">
                <option value="">Select country</option>
                <option value="USA">USA</option>
                <option value="Cyprus">Cyprus</option>
              </SelectWithArrow>
            </div>
            <div className="sm:col-span-2 flex justify-between pt-6">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium hover:bg-gray-50"
                style={{ color: "#6B7280", borderRadius: "8px" }}
              >
                Back
              </button>
              <button
                type="submit"
                className="rounded-lg px-5 py-2.5 text-sm font-medium text-white"
                style={{ backgroundColor: "#0F50DB", borderRadius: "8px" }}
              >
                Next
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Step 3: Employment & Role Details — Figma 473-5762 */}
      {currentStep === 3 && (
        <div className="add-employee-form-section rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2
            className="mb-6 font-semibold"
            style={{
              fontFamily: "var(--font-poppins), Poppins, sans-serif",
              fontSize: "18px",
              lineHeight: "24px",
              color: "#1F2937",
            }}
          >
            Employment & Role Details
          </h2>
          <form
            className="employee-step-form grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              setCurrentStep(4);
            }}
          >
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                Legal entity <span className="text-red-500">*</span>
              </label>
              <input type="text" placeholder="Enter legal entity" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400" />
            </div>
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                Group (optional)
              </label>
              <input type="text" placeholder="Enter group" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400" />
            </div>
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                Job title
              </label>
              <input type="text" placeholder="Enter job title" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400" />
            </div>
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                Seniority level
              </label>
              <SelectWithArrow
                value={seniorityLevel}
                onChange={(e) => setSeniorityLevel(e.target.value)}
                className={`w-full rounded-lg border border-gray-300 px-3 py-2 bg-white ${seniorityLevel === "" ? "text-gray-500" : "text-gray-900"}`}
              >
                <option value="">Select</option>
              </SelectWithArrow>
            </div>
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                Scope of work
              </label>
              <input type="text" placeholder="Enter scope of work" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400" />
            </div>
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                Department
              </label>
              <SelectWithArrow
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className={`w-full rounded-lg border border-gray-300 px-3 py-2 bg-white ${department === "" ? "text-gray-500" : "text-gray-900"}`}
              >
                <option value="">Select</option>
              </SelectWithArrow>
            </div>
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                Department role
              </label>
              <input type="text" placeholder="Enter department role" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400" />
            </div>
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                Direct manager email
              </label>
              <input type="email" placeholder="Enter direct manager email" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400" />
            </div>
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                Contract start date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input type="text" placeholder="Select" className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-gray-900 placeholder-gray-400" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: DROPDOWN_ARROW_COLOR }}>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
              </div>
            </div>
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                Contract end date
              </label>
              <div className="relative">
                <input type="text" placeholder="Select" className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-gray-900 placeholder-gray-400" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: DROPDOWN_ARROW_COLOR }}>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
              </div>
            </div>
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                Employment type <span className="text-red-500">*</span>
              </label>
              <SelectWithArrow
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className={`w-full rounded-lg border border-gray-300 px-3 py-2 bg-white ${employmentType === "" ? "text-gray-500" : "text-gray-900"}`}
              >
                <option value="">Select</option>
                <option value="full-time">Full-time</option>
              </SelectWithArrow>
            </div>
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                Part time percentage
              </label>
              <input type="number" placeholder="Enter part time percentage" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400" />
            </div>
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                Employee Status
              </label>
              <SelectWithArrow
                value={employeeStatus}
                onChange={(e) => setEmployeeStatus(e.target.value)}
                className={`w-full rounded-lg border border-gray-300 px-3 py-2 bg-white ${employeeStatus === "" ? "text-gray-500" : "text-gray-900"}`}
              >
                <option value="">Select</option>
                <option value="Active">Active</option>
              </SelectWithArrow>
            </div>
            <div className="sm:col-span-2 flex justify-between pt-6">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium hover:bg-gray-50"
                style={{ color: "#6B7280", borderRadius: "8px" }}
              >
                Back
              </button>
              <button
                type="submit"
                className="rounded-lg px-5 py-2.5 text-sm font-medium text-white"
                style={{ backgroundColor: "#0F50DB", borderRadius: "8px" }}
              >
                Next
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Step 4: Compensation & Payment — Figma 473-6148 */}
      {currentStep === 4 && (
        <div className="add-employee-form-section rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2
            className="mb-6 font-semibold"
            style={{
              fontFamily: "var(--font-poppins), Poppins, sans-serif",
              fontSize: "18px",
              lineHeight: "24px",
              color: "#1F2937",
            }}
          >
            Compensation & Payment
          </h2>
          <form
            className="employee-step-form grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              setCurrentStep(5);
            }}
          >
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                Payment method <span className="text-red-500">*</span>
              </label>
              <SelectWithArrow
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className={`w-full rounded-lg border border-gray-300 px-3 py-2 bg-white ${paymentMethod === "" ? "text-gray-500" : "text-gray-900"}`}
              >
                <option value="">Select</option>
                <option value="bank-transfer">Bank transfer</option>
                <option value="wallet">Wallet</option>
              </SelectWithArrow>
            </div>
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                Payment Preference
              </label>
              <SelectWithArrow
                value={paymentPreference}
                onChange={(e) => setPaymentPreference(e.target.value)}
                className={`w-full rounded-lg border border-gray-300 px-3 py-2 bg-white ${paymentPreference === "" ? "text-gray-500" : "text-gray-900"}`}
              >
                <option value="">Select</option>
                <option value="monthly">Monthly</option>
                <option value="bi-weekly">Bi-weekly</option>
              </SelectWithArrow>
            </div>
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                Compensation type <span className="text-red-500">*</span>
              </label>
              <SelectWithArrow
                value={compensationType}
                onChange={(e) => setCompensationType(e.target.value)}
                className={`w-full rounded-lg border border-gray-300 px-3 py-2 bg-white ${compensationType === "" ? "text-gray-500" : "text-gray-900"}`}
              >
                <option value="">Select</option>
                <option value="salary">Salary</option>
                <option value="contract">Contract</option>
              </SelectWithArrow>
            </div>
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                Payment currency code
              </label>
              <SelectWithArrow
                value={paymentCurrencyCode}
                onChange={(e) => setPaymentCurrencyCode(e.target.value)}
                className={`w-full rounded-lg border border-gray-300 px-3 py-2 bg-white ${paymentCurrencyCode === "" ? "text-gray-500" : "text-gray-900"}`}
              >
                <option value="">Select</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="INR">INR</option>
              </SelectWithArrow>
            </div>
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                Gross annual salary <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="Enter gross annual salary"
                value={grossAnnualSalary}
                onChange={(e) => setGrossAnnualSalary(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                Variable compensation 1: effective Date
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Select"
                  value={varComp1EffectiveDate}
                  onChange={(e) => setVarComp1EffectiveDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-gray-900 placeholder-gray-400"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: DROPDOWN_ARROW_COLOR }}>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
              </div>
            </div>
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                Variable compensation 1: frequency
              </label>
              <SelectWithArrow
                value={varComp1Frequency}
                onChange={(e) => setVarComp1Frequency(e.target.value)}
                className={`w-full rounded-lg border border-gray-300 px-3 py-2 bg-white ${varComp1Frequency === "" ? "text-gray-500" : "text-gray-900"}`}
              >
                <option value="">Select</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annual">Annual</option>
              </SelectWithArrow>
            </div>
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                Variable compensation 1: type
              </label>
              <SelectWithArrow
                value={varComp1Type}
                onChange={(e) => setVarComp1Type(e.target.value)}
                className={`w-full rounded-lg border border-gray-300 px-3 py-2 bg-white ${varComp1Type === "" ? "text-gray-500" : "text-gray-900"}`}
              >
                <option value="">Select</option>
                <option value="bonus">Bonus</option>
                <option value="commission">Commission</option>
              </SelectWithArrow>
            </div>
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                Variable compensation 1: title
              </label>
              <input
                type="text"
                placeholder="Enter"
                value={varComp1Title}
                onChange={(e) => setVarComp1Title(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400"
              />
            </div>
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                Variable compensation 1: compensation amount
              </label>
              <input
                type="number"
                placeholder="Enter amount"
                value={varComp1Amount}
                onChange={(e) => setVarComp1Amount(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <div className="sm:col-span-2 flex justify-between pt-6">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium hover:bg-gray-50"
                style={{ color: "#6B7280", borderRadius: "8px" }}
              >
                Back
              </button>
              <button
                type="submit"
                className="rounded-lg px-5 py-2.5 text-sm font-medium text-white"
                style={{ backgroundColor: "#0F50DB", borderRadius: "8px" }}
              >
                Next
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Step 5: Bank & Wallet Details — Figma 473-6568 */}
      {currentStep === 5 && (
        <div className="add-employee-form-section rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2
            className="mb-6 font-semibold"
            style={{
              fontFamily: "var(--font-poppins), Poppins, sans-serif",
              fontSize: "18px",
              lineHeight: "24px",
              color: "#1F2937",
            }}
          >
            Bank & Wallet Details
          </h2>
          <form
            className="employee-step-form grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!token || submitting) return;
              if (!firstName.trim() || !lastName.trim() || !personalEmail.trim()) {
                alert("First name, last name, and personal email are required");
                setCurrentStep(1);
                return;
              }
              setSubmitting(true);
              try {
                await createEmployee(token, {
                  first_name: firstName.trim(),
                  last_name: lastName.trim(),
                  email: personalEmail.trim(),
                  work_email: workEmail || null,
                  job_title: jobTitle || null,
                  employment_type: employmentType || null,
                  status: employeeStatus || "active",
                  seniority_level: seniorityLevel || null,
                  department: department || null,
                  payment_method: paymentMethod || null,
                  payment_preference: paymentPreference || null,
                  compensation_type: compensationType || null,
                  payment_currency_code: paymentCurrencyCode || null,
                  gross_annual_salary: grossAnnualSalary ? Number(grossAnnualSalary) : null,
                  bank_name: bankName || null,
                  bank_address: bankAddress || null,
                  swift_bic: swiftBic || null,
                  iban: iban || null,
                  usdt_erc_wallet: usdtErcWallet || null,
                  usdc_erc_wallet: usdcErcWallet || null,
                  usdc_poly_wallet: usdcPolyWallet || null,
                  btc_wallet: btcWallet || null,
                });
                router.push(ROUTES.admin.employees);
              } catch (err) {
                alert(err instanceof Error ? err.message : "Failed to create employee");
              } finally {
                setSubmitting(false);
              }
            }}
          >
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                Bank name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter bank name"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400"
              />
            </div>
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                Bank address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter bank address"
                value={bankAddress}
                onChange={(e) => setBankAddress(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400"
              />
            </div>
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                SWIFT/BIC <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter SWIFT/BIC"
                value={swiftBic}
                onChange={(e) => setSwiftBic(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400"
              />
            </div>
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                IBAN <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter IBAN"
                value={iban}
                onChange={(e) => setIban(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400"
              />
            </div>
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                USDT_ERC Wallet Address
              </label>
              <input
                type="text"
                placeholder="Enter USDT_ERC Wallet Address"
                value={usdtErcWallet}
                onChange={(e) => setUsdtErcWallet(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400"
              />
            </div>
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                USDC_ERC Wallet Address
              </label>
              <input
                type="text"
                placeholder="Enter USDC_ERC Wallet Address"
                value={usdcErcWallet}
                onChange={(e) => setUsdcErcWallet(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400"
              />
            </div>
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                USDC_Poly Wallet Address
              </label>
              <input
                type="text"
                placeholder="Enter USDC_Poly Wallet Address"
                value={usdcPolyWallet}
                onChange={(e) => setUsdcPolyWallet(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400"
              />
            </div>
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                BTC Wallet Address
              </label>
              <input
                type="text"
                placeholder="Enter BTC Wallet Address"
                value={btcWallet}
                onChange={(e) => setBtcWallet(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400"
              />
            </div>
            <div className="sm:col-span-2 flex justify-between pt-6">
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium hover:bg-gray-50"
                style={{ color: "#6B7280", borderRadius: "8px" }}
              >
                Back
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                style={{ backgroundColor: "#0F50DB", borderRadius: "8px" }}
              >
                {submitting ? "Saving..." : "Add Employee"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}