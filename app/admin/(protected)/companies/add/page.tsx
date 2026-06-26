"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Dropdown from "@/components/ui/Dropdown";
import { ROUTES } from "@/lib/constants/routes";
import { useCreateCompany } from "@/hooks/admin/useCompanies";

const COUNTRY_CODE_OPTIONS = [
  "+93 🇦🇫",
  "+355 🇦🇱",
  "+213 🇩🇿",
  "+1 🇺🇸",
  "+54 🇦🇷",
  "+374 🇦🇲",
  "+61 🇦🇺",
  "+43 🇦🇹",
  "+994 🇦🇿",
  "+973 🇧🇭",
  "+880 🇧🇩",
  "+32 🇧🇪",
  "+55 🇧🇷",
  "+44 🇬🇧",
  "+359 🇧🇬",
  "+1 🇨🇦",
  "+56 🇨🇱",
  "+86 🇨🇳",
  "+57 🇨🇴",
  "+385 🇭🇷",
  "+53 🇨🇺",
  "+357 🇨🇾",
  "+420 🇨🇿",
  "+45 🇩🇰",
  "+20 🇪🇬",
  "+971 🇦🇪",
  "+372 🇪🇪",
  "+251 🇪🇹",
  "+358 🇫🇮",
  "+33 🇫🇷",
  "+995 🇬🇪",
  "+49 🇩🇪",
  "+233 🇬🇭",
  "+30 🇬🇷",
  "+36 🇭🇺",
  "+91 🇮🇳",
  "+62 🇮🇩",
  "+98 🇮🇷",
  "+964 🇮🇶",
  "+353 🇮🇪",
  "+972 🇮🇱",
  "+39 🇮🇹",
  "+81 🇯🇵",
  "+962 🇯🇴",
  "+7 🇰🇿",
  "+254 🇰🇪",
  "+82 🇰🇷",
  "+965 🇰🇼",
  "+371 🇱🇻",
  "+961 🇱🇧",
  "+370 🇱🇹",
  "+60 🇲🇾",
  "+960 🇲🇻",
  "+356 🇲🇹",
  "+52 🇲🇽",
  "+373 🇲🇩",
  "+976 🇲🇳",
  "+212 🇲🇦",
  "+31 🇳🇱",
  "+64 🇳🇿",
  "+234 🇳🇬",
  "+47 🇳🇴",
  "+968 🇴🇲",
  "+92 🇵🇰",
  "+63 🇵🇭",
  "+48 🇵🇱",
  "+351 🇵🇹",
  "+974 🇶🇦",
  "+40 🇷🇴",
  "+7 🇷🇺",
  "+966 🇸🇦",
  "+381 🇷🇸",
  "+65 🇸🇬",
  "+421 🇸🇰",
  "+386 🇸🇮",
  "+27 🇿🇦",
  "+34 🇪🇸",
  "+94 🇱🇰",
  "+46 🇸🇪",
  "+41 🇨🇭",
  "+963 🇸🇾",
  "+886 🇹🇼",
  "+255 🇹🇿",
  "+66 🇹🇭",
  "+216 🇹🇳",
  "+90 🇹🇷",
  "+256 🇺🇬",
  "+380 🇺🇦",
  "+598 🇺🇾",
  "+998 🇺🇿",
  "+58 🇻🇪",
  "+84 🇻🇳",
  "+967 🇾🇪",
  "+260 🇿🇲",
  "+263 🇿🇼",
  "+977 🇳🇵",
];

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

const cfInput: React.CSSProperties = { width: "100%", height: 46, boxSizing: "border-box", borderRadius: 11, border: "1px solid #E5E7EB", background: "#fff", padding: "0 14px", fontFamily: "inherit", fontSize: 14, color: "#0E1620", outline: "none" };
const cfLabel: React.CSSProperties = { display: "block", marginBottom: 7, fontWeight: 600, fontSize: 11.5, letterSpacing: "0.04em", textTransform: "uppercase", color: "#6C757D" };

function FeesEstimateCard({ cycle, base, per, count }: { cycle: string; base: number; per: number; count: number }) {
  const noun = cycle === "Annual" ? "year" : "month";
  const perTotal = per * count;
  const cycleTotal = base + perTotal;
  const monthly = cycle === "Annual" ? cycleTotal / 12 : cycleTotal;
  const annual = cycle === "Annual" ? cycleTotal : cycleTotal * 12;
  const fmt = (n: number) => "€" + (n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const chip: React.CSSProperties = { background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.16)", borderRadius: 12, padding: "12px 16px" };
  return (
    <div style={{ borderRadius: 16, overflow: "hidden", background: "linear-gradient(125deg, #0a1c36 0%, #14305a 100%)", color: "#fff", position: "relative", border: "1px solid #E5E7EB" }}>
      <div style={{ position: "absolute", top: -60, right: -30, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle, rgba(212,175,90,0.18), transparent 70%)" }} />
      <div style={{ position: "relative", padding: "18px 22px" }}>
        <div style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: "#d4af5a", marginBottom: 12 }}>Estimated Charge</div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "rgba(255,255,255,0.78)", padding: "6px 0" }}>
          <span>Base platform fee</span>
          <span style={{ fontFamily: "monospace" }}>{fmt(base)} / {noun}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "rgba(255,255,255,0.78)", padding: "6px 0" }}>
          <span>Per-employee ({count} × {fmt(per)})</span>
          <span style={{ fontFamily: "monospace" }}>{fmt(perTotal)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.16)", marginTop: 6, paddingTop: 12 }}>
          <span style={{ fontWeight: 600, color: "#fff", fontSize: 14 }}>Total per {noun}</span>
          <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 24 }}>{fmt(cycleTotal)}</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
          <div style={chip}>
            <div style={{ fontSize: 11, color: "#9db8ef", fontWeight: 600, textTransform: "uppercase" as const }}>Monthly</div>
            <div style={{ marginTop: 4, fontFamily: "monospace", fontWeight: 600, fontSize: 17 }}>{fmt(monthly)}</div>
          </div>
          <div style={chip}>
            <div style={{ fontSize: 11, color: "#9db8ef", fontWeight: 600, textTransform: "uppercase" as const }}>Annual</div>
            <div style={{ marginTop: 4, fontFamily: "monospace", fontWeight: 600, fontSize: 17 }}>{fmt(annual)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminAddCompanyPage() {
  const router = useRouter();
  const createMut = useCreateCompany();
  const [companyType, setCompanyType] = useState("");
  const [owner, setOwner] = useState("");
  const [name, setName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [beneficialOwnerType, setBeneficialOwnerType] = useState("");
  const [otherBusinessType, setOtherBusinessType] = useState("");
  const [accountStatus, setAccountStatus] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("");
  const [verificationLevel, setVerificationLevel] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState("🇳🇵 +977");
  const incorporationDateRef = useRef<HTMLInputElement>(null);
  const [incorporationDate, setIncorporationDate] = useState("");
  const [taxId, setTaxId] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [url, setUrl] = useState("");
  const [sameAsIncorporation, setSameAsIncorporation] = useState(false);
  const [skipTransferPreApproval, setSkipTransferPreApproval] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fees & billing state
  const [billingCycle, setBillingCycle] = useState("Monthly");
  const [employeeCount, setEmployeeCount] = useState(0);
  const [baseFee, setBaseFee] = useState(0);
  const [perEmployeeFee, setPerEmployeeFee] = useState(0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);
    if (!name.trim()) {
      setSubmitError("Company name is required.");
      return;
    }
    const dialCode = phoneCountryCode.split(" ").pop() ?? "";
    const fullPhone = phone ? `${dialCode} ${phone}`.trim() : undefined;
    const address = [addressLine1, addressLine2, city, stateName, postalCode]
      .filter(Boolean)
      .join(", ") || undefined;
    try {
      await createMut.mutateAsync({
        name: name.trim(),
        owner_name: owner || undefined,
        email: email || undefined,
        phone: fullPhone,
        address,
        country: country || undefined,
        industry: companyType || undefined,
        business_type: businessType || undefined,
        registration_number: registrationNumber || undefined,
        tax_id: taxId || undefined,
        incorporation_date: incorporationDate || undefined,
        verification_status: verificationStatus || undefined,
        account_status: accountStatus || undefined,
        verification_level: verificationLevel || undefined,
      });
      router.push(ROUTES.admin.companies);
    } catch (err) {
      setSubmitError((err as Error).message);
    }
    void url; // currently captured but not on backend yet
  };

  return (
    <div className="admin-add-company-page w-full space-y-4 sm:space-y-6">
      {/* Navy hero */}
      <div style={{ position: "relative", overflow: "hidden", borderRadius: 18, padding: "26px 28px", marginBottom: 20, background: "linear-gradient(125deg, #0a1c36 0%, #12294c 55%, #1b3b66 100%)", color: "#fff" }}>
        <div style={{ position: "absolute", top: -70, right: -40, width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle, rgba(212,175,90,0.20), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, fontWeight: 500, color: "rgba(255,255,255,0.6)", marginBottom: 8 }}>
            <span>Companies</span><span style={{ margin: "0 4px" }}>›</span><span style={{ color: "rgba(255,255,255,0.92)" }}>Add New</span>
          </div>
          <h1 style={{ margin: 0, fontWeight: 700, fontSize: 27, letterSpacing: "-0.01em" }}>Add New Company</h1>
          <p style={{ margin: "7px 0 0", fontSize: 14, color: "rgba(255,255,255,0.72)", maxWidth: 520 }}>Register a new client organization and configure its verification, addresses and access.</p>
        </div>
      </div>

      <div className="details overflow-hidden rounded-2xl bg-white">
        <form className="block" onSubmit={handleSubmit}>
        {/* Upload Picture */}
        <SectionBlock title="Upload Picture">
          <CompanyLogoUpload />
        </SectionBlock>

        {/* Company Details */}
        <SectionBlock title="Company Details">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block" style={LABEL_STYLE}>Company Type</label>
              <SelectWithArrow value={companyType} onChange={(e) => setCompanyType(e.target.value)} className={selectClass(companyType)}>
                <option value="">Select</option>
                <option value="private-limited">Private Limited Liability Company</option>
                <option value="public-limited">Public Limited Company</option>
                <option value="partnership">Partnership Structure</option>
                <option value="sole-proprietorship">Sole Proprietorship</option>
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
                <option value="retail">Retail</option>
                <option value="wholesale">Wholesale</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="services">Services</option>
                <option value="financial-services">Financial Services</option>
                <option value="technology">Technology</option>
                <option value="healthcare">Healthcare</option>
                <option value="real-estate">Real Estate</option>
                <option value="education">Education</option>
                <option value="other">Other</option>
              </SelectWithArrow>
            </div>
            <div>
              <label className="mb-2 block" style={LABEL_STYLE}>Beneficial Owner Type <span className="text-red-500">*</span></label>
              <SelectWithArrow value={beneficialOwnerType} onChange={(e) => setBeneficialOwnerType(e.target.value)} className={selectClass(beneficialOwnerType)}>
                <option value="">Select</option>
                <option value="ultimate-beneficial-owner">Ultimate Beneficial Owner</option>
                <option value="shareholder">Shareholder</option>
                <option value="representative">Representative</option>
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
                <option value="pending">Pending</option>
                <option value="submitted">Submitted</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </SelectWithArrow>
            </div>
            <div>
              <label className="mb-2 block" style={LABEL_STYLE}>Verification Level</label>
              <SelectWithArrow value={verificationLevel} onChange={(e) => setVerificationLevel(e.target.value)} className={selectClass(verificationLevel)}>
                <option value="">Select</option>
                <option value="not-identified">Not Identified</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </SelectWithArrow>
            </div>
            <div>
              <label className="mb-2 block" style={LABEL_STYLE}>Incorporation Date</label>
              <div className="relative">
                <input
                  ref={incorporationDateRef}
                  type="date"
                  value={incorporationDate}
                  onChange={(e) => setIncorporationDate(e.target.value)}
                  className={`${inputClass} kp-date pr-10`}
                  style={{ colorScheme: "light" }}
                />
                <span
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  aria-hidden
                >
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
              <input
                type="text"
                placeholder="Enter"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-2 block" style={LABEL_STYLE}>Registration Number</label>
              <input
                type="text"
                placeholder="Enter"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </SectionBlock>

        {/* Incorporation Address */}
        <SectionBlock title="Incorporation Address">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block" style={LABEL_STYLE}>Country</label>
              <SelectWithArrow value={country} onChange={(e) => setCountry(e.target.value)} className={selectClass(country)}>
                <option value="">Select</option>
                {["Afghanistan","Albania","Algeria","Argentina","Armenia","Australia","Austria","Azerbaijan","Bahrain","Bangladesh","Belarus","Belgium","Bolivia","Bosnia and Herzegovina","Brazil","Bulgaria","Cambodia","Cameroon","Canada","Chile","China","Colombia","Croatia","Cuba","Cyprus","Czech Republic","Denmark","Dominican Republic","Ecuador","Egypt","Estonia","Ethiopia","Finland","France","Georgia","Germany","Ghana","Greece","Guatemala","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kuwait","Latvia","Lebanon","Lithuania","Luxembourg","Malaysia","Maldives","Malta","Mexico","Moldova","Mongolia","Morocco","Nepal","Netherlands","New Zealand","Nigeria","Norway","Oman","Pakistan","Panama","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Saudi Arabia","Serbia","Singapore","Slovakia","Slovenia","South Africa","South Korea","Spain","Sri Lanka","Sweden","Switzerland","Syria","Taiwan","Tanzania","Thailand","Tunisia","Turkey","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"].map(c => <option key={c} value={c}>{c}</option>)}
              </SelectWithArrow>
            </div>
            <div>
              <label className="mb-2 block" style={LABEL_STYLE}>City</label>
              <input type="text" placeholder="Enter city" value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-2 block" style={LABEL_STYLE}>State</label>
              <input type="text" placeholder="Enter state" value={stateName} onChange={(e) => setStateName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-2 block" style={LABEL_STYLE}>Postal Code</label>
              <input type="text" placeholder="Enter" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-2 block" style={LABEL_STYLE}>Address Line 1</label>
              <input type="text" placeholder="Enter" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-2 block" style={LABEL_STYLE}>Address Line 2</label>
              <input type="text" placeholder="Enter" value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} className={inputClass} />
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
              <label className="mb-2 block" style={LABEL_STYLE}>Country</label>
              <SelectWithArrow className={selectClass("")}>
                <option value="">Select</option>
                {["Afghanistan","Albania","Algeria","Argentina","Armenia","Australia","Austria","Azerbaijan","Bahrain","Bangladesh","Belarus","Belgium","Bolivia","Bosnia and Herzegovina","Brazil","Bulgaria","Cambodia","Cameroon","Canada","Chile","China","Colombia","Croatia","Cuba","Cyprus","Czech Republic","Denmark","Dominican Republic","Ecuador","Egypt","Estonia","Ethiopia","Finland","France","Georgia","Germany","Ghana","Greece","Guatemala","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kuwait","Latvia","Lebanon","Lithuania","Luxembourg","Malaysia","Maldives","Malta","Mexico","Moldova","Mongolia","Morocco","Nepal","Netherlands","New Zealand","Nigeria","Norway","Oman","Pakistan","Panama","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Saudi Arabia","Serbia","Singapore","Slovakia","Slovenia","South Africa","South Korea","Spain","Sri Lanka","Sweden","Switzerland","Syria","Taiwan","Tanzania","Thailand","Tunisia","Turkey","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"].map(c => <option key={c} value={c}>{c}</option>)}
              </SelectWithArrow>
            </div>
            <div>
              <label className="mb-2 block" style={LABEL_STYLE}>City</label>
              <input type="text" placeholder="Enter city" className={inputClass} />
            </div>
            <div>
              <label className="mb-2 block" style={LABEL_STYLE}>State</label>
              <input type="text" placeholder="Enter state" className={inputClass} />
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
              <label className="mb-2 block" style={LABEL_STYLE}>Phone</label>
              <div className="add-company-phone-field flex min-h-[2.75rem] items-stretch overflow-visible rounded-lg border border-gray-300 bg-white">
                <div className="flex items-center gap-1.5 border-r border-gray-200 bg-transparent pl-3 pr-1">
                  <Dropdown
                    trigger={
                      <button type="button" className="flex min-w-[7rem] items-center justify-between gap-2 bg-transparent py-2.5 pr-3 text-left text-gray-900 focus:outline-none">
                        <span>{phoneCountryCode}</span>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    }
                    items={COUNTRY_CODE_OPTIONS.map((code) => {
                      const [dialCode, flag] = code.split(" ");
                      return { label: `${flag} ${dialCode}`, value: code };
                    })}
                    onSelect={(value) => {
                      const [dialCode, flag] = value.split(" ");
                      setPhoneCountryCode(`${flag} ${dialCode}`);
                    }}
                    className="max-h-[50vh]"
                  />
                </div>
                <input type="tel" placeholder="980-00-000-00" value={phone} onChange={(e) => setPhone(e.target.value)} className="flex-1 border-0 bg-transparent px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:ring-0 focus:ring-inset" />
              </div>
            </div>
            <div>
              <label className="mb-2 block" style={LABEL_STYLE}>Email</label>
              <div className="relative">
                <input type="email" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} className={`${inputClass} pr-10`} />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <EnvelopeIcon />
                </span>
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-2 block" style={LABEL_STYLE}>URL</label>
              <input type="text" placeholder="Enter URL" value={url} onChange={(e) => setUrl(e.target.value)} className={inputClass} />
            </div>
          </div>
        </SectionBlock>

        {/* Fees & Billing */}
        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", overflow: "hidden", margin: "0 0 0 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 13, padding: "18px 22px", borderBottom: "1px solid #E5E7EB" }}>
            <span style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(15,80,219,0.1)", color: "#0F50DB", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="19" height="19" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
            </span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15.5, color: "#0E1620" }}>Fees &amp; Billing</div>
              <div style={{ marginTop: 2, fontSize: 12.5, color: "#9EA6B3" }}>What this company is charged — per cycle and per employee</div>
            </div>
          </div>
          <div style={{ padding: 22, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 22px" }}>
            <div>
              <label style={cfLabel}>Billing Cycle <span style={{ color: "#ef4444" }}>*</span></label>
              <div style={{ position: "relative" }}>
                <select value={billingCycle} onChange={(e) => setBillingCycle(e.target.value)} style={{ ...cfInput, appearance: "none", paddingRight: 38, cursor: "pointer" }}>
                  <option value="Monthly">Monthly</option>
                  <option value="Annual">Annual</option>
                </select>
                <span style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9EA6B3" }}>▼</span>
              </div>
            </div>
            <div>
              <label style={cfLabel}>Number of Employees <span style={{ color: "#ef4444" }}>*</span></label>
              <input type="number" min={0} value={employeeCount || ""} onChange={(e) => setEmployeeCount(parseInt(e.target.value) || 0)} placeholder="0" style={cfInput} />
            </div>
            <div>
              <label style={cfLabel}>Base Platform Fee (per {billingCycle === "Annual" ? "year" : "month"}) <span style={{ color: "#ef4444" }}>*</span></label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9EA6B3", pointerEvents: "none" }}>€</span>
                <input type="number" min={0} step="any" value={baseFee || ""} onChange={(e) => setBaseFee(parseFloat(e.target.value) || 0)} placeholder="0.00" style={{ ...cfInput, paddingLeft: 30 }} />
              </div>
            </div>
            <div>
              <label style={cfLabel}>Fee per Employee (per {billingCycle === "Annual" ? "year" : "month"}) <span style={{ color: "#ef4444" }}>*</span></label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9EA6B3", pointerEvents: "none" }}>€</span>
                <input type="number" min={0} step="any" value={perEmployeeFee || ""} onChange={(e) => setPerEmployeeFee(parseFloat(e.target.value) || 0)} placeholder="0.00" style={{ ...cfInput, paddingLeft: 30 }} />
              </div>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <FeesEstimateCard cycle={billingCycle} base={baseFee} per={perEmployeeFee} count={employeeCount} />
            </div>
          </div>
        </div>

        {/* Back & Save — narrow buttons, Back left / Save right */}
        <div className="add-company-form-footer flex w-full flex-col items-stretch gap-3 border-t border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          {submitError ? (
            <div className="flex-1 rounded-md bg-red-50 p-2 text-sm text-red-700">{submitError}</div>
          ) : <div className="flex-1" />}
          <div className="flex items-center justify-end gap-3">
            <Link
              href={ROUTES.admin.companies}
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white px-5 text-sm font-medium hover:bg-gray-50 sm:h-11 sm:px-6"
              style={{ color: "#6B7280", borderRadius: "8px" }}
            >
              Back
            </Link>
            <button
              type="submit"
              disabled={createMut.isPending}
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg px-6 text-sm font-medium text-white disabled:opacity-60 sm:h-11 sm:px-8"
              style={{ backgroundColor: "#0F50DB", borderRadius: "8px" }}
            >
              {createMut.isPending ? "Saving…" : "Save"}
            </button>
          </div>
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
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" strokeWidth={2} />
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

function CompanyLogoUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 text-center hover:border-gray-400"
        style={{
          width: 104,
          height: 104,
          border: "1.5px dashed #C4C4C4",
          borderRadius: 8,
          backgroundColor: "#f7f7f7",
          backgroundImage: preview ? `url(${preview})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        aria-label="Upload company logo"
      >
        {!preview ? (
          <>
            <span style={{ fontSize: 28, fontWeight: 300, lineHeight: 1, color: "#6B7280" }}>+</span>
            <p style={{ fontSize: 14, color: "#6B7280" }}>Upload</p>
          </>
        ) : null}
      </button>
      {preview ? (
        <button
          type="button"
          className="mt-2 text-xs text-gray-500 underline hover:text-gray-700"
          onClick={() => {
            URL.revokeObjectURL(preview);
            setPreview(null);
            if (inputRef.current) inputRef.current.value = "";
          }}
        >
          Remove
        </button>
      ) : null}
      <p className="mt-2 text-xs text-gray-400">
        Image preview only — full upload coming in next release.
      </p>
    </div>
  );
}
