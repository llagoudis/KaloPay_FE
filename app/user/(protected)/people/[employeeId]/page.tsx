"use client";

import { useState } from "react";
import Link from "next/link";
import { DASHBOARD_ROUTES } from "@/components/user/dashboard/routes";
import EditPersonalDetailsModal, { type EditPersonalForm } from "@/components/user/people/EditPersonalDetailsModal";
import EditAddressModal, { type EditAddressForm } from "@/components/user/people/EditAddressModal";
import EditEmploymentModal from "@/components/user/people/EditEmploymentModal";
import EditCompensationModal from "@/components/user/people/EditCompensationModal";
import EditBankWalletModal from "@/components/user/people/EditBankWalletModal";
import EditNotesModal from "@/components/user/people/EditNotesModal";

/** Mock data – matches Figma Employee Profile. */
const MOCK_PROFILE = {
  firstName: "Carlos",
  lastName: "Santana",
  email: "sameer.khan@gamil.com",
  phone: "+92 300 1234567",
  gender: "Male",
  nationality: "Pakistani",
  dateOfBirth: "22/07/1988",
  placeOfBirth: "Lahore",
  maritalStatus: "Married",
  children: "2",
  cnicNo: "35201-1234567-1",
  passportNo: "0987654321",
  taxId: "12345678",
  drivingLicense: "N/A",
  cnicExpiry: "22/07/2026",
  // Address
  houseNo: "12",
  streetNo: "50-A",
  blockArea: "Block 7",
  city: "Lahore",
  stateProvince: "Punjab",
  country: "Pakistan",
  postalCode: "54000",
  // Work
  joiningDate: "22 April, 2024",
  jobTitle: "Accountant",
  department: "Technology",
  contractType: "Full-Time",
  schedule: "Standard Work Hours (9-5)",
  reportingTo: "Zeeshan Akram",
  workLocation: "Office",
  employmentType: "Permanent",
  workStatus: "Active",
  shiftTiming: "9AM - 5PM",
  company: "Kalopay",
  branch: "Head Office",
  role: "Employee",
  leavePolicy: "Standard",
  overtimeEligible: "Yes",
  probationPeriod: "3 Months",
  // Compensation
  monthlySalary: "PKR 150,000",
  paymentMethod: "Bank Transfer",
  currency: "PKR",
  paymentFrequency: "Monthly",
  taxApplicable: "Yes",
  bonusStructure: "Standard",
  allowance: "PKR 10,000",
  deductions: "N/A",
  benefits: "Health Insurance",
  // Bank
  bankName: "HBL Bank",
  accountNumber: "1234-5678-9012-3456",
  iban: "PK36 HBL 0000 0000 0000 0000",
  accountTitle: "Sameer Khan",
  branchCode: "0123",
  // Header (nav ke niche wala card)
  onboardingStatus: "ONBOARDING OVERDUE" as const,
  // Personal Details card (image layout)
  employeeNo: "EMP-121",
  personalEmail: "email@example.com",
  workEmail: "email@example.com",
  fullName: "John Doe",
  nationalIdNumber: "123 456 789",
  primaryContactNo: "+32 123 456 7890",
  emergencyContactNo: "+32 123 456 7890",
  nationalInsuranceNo: "123 456 789",
  tic: "123 456",
  dependants: "-",
  workPermitVisa: "-",
  residencePermitExpiry: "Oct 1st 2025",
  dateOfBirthDisplay: "Oct 1st 2025",
  // Address (image 1)
  streetName: "Paxton street",
  streetNumber: "181",
  flatApartmentNumber: "141",
  floor: "4th",
  postalCode: "12345",
  city: "Las Vegas",
  provinceRegionState: "California",
  countryAddress: "USA",
  // Employment & Role Details (image 2)
  legalEntity: "Aperture Science, LLC",
  scopeOfWork: "Develop mobile applications",
  departmentRole: "Module Lead - Payments",
  contractStartDate: "01/04/2024",
  contractEndDate: "31/03/2027",
  employeeIdEmp: "EMP-1234",
  groupOptional: "Product Engineering",
  seniorityLevel: "L5 (Senior)",
  departmentTech: "Technology & Innovation",
  directManagerEmail: "jane.doe@example.com",
  partTimePercentage: "60%",
  statusDash: "-",
  employmentTypeDisplay: "Full-Time Permanent",
  workLocationCountry: "Los Angeles",
  // Compensation & Payment (image 2)
  paymentPreference: "-",
  compensationType: "Salary + Bonus",
  shiftSchedule: "-",
  probationPeriodComp: "12 months",
  grossAnnualSalary: "95,000",
  workingHours: "-",
  workingDaysPerWeek: "-",
  noticePeriod: "15 Days",
  // Bank & Wallet (image 3)
  swiftBic: "GBCBUS33",
  defaultPaymentMethodFiatCrypto: "Fiat",
  digitalWalletAddress: "0x2d3CID076722dC7039089A1264F7c518A7E0831A",
  bankAddress: "123 Financial Ave, London, SWIA DAA",
  ibanBank: "GBB20BCB12345698765432",
  currencyPreference: "-",
  // Notes
  internalNotes: "",
};

const KYC_MOCK_FILES = [
  { id: "1", name: "Personal Note", format: "PNG", size: "12MB", progress: 100 },
  { id: "2", name: "Personal Note", format: "PNG", size: "12MB", progress: 100 },
  { id: "3", name: "Personal Note", format: "PNG", size: "12MB", progress: 100 },
  { id: "4", name: "Personal Note", format: "PNG", size: "12MB", progress: 100 },
  { id: "5", name: "Personal Note", format: "PNG", size: "12MB", progress: 100 },
  { id: "6", name: "Personal Note", format: "PNG", size: "12MB", progress: 100 },
];

/** Map profile to Edit Personal Details form initial values. */
function profileToEditPersonalInitial(p: typeof MOCK_PROFILE): Partial<EditPersonalForm> {
  const parseCode = (s: string) => {
    const match = s?.match(/^\s*(\+\d+)\s*(.*)$/);
    return match ? [match[1], match[2].trim()] : ["+977", s?.replace(/\D/g, "") ?? ""];
  };
  const [primaryCode, primaryNum] = parseCode(p.primaryContactNo ?? "");
  const [emergencyCode, emergencyNum] = parseCode(p.emergencyContactNo ?? "");
  const fullName = (p.fullName || `${p.firstName} ${p.lastName}`).trim();
  const parts = fullName.split(/\s+/);
  const name = parts[0] ?? "";
  const surname = parts.length > 1 ? parts[parts.length - 1]! : "";
  const middleName = parts.length > 2 ? parts.slice(1, -1).join(" ") : "";
  return {
    name,
    middleName,
    surname,
    personalEmail: p.personalEmail ?? "",
    workEmail: p.workEmail ?? "",
    nationality: (p.nationality === "Pakistani" ? "PK" : p.nationality) ?? "",
    dateOfBirth: p.dateOfBirth ? toDateInputValue(p.dateOfBirth) : "",
    gender: (p.gender ?? "").toLowerCase(),
    maritalStatus: (p.maritalStatus ?? "").toLowerCase(),
    nationalIdNumber: p.nationalIdNumber ?? "",
    passportNumber: p.passportNo ?? "",
    primaryCountryCode: primaryCode,
    primaryContact: primaryNum,
    emergencyCountryCode: emergencyCode,
    emergencyContact: emergencyNum,
    nationalInsuranceNo: p.nationalInsuranceNo ?? "",
    tic: p.tic ?? "",
    dependants: p.dependants ?? "",
    workPermitVisa: p.workPermitVisa ?? "",
    residencePermitExpiry: p.residencePermitExpiry ? toDateInputValue(p.residencePermitExpiry) : "",
  };
}

function toDateInputValue(display: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(display)) return display;
  const ddmmyy = display.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (ddmmyy) return `${ddmmyy[3]}-${ddmmyy[2]!.padStart(2, "0")}-${ddmmyy[1]!.padStart(2, "0")}`;
  const months: Record<string, string> = { jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06", jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12" };
  const m = display.toLowerCase().match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2})(?:st|nd|rd|th)?\s*(\d{4})/);
  if (m) return `${m[3]}-${months[m[1]!] ?? "01"}-${(m[2] ?? "01").padStart(2, "0")}`;
  return "";
}

function profileToEditAddressInitial(p: typeof MOCK_PROFILE): Partial<EditAddressForm> {
  return {
    streetName: p.streetName ?? "",
    streetNumber: p.streetNumber ?? "",
    flatApartmentNumber: p.flatApartmentNumber ?? "",
    floor: p.floor ?? "",
    postalCode: p.postalCode ?? "",
    city: p.city ?? "",
    provinceRegionState: p.provinceRegionState ?? "",
    country: p.countryAddress ?? "",
  };
}

/** Alag section card – light blue header + Edit, white content, rounded, gap ke liye standalone. */
function SectionCard({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit?: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="emp-profile-section-card overflow-hidden rounded-xl border border-[#e5e7eb] bg-[#f7f7fa]">
      <div className="emp-profile-section-header flex items-center justify-between gap-2 border-b border-[#e5e7eb] bg-[#DEEEFF] px-4 py-3 sm:px-6 sm:py-4">
        <h2 className="emp-profile-section-title whitespace-nowrap align-middle text-[13px] font-medium leading-[20px] tracking-normal text-[#000000] [font-family:var(--font-poppins),Poppins,sans-serif] sm:text-[16px]">
          {title}
        </h2>
        {onEdit && (
          <button type="button" onClick={onEdit} className="shrink-0 text-sm font-medium text-[var(--color-dash-accent)] hover:underline">
          Edit
        </button>
        )}
      </div>
      <div className="emp-profile-section-body bg-[#f7f7fa] px-4 py-4 sm:px-6 sm:py-5">{children}</div>
    </section>
  );
}

function DetailGrid({ items }: { items: [string, string][] }) {
  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
      {items.map(([label, value]) => (
        <div key={label}>
          <span className="block text-sm text-[#6b7280]">{label}</span>
          <p className="mt-0.5 text-sm font-medium text-[#1f2937]">{value}</p>
        </div>
      ))}
    </div>
  );
}

/** Personal Details content – two columns 50-50 (used inside SectionCard). */
function PersonalDetailsContent({ p }: { p: typeof MOCK_PROFILE }) {
  return (
    <div className="grid w-full grid-cols-1 gap-x-16 gap-y-5 sm:grid-cols-2">
      <div className="min-w-0 space-y-5">
        {[
          ["Employee no", p.employeeNo],
          ["Personal email", p.personalEmail],
          ["Nationality", p.nationality],
          ["Gender", p.gender],
          ["National ID Number", p.nationalIdNumber],
          ["Primary contact no", p.primaryContactNo],
          ["National insurance no", p.nationalInsuranceNo],
          ["Dependants", p.dependants],
          ["Residence Permit Expiry", p.residencePermitExpiry],
        ].map(([label, value]) => (
          <div key={String(label)}>
            <span className="block text-sm text-[#6b7280]">{label}</span>
            <p className="mt-1 text-sm font-medium text-[#1f2937]">{value}</p>
          </div>
        ))}
      </div>
      <div className="min-w-0 space-y-5">
        {[
          ["Full name", p.fullName],
          ["Work email", p.workEmail],
          ["Date of birth", p.dateOfBirthDisplay],
          ["Marital Status", p.maritalStatus],
          ["Passport Number", p.passportNo],
          ["Emergency contact no", p.emergencyContactNo],
          ["TIC (Tax Identification code)", p.tic],
          ["Work permit/Visa", p.workPermitVisa],
        ].map(([label, value]) => (
          <div key={String(label)}>
            <span className="block text-sm text-[#6b7280]">{label}</span>
            <p className="mt-1 text-sm font-medium text-[#1f2937]">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Employee Profile screen – Figma Payroll (Profile / Employee / Name). Same as design. */
export default function EmployeeProfilePage({
  params,
}: {
  params: { employeeId: string };
}) {
  const p = MOCK_PROFILE;
  const [kycFiles, setKycFiles] = useState(KYC_MOCK_FILES);
  const [editPersonalOpen, setEditPersonalOpen] = useState(false);
  const [editAddressOpen, setEditAddressOpen] = useState(false);
  const [editEmploymentOpen, setEditEmploymentOpen] = useState(false);
  const [editCompensationOpen, setEditCompensationOpen] = useState(false);
  const [editBankWalletOpen, setEditBankWalletOpen] = useState(false);
  const [editNotesOpen, setEditNotesOpen] = useState(false);

  function removeKycFile(id: string) {
    setKycFiles((prev) => prev.filter((f) => f.id !== id));
  }

  return (
    <div className="min-h-full w-full bg-dash-page" data-dashboard-theme data-page="employee-profile">
      <div className="dash-shell w-full py-6">
        {/* Employee header card – back, avatar + name barabar, role + status neeche */}
        <div className="emp-profile-header-card mb-6 flex flex-col gap-4 rounded-xl border border-[#e5e7eb] bg-[#f7f7fa] px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-1 items-start gap-2 sm:gap-3">
            <Link
              href={DASHBOARD_ROUTES.people}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#000000] hover:bg-[#e5e7eb]"
              aria-label="Back to People"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M19 12H5" />
                <path d="m12 19-7-7 7-7" />
              </svg>
            </Link>
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#DBEAFE] text-[14px] font-normal leading-[24px] text-[#0F4FDB]"
              style={{ fontFamily: 'var(--font-poppins)' }}
            >
              {p.firstName[0]}
              {p.lastName[0]}
            </span>
            <div className="min-w-0">
              <h1 className="break-words text-[18px] font-semibold leading-[24px] tracking-normal text-[#000000] [font-family:var(--font-poppins),Poppins,sans-serif] sm:text-[24px] sm:leading-[28px]">
                {p.firstName} {p.lastName}
              </h1>
              <div className="mt-1 flex items-center gap-2">
                <span className="truncate text-[11px] font-normal text-[#6B7280] sm:text-sm">{p.jobTitle}</span>
                {p.onboardingStatus && (
                  <span className="inline-flex shrink-0 items-center gap-0.5 rounded-md bg-[#FEF2F2] px-1 py-0.5 align-middle text-[7px] font-medium leading-tight tracking-normal text-[#DC2626] [font-family:var(--font-poppins),Poppins,sans-serif] sm:gap-1 sm:px-1.5 sm:text-[11px]">
                    <span className="h-1 w-1 shrink-0 rounded-full bg-[#DC2626] sm:h-1.5 sm:w-1.5" aria-hidden />
                    <span className="whitespace-nowrap uppercase">ONBOARDING OVERDUE</span>
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg border border-[#d1d5db] bg-[#f7f7fa] px-3 py-2 align-middle text-[13px] font-medium leading-[100%] tracking-normal text-[#6B7280] transition hover:bg-[#ededf2] [font-family:var(--font-poppins),Poppins,sans-serif] sm:px-4 sm:text-[14px]"
            >
              View in org chart
            </button>
            <button
              type="button"
              className="box-border inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#DFDFDF] bg-[#f7f7fa] p-0 text-center transition hover:bg-[#ededf2]"
              aria-label="More actions"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="shrink-0" aria-hidden>
                <circle cx="12" cy="6" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="18" r="1.5" />
              </svg>
            </button>
          </div>
        </div>

        {/* Main div – isi ke andar saari cards */}
        <div className="emp-profile-main-card rounded-xl border border-[#e5e7eb] bg-[#f7f7fa] p-3 sm:p-6">
          <div className="flex flex-col gap-4">
            <SectionCard title="Personal Details" onEdit={() => setEditPersonalOpen(true)}>
            <PersonalDetailsContent p={p} />
          </SectionCard>

          <SectionCard title="Address" onEdit={() => setEditAddressOpen(true)}>
              <DetailGrid
              items={[
                ["Street name", p.streetName],
                ["Street number", p.streetNumber],
                ["Flat/Appartment number", p.flatApartmentNumber],
                ["Floor", p.floor],
                ["Postal code", p.postalCode],
                ["City", p.city],
                ["Province/region/state", p.provinceRegionState],
                ["Country", p.countryAddress],
              ]}
            />
          </SectionCard>

          <SectionCard title="Employment & Role Details" onEdit={() => setEditEmploymentOpen(true)}>
            <DetailGrid
              items={[
                ["Legal entity", p.legalEntity],
                ["Employee ID", p.employeeIdEmp],
                ["Job title", p.jobTitle],
                ["Group (optional)", p.groupOptional],
                ["Scope of work", p.scopeOfWork],
                ["Seniority level", p.seniorityLevel],
                ["Department role", p.departmentRole],
                ["Department", p.departmentTech],
                ["Contract start date", p.contractStartDate],
                ["Direct manager email", p.directManagerEmail],
                ["Contract end date", p.contractEndDate],
                ["Employment type", p.employmentTypeDisplay],
                ["Part time percentage", p.partTimePercentage],
                ["Work Location/Country", p.workLocationCountry],
                ["Status", p.statusDash],
                ["Employee Status", p.workStatus],
              ]}
            />
          </SectionCard>

          <SectionCard title="Compensation & Payment" onEdit={() => setEditCompensationOpen(true)}>
            <DetailGrid
              items={[
                ["Payment method", p.paymentMethod],
                ["Payment currency code", p.currency],
                ["Payment Preference", p.paymentPreference],
                ["Gross annual salary", p.grossAnnualSalary],
                ["Compensation type", p.compensationType],
                ["Working Hours", p.workingHours],
                ["Shift Schedule", p.shiftSchedule],
                ["Working days per week", p.workingDaysPerWeek],
                ["Probation Period", p.probationPeriodComp],
                ["Notice Period", p.noticePeriod],
              ]}
            />
          </SectionCard>

          <SectionCard title="Bank & Wallet Details" onEdit={() => setEditBankWalletOpen(true)}>
            <DetailGrid
              items={[
                ["Bank name", p.bankName],
                ["Bank address", p.bankAddress],
                ["SWIFT/BIC", p.swiftBic],
                ["IBAN", p.ibanBank],
                ["Default payment method (fiat or crypto)", p.defaultPaymentMethodFiatCrypto],
                ["Currency Preference", p.currencyPreference],
                ["Digital wallet address (if crypto)", p.digitalWalletAddress],
              ]}
            />
          </SectionCard>

          <SectionCard title="Notes" onEdit={() => setEditNotesOpen(true)}>
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#9ca3af] text-xs font-semibold text-white" aria-hidden>!</span>
              <p className="notes-section-text">
                This space is for internal notes. It&apos;s visible to your organization&apos;s managers only.
              </p>
            </div>
          </SectionCard>
          </div>
        </div>

        <EditPersonalDetailsModal
          open={editPersonalOpen}
          onClose={() => setEditPersonalOpen(false)}
          onSave={() => { /* optional: update local state or refetch */ }}
        />

        <EditAddressModal
          open={editAddressOpen}
          onClose={() => setEditAddressOpen(false)}
          onSave={() => { /* optional */ }}
        />

        <EditEmploymentModal
          open={editEmploymentOpen}
          onClose={() => setEditEmploymentOpen(false)}
          onSave={() => { /* optional */ }}
        />

        <EditCompensationModal
          open={editCompensationOpen}
          onClose={() => setEditCompensationOpen(false)}
          initialValues={{
            paymentMethod: p.paymentMethod,
            paymentCurrencyCode: p.currency,
            paymentPreference: p.paymentPreference,
            grossAnnualSalary: p.grossAnnualSalary,
            compensationType: p.compensationType,
            workingHours: p.workingHours,
            shiftSchedule: p.shiftSchedule,
            workingDaysPerWeek: p.workingDaysPerWeek,
            probationPeriod: p.probationPeriodComp,
            noticePeriod: p.noticePeriod,
          }}
          onSave={() => { /* optional */ }}
        />

        <EditBankWalletModal
          open={editBankWalletOpen}
          onClose={() => setEditBankWalletOpen(false)}
          initialValues={{
            bankName: p.bankName,
            bankAddress: p.bankAddress,
            swiftBic: p.swiftBic,
            iban: p.ibanBank,
            defaultPaymentMethod: p.defaultPaymentMethodFiatCrypto,
            currencyPreference: p.currencyPreference,
            digitalWalletAddress: p.digitalWalletAddress,
          }}
          onSave={() => { /* optional */ }}
        />

        <EditNotesModal
          open={editNotesOpen}
          onClose={() => setEditNotesOpen(false)}
          initialValues={{ notes: p.internalNotes }}
          onSave={() => { /* optional */ }}
        />

        {/* KYC Documents – main div ke bahar, page bg par alag card */}
        <div className="emp-profile-kyc-card mt-6 overflow-hidden rounded-xl border border-[#e5e7eb] bg-[#f7f7fa]">
          <div className="emp-profile-kyc-header bg-[#f7f7fa] px-6 py-4">
            <h2 className="emp-profile-kyc-title align-middle text-[20px] font-semibold leading-[32px] tracking-normal text-[#000000] [font-family:var(--font-poppins),Poppins,sans-serif]">
              KYC Documents
            </h2>
          </div>
          <div className="p-6">
          <div
            className="mx-auto box-border flex w-full max-w-[1232px] min-h-[147px] flex-col items-center justify-center gap-3 rounded-[8px] border-[3px] border-dashed border-[#E5E7EB] bg-gradient-to-r from-white to-[#E5F0FF] px-4 py-8 text-center sm:px-12 sm:py-12 lg:px-[308px] lg:py-[61px]"
            role="button"
            tabIndex={0}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-[#0F4FDB]">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-semibold text-[#1f2937]">Upload or drag your files here</p>
              <p className="text-xs text-[#6B7280]">Maximum File Size is 20MB</p>
              <p className="text-xs text-[#6B7280]">Supported File Types are .png, .jpeg, .pdf, .csv</p>
            </div>
          </div>
          <h3 className="mt-6 mb-3 text-base font-bold text-[#1f2937]">Uploaded files</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {kycFiles.map((file, index) => (
              <div
                key={file.id}
                className="emp-profile-kyc-file overflow-hidden rounded-lg border border-[#EAECF0] bg-[#fcfcfc] p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-dash-accent)] text-white">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#1f2937]">{file.name}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-4 text-[12px] font-medium leading-[14px] tracking-[-0.05em] text-[#9CA3AF] [font-family:var(--font-inter),Inter,sans-serif]">
                      <span>File Format: {file.format}</span>
                      <span>File Size: {file.size}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeKycFile(file.id)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#E5E7EB] bg-[#f7f7fa] text-[#6B7280] hover:bg-[#ededf2]"
                    aria-label={`Remove ${file.name}`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                  </button>
                </div>
                {/* Blue line: pehli chaar cards par; aakhri do par nahi */}
                {index < kycFiles.length - 2 ? (
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#E1EFFE]">
                    <div
                      className="h-full w-1/2 rounded-full bg-[var(--color-dash-accent)]"
                    />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* Last div – isi ke andar saare inputs (4 cards) – bg/border upper divs jaisa */}
        <div className="emp-profile-links-card mt-6 rounded-xl border border-[#e5e7eb] bg-[#f7f7fa] p-4">
          <div className="flex flex-col gap-4">
            <a
            href="#"
            className="emp-profile-link-item flex items-center gap-4 rounded-lg border border-[#DFDFDF] bg-transparent px-6 py-4 transition hover:bg-[#f9fafb]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center text-[#6B7280]" aria-hidden>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity={1}>
                <rect x="0.5" y="0.5" width="14" height="14" rx="2" />
                <line x1="2" y1="4" x2="13" y2="4" />
                <line x1="2" y1="7" x2="8" y2="7" />
                <line x1="2" y1="9.5" x2="8" y2="9.5" />
              </svg>
            </span>
            <div className="min-w-0 flex-1 flex flex-col gap-1">
              <p className="text-[#1f2937] font-normal text-[16px] leading-[20px]" style={{ fontFamily: 'var(--font-poppins)' }}>Payments, expenses & work submissions</p>
              <p className="text-sm text-[#6b7280]">Review their submitted invoices and manage any payments</p>
            </div>
          </a>
          <a
            href="#"
            className="emp-profile-link-item flex items-center gap-4 rounded-lg border border-[#DFDFDF] bg-transparent px-6 py-4 transition hover:bg-[#f9fafb]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center text-[#6B7280]" aria-hidden>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </span>
            <div className="min-w-0 flex-1 flex flex-col gap-1">
              <p className="text-[#1f2937] font-normal text-[16px] leading-[20px]" style={{ fontFamily: 'var(--font-poppins)' }}>Personal information</p>
              <p className="text-sm text-[#6b7280]">Check their contact info and other personal details</p>
            </div>
          </a>
          <a
            href="#"
            className="emp-profile-link-item flex items-center gap-4 rounded-lg border border-[#DFDFDF] bg-transparent px-6 py-4 transition hover:bg-[#f9fafb]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center text-[#6B7280]" aria-hidden>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </span>
            <div className="min-w-0 flex-1 flex flex-col gap-1">
              <p className="text-[#1f2937] font-normal text-[16px] leading-[20px]" style={{ fontFamily: 'var(--font-poppins)' }}>Time off</p>
              <p className="text-sm text-[#6b7280]">Review and manage time off information</p>
            </div>
          </a>
          <a
            href="#"
            className="emp-profile-link-item flex items-center gap-4 rounded-lg border border-[#DFDFDF] bg-transparent px-6 py-4 transition hover:bg-[#f9fafb]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center text-[#6B7280]" aria-hidden>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <line x1="10" y1="9" x2="8" y2="9" />
              </svg>
            </span>
            <div className="min-w-0 flex-1 flex flex-col gap-1">
              <p className="text-[#1f2937] font-normal text-[16px] leading-[20px]" style={{ fontFamily: 'var(--font-poppins)' }}>Payslips</p>
              <p className="text-sm text-[#6b7280]">Open and review payslips history</p>
            </div>
          </a>
          </div>
        </div>
      </div>
    </div>
  );
}
