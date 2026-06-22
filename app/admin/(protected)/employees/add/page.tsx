"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateAdminEmployee } from "@/hooks/admin/useEmployees";
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

const SELECT_FIELD_STYLE = { border: "1px solid #E5E7EB", backgroundColor: "#FFFFFF", color: "#6B7280" };

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
  const [currentStep, setCurrentStep] = useState(1);
  const [nationalityOpen, setNationalityOpen] = useState(false);
  const [selectedNationality, setSelectedNationality] = useState("");
  const [primaryCodeOpen, setPrimaryCodeOpen] = useState(false);
  const [selectedPrimaryCode, setSelectedPrimaryCode] = useState("+93 🇦🇫");
  const [emergencyCodeOpen, setEmergencyCodeOpen] = useState(false);
  const [selectedEmergencyCode, setSelectedEmergencyCode] = useState("+93 🇦🇫");
  const [addressCountryOpen, setAddressCountryOpen] = useState(false);
  const [selectedAddressCountry, setSelectedAddressCountry] = useState("");
  const dobRef = useRef<HTMLInputElement>(null);
  const contractStartRef = useRef<HTMLInputElement>(null);
  const contractEndRef = useRef<HTMLInputElement>(null);
  const varComp1DateRef = useRef<HTMLInputElement>(null);
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

  // Step 1 — Personal Details (newly bound for save)
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [personalEmail, setPersonalEmail] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [primaryPhone, setPrimaryPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [employeeNo, setEmployeeNo] = useState("");

  // Step 2 — Address (newly bound)
  const [streetName, setStreetName] = useState("");
  const [streetNo, setStreetNo] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");

  // Step 3 — Employment (newly bound)
  const [jobTitle, setJobTitle] = useState("");
  const [contractStart, setContractStart] = useState("");
  const [contractEnd, setContractEnd] = useState("");

  // Step 1 — additional bound fields
  const [identificationType, setIdentificationType] = useState("");
  const [passportNo, setPassportNo] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [nationalInsuranceNo, setNationalInsuranceNo] = useState("");
  const [tic, setTic] = useState("");

  // Step 2 — additional bound fields
  const [flatApartmentNo, setFlatApartmentNo] = useState("");
  const [floor, setFloor] = useState("");

  // Step 3 — additional bound fields
  const [legalEntity, setLegalEntity] = useState("");
  const [groupName, setGroupName] = useState("");
  const [scopeOfWork, setScopeOfWork] = useState("");
  const [departmentRole, setDepartmentRole] = useState("");
  const [directManagerEmail, setDirectManagerEmail] = useState("");
  const [partTimePercentage, setPartTimePercentage] = useState("");

  const router = useRouter();
  const createMut = useCreateAdminEmployee();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleFinalSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);
    if (!firstName.trim() || !lastName.trim() || !personalEmail.trim()) {
      setSubmitError("First name, last name, and personal email are required.");
      setCurrentStep(1);
      return;
    }
    try {
      await createMut.mutateAsync({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: personalEmail.trim(),
        work_email: workEmail || undefined,
        phone: primaryPhone ? `${selectedPrimaryCode.split(" ")[0]} ${primaryPhone}`.trim() : undefined,
        emergency_phone: emergencyPhone
          ? `${selectedEmergencyCode.split(" ")[0]} ${emergencyPhone}`.trim()
          : undefined,
        nationality: selectedNationality || undefined,
        date_of_birth: dateOfBirth || undefined,
        employee_no: employeeNo || undefined,
        identification_type: identificationType || undefined,
        passport_number: passportNo || undefined,
        national_insurance_no: nationalInsuranceNo || undefined,
        tic: tic || undefined,
        street_name: streetName || undefined,
        street_no: streetNo || undefined,
        flat_apartment_no: flatApartmentNo || undefined,
        floor: floor || undefined,
        postal_code: postalCode || undefined,
        city: city || undefined,
        province: province || undefined,
        country: selectedAddressCountry || undefined,
        job_title: jobTitle || undefined,
        legal_entity: legalEntity || undefined,
        group_name: groupName || undefined,
        scope_of_work: scopeOfWork || undefined,
        department: department || undefined,
        department_role: departmentRole || undefined,
        seniority_level: seniorityLevel || undefined,
        line_manager_email: directManagerEmail || undefined,
        employment_type: employmentType || undefined,
        employee_status: employeeStatus || "active",
        part_time_percentage: partTimePercentage || undefined,
        contract_start: contractStart || undefined,
        contract_end: contractEnd || undefined,
        payment_method: paymentMethod || undefined,
        payment_preference: paymentPreference || undefined,
        compensation_type: compensationType || undefined,
        payment_currency_code: paymentCurrencyCode || undefined,
        gross_annual_salary: grossAnnualSalary || undefined,
        bank_name: bankName || undefined,
        bank_address: bankAddress || undefined,
        swift_bic: swiftBic || undefined,
        iban: iban || undefined,
        usdt_erc_wallet: usdtErcWallet || undefined,
        usdc_erc_wallet: usdcErcWallet || undefined,
        usdc_polygon_wallet: usdcPolyWallet || undefined,
        btc_wallet: btcWallet || undefined,
      });
      router.push(ROUTES.admin.employees);
    } catch (err) {
      setSubmitError((err as Error).message);
    }
    void varComp1EffectiveDate; void varComp1Frequency; void varComp1Type; void varComp1Title; void varComp1Amount;
    void primaryCodeOpen; void setPrimaryCodeOpen; void emergencyCodeOpen; void setEmergencyCodeOpen;
    void addressCountryOpen; void setAddressCountryOpen;
    void contractStartRef; void contractEndRef; void varComp1DateRef;
  };

  return (
    <div className="w-full space-y-6" data-page="add-employee">
      {/* Page title */}
      <div
        className="add-employee-header-card bg-white px-6 py-5"
        style={{ borderRadius: "10px" }}
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
        className="add-employee-stepper-card w-full overflow-x-auto rounded-2xl border border-gray-200 bg-white p-6 md:overflow-visible"
        style={{ backgroundColor: "#FFFFFF" }}
      >
        {/* grid-cols-5: equal columns so each circle center is exactly at 10%, 30%, 50%, 70%, 90% */}
        <div className="employee-stepper-row relative grid grid-cols-5 min-w-[860px] items-start md:min-w-0">
          {/* Gray track: center of col-1 (10%) to center of col-5 (90%) */}
          <div
            className="employee-stepper-track add-employee-stepper-connector pointer-events-none absolute left-[10%] right-[10%] z-0 h-[6px] bg-[#E5E7EB]"
            style={{ top: "24px" }}
            aria-hidden
          />
          {/* Blue progress: grows 20% per completed step */}
          {currentStep >= 2 && (
            <div
              className="employee-stepper-progress pointer-events-none absolute z-0 h-[6px] bg-[#2962FF]"
              style={{
                top: "24px",
                left: "10%",
                width: `${(currentStep - 1) * 20}%`,
              }}
            />
          )}
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
                      borderRadius: "50%",
                      opacity: 1,
                      border: isCompleted ? "none" : isActive ? "none" : "1.5px solid #D1D5DB",
                      boxShadow: isActive ? "0 0 0 4px #FFFFFF, 0 0 0 6px #2962FF" : undefined,
                      backgroundColor: isCompleted ? "#2962FF" : isActive ? "#2962FF" : "#FFFFFF",
                      fontFamily: "var(--font-poppins), Poppins, sans-serif",
                      fontWeight: 600,
                      fontSize: "16px",
                      lineHeight: "100%",
                      letterSpacing: "0%",
                      color: isCompleted ? "#FFFFFF" : isActive ? "#FFFFFF" : "#9CA3AF",
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
        <div className="add-employee-form-section rounded-2xl border border-gray-200 bg-white p-6">
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
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600"
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
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600"
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
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-gray-900 placeholder-gray-400 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600"
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
                  value={workEmail}
                  onChange={(e) => setWorkEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-gray-900 placeholder-gray-400 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
              </div>
            </div>
            <div className="relative">
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                Nationality
              </label>
              <button
                type="button"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-left flex items-center justify-between bg-white"
                style={{ color: selectedNationality ? "#6B7280" : "#9CA3AF" }}
                onClick={() => setNationalityOpen(!nationalityOpen)}
              >
                <span>{selectedNationality || "Select nationality"}</span>
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {nationalityOpen && (
                <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg" style={{ maxHeight: "50vh", overflowY: "auto" }}>
                  {["Afghan","Albanian","Algerian","American","Andorran","Angolan","Argentine","Armenian","Australian","Austrian","Azerbaijani","Bahamian","Bahraini","Bangladeshi","Belarusian","Belgian","Belizean","Beninese","Bhutanese","Bolivian","Bosnian","Botswanan","Brazilian","British","Bruneian","Bulgarian","Burkinabe","Burundian","Cambodian","Cameroonian","Canadian","Chilean","Chinese","Colombian","Congolese","Costa Rican","Croatian","Cuban","Cypriot","Czech","Danish","Dominican","Dutch","Ecuadorian","Egyptian","Emirati","Estonian","Ethiopian","Fijian","Finnish","French","Gabonese","Gambian","Georgian","German","Ghanaian","Greek","Guatemalan","Guinean","Haitian","Honduran","Hungarian","Icelandic","Indian","Indonesian","Iranian","Iraqi","Irish","Israeli","Italian","Ivorian","Jamaican","Japanese","Jordanian","Kazakhstani","Kenyan","Korean","Kuwaiti","Kyrgyz","Laotian","Latvian","Lebanese","Liberian","Libyan","Lithuanian","Luxembourgish","Macedonian","Malagasy","Malawian","Malaysian","Maldivian","Malian","Maltese","Mauritanian","Mauritian","Mexican","Moldovan","Mongolian","Montenegrin","Moroccan","Mozambican","Namibian","Nepalese","New Zealander","Nicaraguan","Nigerian","Norwegian","Omani","Pakistani","Panamanian","Paraguayan","Peruvian","Filipino","Polish","Portuguese","Qatari","Romanian","Russian","Rwandan","Saudi","Senegalese","Serbian","Sierra Leonean","Singaporean","Slovak","Slovenian","Somali","South African","Spanish","Sri Lankan","Sudanese","Swedish","Swiss","Syrian","Taiwanese","Tajik","Tanzanian","Thai","Togolese","Trinidadian","Tunisian","Turkish","Turkmen","Ugandan","Ukrainian","Uruguayan","Uzbek","Venezuelan","Vietnamese","Yemeni","Zambian","Zimbabwean"].map((n) => (
                    <div key={n} className="cursor-pointer px-3 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => { setSelectedNationality(n); setNationalityOpen(false); }}>{n}</div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                Date of birth <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  ref={dobRef}
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="kp-date w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-gray-900 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600"
                  style={{ colorScheme: "light" }}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden>
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
              <SelectWithArrow
                value={identificationType}
                onChange={(e) => setIdentificationType(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 bg-white"
              >
                <option value="">Select identification type</option>
                <option value="passport">Passport</option>
                <option value="national_id">National ID</option>
              </SelectWithArrow>
            </div>
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                Enter passport no <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter passport no"
                value={passportNo}
                onChange={(e) => setPassportNo(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400"
              />
            </div>
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                Primary contact no <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-1">
                <div className="relative w-28">
                  {primaryCodeOpen && <div className="fixed inset-0 z-[199]" onClick={() => setPrimaryCodeOpen(false)} />}
                  <button type="button" onClick={() => setPrimaryCodeOpen(!primaryCodeOpen)} className="w-full rounded-lg border border-gray-300 px-2 py-2 text-left flex items-center justify-between bg-white" style={{ color: "#1F2937" }}>
                    <span className="truncate text-sm">{selectedPrimaryCode}</span>
                    <svg className="h-3 w-3 ml-1 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {primaryCodeOpen && (
                    <div className="absolute left-0 right-0 z-[200] overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg" style={{ bottom: "100%", marginBottom: 4, maxHeight: "50vh" }}>
                      {["+93 🇦🇫","+355 🇦🇱","+213 🇩🇿","+1 🇺🇸","+54 🇦🇷","+374 🇦🇲","+61 🇦🇺","+43 🇦🇹","+994 🇦🇿","+973 🇧🇭","+880 🇧🇩","+32 🇧🇪","+55 🇧🇷","+44 🇬🇧","+359 🇧🇬","+1 🇨🇦","+56 🇨🇱","+86 🇨🇳","+57 🇨🇴","+385 🇭🇷","+53 🇨🇺","+357 🇨🇾","+420 🇨🇿","+45 🇩🇰","+20 🇪🇬","+971 🇦🇪","+372 🇪🇪","+251 🇪🇹","+358 🇫🇮","+33 🇫🇷","+995 🇬🇪","+49 🇩🇪","+233 🇬🇭","+30 🇬🇷","+36 🇭🇺","+91 🇮🇳","+62 🇮🇩","+98 🇮🇷","+964 🇮🇶","+353 🇮🇪","+972 🇮🇱","+39 🇮🇹","+81 🇯🇵","+962 🇯🇴","+7 🇰🇿","+254 🇰🇪","+82 🇰🇷","+965 🇰🇼","+371 🇱🇻","+961 🇱🇧","+370 🇱🇹","+60 🇲🇾","+960 🇲🇻","+356 🇲🇹","+52 🇲🇽","+373 🇲🇩","+976 🇲🇳","+212 🇲🇦","+31 🇳🇱","+64 🇳🇿","+234 🇳🇬","+47 🇳🇴","+968 🇴🇲","+92 🇵🇰","+63 🇵🇭","+48 🇵🇱","+351 🇵🇹","+974 🇶🇦","+40 🇷🇴","+7 🇷🇺","+966 🇸🇦","+381 🇷🇸","+65 🇸🇬","+421 🇸🇰","+386 🇸🇮","+27 🇿🇦","+34 🇪🇸","+94 🇱🇰","+46 🇸🇪","+41 🇨🇭","+963 🇸🇾","+886 🇹🇼","+255 🇹🇿","+66 🇹🇭","+216 🇹🇳","+90 🇹🇷","+256 🇺🇬","+380 🇺🇦","+598 🇺🇾","+998 🇺🇿","+58 🇻🇪","+84 🇻🇳","+967 🇾🇪","+260 🇿🇲","+263 🇿🇼","+977 🇳🇵"].map(c => (
                        <div key={c} className="cursor-pointer px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 whitespace-nowrap" onClick={() => { setSelectedPrimaryCode(c); setPrimaryCodeOpen(false); }}>{c}</div>
                      ))}
                    </div>
                  )}
                </div>
                <input type="tel" placeholder="980-00-000-00" value={primaryPhone} onChange={(e) => setPrimaryPhone(e.target.value)} className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400" />
              </div>
            </div>
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                Emergency contact no <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-1">
                <div className="relative w-28">
                  {emergencyCodeOpen && <div className="fixed inset-0 z-[199]" onClick={() => setEmergencyCodeOpen(false)} />}
                  <button type="button" onClick={() => setEmergencyCodeOpen(!emergencyCodeOpen)} className="w-full rounded-lg border border-gray-300 px-2 py-2 text-left flex items-center justify-between bg-white" style={{ color: "#1F2937" }}>
                    <span className="truncate text-sm">{selectedEmergencyCode}</span>
                    <svg className="h-3 w-3 ml-1 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {emergencyCodeOpen && (
                    <div className="absolute left-0 right-0 z-[200] overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg" style={{ bottom: "100%", marginBottom: 4, maxHeight: "50vh" }}>
                      {["+93 🇦🇫","+355 🇦🇱","+213 🇩🇿","+1 🇺🇸","+54 🇦🇷","+374 🇦🇲","+61 🇦🇺","+43 🇦🇹","+994 🇦🇿","+973 🇧🇭","+880 🇧🇩","+32 🇧🇪","+55 🇧🇷","+44 🇬🇧","+359 🇧🇬","+1 🇨🇦","+56 🇨🇱","+86 🇨🇳","+57 🇨🇴","+385 🇭🇷","+53 🇨🇺","+357 🇨🇾","+420 🇨🇿","+45 🇩🇰","+20 🇪🇬","+971 🇦🇪","+372 🇪🇪","+251 🇪🇹","+358 🇫🇮","+33 🇫🇷","+995 🇬🇪","+49 🇩🇪","+233 🇬🇭","+30 🇬🇷","+36 🇭🇺","+91 🇮🇳","+62 🇮🇩","+98 🇮🇷","+964 🇮🇶","+353 🇮🇪","+972 🇮🇱","+39 🇮🇹","+81 🇯🇵","+962 🇯🇴","+7 🇰🇿","+254 🇰🇪","+82 🇰🇷","+965 🇰🇼","+371 🇱🇻","+961 🇱🇧","+370 🇱🇹","+60 🇲🇾","+960 🇲🇻","+356 🇲🇹","+52 🇲🇽","+373 🇲🇩","+976 🇲🇳","+212 🇲🇦","+31 🇳🇱","+64 🇳🇿","+234 🇳🇬","+47 🇳🇴","+968 🇴🇲","+92 🇵🇰","+63 🇵🇭","+48 🇵🇱","+351 🇵🇹","+974 🇶🇦","+40 🇷🇴","+7 🇷🇺","+966 🇸🇦","+381 🇷🇸","+65 🇸🇬","+421 🇸🇰","+386 🇸🇮","+27 🇿🇦","+34 🇪🇸","+94 🇱🇰","+46 🇸🇪","+41 🇨🇭","+963 🇸🇾","+886 🇹🇼","+255 🇹🇿","+66 🇹🇭","+216 🇹🇳","+90 🇹🇷","+256 🇺🇬","+380 🇺🇦","+598 🇺🇾","+998 🇺🇿","+58 🇻🇪","+84 🇻🇳","+967 🇾🇪","+260 🇿🇲","+263 🇿🇼","+977 🇳🇵"].map(c => (
                        <div key={c} className="cursor-pointer px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 whitespace-nowrap" onClick={() => { setSelectedEmergencyCode(c); setEmergencyCodeOpen(false); }}>{c}</div>
                      ))}
                    </div>
                  )}
                </div>
                <input type="tel" placeholder="980-00-000-00" value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400" />
              </div>
            </div>
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                National insurance no <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter national insurance no"
                value={nationalInsuranceNo}
                onChange={(e) => setNationalInsuranceNo(e.target.value)}
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
                value={tic}
                onChange={(e) => setTic(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400"
              />
            </div>
            <div className="sm:col-span-2 flex justify-between pt-6">
              <button
                type="button"
                onClick={() => router.push(ROUTES.admin.employees)}
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

      {/* Step 2: Address — Figma 473-5361 */}
      {currentStep === 2 && (
        <div className="add-employee-form-section rounded-2xl border border-gray-200 bg-white p-6">
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
                value={streetName}
                onChange={(e) => setStreetName(e.target.value)}
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
                value={streetNo}
                onChange={(e) => setStreetNo(e.target.value)}
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
                value={flatApartmentNo}
                onChange={(e) => setFlatApartmentNo(e.target.value)}
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
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
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
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
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
                value={province}
                onChange={(e) => setProvince(e.target.value)}
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
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400"
              />
            </div>
            <div className="relative">
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                Select country
              </label>
              {addressCountryOpen && <div className="fixed inset-0 z-[199]" onClick={() => setAddressCountryOpen(false)} />}
              <button type="button" onClick={() => setAddressCountryOpen(!addressCountryOpen)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-left flex items-center justify-between bg-white" style={{ color: selectedAddressCountry ? "#6B7280" : "#9CA3AF" }}>
                <span>{selectedAddressCountry || "Select country"}</span>
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {addressCountryOpen && (
                <div className="absolute left-0 right-0 z-[200] overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg" style={{ bottom: "100%", marginBottom: 4, maxHeight: "50vh" }}>
                  {["Afghanistan","Albania","Algeria","Argentina","Armenia","Australia","Austria","Azerbaijan","Bahrain","Bangladesh","Belarus","Belgium","Bolivia","Bosnia and Herzegovina","Brazil","Bulgaria","Cambodia","Cameroon","Canada","Chile","China","Colombia","Croatia","Cuba","Cyprus","Czech Republic","Denmark","Dominican Republic","Ecuador","Egypt","Estonia","Ethiopia","Finland","France","Georgia","Germany","Ghana","Greece","Guatemala","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kuwait","Latvia","Lebanon","Lithuania","Luxembourg","Malaysia","Maldives","Malta","Mexico","Moldova","Mongolia","Morocco","Nepal","Netherlands","New Zealand","Nigeria","Norway","Oman","Pakistan","Panama","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Saudi Arabia","Serbia","Singapore","Slovakia","Slovenia","South Africa","South Korea","Spain","Sri Lanka","Sweden","Switzerland","Syria","Taiwan","Tanzania","Thailand","Tunisia","Turkey","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"].map(c => (
                    <div key={c} className="cursor-pointer px-3 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => { setSelectedAddressCountry(c); setAddressCountryOpen(false); }}>{c}</div>
                  ))}
                </div>
              )}
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
        <div className="add-employee-form-section rounded-2xl border border-gray-200 bg-white p-6">
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
              <input type="text" placeholder="Enter legal entity" value={legalEntity} onChange={(e) => setLegalEntity(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400" />
            </div>
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                Group (optional)
              </label>
              <input type="text" placeholder="Enter group" value={groupName} onChange={(e) => setGroupName(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400" />
            </div>
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                Job title
              </label>
              <input type="text" placeholder="Enter job title" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600" />
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
              <input type="text" placeholder="Enter scope of work" value={scopeOfWork} onChange={(e) => setScopeOfWork(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400" />
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
              <input type="text" placeholder="Enter department role" value={departmentRole} onChange={(e) => setDepartmentRole(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400" />
            </div>
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                Direct manager email
              </label>
              <input type="email" placeholder="Enter direct manager email" value={directManagerEmail} onChange={(e) => setDirectManagerEmail(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400" />
            </div>
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                Contract start date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input ref={contractStartRef} type="date" value={contractStart} onChange={(e) => setContractStart(e.target.value)} className="kp-date w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-gray-900 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600" style={{ colorScheme: "light" }} />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </span>
              </div>
            </div>
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                Contract end date
              </label>
              <div className="relative">
                <input ref={contractEndRef} type="date" value={contractEnd} onChange={(e) => setContractEnd(e.target.value)} className="kp-date w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-gray-900 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600" style={{ colorScheme: "light" }} />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
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
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
              </SelectWithArrow>
            </div>
            <div>
              <label className="add-employee-label mb-2.5 block" style={LABEL_STYLE}>
                Part time percentage
              </label>
              <input type="number" placeholder="Enter part time percentage" value={partTimePercentage} onChange={(e) => setPartTimePercentage(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400" />
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
                <option value="Probation">Probation</option>
                <option value="Terminated">Terminated</option>
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
        <div className="add-employee-form-section rounded-2xl border border-gray-200 bg-white p-6">
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
                <option value="bank-transfer">Bank Transfer</option>
                <option value="crypto">Crypto Payment</option>
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
                <option value="EURO">EURO</option>
                <option value="BTC">BTC</option>
                <option value="USDC">USDC</option>
                <option value="USDT">USDT</option>
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
                  ref={varComp1DateRef}
                  type="date"
                  value={varComp1EffectiveDate}
                  onChange={(e) => setVarComp1EffectiveDate(e.target.value)}
                  className="kp-date w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-gray-900 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600"
                  style={{ colorScheme: "light" }}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden>
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
                <option value="daily">Daily</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
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
        <div className="add-employee-form-section rounded-2xl border border-gray-200 bg-white p-6">
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
            onSubmit={handleFinalSubmit}
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
            <div className="sm:col-span-2 flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
              {submitError ? (
                <div className="flex-1 rounded-md bg-red-50 p-2 text-sm text-red-700">{submitError}</div>
              ) : <div className="flex-1" />}
              <div className="flex items-center justify-end gap-3">
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
                  disabled={createMut.isPending}
                  className="rounded-lg px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
                  style={{ backgroundColor: "#0F50DB", borderRadius: "8px" }}
                >
                  {createMut.isPending ? "Saving…" : "Add Employee"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}