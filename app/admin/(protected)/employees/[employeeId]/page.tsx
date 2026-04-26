"use client";

import Link from "next/link";
import { use, useRef, useState } from "react";
import { ROUTES } from "@/lib/constants/routes";
type TabId = "details" | "documents" | "accounts";

const SECTION_HEADER_STYLE = "border-b border-gray-200 px-4 py-3 flex items-center justify-between";

const DOCUMENTS_TABLE_HEADER_STYLE: React.CSSProperties = {
  fontFamily: "var(--font-poppins), Poppins, sans-serif",
  fontWeight: 400,
  fontSize: "14px",
  lineHeight: "16px",
  letterSpacing: "0%",
  color: "#6B7280",
  verticalAlign: "middle",
};

const ACCOUNTS_DETAILS_STYLE: React.CSSProperties = {
  fontFamily: "var(--font-poppins), Poppins, sans-serif",
  fontWeight: 400,
  fontSize: "14px",
  lineHeight: "20px",
  letterSpacing: "0%",
  color: "#1F2937",
  verticalAlign: "middle",
};

const MOCK_DETAIL: {
  personal: { employeeNo: string; nationality: string; personalEmail: string; dateOfBirth: string; socialInsuranceNo: string; emergencyContactNo: string; name: string; surname: string; workEmail: string; identificationNo: string; idNumber: string };
  address: { streetName: string; flatApartmentNo: string; postalCode: string; city: string; streetNo: string; floor: string; province: string; country: string };
  employment: { legalEntity: string; jobTitle: string; scopeOfWork: string; departmentRole: string; contractStart: string; employmentType: string; employeeStatus: string; group: string; seniority: string; department: string; directManagerEmail: string; contractEnd: string; partTimePercentage: string };
  compensation: { paymentMethod: string; stableCoinCode: string; compensationType: string; varComp1EffectiveDate: string; varComp1Type: string; paymentCurrencyCode: string; grossAnnualSalary: string; varComp1Title: string; varComp1Frequency: string; varComp1CompensationAmount: string };
  bank: { bankName: string; swiftBic: string; usdtErcWalletAddress: string; usdcPolyWalletAddress: string; bankAddress: string; iban: string; usdcErcWalletAddress: string; btcWalletAddress: string };
} = {
  personal: { employeeNo: "EMP-121", nationality: "American", personalEmail: "email@example.com", dateOfBirth: "Oct 1st 2025", socialInsuranceNo: "123 456 789", emergencyContactNo: "+32 123 456 7890", name: "John", surname: "Doe", workEmail: "email@example.com", identificationNo: "MKB 123 456", idNumber: "ID-987 654" },
  address: { streetName: "Paxton street", flatApartmentNo: "141", postalCode: "12345", city: "Las Vegas", streetNo: "181", floor: "4th", province: "California", country: "USA" },
  employment: { legalEntity: "Aperture Science, LLC", jobTitle: "Senior Frontend Developer", scopeOfWork: "Develop mobile applications", departmentRole: "Module Lead - Payments", contractStart: "01/04/2024", employmentType: "Full-Time Permanent", employeeStatus: "Active", group: "Product Engineering", seniority: "L5 (Senior)", department: "Technology & Innovation", directManagerEmail: "jane.doe@example.com", contractEnd: "31/03/2027", partTimePercentage: "60%" },
  compensation: { paymentMethod: "Bank Transfer", stableCoinCode: "USDC", compensationType: "Salary + Bonus", varComp1EffectiveDate: "01/01/2025", varComp1Type: "Percentage of Salary", paymentCurrencyCode: "USD", grossAnnualSalary: "95,000", varComp1Title: "Performance Bonus", varComp1Frequency: "Annually", varComp1CompensationAmount: "10%" },
  bank: { bankName: "Global Commerce Bank", swiftBic: "GBCBUS33", usdtErcWalletAddress: "0x4B08bFfE939A7Ff59E813eD0c4c47F5C5B9A6E9D", usdcPolyWalletAddress: "0x2d3C1D076722dC7a39d89A12e4F7c5f8A7E0B3fA", bankAddress: "123 Financial Ave, London, SW1A 0AA", iban: "GB82GBCB12345698765432", usdcErcWalletAddress: "0x8a92f026D7D31969B672323a78C4e55e0A3F17bE", btcWalletAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kvrg2u7p8y" },
};

const TABS: { id: TabId; label: string }[] = [
  { id: "details", label: "Details" },
  { id: "documents", label: "Documents" },
  { id: "accounts", label: "Accounts" },
];

const BOTTOM_CARDS: { icon: "document" | "person" | "clock" | "payslip"; title: string; description: string }[] = [
  { icon: "document", title: "Payments, expenses & work submissions", description: "Review their submitted invoices and manage any payments" },
  { icon: "person", title: "Personal information", description: "Check their contact info and other personal details" },
  { icon: "clock", title: "Time off", description: "Review and manage time off information" },
  { icon: "payslip", title: "Payslips", description: "Open and review payslips history" },
];

function BottomCardIcon({ type }: { type: "document" | "person" | "clock" | "payslip" }) {
  const base = "flex h-10 w-10 flex-shrink-0 items-center justify-center text-gray-500";
  if (type === "document") return <span className={base} aria-hidden><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></span>;
  if (type === "person") return <span className={base} aria-hidden><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></span>;
  if (type === "clock") return <span className={base} aria-hidden><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>;
  return <span className={base} aria-hidden><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></span>;
}

/* Har detail: label upper (upar), value niche (neeche) — upper niche layout */
function DetailRow({
  label,
  value,
  valueClassName = "",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="mb-4 min-w-0 flex flex-col gap-0.5">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`min-w-0 text-sm font-medium text-gray-900 break-words [overflow-wrap:anywhere] ${valueClassName}`}>
        {value}
      </span>
    </div>
  );
}

const EDIT_MODAL_LABEL_STYLE: React.CSSProperties = {
  fontFamily: "var(--font-poppins), Poppins, sans-serif",
  fontWeight: 500,
  fontSize: "16px",
  lineHeight: "20px",
  letterSpacing: "0%",
  color: "#1F2937",
  verticalAlign: "middle",
};

const SECTION_TITLE_LINE_CLAMP: React.CSSProperties = {
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

function SectionCard({ title, children, onEdit }: { title: string; children: React.ReactNode; onEdit?: () => void }) {
  return (
    <div className="view-individual-section-card overflow-hidden rounded-xl border border-gray-200">
      <div className={`${SECTION_HEADER_STYLE} view-individual-section-header gap-3`}>
        <span
          className="view-individual-section-title responsive-card-heading min-w-0 flex-1 text-[13px] leading-[17px] text-gray-900 sm:text-[15px] sm:leading-[19px]"
          style={{
            fontFamily: "var(--font-poppins), Poppins, sans-serif",
            fontWeight: 400,
            letterSpacing: "0%",
            verticalAlign: "middle",
            ...SECTION_TITLE_LINE_CLAMP,
          }}
        >
          {title}
        </span>
        <button type="button" onClick={onEdit} className="shrink-0 text-sm font-medium text-blue-600 hover:underline">
          Edit
        </button>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export default function AdminEmployeeDetailPage({
  params,
}: {
  params: Promise<{ employeeId: string }>;
}) {
  const { employeeId } = use(params);
  const [activeTab, setActiveTab] = useState<TabId>("details");
  const [editPersonalDetailsOpen, setEditPersonalDetailsOpen] = useState(false);
  const [nationalityOpen, setNationalityOpen] = useState(false);
  const [selectedNationality, setSelectedNationality] = useState("");
  const dobInputRef = useRef<HTMLInputElement>(null);
  const contractStartRef = useRef<HTMLInputElement>(null);
  const contractEndRef = useRef<HTMLInputElement>(null);
  const varComp1DateRef = useRef<HTMLInputElement>(null);
  const [editAddressOpen, setEditAddressOpen] = useState(false);
  const [editEmploymentOpen, setEditEmploymentOpen] = useState(false);
  const [editCompensationOpen, setEditCompensationOpen] = useState(false);
  const [editBankOpen, setEditBankOpen] = useState(false);
  const [editNotesOpen, setEditNotesOpen] = useState(false);
  const [addDocumentOpen, setAddDocumentOpen] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [phoneCodeOpen, setPhoneCodeOpen] = useState(false);
  const [selectedPhoneCode, setSelectedPhoneCode] = useState("+93");
  const d = MOCK_DETAIL;

  return (
    <div className="w-full space-y-6">
      {/* 1. Title card - "View individual" */}
      <div className="bg-white px-6 py-5" style={{ borderRadius: "10px", boxShadow: "none" }}>
        <h1
          className="admin-page-heading font-semibold"
          style={{
            fontFamily: "var(--font-poppins), Poppins, sans-serif",
            fontSize: "22px",
            lineHeight: "28px",
            color: "#0E1620",
          }}
        >
          View Individual
        </h1>
      </div>

      {/* 2. Tabs card - Details, Documents, Accounts */}
      <div
        className="admin-tab-strip grid grid-cols-3 items-center gap-1"
        style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "8px", border: "1px solid #E5E7EB" }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`min-w-0 whitespace-nowrap rounded-[12px] px-2 py-2 text-center text-[13px] font-medium transition-colors sm:px-4 sm:py-2.5 sm:text-sm ${
              activeTab === tab.id
                ? "admin-tab-btn--active text-white"
                : "admin-tab-btn--inactive text-[#6C757D]"
            }`}
            style={
              activeTab === tab.id
                ? { backgroundColor: "#0F50DB" }
                : undefined
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "details" && (
        <div
          className="view-individual-details-parent flex min-h-[200px] flex-col gap-4 rounded-2xl bg-white p-4"
          role="region"
          aria-label="View individual details"
        >
            {/* Parent Div (blue mat karna — sirf structure ke liye). Iske andar har section ka alag div: Personal Details, Address, Employment & Role Details, Compensation & Payment, Bank & Wallet Details, Notes, + 4 collapsible divs. */}
            {/* Div 1: Personal Details */}
            <SectionCard title="Personal Details" onEdit={() => setEditPersonalDetailsOpen(true)}>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <DetailRow label="Employee no" value={d.personal.employeeNo} />
                  <DetailRow label="Nationality" value={d.personal.nationality} />
                  <DetailRow label="Personal email" value={d.personal.personalEmail} />
                  <DetailRow label="Date of birth" value={d.personal.dateOfBirth} />
                  <DetailRow label="Social Insurance no" value={d.personal.socialInsuranceNo} />
                  <DetailRow label="ID" value={d.personal.idNumber} />
                </div>
                <div>
                  <DetailRow label="Name" value={d.personal.name} />
                  <DetailRow label="Surname" value={d.personal.surname} />
                  <DetailRow label="Emergency contact no" value={d.personal.emergencyContactNo} />
                  <DetailRow label="Work email" value={d.personal.workEmail} />
                  <DetailRow label="Identification no (Passport)" value={d.personal.identificationNo} />
                </div>
              </div>
            </SectionCard>

            {/* Div 2: Address */}
            <SectionCard title="Address" onEdit={() => setEditAddressOpen(true)}>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <DetailRow label="Street name" value={d.address.streetName} />
                  <DetailRow label="Flat/Apartment number" value={d.address.flatApartmentNo} />
                  <DetailRow label="Postal code" value={d.address.postalCode} />
                  <DetailRow label="City" value={d.address.city} />
                </div>
                <div>
                  <DetailRow label="Street number" value={d.address.streetNo} />
                  <DetailRow label="Floor" value={d.address.floor} />
                  <DetailRow label="Province/region/state" value={d.address.province} />
                  <DetailRow label="Country" value={d.address.country} />
                </div>
              </div>
            </SectionCard>

            {/* Div 3: Employment & Role Details */}
            <SectionCard title="Employment & Role Details" onEdit={() => setEditEmploymentOpen(true)}>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <DetailRow label="Legal entity" value={d.employment.legalEntity} />
                  <DetailRow label="Job title" value={d.employment.jobTitle} />
                  <DetailRow label="Scope of work" value={d.employment.scopeOfWork} />
                  <DetailRow label="Department role" value={d.employment.departmentRole} />
                  <DetailRow label="Contract start date" value={d.employment.contractStart} />
                  <DetailRow label="Employment type" value={d.employment.employmentType} />
                  <DetailRow label="Employee Status" value={d.employment.employeeStatus} />
                </div>
                <div>
                  <DetailRow label="Group (optional)" value={d.employment.group} />
                  <DetailRow label="Seniority level" value={d.employment.seniority} />
                  <DetailRow label="Department" value={d.employment.department} />
                  <DetailRow label="Direct manager email" value={d.employment.directManagerEmail} />
                  <DetailRow label="Contract end date" value={d.employment.contractEnd} />
                  <DetailRow label="Part time percentage" value={d.employment.partTimePercentage} />
                </div>
              </div>
            </SectionCard>

            {/* Div 4: Compensation & Payment */}
            <SectionCard title="Compensation & Payment" onEdit={() => setEditCompensationOpen(true)}>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <DetailRow label="Payment method" value={d.compensation.paymentMethod} />
                  <DetailRow label="Stable coin code" value={d.compensation.stableCoinCode} />
                  <DetailRow label="Compensation type" value={d.compensation.compensationType} />
                  <DetailRow label="Variable compensation 1: effective Date" value={d.compensation.varComp1EffectiveDate} />
                  <DetailRow label="Variable compensation 1: type" value={d.compensation.varComp1Type} />
                </div>
                <div>
                  <DetailRow label="Payment currency code" value={d.compensation.paymentCurrencyCode} />
                  <DetailRow label="Gross annual salary" value={d.compensation.grossAnnualSalary} />
                  <DetailRow label="Variable compensation 1: title" value={d.compensation.varComp1Title} />
                  <DetailRow label="Variable compensation 1: frequency" value={d.compensation.varComp1Frequency} />
                  <DetailRow label="Variable compensation 1: compensation amount" value={d.compensation.varComp1CompensationAmount} />
                </div>
              </div>
            </SectionCard>

            {/* Div 5: Bank & Wallet Details */}
            <SectionCard title="Bank & Wallet Details" onEdit={() => setEditBankOpen(true)}>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <DetailRow label="Bank name" value={d.bank.bankName} />
                  <DetailRow label="SWIFT/BIC" value={d.bank.swiftBic} />
                  <DetailRow label="USDT_ERC Wallet Address" value={d.bank.usdtErcWalletAddress} valueClassName="break-all" />
                  <DetailRow label="USDC_Poly Wallet Address" value={d.bank.usdcPolyWalletAddress} valueClassName="break-all" />
                </div>
                <div>
                  <DetailRow label="Bank address" value={d.bank.bankAddress} />
                  <DetailRow label="IBAN" value={d.bank.iban} />
                  <DetailRow label="USDC_ERC Wallet Address" value={d.bank.usdcErcWalletAddress} valueClassName="break-all" />
                  <DetailRow label="BTC Wallet Address" value={d.bank.btcWalletAddress} valueClassName="break-all" />
                </div>
              </div>
            </SectionCard>

            {/* Div 6: Notes — info icon + message, Edit in header */}
            <SectionCard title="Notes" onEdit={() => setEditNotesOpen(true)}>
              <div className="flex items-start gap-3 p-1">
                <span className="flex flex-shrink-0 items-center justify-center rounded-full bg-gray-200 text-[10px] font-semibold" style={{ width: 16, height: 16, color: "#9CA3AF" }} aria-hidden>
                  !
                </span>
                <p className="text-sm text-gray-500">
                  This space is for internal notes. It&apos;s visible to your organization&apos;s managers only.
                </p>
              </div>
            </SectionCard>

            {/* Ek div — usme ye charon items; div ka bg #EAEAEA40, har input ka bhi */}
            <div className="view-individual-bottom-wrap flex flex-col gap-4 rounded-xl p-4" style={{ backgroundColor: "#fafafa" }}>
              {BOTTOM_CARDS.map((item) => (
                <div
                  key={item.title}
                  className="view-individual-bottom-card flex items-start gap-4 rounded-lg border border-gray-200 px-4 py-4" style={{ backgroundColor: "#fafafa" }}
                >
                  <BottomCardIcon type={item.icon} />
                  <div className="min-w-0 flex-1">
                    <div
                      className="view-individual-bottom-card-title min-w-0 text-base font-normal text-gray-900"
                      style={{
                        fontFamily: "var(--font-poppins), Poppins, sans-serif",
                        lineHeight: "20px",
                        letterSpacing: "0%",
                        verticalAlign: "middle",
                      }}
                    >
                      {item.title}
                    </div>
                    <div className="mt-0.5 text-sm text-gray-500">{item.description}</div>
                  </div>
                </div>
              ))}
            </div>
        </div>
      )}

      {activeTab === "documents" && (
        <div className="view-individual-tab-panel rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-2 sm:gap-3">
            <div className="relative min-w-0 flex-1">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </span>
              <input type="search" placeholder="Search" className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm text-gray-500 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <button type="button" onClick={() => setAddDocumentOpen(true)} className="shrink-0 whitespace-nowrap bg-[#0F50DB] px-3 py-2 text-sm font-medium text-white hover:bg-[#0D46C3] sm:px-4" style={{ borderRadius: "8px" }}>
              + Add new
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 align-middle" style={DOCUMENTS_TABLE_HEADER_STYLE}>Document Type</th>
                  <th className="px-4 py-3 align-middle" style={DOCUMENTS_TABLE_HEADER_STYLE}>Status</th>
                  <th className="px-4 py-3 align-middle" style={DOCUMENTS_TABLE_HEADER_STYLE}>File</th>
                  <th className="px-4 py-3 align-middle" style={DOCUMENTS_TABLE_HEADER_STYLE}>Document Number</th>
                  <th className="px-4 py-3 align-middle" style={DOCUMENTS_TABLE_HEADER_STYLE}>Country</th>
                  <th className="px-4 py-3 align-middle" style={DOCUMENTS_TABLE_HEADER_STYLE}>Issue Date</th>
                  <th className="px-4 py-3 align-middle" style={DOCUMENTS_TABLE_HEADER_STYLE}>Valid Until</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 text-gray-900">ID card</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">Approved</span>
                  </td>
                  <td className="px-4 py-3">
                    <a href="#" className="text-blue-600 hover:underline">Link</a>
                  </td>
                  <td className="px-4 py-3 text-gray-500">-</td>
                  <td className="px-4 py-3 text-gray-900">Cyprus</td>
                  <td className="px-4 py-3 text-gray-500">-</td>
                  <td className="px-4 py-3 text-gray-500">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "accounts" && (
        <div className="view-individual-tab-panel rounded-2xl border border-gray-200 p-6" style={{ backgroundColor: "#ffffff" }}>
          <div className="mb-4 flex items-center gap-2 sm:gap-3">
            <div className="relative min-w-0 flex-1">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </span>
              <input type="search" placeholder="Search" className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm text-gray-500 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <Link href={ROUTES.admin.employeeAdd} className="inline-block shrink-0 whitespace-nowrap rounded-lg bg-[#0F50DB] px-3 py-2 text-sm font-medium text-white hover:bg-[#0D46C3] sm:px-4" style={{ borderRadius: "8px" }}>
              + Add new
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="accounts-detail-table w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-white">
                  <th className="px-4 py-3 align-middle" style={DOCUMENTS_TABLE_HEADER_STYLE}>Number</th>
                  <th className="px-4 py-3 align-middle" style={DOCUMENTS_TABLE_HEADER_STYLE}>Provider Number</th>
                  <th className="px-4 py-3 align-middle" style={DOCUMENTS_TABLE_HEADER_STYLE}>Type</th>
                  <th className="whitespace-nowrap px-4 py-3 align-middle" style={DOCUMENTS_TABLE_HEADER_STYLE}>Provider Currency</th>
                  <th className="px-4 py-3 align-middle" style={DOCUMENTS_TABLE_HEADER_STYLE}>Bank Details</th>
                  <th className="whitespace-nowrap px-4 py-3 align-middle" style={DOCUMENTS_TABLE_HEADER_STYLE}>Current Balance</th>
                  <th className="px-4 py-3 align-middle" style={DOCUMENTS_TABLE_HEADER_STYLE}>Status</th>
                  <th className="whitespace-nowrap px-4 py-3 align-middle" style={DOCUMENTS_TABLE_HEADER_STYLE}>Client Type</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { number: "HE123129", providerNo: "ASdawoqqwe123121412", type: "Standard", currency: "Euro", balance: "0.00", status: "Approved", clientType: "Firebooks" },
                  { number: "HE123129", providerNo: "ASdawoqqwe123121412", type: "Standard", currency: "Euro", balance: "0.00", status: "Approved", clientType: "Firebooks" },
                  { number: "HE123129", providerNo: "ASdawoqqwe123121412", type: "Standard", currency: "Euro", balance: "0.00", status: "Approved", clientType: "Firebooks" },
                  { number: "HE123129", providerNo: "ASdawoqqwe123121412", type: "Standard", currency: "Euro", balance: "0.00", status: "Approved", clientType: "Firebooks" },
                  { number: "HE123129", providerNo: "ASdawoqqwe123121412", type: "Standard", currency: "Euro", balance: "0.00", status: "Approved", clientType: "Firebooks" },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="accounts-table-cell px-4 py-3 align-middle" style={ACCOUNTS_DETAILS_STYLE}>
                      <a href="#" className="text-blue-600 hover:underline">
                        {row.number}
                      </a>
                    </td>
                    <td className="accounts-table-cell px-4 py-3 align-middle" style={ACCOUNTS_DETAILS_STYLE}>
                      {row.providerNo}
                    </td>
                    <td className="accounts-table-cell px-4 py-3 align-middle" style={ACCOUNTS_DETAILS_STYLE}>
                      {row.type}
                    </td>
                    <td className="accounts-table-cell px-4 py-3 align-middle" style={ACCOUNTS_DETAILS_STYLE}>
                      {row.currency}
                    </td>
                    <td className="accounts-table-cell px-4 py-3 align-middle" style={ACCOUNTS_DETAILS_STYLE}>
                      <div className="accounts-table-cell whitespace-pre-line" style={ACCOUNTS_DETAILS_STYLE}>
                        Bank Details: General Payments Gate LTD
                        IBAN: GB50TRWI23148510000949
                        SWIFT/BIC: TRWIGB2LXXX
                        Bank Name: My EU Pay Ltd.
                      </div>
                    </td>
                    <td className="accounts-table-cell px-4 py-3 align-middle" style={ACCOUNTS_DETAILS_STYLE}>
                      {row.balance}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <span className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        {row.status}
                      </span>
                    </td>
                    <td className="accounts-table-cell px-4 py-3 align-middle" style={ACCOUNTS_DETAILS_STYLE}>
                      {row.clientType}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add New Document modal — Figma 473-3084 */}
      {addDocumentOpen && (
        <div className="admin-employee-modal-backdrop fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-2" onClick={() => setAddDocumentOpen(false)} role="dialog" aria-modal="true" aria-labelledby="add-document-title">
          <div
            className="admin-employee-edit-modal bg-white shadow-xl"
            style={{
              width: "800px",
              maxWidth: "100%",
              maxHeight: "calc(100vh - 2rem)",
              borderRadius: "8px",
              padding: "24px",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4">
              <h2
                id="add-document-title"
                className="dialog-title-one-line align-middle"
                style={{
                  fontFamily: "var(--font-poppins), Poppins, sans-serif",
                  fontWeight: 600,
                  fontSize: "24px",
                  lineHeight: "32px",
                  letterSpacing: "0%",
                  color: "#1F2937",
                }}
              >
                Add New Document
              </h2>
              <button type="button" className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600" onClick={() => setAddDocumentOpen(false)} aria-label="Close">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setAddDocumentOpen(false); }}>
              <div className="dialog-form-grid grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block" style={EDIT_MODAL_LABEL_STYLE}>Document Type <span className="text-red-500">*</span></label>
                  <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-500 placeholder-gray-400" style={DOCUMENTS_TABLE_HEADER_STYLE}>
                    <option value="">Select</option>
                    <option value="id-card">ID card</option>
                    <option value="passport">Passport</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block" style={EDIT_MODAL_LABEL_STYLE}>Country <span className="text-red-500">*</span></label>
                  <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-500 placeholder-gray-400" style={DOCUMENTS_TABLE_HEADER_STYLE}>
                    <option value="">Select</option>
                    <option value="cyprus">Cyprus</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block" style={EDIT_MODAL_LABEL_STYLE}>Document Number</label>
                  <input type="text" placeholder="Enter document no" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-500 placeholder-gray-400" style={DOCUMENTS_TABLE_HEADER_STYLE} />
                </div>
                <div>
                  <label className="mb-1 block" style={EDIT_MODAL_LABEL_STYLE}>Document Status</label>
                  <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-500 placeholder-gray-400" style={DOCUMENTS_TABLE_HEADER_STYLE}>
                    <option value="">Select</option>
                    <option value="approved">Approved</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block" style={EDIT_MODAL_LABEL_STYLE}>Issue Date</label>
                  <div className="relative">
                    <input type="text" placeholder="Select" className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-gray-500 placeholder-gray-400" style={DOCUMENTS_TABLE_HEADER_STYLE} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </span>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block" style={EDIT_MODAL_LABEL_STYLE}>Valid Uptil</label>
                  <div className="relative">
                    <input type="text" placeholder="Select" className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-gray-500 placeholder-gray-400" style={DOCUMENTS_TABLE_HEADER_STYLE} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-gray-900" style={{ fontFamily: "var(--font-poppins), Poppins, sans-serif", fontSize: "16px" }}>Upload Files</h3>
                <div
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white py-10 px-4"
                  style={{ minHeight: "160px" }}
                >
                  <span
                    className="mb-6 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-gray-300 text-gray-400"
                    style={{ borderColor: "#D1D5DB" }}
                    aria-hidden
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  </span>
                  <p
                    className="mb-2"
                    style={{ fontFamily: "var(--font-poppins), Poppins, sans-serif", fontWeight: 500, fontSize: "18px", lineHeight: "24px", letterSpacing: "0%", color: "#374151" }}
                  >
                    Choose a file or drag & drop it here
                  </p>
                  <p className="mb-7" style={DOCUMENTS_TABLE_HEADER_STYLE}>Please upload only one CSV file (max 5MB)</p>
                  <button
                    type="button"
                    className="border bg-white px-5 py-2.5 font-normal hover:bg-gray-50"
                    style={{ fontFamily: "var(--font-poppins), Poppins, sans-serif", fontSize: "14px", color: "#374151", borderColor: "#D1D5DB", borderRadius: "8px" }}
                  >
                    Browse Files
                  </button>
                </div>
              </div>
              <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
                <button
                  type="button"
                  onClick={() => setAddDocumentOpen(false)}
                  className="px-4 py-2 text-sm font-medium hover:bg-gray-50"
                  style={{ backgroundColor: "#FFFFFF", color: "#6C757D", border: "1px solid #D1D5DB", borderRadius: "8px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white"
                  style={{ backgroundColor: "#0F50DB", borderRadius: "8px" }}
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Personal Details popup — Figma 473-7762: Personal Details Edit pe click par yehi popup */}
      {editPersonalDetailsOpen && (
        <div className="admin-employee-modal-backdrop fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-2" onClick={() => setEditPersonalDetailsOpen(false)} role="dialog" aria-modal="true" aria-labelledby="edit-personal-details-title">
          <div
            className="admin-employee-edit-modal bg-white shadow-xl"
            style={{
              width: "800px",
              maxWidth: "100%",
              height: "auto",
              borderRadius: "8px",
              padding: "24px",
              opacity: 1,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4">
              <h2
                id="edit-personal-details-title"
                className="dialog-title-one-line align-middle"
                style={{
                  fontFamily: "var(--font-poppins), Poppins, sans-serif",
                  fontWeight: 600,
                  fontSize: "24px",
                  lineHeight: "32px",
                  letterSpacing: "0%",
                  color: "#1F2937",
                }}
              >
                Edit Personal Details
              </h2>
              <button type="button" className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600" onClick={() => setEditPersonalDetailsOpen(false)} aria-label="Close">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form className="dialog-form-grid grid grid-cols-1 gap-x-6 pt-4 sm:grid-cols-2" style={{ gap: "24px" }} onSubmit={(e) => { e.preventDefault(); setEditPersonalDetailsOpen(false); }}>
              <div>
                <label className="mb-1 block" style={EDIT_MODAL_LABEL_STYLE}>Legal first name <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Enter first name" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-500 placeholder-gray-300" />
              </div>
              <div>
                <label className="mb-1 block" style={EDIT_MODAL_LABEL_STYLE}>Legal last name <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Enter last name" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-500 placeholder-gray-300" />
              </div>
              <div>
                <label className="mb-1 block" style={EDIT_MODAL_LABEL_STYLE}>Personal email <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input type="email" placeholder="Enter your personal email" className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-gray-500 placeholder-gray-300" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></span>
                </div>
              </div>
              <div>
                <label className="mb-1 block" style={EDIT_MODAL_LABEL_STYLE}>Work email</label>
                <div className="relative">
                  <input type="email" placeholder="Enter your work email" className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-gray-500 placeholder-gray-300" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></span>
                </div>
              </div>
              <div className="relative">
                <label className="mb-1 block" style={EDIT_MODAL_LABEL_STYLE}>Nationality</label>
                <button
                  type="button"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-left flex items-center justify-between"
                  style={{ color: selectedNationality ? "#1F2937" : "#9CA3AF" }}
                  onClick={() => setNationalityOpen(!nationalityOpen)}
                >
                  <span>{selectedNationality || "Select nationality"}</span>
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {nationalityOpen && (
                  <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg" style={{ maxHeight: "50vh", overflowY: "auto" }}>
                    {["Afghan","Albanian","Algerian","American","Andorran","Angolan","Argentine","Armenian","Australian","Austrian","Azerbaijani","Bahamian","Bahraini","Bangladeshi","Belarusian","Belgian","Belizean","Beninese","Bhutanese","Bolivian","Bosnian","Botswanan","Brazilian","British","Bruneian","Bulgarian","Burkinabe","Burundian","Cambodian","Cameroonian","Canadian","Chilean","Chinese","Colombian","Congolese","Costa Rican","Croatian","Cuban","Cypriot","Czech","Danish","Dominican","Dutch","Ecuadorian","Egyptian","Emirati","Estonian","Ethiopian","Fijian","Finnish","French","Gabonese","Gambian","Georgian","German","Ghanaian","Greek","Guatemalan","Guinean","Haitian","Honduran","Hungarian","Icelandic","Indian","Indonesian","Iranian","Iraqi","Irish","Israeli","Italian","Ivorian","Jamaican","Japanese","Jordanian","Kazakhstani","Kenyan","Korean","Kuwaiti","Kyrgyz","Laotian","Latvian","Lebanese","Liberian","Libyan","Lithuanian","Luxembourgish","Macedonian","Malagasy","Malawian","Malaysian","Maldivian","Malian","Maltese","Mauritanian","Mauritian","Mexican","Moldovan","Mongolian","Montenegrin","Moroccan","Mozambican","Namibian","Nepalese","New Zealander","Nicaraguan","Nigerian","Norwegian","Omani","Pakistani","Panamanian","Paraguayan","Peruvian","Filipino","Polish","Portuguese","Qatari","Romanian","Russian","Rwandan","Saudi","Senegalese","Serbian","Sierra Leonean","Singaporean","Slovak","Slovenian","Somali","South African","Spanish","Sri Lankan","Sudanese","Swedish","Swiss","Syrian","Taiwanese","Tajik","Tanzanian","Thai","Togolese","Trinidadian","Tunisian","Turkish","Turkmen","Ugandan","Ukrainian","Uruguayan","Uzbek","Venezuelan","Vietnamese","Yemeni","Zambian","Zimbabwean"].map((n) => (
                      <div
                        key={n}
                        className="cursor-pointer px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => { setSelectedNationality(n); setNationalityOpen(false); }}
                      >
                        {n}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="mb-1 block" style={EDIT_MODAL_LABEL_STYLE}>Date of birth <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input ref={dobInputRef} type="date" className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-gray-500" style={{ colorScheme: "light" }} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer" onClick={() => dobInputRef.current?.showPicker()}><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></span>
                </div>
              </div>
              <div>
                <label className="mb-1 block" style={EDIT_MODAL_LABEL_STYLE}>Identification Type</label>
                <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-400">
                  <option value="">Select identification type</option>
                  <option value="passport" className="text-gray-500">Passport</option>
                  <option value="national_id" className="text-gray-500">National ID</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block" style={EDIT_MODAL_LABEL_STYLE}>Enter passport no <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Enter passport no" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-500 placeholder-gray-300" />
              </div>
              <div>
                <label className="mb-1 block" style={EDIT_MODAL_LABEL_STYLE}>National insurance no <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Enter national insurance no" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-500 placeholder-gray-300" />
              </div>
              <div>
                <label className="mb-1 block" style={EDIT_MODAL_LABEL_STYLE}>Emergency contact no <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  <div className="relative w-32 flex-shrink-0">
                    <button type="button" onClick={() => setPhoneCodeOpen(o => !o)}
                      className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm text-gray-500">
                      <span>{selectedPhoneCode}</span>
                      <svg className="h-3 w-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                    </button>
                    {phoneCodeOpen && (
                      <>
                        <div className="fixed inset-0 z-[199]" onClick={() => setPhoneCodeOpen(false)}/>
                        <div className="absolute left-0 bottom-full z-[200] mb-1 w-40 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg" style={{maxHeight:"30vh"}}>
                          {[["+93","🇦🇫"],["+355","🇦🇱"],["+213","🇩🇿"],["+1","🇺🇸"],["+54","🇦🇷"],["+374","🇦🇲"],["+61","🇦🇺"],["+43","🇦🇹"],["+994","🇦🇿"],["+973","🇧🇭"],["+880","🇧🇩"],["+32","🇧🇪"],["+55","🇧🇷"],["+44","🇬🇧"],["+359","🇧🇬"],["+855","🇰🇭"],["+1","🇨🇦"],["+56","🇨🇱"],["+86","🇨🇳"],["+57","🇨🇴"],["+385","🇭🇷"],["+53","🇨🇺"],["+357","🇨🇾"],["+420","🇨🇿"],["+45","🇩🇰"],["+20","🇪🇬"],["+971","🇦🇪"],["+372","🇪🇪"],["+358","🇫🇮"],["+33","🇫🇷"],["+995","🇬🇪"],["+49","🇩🇪"],["+233","🇬🇭"],["+30","🇬🇷"],["+36","🇭🇺"],["+91","🇮🇳"],["+62","🇮🇩"],["+98","🇮🇷"],["+964","🇮🇶"],["+353","🇮🇪"],["+972","🇮🇱"],["+39","🇮🇹"],["+81","🇯🇵"],["+962","🇯🇴"],["+7","🇰🇿"],["+254","🇰🇪"],["+82","🇰🇷"],["+965","🇰🇼"],["+371","🇱🇻"],["+961","🇱🇧"],["+370","🇱🇹"],["+60","🇲🇾"],["+960","🇲🇻"],["+52","🇲🇽"],["+31","🇳🇱"],["+64","🇳🇿"],["+234","🇳🇬"],["+47","🇳🇴"],["+968","🇴🇲"],["+92","🇵🇰"],["+63","🇵🇭"],["+48","🇵🇱"],["+351","🇵🇹"],["+974","🇶🇦"],["+40","🇷🇴"],["+7","🇷🇺"],["+966","🇸🇦"],["+381","🇷🇸"],["+65","🇸🇬"],["+27","🇿🇦"],["+34","🇪🇸"],["+94","🇱🇰"],["+46","🇸🇪"],["+41","🇨🇭"],["+90","🇹🇷"],["+380","🇺🇦"],["+598","🇺🇾"],["+998","🇺🇿"],["+58","🇻🇪"],["+84","🇻🇳"],["+967","🇾🇪"],["+260","🇿🇲"],["+977","🇳🇵"]].map(([code,flag])=>(
                            <div key={flag+code} onClick={()=>{setSelectedPhoneCode(code);setPhoneCodeOpen(false);}}
                              className="cursor-pointer px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
                              {flag} {code}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  <input type="tel" placeholder="980-00-000-00" className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-gray-500 placeholder-gray-300" />
                </div>
              </div>
              <div className="sm:col-span-2 flex justify-end gap-3 border-t border-gray-200 pt-3">
                <button type="button" onClick={() => setEditPersonalDetailsOpen(false)} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50" style={{ color: "#6B7280" }}>
                  Cancel
                </button>
                <button type="submit" className="rounded-lg bg-[#0F50DB] px-4 py-2 text-sm font-medium text-white hover:bg-[#0D46C3]">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Address modal — Figma 473-8276: Address section Edit pe click par */}
      {editAddressOpen && (
        <div className="admin-employee-modal-backdrop fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-2" onClick={() => setEditAddressOpen(false)} role="dialog" aria-modal="true" aria-labelledby="edit-address-title">
          <div
            className="admin-employee-edit-modal bg-white shadow-xl"
            style={{
              width: "800px",
              maxWidth: "100%",
              maxHeight: "calc(100vh - 2rem)",
              height: "auto",
              borderRadius: "8px",
              padding: "24px",
              opacity: 1,
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4">
              <h2
                id="edit-address-title"
                className="dialog-title-one-line align-middle"
                style={{
                  fontFamily: "var(--font-poppins), Poppins, sans-serif",
                  fontWeight: 600,
                  fontSize: "24px",
                  lineHeight: "32px",
                  letterSpacing: "0%",
                  color: "#1F2937",
                }}
              >
                Edit Address
              </h2>
              <button type="button" className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600" onClick={() => setEditAddressOpen(false)} aria-label="Close">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form className="dialog-form-grid grid grid-cols-1 gap-x-6 pt-4 sm:grid-cols-2" style={{ gap: "24px" }} onSubmit={(e) => { e.preventDefault(); setEditAddressOpen(false); }}>
              <div>
                <label className="mb-1 block" style={EDIT_MODAL_LABEL_STYLE}>Street name <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Enter street name" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-500 placeholder-gray-300" />
              </div>
              <div>
                <label className="mb-1 block" style={EDIT_MODAL_LABEL_STYLE}>Street number <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Enter street number" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-500 placeholder-gray-300" />
              </div>
              <div>
                <label className="mb-1 block" style={EDIT_MODAL_LABEL_STYLE}>Flat/Appartment number (if applicable)</label>
                <input type="text" placeholder="Enter flat/appartment number" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-500 placeholder-gray-300" />
              </div>
              <div>
                <label className="mb-1 block" style={EDIT_MODAL_LABEL_STYLE}>Floor <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Enter floor" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-500 placeholder-gray-300" />
              </div>
              <div>
                <label className="mb-1 block" style={EDIT_MODAL_LABEL_STYLE}>Postal code <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Enter postal code" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-500 placeholder-gray-300" />
              </div>
              <div>
                <label className="mb-1 block" style={EDIT_MODAL_LABEL_STYLE}>Select Province/region/state</label>
                <input type="text" placeholder="Select province/region/state" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-500 placeholder-gray-400" />
              </div>
              <div>
                <label className="mb-1 block" style={EDIT_MODAL_LABEL_STYLE}>Select city <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Select city" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-500 placeholder-gray-400" />
              </div>
              <div className="relative">
                <label className="mb-1 block" style={EDIT_MODAL_LABEL_STYLE}>Select country</label>
                {countryOpen && (
                  <div className="fixed inset-0 z-[199]" onClick={() => setCountryOpen(false)} />
                )}
                <button
                  type="button"
                  onClick={() => setCountryOpen(!countryOpen)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-left flex items-center justify-between"
                  style={{ color: selectedCountry ? "#6B7280" : "#9CA3AF", background: "#fff" }}
                >
                  <span>{selectedCountry || "Select country"}</span>
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {countryOpen && (
                  <div
                    className="absolute left-0 right-0 z-[200] overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg"
                    style={{ bottom: "100%", marginBottom: 4, maxHeight: "50vh" }}
                  >
                    {["Afghanistan","Albania","Algeria","Argentina","Armenia","Australia","Austria","Azerbaijan","Bahrain","Bangladesh","Belarus","Belgium","Bolivia","Bosnia and Herzegovina","Brazil","Bulgaria","Cambodia","Cameroon","Canada","Chile","China","Colombia","Croatia","Cuba","Cyprus","Czech Republic","Denmark","Dominican Republic","Ecuador","Egypt","Estonia","Ethiopia","Finland","France","Georgia","Germany","Ghana","Greece","Guatemala","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kuwait","Latvia","Lebanon","Lithuania","Luxembourg","Malaysia","Maldives","Malta","Mexico","Moldova","Mongolia","Morocco","Nepal","Netherlands","New Zealand","Nigeria","Norway","Oman","Pakistan","Panama","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Saudi Arabia","Serbia","Singapore","Slovakia","Slovenia","South Africa","South Korea","Spain","Sri Lanka","Sweden","Switzerland","Syria","Taiwan","Tanzania","Thailand","Tunisia","Turkey","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"].map((country) => (
                      <div
                        key={country}
                        className="cursor-pointer px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => { setSelectedCountry(country); setCountryOpen(false); }}
                      >
                        {country}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="sm:col-span-2 flex justify-end gap-3 border-t border-gray-200 pt-3">
                <button type="button" onClick={() => setEditAddressOpen(false)} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50" style={{ color: "#6B7280" }}>
                  Cancel
                </button>
                <button type="submit" className="rounded-lg bg-[#0F50DB] px-4 py-2 text-sm font-medium text-white hover:bg-[#0D46C3]">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employment & Role Details modal — Figma 473-8845 */}
      {editEmploymentOpen && (
        <div className="admin-employee-modal-backdrop fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-2" onClick={() => setEditEmploymentOpen(false)} role="dialog" aria-modal="true" aria-labelledby="edit-employment-title">
          <div
            className="admin-employee-edit-modal bg-white shadow-xl"
            style={{
              width: "800px",
              maxWidth: "100%",
              maxHeight: "calc(100vh - 2rem)",
              height: "auto",
              borderRadius: "8px",
              padding: "24px",
              opacity: 1,
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4">
              <h2 id="edit-employment-title" className="dialog-title-one-line align-middle" style={{ fontFamily: "var(--font-poppins), Poppins, sans-serif", fontWeight: 600, fontSize: "24px", lineHeight: "32px", letterSpacing: "0%", color: "#1F2937" }}>
                Edit Employment & Role Details
              </h2>
              <button type="button" className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600" onClick={() => setEditEmploymentOpen(false)} aria-label="Close">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form className="dialog-form-grid grid grid-cols-1 gap-x-6 pt-4 sm:grid-cols-2" style={{ gap: "24px" }} onSubmit={(e) => { e.preventDefault(); setEditEmploymentOpen(false); }}>
              <div>
                <label className="mb-1 block" style={EDIT_MODAL_LABEL_STYLE}>Legal entity <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Enter legal entity" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-500 placeholder-gray-300" />
              </div>
              <div>
                <label className="mb-1 block" style={EDIT_MODAL_LABEL_STYLE}>Group (optional)</label>
                <input type="text" placeholder="Enter group" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-500 placeholder-gray-300" />
              </div>
              <div>
                <label className="mb-1 block" style={EDIT_MODAL_LABEL_STYLE}>Job title</label>
                <input type="text" placeholder="Enter job title" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-500 placeholder-gray-300" />
              </div>
              <div>
                <label className="mb-1 block" style={EDIT_MODAL_LABEL_STYLE}>Seniority level</label>
                <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-400">
                  <option value="">Select</option>
                  <option value="L5">L5 (Senior)</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block" style={EDIT_MODAL_LABEL_STYLE}>Scope of work</label>
                <input type="text" placeholder="Enter scope of work" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-500 placeholder-gray-300" />
              </div>
              <div>
                <label className="mb-1 block" style={EDIT_MODAL_LABEL_STYLE}>Department</label>
                <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-400">
                  <option value="">Select</option>
                  <option value="Technology">Technology & Innovation</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block" style={EDIT_MODAL_LABEL_STYLE}>Department role</label>
                <input type="text" placeholder="Enter department role" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-500 placeholder-gray-300" />
              </div>
              <div>
                <label className="mb-1 block" style={EDIT_MODAL_LABEL_STYLE}>Direct manager email</label>
                <input type="email" placeholder="Enter direct manager email" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-500 placeholder-gray-300" />
              </div>
              <div>
                <label className="mb-1 block" style={EDIT_MODAL_LABEL_STYLE}>Contract start date <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input ref={contractStartRef} type="date" className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-gray-500" style={{ colorScheme: "light" }} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer" onClick={() => contractStartRef.current?.showPicker()}><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></span>
                </div>
              </div>
              <div>
                <label className="mb-1 block" style={EDIT_MODAL_LABEL_STYLE}>Contract end date</label>
                <div className="relative">
                  <input ref={contractEndRef} type="date" className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-gray-500" style={{ colorScheme: "light" }} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer" onClick={() => contractEndRef.current?.showPicker()}><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></span>
                </div>
              </div>
              <div>
                <label className="mb-1 block" style={EDIT_MODAL_LABEL_STYLE}>Employment type <span className="text-red-500">*</span></label>
                <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-400">
                  <option value="">Select</option>
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block" style={EDIT_MODAL_LABEL_STYLE}>Part time percentage</label>
                <input type="text" placeholder="Enter part time percentage" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-500 placeholder-gray-300" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block" style={EDIT_MODAL_LABEL_STYLE}>Employee Status</label>
                <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-400">
                  <option value="">Select</option>
                  <option value="Active">Active</option>
                  <option value="Probation">Probation</option>
                  <option value="Terminated">Terminated</option>
                </select>
              </div>
              <div className="sm:col-span-2 flex justify-end gap-3 border-t border-gray-200 pt-3">
                <button type="button" onClick={() => setEditEmploymentOpen(false)} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50" style={{ color: "#6B7280" }}>Cancel</button>
                <button type="submit" className="rounded-lg bg-[#0F50DB] px-4 py-2 text-sm font-medium text-white hover:bg-[#0D46C3]">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Compensation & Payment modal — Figma 473-9420 */}
      {editCompensationOpen && (
        <div className="admin-employee-modal-backdrop fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-2" onClick={() => setEditCompensationOpen(false)} role="dialog" aria-modal="true" aria-labelledby="edit-compensation-title">
          <div className="admin-employee-edit-modal bg-white shadow-xl" style={{ width: "800px", maxWidth: "100%", maxHeight: "calc(100vh - 2rem)", height: "auto", borderRadius: "8px", padding: "24px", opacity: 1, overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-4">
              <h2 id="edit-compensation-title" className="dialog-title-one-line align-middle" style={{ fontFamily: "var(--font-poppins), Poppins, sans-serif", fontWeight: 600, fontSize: "24px", lineHeight: "32px", letterSpacing: "0%", color: "#1F2937" }}>Edit Compensation & Payment</h2>
              <button type="button" className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600" onClick={() => setEditCompensationOpen(false)} aria-label="Close">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form className="dialog-form-grid grid grid-cols-1 gap-x-6 pt-4 sm:grid-cols-2" style={{ gap: "24px" }} onSubmit={(e) => { e.preventDefault(); setEditCompensationOpen(false); }}>
              <div>
                <label className="mb-1 block" style={EDIT_MODAL_LABEL_STYLE}>Payment method</label>
                <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-400">
                  <option value="">Select</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="crypto">Crypto Payment</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block" style={EDIT_MODAL_LABEL_STYLE}>Payment currency code <span className="text-red-500">*</span></label>
                <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-400">
                  <option value="">Select</option>
                  <option value="EURO">EURO</option>
                  <option value="BTC">BTC</option>
                  <option value="USDC">USDC</option>
                  <option value="USDT">USDT</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block" style={EDIT_MODAL_LABEL_STYLE}>Stable coin code <span className="text-red-500">*</span></label>
                <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-400">
                  <option value="">Select</option>
                  <option value="USDC">USDC</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block" style={EDIT_MODAL_LABEL_STYLE}>Gross annual salary <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Enter gross annual salary" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-500 placeholder-gray-300" />
              </div>
              <div>
                <label className="mb-1 block" style={EDIT_MODAL_LABEL_STYLE}>Compensation type <span className="text-red-500">*</span></label>
                <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-400">
                  <option value="">Select</option>
                  <option value="salary-bonus">Salary + Bonus</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block" style={EDIT_MODAL_LABEL_STYLE}>Variable compensation 1: title</label>
                <input type="text" placeholder="Enter" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-500 placeholder-gray-300" />
              </div>
              <div>
                <label className="mb-1 block" style={EDIT_MODAL_LABEL_STYLE}>Variable compensation 1: effective Date</label>
                <div className="relative">
                  <input ref={varComp1DateRef} type="date" className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-gray-500" style={{ colorScheme: "light" }} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer" onClick={() => varComp1DateRef.current?.showPicker()}><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></span>
                </div>
              </div>
              <div>
                <label className="mb-1 block" style={EDIT_MODAL_LABEL_STYLE}>Variable compensation 1: frequency</label>
                <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-400">
                  <option value="">Select</option>
                  <option value="daily">Daily</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block" style={EDIT_MODAL_LABEL_STYLE}>Variable compensation 1: type</label>
                <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-400">
                  <option value="">Select</option>
                  <option value="percentage">Percentage of Salary</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block" style={EDIT_MODAL_LABEL_STYLE}>Variable compensation 1: compensation amount</label>
                <input type="text" placeholder="Enter" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-500 placeholder-gray-300" />
              </div>
              <div />
              <div className="sm:col-span-2 flex justify-end gap-3 border-t border-gray-200 pt-3">
                <button type="button" onClick={() => setEditCompensationOpen(false)} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50" style={{ color: "#6B7280" }}>Cancel</button>
                <button type="submit" className="rounded-lg bg-[#0F50DB] px-4 py-2 text-sm font-medium text-white hover:bg-[#0D46C3]">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Bank & Wallet Details modal — Figma 473-10443 */}
      {editBankOpen && (
        <div className="admin-employee-modal-backdrop fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-2" onClick={() => setEditBankOpen(false)} role="dialog" aria-modal="true" aria-labelledby="edit-bank-title">
          <div className="admin-employee-edit-modal bg-white shadow-xl" style={{ width: "800px", maxWidth: "100%", maxHeight: "calc(100vh - 2rem)", height: "auto", borderRadius: "8px", padding: "24px", opacity: 1, overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-4">
              <h2 id="edit-bank-title" className="dialog-title-one-line align-middle" style={{ fontFamily: "var(--font-poppins), Poppins, sans-serif", fontWeight: 600, fontSize: "24px", lineHeight: "32px", letterSpacing: "0%", color: "#1F2937" }}>Edit Bank & Wallet Details</h2>
              <button type="button" className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600" onClick={() => setEditBankOpen(false)} aria-label="Close">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form className="dialog-form-grid grid grid-cols-1 gap-x-6 pt-4 sm:grid-cols-2" style={{ gap: "24px" }} onSubmit={(e) => { e.preventDefault(); setEditBankOpen(false); }}>
              <div>
                <label className="mb-1 block" style={EDIT_MODAL_LABEL_STYLE}>Bank name <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Enter bank name" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-500 placeholder-gray-300" />
              </div>
              <div>
                <label className="mb-1 block" style={EDIT_MODAL_LABEL_STYLE}>Bank address <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Enter bank address" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-500 placeholder-gray-300" />
              </div>
              <div>
                <label className="mb-1 block" style={EDIT_MODAL_LABEL_STYLE}>SWIFT/BIC <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Enter SWIFT/BIC" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-500 placeholder-gray-300" />
              </div>
              <div>
                <label className="mb-1 block" style={EDIT_MODAL_LABEL_STYLE}>IBAN <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Enter IBAN" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-500 placeholder-gray-300" />
              </div>
              <div>
                <label className="mb-1 block" style={EDIT_MODAL_LABEL_STYLE}>USDT_ERC Wallet Address</label>
                <input type="text" placeholder="Enter USDT_ERC Wallet Address" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-500 placeholder-gray-300" />
              </div>
              <div>
                <label className="mb-1 block" style={EDIT_MODAL_LABEL_STYLE}>USDC_ERC Wallet Address</label>
                <input type="text" placeholder="Enter USDC_ERC Wallet Address" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-500 placeholder-gray-300" />
              </div>
              <div>
                <label className="mb-1 block" style={EDIT_MODAL_LABEL_STYLE}>USDC_Poly Wallet Address</label>
                <input type="text" placeholder="Enter USDC_Poly Wallet Address" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-500 placeholder-gray-300" />
              </div>
              <div>
                <label className="mb-1 block" style={EDIT_MODAL_LABEL_STYLE}>BTC Wallet Address</label>
                <input type="text" placeholder="Enter BTC Wallet Address" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-500 placeholder-gray-300" />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-3 border-t border-gray-200 pt-3">
                <button type="button" onClick={() => setEditBankOpen(false)} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50" style={{ color: "#6B7280" }}>Cancel</button>
                <button type="submit" className="rounded-lg bg-[#0F50DB] px-4 py-2 text-sm font-medium text-white hover:bg-[#0D46C3]">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Notes modal — Figma 473-10580 */}
      {editNotesOpen && (
        <div className="admin-employee-modal-backdrop fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-2" onClick={() => setEditNotesOpen(false)} role="dialog" aria-modal="true" aria-labelledby="edit-notes-title">
          <div className="admin-employee-edit-modal bg-white shadow-xl" style={{ width: "800px", maxWidth: "100%", maxHeight: "calc(100vh - 2rem)", height: "auto", borderRadius: "8px", padding: "24px", opacity: 1, overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-4">
              <h2 id="edit-notes-title" className="dialog-title-one-line align-middle" style={{ fontFamily: "var(--font-poppins), Poppins, sans-serif", fontWeight: 600, fontSize: "24px", lineHeight: "32px", letterSpacing: "0%", color: "#1F2937" }}>Edit Notes</h2>
              <button type="button" className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600" onClick={() => setEditNotesOpen(false)} aria-label="Close">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form className="pt-4" onSubmit={(e) => { e.preventDefault(); setEditNotesOpen(false); }}>
              <label className="mb-1 block" style={EDIT_MODAL_LABEL_STYLE}>Notes</label>
              <textarea placeholder="Lorem ipsum" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-500 placeholder-gray-300 min-h-[120px] resize-y" rows={4} />
              <div className="flex justify-end gap-3 border-t border-gray-200 pt-3 mt-4">
                <button type="button" onClick={() => setEditNotesOpen(false)} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50" style={{ color: "#6B7280" }}>Cancel</button>
                <button type="submit" className="rounded-lg bg-[#0F50DB] px-4 py-2 text-sm font-medium text-white hover:bg-[#0D46C3]">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}