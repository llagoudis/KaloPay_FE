"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { DASHBOARD_ROUTES } from "@/components/user/dashboard/routes";
import EditPersonalDetailsModal, { type EditPersonalForm } from "@/components/user/people/EditPersonalDetailsModal";
import EditAddressModal, { type EditAddressForm } from "@/components/user/people/EditAddressModal";
import EditEmploymentModal from "@/components/user/people/EditEmploymentModal";
import EditCompensationModal from "@/components/user/people/EditCompensationModal";
import EditBankWalletModal from "@/components/user/people/EditBankWalletModal";
import EditNotesModal from "@/components/user/people/EditNotesModal";
import { usePersonDetail, useUpdatePerson, useDeletePerson } from "@/hooks/employer/useUserPanel";
import type { PersonDetail } from "@/lib/api/employer/people";
import { useEmployerAuthStore } from "@/store/employerAuthStore";
import { getEmployeeDocuments, uploadEmployeeDocument } from "@/lib/api/employer/appFeatures";

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
    <section className="emp-profile-section-card overflow-hidden rounded-xl border border-[#e5e7eb] bg-[#f7f7fa] dark:border-slate-700 dark:bg-slate-800">
      <div className="emp-profile-section-header flex items-center justify-between gap-2 border-b border-[#e5e7eb] bg-[#DEEEFF] px-4 py-3 dark:border-slate-700 dark:bg-slate-700 sm:px-6 sm:py-4">
        <h2 className="emp-profile-section-title whitespace-nowrap align-middle text-[13px] font-medium leading-[20px] tracking-normal text-[#000000] [font-family:var(--font-poppins),Poppins,sans-serif] dark:text-white sm:text-[16px]">
          {title}
        </h2>
        {onEdit && (
          <button type="button" onClick={onEdit} className="shrink-0 text-sm font-medium text-[var(--color-dash-accent)] hover:underline">
            Edit
          </button>
        )}
      </div>
      <div className="emp-profile-section-body bg-[#f7f7fa] px-4 py-4 dark:bg-slate-800 sm:px-6 sm:py-5">{children}</div>
    </section>
  );
}

function DetailGrid({ items }: { items: [string, string][] }) {
  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
      {items.map(([label, value]) => (
        <div key={label}>
          <span className="block text-sm text-[#6b7280] dark:text-slate-400">{label}</span>
          <p className="mt-0.5 text-sm font-medium text-[#1f2937] dark:text-slate-100">{value}</p>
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
          ["Social Insurance No", dash(p.nationalInsuranceNo)],
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
          ["Tax Identification code", dash(p.tic)],
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
  const searchParams = useSearchParams();

  const { data, isLoading, error } = usePersonDetail(Number.isFinite(id) ? id : null);
  const updateMutation = useUpdatePerson(id);
  const deleteMutation = useDeletePerson();
  const [editPersonalOpen, setEditPersonalOpen] = useState(false);
  const [editAddressOpen, setEditAddressOpen] = useState(false);
  const [editEmploymentOpen, setEditEmploymentOpen] = useState(false);
  const [editCompensationOpen, setEditCompensationOpen] = useState(false);
  const [editBankWalletOpen, setEditBankWalletOpen] = useState(false);
  const [editNotesOpen, setEditNotesOpen] = useState(false);

  type KycFile = { id: string; name: string; format: string; size: string; progress: number };
  const [kycFiles, setKycFiles] = useState<KycFile[]>([]);
  const kycToken = useEmployerAuthStore((s) => s.token);

  function fmtSize(bytes: number | null): string {
    if (!bytes) return "—";
    return bytes >= 1_048_576 ? `${(bytes / 1_048_576).toFixed(1)}MB` : `${(bytes / 1024).toFixed(0)}KB`;
  }

  // Load already-uploaded KYC documents for this employee from the server.
  useEffect(() => {
    if (!kycToken || !Number.isFinite(id)) return;
    let alive = true;
    getEmployeeDocuments(kycToken, id)
      .then((res) => {
        if (!alive) return;
        setKycFiles(
          (res.documents ?? []).map((d) => ({
            id: `srv-${d.id}`,
            name: (d.name ?? "").replace(/\.[^.]+$/, ""),
            format: d.format || "FILE",
            size: fmtSize(d.size),
            progress: 100,
          }))
        );
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [kycToken, id]);

  function handleKycUpload(e: React.ChangeEvent<HTMLInputElement>) {
    e.stopPropagation();
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const newEntries: (KycFile & { _file: File })[] = files.map((f) => ({
      id: `${f.name}-${f.size}-${Date.now()}-${Math.random()}`,
      name: f.name.replace(/\.[^.]+$/, ""),
      format: (f.name.split(".").pop() ?? "FILE").toUpperCase(),
      size: f.size >= 1_048_576
        ? `${(f.size / 1_048_576).toFixed(1)}MB`
        : `${(f.size / 1024).toFixed(0)}KB`,
      progress: 0,
      _file: f,
    }));
    setKycFiles((prev) => [...prev, ...newEntries.map(({ _file, ...k }) => k)]);
    e.target.value = "";

    // animate each file's progress bar 0 → 100, and upload it to the server for real.
    newEntries.forEach((entry) => {
      let p = 0;
      const step = () => {
        p = Math.min(p + Math.random() * 18 + 8, 100);
        setKycFiles((prev) =>
          prev.map((f) => (f.id === entry.id ? { ...f, progress: Math.round(p) } : f))
        );
        if (p < 100) setTimeout(step, 120);
      };
      setTimeout(step, 80);

      if (kycToken && Number.isFinite(id)) {
        const reader = new FileReader();
        reader.onload = () => {
          uploadEmployeeDocument(kycToken, id, {
            fileName: entry._file.name,
            fileData: typeof reader.result === "string" ? reader.result : undefined,
            fileSize: entry._file.size,
            mimeType: entry._file.type || undefined,
            documentType: "kyc",
          }).catch(() => {});
        };
        reader.readAsDataURL(entry._file);
      }
    });
  }

  function removeKycFile(id: string) {
    setKycFiles((prev) => prev.filter((f) => f.id !== id));
  }

  // Auto-open Personal Details modal when navigated with ?edit=1 (from People list "Edit" action).
  // Strip the query so a manual refresh doesn't re-open the modal.
  useEffect(() => {
    if (!data?.person) return;
    if (searchParams.get("edit") === "1") {
      setEditPersonalOpen(true);
      router.replace(`${DASHBOARD_ROUTES.people}/${id}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.person]);

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
      partTimePercentage: values.partTimePercentage || null,
      legalEntity: values.legalEntity || null,
      scopeOfWork: values.scopeOfWork || null,
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
      <div className="dash-shell w-full pt-6 pb-10">
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
                  ["Part-time percentage", dash(p.partTimePercentage)],
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

        {/* ── KYC Documents ── */}
        <div className="emp-profile-kyc-card mt-4 rounded-xl border border-[#e5e7eb] bg-[#f7f7fa] p-4 sm:p-6">
          <h2 className="emp-profile-section-title mb-4 text-[15px] font-semibold text-[#000000] [font-family:var(--font-poppins),Poppins,sans-serif]">KYC Documents</h2>
          <label className="emp-profile-kyc-upload mb-5 flex cursor-pointer items-center justify-center gap-4 rounded-lg border-2 border-dashed border-[#c7d8f8] bg-[#eef3ff] px-6 py-5 transition hover:opacity-90">
            <input type="file" accept=".png,.jpeg,.jpg,.pdf,.csv" className="hidden" multiple onChange={handleKycUpload} />
            <span className="flex shrink-0 items-center justify-center text-[#3b82f6]">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </span>
            <div>
              <p className="text-[13px] font-semibold text-[#1f2937]">Upload or drag your files here</p>
              <p className="text-[11px] text-[#6b7280]">Maximum File Size is 20MB</p>
              <p className="text-[11px] text-[#6b7280]">Supported File Types are .png, .jpeg, .pdf, .csv</p>
            </div>
          </label>

          <p className="mb-3 text-[13px] font-semibold text-[#374151]">Uploaded files</p>
          {kycFiles.length === 0 ? (
            <p className="text-[12px] text-[#9ca3af]">No documents uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {kycFiles.map((f) => (
                <div key={f.id} className="emp-profile-kyc-file relative rounded-lg border border-[#e5e7eb] bg-white px-4 pt-3 pb-4">
                  <button
                    type="button"
                    onClick={() => removeKycFile(f.id)}
                    className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full border border-[#e5e7eb] bg-white text-[#9ca3af] hover:text-[#ef4444]"
                    aria-label="Remove file"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#3b82f6] text-white">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                    </span>
                    <div className="min-w-0 flex-1 pr-4">
                      <p className="truncate text-[13px] font-medium text-[#1f2937]">{f.name}</p>
                      <p className="text-[11px] text-[#6b7280]">File Format: {f.format}&nbsp;&nbsp;&nbsp;File Size: {f.size}</p>
                    </div>
                  </div>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#e5e7eb]">
                    <div className="h-full rounded-full bg-[#3b82f6] transition-[width] duration-150 ease-out" style={{ width: `${f.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Navigation section cards ── */}
        <div className="emp-profile-links-card mt-4 mb-6 rounded-xl border border-[#e5e7eb] bg-[#f7f7fa] flex flex-col gap-3" style={{ padding: "18px" }}>
          {[
            { title: "Payments, expenses & work submissions", desc: "Review their submitted invoices and manage any payments",
              onClick: () => router.push(`${DASHBOARD_ROUTES.payments}?employee=${id}`),
              svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 9h4"/><path d="M7 13h2"/></svg> },
            { title: "Personal information", desc: "Check their contact info and other personal details",
              onClick: () => { if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" }); },
              svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg> },
            { title: "Time off", desc: "Review and manage time off information",
              onClick: () => router.push(DASHBOARD_ROUTES.payrollReports),
              svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg> },
            { title: "Payslips", desc: "Open and review payslips history",
              onClick: () => router.push(DASHBOARD_ROUTES.payrollReports),
              svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8"/><path d="M8 11h8"/><path d="M8 15h5"/></svg> },
          ].map((item) => (
            <button
              key={item.title}
              type="button"
              onClick={item.onClick}
              className="emp-profile-link-item flex w-full items-center gap-4 rounded-xl border border-[#e5e7eb] bg-[#f9f9fb] px-5 py-4 text-left transition"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center text-[#6b7280]">
                {item.svg}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-[#1f2937]">{item.title}</p>
                <p className="text-[12px] text-[#6b7280]">{item.desc}</p>
              </div>
            </button>
          ))}
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
            partTimePercentage: p.partTimePercentage ?? "",
            legalEntity: p.legalEntity ?? "",
            scopeOfWork: p.scopeOfWork ?? "",
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
