"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Select from "react-select";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { ROUTES } from "@/lib/constants/routes";
import { COUNTRIES, countrySelectStyles, type CountryOption } from "@/lib/constants/countries";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import { createCompany } from "@/lib/api/admin/companies";

const LABEL_STYLE: React.CSSProperties = {
  fontFamily: "var(--font-poppins), Poppins, sans-serif",
  fontWeight: 500,
  fontSize: "16px",
  lineHeight: "20px",
  letterSpacing: "0%",
  color: "#1F2937",
};
const DROPDOWN_ARROW_COLOR = "#878787DD";
function SelectWithArrow({ children, className, ...props }: React.ComponentPropsWithoutRef<"select">) {
  return (
    <div className="relative">
      <select
        className={className}
        style={{
          appearance: "none",
          paddingRight: "2.5rem",
          border: "1px solid #E5E7EB",
          backgroundColor: "#FFFFFF",
        }}
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

/** Section inside the single details card: only header bar + content, no separate card. headerRight shows on the right of the title (e.g. checkbox). Separator line is inset from left/right. */
function SectionBlock({ title, headerRight, children }: { title: string; headerRight?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex flex-col items-start justify-between gap-2 px-4 pt-4 pb-3 sm:flex-row sm:items-center">
        <span className="add-company-section-heading">{title}</span>
        {headerRight != null ? headerRight : null}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
      <div className="add-company-section-sep mx-4 border-t border-gray-200" aria-hidden />
    </div>
  );
}

const inputClass =
  "w-full min-h-[2.75rem] rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400";
const selectClass = (val: string) =>
  `w-full min-h-[2.75rem] rounded-lg border border-gray-300 px-4 py-2.5 bg-white ${val === "" ? "text-gray-500" : "text-gray-900"}`;

export default function AdminAddCompanyPage() {
  const [companyType, setCompanyType] = useState("");
  const [owner, setOwner] = useState("");
  const [name, setName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [beneficialOwnerType, setBeneficialOwnerType] = useState("");
  const [otherBusinessType, setOtherBusinessType] = useState("");
  const [accountStatus, setAccountStatus] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("");
  const [verificationLevel, setVerificationLevel] = useState("");
  const [sameAsIncorporation, setSameAsIncorporation] = useState(false);
  const [skipTransferPreApproval, setSkipTransferPreApproval] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [incorporationCountry, setIncorporationCountry] = useState<CountryOption | null>(null);
  const [operationalCountry, setOperationalCountry] = useState<CountryOption | null>(null);
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const token = useAdminAuthStore((s) => s.token);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || submitting) return;
    if (!name.trim()) {
      alert("Company name is required");
      return;
    }
    setSubmitting(true);
    try {
      await createCompany(token, {
        name: name.trim(),
        owner_name: owner || null,
        email: contactEmail || null,
        phone: contactPhone || null,
        country: incorporationCountry?.label || operationalCountry?.label || null,
        business_type: businessType || otherBusinessType || null,
        verification_status: verificationStatus || "pending",
        account_status: accountStatus || "active",
        verification_level: verificationLevel || null,
      });
      router.push(ROUTES.admin.companies);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create company");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-add-company-page w-full space-y-4 sm:space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm sm:px-6 sm:py-5">
        <h1
          className="admin-page-heading font-semibold"
          style={{
            fontFamily: "var(--font-poppins), Poppins, sans-serif",
            fontSize: "22px",
            lineHeight: "28px",
            color: "#0E1620",
          }}
        >
          Add New Company
        </h1>
      </div>

      <div className="details overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <form className="block" onSubmit={handleSubmit}>
        {/* Upload Picture */}
        <SectionBlock title="Upload Picture">
          <div className="relative shrink-0" style={{ width: 104, height: 104 }}>
            <svg
              className="absolute inset-0 size-full"
              style={{ borderRadius: 2 }}
              viewBox="0 0 104 104"
              fill="none"
            >
              <rect
                x={0.5}
                y={0.5}
                width={103}
                height={103}
                rx={2}
                stroke="#B3B3B3"
                strokeWidth={1}
                strokeDasharray="6 6"
              />
            </svg>
            <div
              className="flex flex-col items-center justify-center text-center"
              style={{
                width: 104,
                height: 104,
                gap: 8,
                paddingTop: 40,
                paddingRight: 8,
                paddingBottom: 40,
                paddingLeft: 8,
                backgroundColor: "#D9D9D9",
                borderRadius: 2,
              }}
            >
              <span className="text-2xl font-normal leading-none text-black">+</span>
              <p className="text-sm text-gray-600">Upload</p>
            </div>
          </div>
        </SectionBlock>

        {/* Company Details */}
        <SectionBlock title="Company Details">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block" style={LABEL_STYLE}>Company Type</label>
              <SelectWithArrow value={companyType} onChange={(e) => setCompanyType(e.target.value)} className={selectClass(companyType)}>
                <option value="">Select</option>
                <option value="llc">LLC</option>
              </SelectWithArrow>
            </div>
            <div>
              <label className="mb-2 block" style={LABEL_STYLE}>Owner <span className="text-red-500">*</span></label>
              <SelectWithArrow value={owner} onChange={(e) => setOwner(e.target.value)} className={selectClass(owner)}>
                <option value="">Select</option>
              </SelectWithArrow>
            </div>
            <div>
              <label className="mb-2 block" style={LABEL_STYLE}>Name <span className="text-red-500">*</span></label>
              <input type="text" placeholder="Enter name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-2 block" style={LABEL_STYLE}>Business Type <span className="text-red-500">*</span></label>
              <SelectWithArrow value={businessType} onChange={(e) => setBusinessType(e.target.value)} className={selectClass(businessType)}>
                <option value="">Select</option>
              </SelectWithArrow>
            </div>
            <div>
              <label className="mb-2 block" style={LABEL_STYLE}>Beneficial Owner Type <span className="text-red-500">*</span></label>
              <SelectWithArrow value={beneficialOwnerType} onChange={(e) => setBeneficialOwnerType(e.target.value)} className={selectClass(beneficialOwnerType)}>
                <option value="">Select</option>
              </SelectWithArrow>
            </div>
            <div>
              <label className="mb-2 block" style={LABEL_STYLE}>Other Business Type <span className="text-red-500">*</span></label>
              <input type="text" placeholder="Enter" value={otherBusinessType} onChange={(e) => setOtherBusinessType(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-2 block" style={LABEL_STYLE}>Account Status <span className="text-red-500">*</span></label>
              <SelectWithArrow value={accountStatus} onChange={(e) => setAccountStatus(e.target.value)} className={selectClass(accountStatus)}>
                <option value="">Select</option>
              </SelectWithArrow>
            </div>
            <div>
              <label className="mb-2 block" style={LABEL_STYLE}>IBAN Number</label>
              <input type="text" placeholder="IBAN Number" className={inputClass} />
            </div>
            <div>
              <label className="mb-2 block" style={LABEL_STYLE}>Verification Status <span className="text-red-500">*</span></label>
              <SelectWithArrow value={verificationStatus} onChange={(e) => setVerificationStatus(e.target.value)} className={selectClass(verificationStatus)}>
                <option value="">Select</option>
              </SelectWithArrow>
            </div>
            <div>
              <label className="mb-2 block" style={LABEL_STYLE}>Verification Level</label>
              <SelectWithArrow value={verificationLevel} onChange={(e) => setVerificationLevel(e.target.value)} className={selectClass(verificationLevel)}>
                <option value="">Select</option>
              </SelectWithArrow>
            </div>
            <div>
              <label className="mb-2 block" style={LABEL_STYLE}>Incorporation Date</label>
              <div className="relative">
                <input type="text" placeholder="Select" className={`${inputClass} pr-10`} />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={{ color: DROPDOWN_ARROW_COLOR }}>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
              </div>
            </div>
            <div>
              <label className="mb-2 block" style={LABEL_STYLE}>Beneficial Owner Positions</label>
              <input type="text" placeholder="Enter" className={inputClass} />
            </div>
            <div>
              <label className="mb-2 block" style={LABEL_STYLE}>Tax Identification Number</label>
              <input type="text" placeholder="Enter" className={inputClass} />
            </div>
            <div>
              <label className="mb-2 block" style={LABEL_STYLE}>Registration Number</label>
              <input type="text" placeholder="Enter" className={inputClass} />
            </div>
          </div>
        </SectionBlock>

        {/* Incorporation Address */}
        <SectionBlock title="Incorporation Address">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <div>
              <label className="mb-1 block" style={LABEL_STYLE}>Country</label>
              <Select
                options={COUNTRIES}
                value={incorporationCountry}
                onChange={(v) => setIncorporationCountry(v)}
                placeholder="Select country"
                isSearchable
                styles={countrySelectStyles}
              />
            </div>
            <div>
              <label className="mb-2 block" style={LABEL_STYLE}>City</label>
              <SelectWithArrow className={selectClass("")}><option value="">Select</option></SelectWithArrow>
            </div>
            <div>
              <label className="mb-2 block" style={LABEL_STYLE}>State</label>
              <SelectWithArrow className={selectClass("")}><option value="">Select</option></SelectWithArrow>
            </div>
            <div>
              <label className="mb-2 block" style={LABEL_STYLE}>Postal Code</label>
              <input type="text" placeholder="Enter" className={inputClass} />
            </div>
            <div>
              <label className="mb-2 block" style={LABEL_STYLE}>Address Line 1</label>
              <input type="text" placeholder="Enter" className={inputClass} />
            </div>
            <div>
              <label className="mb-2 block" style={LABEL_STYLE}>Address Line 2</label>
              <input type="text" placeholder="Enter" className={inputClass} />
            </div>
          </div>
        </SectionBlock>

        {/* Operational Address */}
        <SectionBlock
          title="Operational Address"
          headerRight={
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={sameAsIncorporation} onChange={(e) => setSameAsIncorporation(e.target.checked)} className="rounded border-gray-300" />
              <span style={{ ...LABEL_STYLE, color: "#6B7280" }}>Same as incorporation address</span>
            </label>
          }
        >
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <div>
              <label className="mb-1 block" style={LABEL_STYLE}>Country</label>
              <Select
                options={COUNTRIES}
                value={operationalCountry}
                onChange={(v) => setOperationalCountry(v)}
                placeholder="Select country"
                isSearchable
                styles={countrySelectStyles}
              />
            </div>
            <div>
              <label className="mb-2 block" style={LABEL_STYLE}>City</label>
              <SelectWithArrow className={selectClass("")}><option value="">Select</option></SelectWithArrow>
            </div>
            <div>
              <label className="mb-2 block" style={LABEL_STYLE}>State</label>
              <SelectWithArrow className={selectClass("")}><option value="">Select</option></SelectWithArrow>
            </div>
            <div>
              <label className="mb-2 block" style={LABEL_STYLE}>Postal Code</label>
              <input type="text" placeholder="Enter" className={inputClass} />
            </div>
            <div>
              <label className="mb-2 block" style={LABEL_STYLE}>Address Line 1</label>
              <input type="text" placeholder="Enter" className={inputClass} />
            </div>
            <div>
              <label className="mb-2 block" style={LABEL_STYLE}>Address Line 2</label>
              <input type="text" placeholder="Enter" className={inputClass} />
            </div>
          </div>
        </SectionBlock>

        {/* Limit Pack */}
        <SectionBlock title="Limit Pack">
          <div>
            <label className="mb-2 block" style={LABEL_STYLE}>Personal Type Limit</label>
            <SelectWithArrow className={selectClass("")}><option value="">Select</option></SelectWithArrow>
          </div>
        </SectionBlock>

        {/* Settings */}
        <SectionBlock
          title="Settings"
          headerRight={
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={skipTransferPreApproval} onChange={(e) => setSkipTransferPreApproval(e.target.checked)} className="rounded border-gray-300" />
              <span style={LABEL_STYLE}>Skip Transfer Pre-Approval</span>
            </label>
          }
        >
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block" style={LABEL_STYLE}>Custom Payout ID</label>
              <SelectWithArrow className={selectClass("")}><option value="">Select</option></SelectWithArrow>
            </div>
            <div>
              <label className="mb-2 block" style={LABEL_STYLE}>Custom Limit List</label>
              <SelectWithArrow className={selectClass("")}><option value="">Select</option></SelectWithArrow>
            </div>
          </div>
        </SectionBlock>

        {/* Security */}
        <SectionBlock title="Security">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-2 block" style={LABEL_STYLE}>Access Roles</label>
              <SelectWithArrow className={selectClass("")}><option value="">Select</option></SelectWithArrow>
            </div>
            <div>
              <label className="mb-2 block" style={LABEL_STYLE}>Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} placeholder="" className={`${inputClass} pr-10 bg-white`} autoComplete="new-password" />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowPassword((s) => !s)}>
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-2 block" style={LABEL_STYLE}>Confirm Password</label>
              <div className="relative">
                <input type={showConfirmPassword ? "text" : "password"} placeholder="" className={`${inputClass} pr-10 bg-white`} autoComplete="new-password" />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowConfirmPassword((s) => !s)}>
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
          </div>
        </SectionBlock>

        {/* Contact */}
        <SectionBlock title="Contact">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <div>
              <label className="mb-1 block" style={LABEL_STYLE}>Phone</label>
              <PhoneInput
                country="us"
                value={contactPhone}
                onChange={(phone) => setContactPhone(phone)}
                inputStyle={{
                  width: "100%",
                  height: "42px",
                  fontSize: "14px",
                  border: "1px solid #D1D5DB",
                  borderRadius: "8px",
                  paddingLeft: "52px",
                  color: "#111827",
                  fontFamily: "var(--font-poppins), Poppins, sans-serif",
                }}
                buttonStyle={{
                  border: "1px solid #D1D5DB",
                  borderRight: "none",
                  borderRadius: "8px 0 0 8px",
                  backgroundColor: "#fff",
                }}
                containerStyle={{ width: "100%" }}
                dropdownStyle={{ zIndex: 9999 }}
              />
            </div>
            <div>
              <label className="mb-2 block" style={LABEL_STYLE}>Email</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className={`${inputClass} pr-10`}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <EnvelopeIcon />
                </span>
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-2 block" style={LABEL_STYLE}>URL</label>
              <input type="text" placeholder="Enter URL" className={inputClass} />
            </div>
          </div>
        </SectionBlock>

        {/* Back & Save — narrow buttons, Back left / Save right */}
        <div className="add-company-form-footer flex w-full items-center justify-between gap-3 border-t border-gray-200 p-4 sm:p-5">
          <Link
            href={ROUTES.admin.companies}
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white px-5 text-sm font-medium hover:bg-gray-50 sm:h-11 sm:px-6"
            style={{ color: "#6B7280", borderRadius: "8px" }}
          >
            Back
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg px-6 text-sm font-medium text-white disabled:opacity-50 sm:h-11 sm:px-8"
            style={{ backgroundColor: "#0F50DB", borderRadius: "8px" }}
          >
            {submitting ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}
function EyeOffIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878a4.5 4.5 0 106.262 6.262M3 3l3 3m15-6l3 3" />
    </svg>
  );
}

function EnvelopeIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}