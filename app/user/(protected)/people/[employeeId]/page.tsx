"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DASHBOARD_ROUTES } from "@/components/user/dashboard/routes";
import EditPersonalDetailsModal, { type EditPersonalForm } from "@/components/user/people/EditPersonalDetailsModal";
import EditAddressModal, { type EditAddressForm } from "@/components/user/people/EditAddressModal";
import EditEmploymentModal from "@/components/user/people/EditEmploymentModal";
import EditCompensationModal from "@/components/user/people/EditCompensationModal";
import EditBankWalletModal from "@/components/user/people/EditBankWalletModal";
import EditNotesModal from "@/components/user/people/EditNotesModal";
import { usePersonDetail, useUpdatePerson, useDeletePerson } from "@/hooks/employer/useUserPanel";
import type { PersonDetail } from "@/lib/api/employer/people";

const dash = (v: string | number | null | undefined) =>
  v === null || v === undefined || v === "" ? "—" : String(v);

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

function profileToEditPersonalInitial(p: PersonDetail): Partial<EditPersonalForm> {
  return {
    name: p.firstName ?? "",
    middleName: p.middleName ?? "",
    surname: p.lastName ?? "",
    personalEmail: p.personalEmail ?? "",
    workEmail: p.workEmail ?? p.email ?? "",
    nationality: p.nationality ?? "",
    dateOfBirth: p.dateOfBirth ?? "",
    gender: (p.gender ?? "").toLowerCase(),
    maritalStatus: (p.maritalStatus ?? "").toLowerCase(),
    nationalIdNumber: p.nationalIdNumber ?? "",
    passportNumber: p.passportNumber ?? "",
    primaryCountryCode: p.primaryCountryCode ?? "+1",
    primaryContact: p.primaryPhone ?? p.phone ?? "",
    emergencyCountryCode: p.emergencyCountryCode ?? "+1",
    emergencyContact: p.emergencyPhone ?? "",
    nationalInsuranceNo: p.nationalInsuranceNo ?? "",
    tic: p.tic ?? "",
    dependants: p.dependants ?? "",
    workPermitVisa: p.workPermitVisa ?? "",
    residencePermitExpiry: p.residencePermitExpiry ?? "",
  };
}

function profileToEditAddressInitial(p: PersonDetail): Partial<EditAddressForm> {
  return {
    streetName: p.streetName ?? "",
    streetNumber: p.streetNo ?? "",
    flatApartmentNumber: p.flatApartmentNo ?? "",
    floor: p.floor ?? "",
    postalCode: p.postalCode ?? "",
    city: p.city ?? "",
    provinceRegionState: p.province ?? "",
    country: p.country ?? "",
  };
}

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

function PersonalDetailsContent({ p }: { p: PersonDetail }) {
  return (
    <div className="grid w-full grid-cols-1 gap-x-16 gap-y-5 sm:grid-cols-2">
      <div className="min-w-0 space-y-5">
        {[
          ["Employee no", dash(p.employeeNo)],
          ["Personal email", dash(p.personalEmail)],
          ["Nationality", dash(p.nationality)],
          ["Gender", dash(p.gender)],
          ["National ID Number", dash(p.nationalIdNumber)],
          ["Primary contact no", dash(p.primaryPhone ?? p.phone)],
          ["National insurance no", dash(p.nationalInsuranceNo)],
          ["Dependants", dash(p.dependants)],
          ["Residence Permit Expiry", fmtDate(p.residencePermitExpiry)],
        ].map(([label, value]) => (
          <div key={label as string}>
            <span className="block text-sm text-[#6b7280]">{label}</span>
            <p className="mt-1 text-sm font-medium text-[#1f2937]">{value}</p>
          </div>
        ))}
      </div>
      <div className="min-w-0 space-y-5">
        {[
          ["Full name", `${p.firstName} ${p.middleName ? p.middleName + " " : ""}${p.lastName}`],
          ["Work email", dash(p.workEmail ?? p.email)],
          ["Date of birth", fmtDate(p.dateOfBirth)],
          ["Marital Status", dash(p.maritalStatus)],
          ["Passport Number", dash(p.passportNumber)],
          ["Emergency contact no", dash(p.emergencyPhone)],
          ["TIC (Tax Identification code)", dash(p.tic)],
          ["Work permit/Visa", dash(p.workPermitVisa)],
        ].map(([label, value]) => (
          <div key={label as string}>
            <span className="block text-sm text-[#6b7280]">{label}</span>
            <p className="mt-1 text-sm font-medium text-[#1f2937]">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function EmployeeProfilePage({
  params,
}: {
  params: Promise<{ employeeId: string }>;
}) {
  const { employeeId } = use(params);
  const id = Number(employeeId);
  const router = useRouter();

  const { data, isLoading, error } = usePersonDetail(Number.isFinite(id) ? id : null);
  const updateMutation = useUpdatePerson(id);
  const deleteMutation = useDeletePerson();
  const [editPersonalOpen, setEditPersonalOpen] = useState(false);
  const [editAddressOpen, setEditAddressOpen] = useState(false);
  const [editEmploymentOpen, setEditEmploymentOpen] = useState(false);
  const [editCompensationOpen, setEditCompensationOpen] = useState(false);
  const [editBankWalletOpen, setEditBankWalletOpen] = useState(false);
  const [editNotesOpen, setEditNotesOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-full w-full bg-dash-page p-8 text-dash-secondary" data-dashboard-theme>
        Loading employee…
      </div>
    );
  }

  if (error || !data?.person) {
    return (
      <div className="min-h-full w-full bg-dash-page p-8 text-dash-secondary" data-dashboard-theme>
        <Link href={DASHBOARD_ROUTES.people} className="text-[var(--color-dash-accent)] hover:underline">
          ← Back to People
        </Link>
        <p className="mt-4">Employee not found.</p>
      </div>
    );
  }

  const p = data.person;

  async function handleSavePersonal(values: EditPersonalForm) {
    await updateMutation.mutateAsync({
      firstName: values.name,
      middleName: values.middleName || null,
      lastName: values.surname,
      personalEmail: values.personalEmail || null,
      workEmail: values.workEmail || null,
      nationality: values.nationality || null,
      dateOfBirth: values.dateOfBirth || null,
      gender: values.gender || null,
      maritalStatus: values.maritalStatus || null,
      nationalIdNumber: values.nationalIdNumber || null,
      passportNumber: values.passportNumber || null,
      primaryCountryCode: values.primaryCountryCode || null,
      primaryPhone: values.primaryContact || null,
      emergencyCountryCode: values.emergencyCountryCode || null,
      emergencyPhone: values.emergencyContact || null,
      nationalInsuranceNo: values.nationalInsuranceNo || null,
      tic: values.tic || null,
      dependants: values.dependants || null,
      workPermitVisa: values.workPermitVisa || null,
      residencePermitExpiry: values.residencePermitExpiry || null,
    });
    setEditPersonalOpen(false);
  }

  async function handleSaveAddress(values: EditAddressForm) {
    await updateMutation.mutateAsync({
      streetName: values.streetName || null,
      streetNo: values.streetNumber || null,
      flatApartmentNo: values.flatApartmentNumber || null,
      floor: values.floor || null,
      postalCode: values.postalCode || null,
      city: values.city || null,
      province: values.provinceRegionState || null,
      country: values.country || null,
    });
    setEditAddressOpen(false);
  }

  async function handleSaveEmployment(values: Record<string, string>) {
    await updateMutation.mutateAsync({
      jobTitle: values.jobTitle || null,
      groupName: values.group || null,
      department: values.department || null,
      lineManagerEmail: values.lineManagerEmail || null,
      contractStart: values.startDate || null,
      employmentType: values.employmentType || null,
      employeeStatus: values.status || "active",
      employeeIdExternal: values.employeeId || null,
      seniorityLevel: values.seniorityLevel || null,
      departmentRole: values.departmentRole || null,
      workLocationCountry: values.workLocationCountry || null,
      contractEnd: values.terminationDate || null,
    });
    setEditEmploymentOpen(false);
  }

  async function handleSaveCompensation(values: Record<string, string>) {
    await updateMutation.mutateAsync({
      paymentMethod: values.paymentMethod || null,
      paymentCurrencyCode: values.paymentCurrencyCode || null,
      paymentPreference: values.paymentPreference || null,
      grossAnnualSalary: values.grossAnnualSalary ? Number(values.grossAnnualSalary) : null,
      compensationType: values.compensationType || null,
      workingHours: values.workingHours || null,
      shiftSchedule: values.shiftSchedule || null,
      workingDaysPerWeek: values.workingDaysPerWeek || null,
      probationPeriod: values.probationPeriod || null,
      noticePeriod: values.noticePeriod || null,
    });
    setEditCompensationOpen(false);
  }

  async function handleSaveBankWallet(values: Record<string, string>) {
    await updateMutation.mutateAsync({
      bankName: values.bankName || null,
      bankAddress: values.bankAddress || null,
      swiftBic: values.swiftBic || null,
      iban: values.iban || null,
      defaultPaymentMethod: values.defaultPaymentMethod || null,
      currencyPreference: values.currencyPreference || null,
      digitalWalletAddress: values.digitalWalletAddress || null,
    });
    setEditBankWalletOpen(false);
  }

  async function handleSaveNotes(values: { notes: string }) {
    await updateMutation.mutateAsync({ internalNotes: values.notes || null });
    setEditNotesOpen(false);
  }

  async function handleDelete() {
    if (!confirm(`Remove ${p.firstName} ${p.lastName}? This soft-deletes the record.`)) return;
    await deleteMutation.mutateAsync(id);
    router.push(DASHBOARD_ROUTES.people);
  }

  return (
    <div className="min-h-full w-full bg-dash-page" data-dashboard-theme data-page="employee-profile">
      <div className="dash-shell w-full py-6">
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
                <span className="truncate text-[11px] font-normal text-[#6B7280] sm:text-sm">{dash(p.jobTitle)}</span>
                <span className={`inline-flex shrink-0 items-center gap-0.5 rounded-md px-1 py-0.5 align-middle text-[7px] font-medium leading-tight tracking-normal [font-family:var(--font-poppins),Poppins,sans-serif] sm:gap-1 sm:px-1.5 sm:text-[11px] ${
                  p.employeeStatus === "active" ? "bg-[#DCFCE7] text-[#166534]" : "bg-[#FEF2F2] text-[#DC2626]"
                }`}>
                  <span className={`h-1 w-1 shrink-0 rounded-full sm:h-1.5 sm:w-1.5 ${p.employeeStatus === "active" ? "bg-[#166534]" : "bg-[#DC2626]"}`} aria-hidden />
                  <span className="whitespace-nowrap uppercase">{p.employeeStatus}</span>
                </span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="inline-flex items-center justify-center rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[13px] font-medium text-[#b91c1c] transition hover:bg-[#fee2e2] disabled:opacity-50 sm:px-4 sm:text-[14px]"
            >
              {deleteMutation.isPending ? "Removing…" : "Remove"}
            </button>
          </div>
        </div>

        <div className="emp-profile-main-card rounded-xl border border-[#e5e7eb] bg-[#f7f7fa] p-3 sm:p-6">
          <div className="flex flex-col gap-4">
            <SectionCard title="Personal Details" onEdit={() => setEditPersonalOpen(true)}>
              <PersonalDetailsContent p={p} />
            </SectionCard>

            <SectionCard title="Address" onEdit={() => setEditAddressOpen(true)}>
              <DetailGrid
                items={[
                  ["Street name", dash(p.streetName)],
                  ["Street number", dash(p.streetNo)],
                  ["Flat/Apartment number", dash(p.flatApartmentNo)],
                  ["Floor", dash(p.floor)],
                  ["Postal code", dash(p.postalCode)],
                  ["City", dash(p.city)],
                  ["Province/region/state", dash(p.province)],
                  ["Country", dash(p.country)],
                ]}
              />
            </SectionCard>

            <SectionCard title="Employment & Role Details" onEdit={() => setEditEmploymentOpen(true)}>
              <DetailGrid
                items={[
                  ["Legal entity", dash(p.legalEntity)],
                  ["Employee ID", dash(p.employeeIdExternal ?? p.employeeNo)],
                  ["Job title", dash(p.jobTitle)],
                  ["Group", dash(p.groupName)],
                  ["Scope of work", dash(p.scopeOfWork)],
                  ["Seniority level", dash(p.seniorityLevel)],
                  ["Department role", dash(p.departmentRole)],
                  ["Department", dash(p.department)],
                  ["Contract start date", fmtDate(p.contractStart)],
                  ["Direct manager email", dash(p.lineManagerEmail)],
                  ["Contract end date", fmtDate(p.contractEnd)],
                  ["Employment type", dash(p.employmentType)],
                  ["Work location/country", dash(p.workLocationCountry)],
                  ["Termination date", fmtDate(p.terminationDate)],
                  ["Status", dash(p.employeeStatus)],
                ]}
              />
            </SectionCard>

            <SectionCard title="Compensation & Payment" onEdit={() => setEditCompensationOpen(true)}>
              <DetailGrid
                items={[
                  ["Payment method", dash(p.paymentMethod)],
                  ["Payment currency code", dash(p.paymentCurrencyCode)],
                  ["Payment preference", dash(p.paymentPreference)],
                  ["Gross annual salary", p.grossAnnualSalary != null ? p.grossAnnualSalary.toLocaleString("en-US") : "—"],
                  ["Compensation type", dash(p.compensationType)],
                  ["Working hours", dash(p.workingHours)],
                  ["Shift schedule", dash(p.shiftSchedule)],
                  ["Working days per week", dash(p.workingDaysPerWeek)],
                  ["Probation period", dash(p.probationPeriod)],
                  ["Notice period", dash(p.noticePeriod)],
                ]}
              />
            </SectionCard>

            <SectionCard title="Bank & Wallet Details" onEdit={() => setEditBankWalletOpen(true)}>
              <DetailGrid
                items={[
                  ["Bank name", dash(p.bankName)],
                  ["Bank address", dash(p.bankAddress)],
                  ["SWIFT/BIC", dash(p.swiftBic)],
                  ["IBAN", dash(p.iban)],
                  ["Default payment method", dash(p.defaultPaymentMethod)],
                  ["Currency preference", dash(p.currencyPreference)],
                  ["Digital wallet address", dash(p.digitalWalletAddress)],
                ]}
              />
            </SectionCard>

            <SectionCard title="Notes" onEdit={() => setEditNotesOpen(true)}>
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#9ca3af] text-xs font-semibold text-white" aria-hidden>!</span>
                <p className="notes-section-text whitespace-pre-wrap">
                  {p.internalNotes || "No internal notes."}
                </p>
              </div>
            </SectionCard>
          </div>
        </div>

        <EditPersonalDetailsModal
          open={editPersonalOpen}
          onClose={() => setEditPersonalOpen(false)}
          initialValues={profileToEditPersonalInitial(p)}
          onSave={handleSavePersonal}
        />

        <EditAddressModal
          open={editAddressOpen}
          onClose={() => setEditAddressOpen(false)}
          initialValues={profileToEditAddressInitial(p)}
          onSave={handleSaveAddress}
        />

        <EditEmploymentModal
          open={editEmploymentOpen}
          onClose={() => setEditEmploymentOpen(false)}
          initialValues={{
            jobTitle: p.jobTitle ?? "",
            group: p.groupName ?? "",
            department: p.department ?? "",
            lineManagerEmail: p.lineManagerEmail ?? "",
            startDate: p.contractStart ?? "",
            employmentType: p.employmentType ?? "",
            status: p.employeeStatus,
            employeeId: p.employeeIdExternal ?? "",
            seniorityLevel: p.seniorityLevel ?? "",
            departmentRole: p.departmentRole ?? "",
            workLocationCountry: p.workLocationCountry ?? "",
            terminationDate: p.contractEnd ?? "",
          }}
          onSave={handleSaveEmployment}
        />

        <EditCompensationModal
          open={editCompensationOpen}
          onClose={() => setEditCompensationOpen(false)}
          initialValues={{
            paymentMethod: p.paymentMethod ?? "",
            paymentCurrencyCode: p.paymentCurrencyCode ?? "",
            paymentPreference: p.paymentPreference ?? "",
            grossAnnualSalary: p.grossAnnualSalary != null ? String(p.grossAnnualSalary) : "",
            compensationType: p.compensationType ?? "",
            workingHours: p.workingHours ?? "",
            shiftSchedule: p.shiftSchedule ?? "",
            workingDaysPerWeek: p.workingDaysPerWeek ?? "",
            probationPeriod: p.probationPeriod ?? "",
            noticePeriod: p.noticePeriod ?? "",
          }}
          onSave={handleSaveCompensation}
        />

        <EditBankWalletModal
          open={editBankWalletOpen}
          onClose={() => setEditBankWalletOpen(false)}
          initialValues={{
            bankName: p.bankName ?? "",
            bankAddress: p.bankAddress ?? "",
            swiftBic: p.swiftBic ?? "",
            iban: p.iban ?? "",
            defaultPaymentMethod: p.defaultPaymentMethod ?? "",
            currencyPreference: p.currencyPreference ?? "",
            digitalWalletAddress: p.digitalWalletAddress ?? "",
          }}
          onSave={handleSaveBankWallet}
        />

        <EditNotesModal
          open={editNotesOpen}
          onClose={() => setEditNotesOpen(false)}
          initialValues={{ notes: p.internalNotes ?? "" }}
          onSave={handleSaveNotes}
        />
      </div>
    </div>
  );
}
