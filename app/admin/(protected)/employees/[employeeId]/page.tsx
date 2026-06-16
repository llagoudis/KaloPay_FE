"use client";

import Link from "next/link";
import { use, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ROUTES } from "@/lib/constants/routes";
import { useAdminEmployee, useUpdateAdminEmployee } from "@/hooks/admin/useEmployees";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import { apiClient } from "@/lib/api/client";
import EditPersonalDetailsModal, {
  type EditPersonalForm,
} from "@/components/user/people/EditPersonalDetailsModal";
import EditAddressModal, {
  type EditAddressForm,
} from "@/components/user/people/EditAddressModal";
import EditEmploymentModal from "@/components/user/people/EditEmploymentModal";
import EditCompensationModal from "@/components/user/people/EditCompensationModal";
import EditBankWalletModal from "@/components/user/people/EditBankWalletModal";
import EditNotesModal from "@/components/user/people/EditNotesModal";
import AddDocumentModal from "@/components/admin/documents/AddDocumentModal";
import EditDocumentModal, {
  type EditableDocument,
} from "@/components/admin/documents/EditDocumentModal";

type TabId = "details" | "documents" | "accounts";

const SECTION_HEADER_STYLE =
  "border-b border-gray-200 px-4 py-3 flex items-center justify-between";

const TABS: { id: TabId; label: string }[] = [
  { id: "details", label: "Details" },
  { id: "documents", label: "Documents" },
  { id: "accounts", label: "Accounts" },
];

const SECTION_TITLE_LINE_CLAMP: React.CSSProperties = {
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

function fmtDate(value: unknown): string {
  if (!value) return "—";
  const s = String(value);
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (iso) {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const day = parseInt(iso[3], 10);
    return `${months[parseInt(iso[2], 10) - 1]} ${day}${
      day === 1 ? "st" : day === 2 ? "nd" : day === 3 ? "rd" : "th"
    } ${iso[1]}`;
  }
  return s;
}

function fmtMoney(value: unknown, currency = "USD"): string {
  if (value === null || value === undefined || value === "") return "—";
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value);
  return n.toLocaleString("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });
}

function v(x: unknown, fallback = "—"): string {
  if (x === null || x === undefined || x === "") return fallback;
  return String(x);
}

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
      <span
        className={`min-w-0 text-sm font-medium text-gray-900 break-words [overflow-wrap:anywhere] ${valueClassName}`}
      >
        {value}
      </span>
    </div>
  );
}

function SectionCard({
  title,
  children,
  onEdit,
}: {
  title: string;
  children: React.ReactNode;
  onEdit?: () => void;
}) {
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
        {onEdit ? (
          <button
            type="button"
            onClick={onEdit}
            className="shrink-0 text-sm font-medium text-blue-600 hover:underline"
          >
            Edit
          </button>
        ) : null}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

interface AdminDocumentRow {
  id: number;
  entity_type: string;
  entity_id: number;
  document_type: string | null;
  document_status: "pending" | "approved" | "rejected";
  country: string | null;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  uploaded_by_name: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  notes: string | null;
  created_at: string;
}

function useAdminToken() {
  return useAdminAuthStore((s) => s.token);
}

function useEmployeeDocuments(employeeId: number | null) {
  const token = useAdminToken();
  return useQuery({
    queryKey: ["admin", "documents", "employee", employeeId],
    queryFn: () =>
      apiClient<{ data: AdminDocumentRow[]; total: number }>(
        `/admin/documents?entityType=employee&entityId=${employeeId}&limit=50`,
        { token: token! }
      ),
    enabled: !!token && employeeId !== null,
  });
}

function useDeleteAdminDocument(employeeId: number | null) {
  const token = useAdminToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiClient<{ message: string }>(`/admin/documents/${id}`, {
        method: "DELETE",
        token: token!,
      }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["admin", "documents", "employee", employeeId],
      });
    },
  });
}

export default function AdminEmployeeDetailPage({
  params,
}: {
  params: Promise<{ employeeId: string }>;
}) {
  const { employeeId } = use(params);
  const id = Number(employeeId);
  const [activeTab, setActiveTab] = useState<TabId>("details");

  const { data, isLoading, error } = useAdminEmployee(employeeId);
  const updateMut = useUpdateAdminEmployee();
  const documentsQuery = useEmployeeDocuments(Number.isFinite(id) ? id : null);

  const [editPersonalOpen, setEditPersonalOpen] = useState(false);
  const [editAddressOpen, setEditAddressOpen] = useState(false);
  const [editEmploymentOpen, setEditEmploymentOpen] = useState(false);
  const [editCompensationOpen, setEditCompensationOpen] = useState(false);
  const [editBankOpen, setEditBankOpen] = useState(false);
  const [editNotesOpen, setEditNotesOpen] = useState(false);
  const [addDocumentOpen, setAddDocumentOpen] = useState(false);
  const [editDocument, setEditDocument] = useState<EditableDocument | null>(null);
  const deleteDocMut = useDeleteAdminDocument(Number.isFinite(id) ? id : null);

  const emp = data?.employee as Record<string, unknown> | undefined;

  const personalInitial: Partial<EditPersonalForm> = useMemo(
    () => ({
      name: v(emp?.first_name, ""),
      middleName: v(emp?.middle_name, ""),
      surname: v(emp?.last_name, ""),
      personalEmail: v(emp?.email ?? emp?.personal_email, ""),
      workEmail: v(emp?.work_email, ""),
      nationality: v(emp?.nationality, ""),
      dateOfBirth: v(emp?.date_of_birth, "").slice(0, 10),
      gender: v(emp?.gender, ""),
      maritalStatus: v(emp?.marital_status, ""),
      nationalIdNumber: v(emp?.national_id_number ?? emp?.passport_number, ""),
      passportNumber: v(emp?.passport_number, ""),
      primaryCountryCode: v(emp?.primary_country_code, ""),
      primaryContact: v(emp?.primary_phone ?? emp?.phone, ""),
      emergencyCountryCode: v(emp?.emergency_country_code, ""),
      emergencyContact: v(emp?.emergency_phone, ""),
      nationalInsuranceNo: v(emp?.national_insurance_no, ""),
      tic: v(emp?.tic, ""),
      dependants: v(emp?.dependants, ""),
      workPermitVisa: v(emp?.work_permit_visa, ""),
      residencePermitExpiry: v(emp?.residence_permit_expiry, "").slice(0, 10),
    }),
    [emp]
  );

  const addressInitial: Partial<EditAddressForm> = useMemo(
    () => ({
      streetName: v(emp?.street_name, ""),
      streetNumber: v(emp?.street_no, ""),
      flatApartmentNumber: v(emp?.flat_apartment_no, ""),
      floor: v(emp?.floor, ""),
      postalCode: v(emp?.postal_code, ""),
      city: v(emp?.city, ""),
      provinceRegionState: v(emp?.province, ""),
      country: v(emp?.country, ""),
    }),
    [emp]
  );

  const employmentInitial: Record<string, string> = useMemo(
    () => ({
      employeeId: v(emp?.employee_no, ""),
      legalEntity: v(emp?.legal_entity, ""),
      group: v(emp?.group_name, ""),
      jobTitle: v(emp?.job_title, ""),
      seniorityLevel: v(emp?.seniority_level, ""),
      department: v(emp?.department, ""),
      departmentRole: v(emp?.department_role, ""),
      lineManagerEmail: v(emp?.line_manager_email, ""),
      employmentType: v(emp?.employment_type, ""),
      status: v(emp?.employee_status, "active"),
      startDate: v(emp?.contract_start, "").slice(0, 10),
      terminationDate: v(emp?.contract_end ?? emp?.termination_date, "").slice(0, 10),
      workLocationCountry: v(emp?.work_location_country, ""),
    }),
    [emp]
  );

  const compensationInitial: Record<string, string> = useMemo(
    () => ({
      paymentMethod: v(emp?.payment_method, ""),
      paymentPreference: v(emp?.payment_preference, ""),
      paymentCurrencyCode: v(emp?.payment_currency_code, ""),
      grossAnnualSalary: v(emp?.gross_annual_salary, ""),
      compensationType: v(emp?.compensation_type, ""),
      workingHours: v(emp?.working_hours, ""),
      shiftSchedule: v(emp?.shift_schedule, ""),
      workingDaysPerWeek: v(emp?.working_days_per_week, ""),
      probationPeriod: v(emp?.probation_period, ""),
      noticePeriod: v(emp?.notice_period, ""),
    }),
    [emp]
  );

  const bankInitial: Record<string, string> = useMemo(
    () => ({
      bankName: v(emp?.bank_name, ""),
      bankAddress: v(emp?.bank_address, ""),
      swiftBic: v(emp?.swift_bic, ""),
      iban: v(emp?.iban, ""),
      defaultPaymentMethod: v(emp?.default_payment_method, ""),
      currencyPreference: v(emp?.currency_preference, ""),
      digitalWalletAddress: v(emp?.digital_wallet_address ?? emp?.usdt_erc_wallet, ""),
    }),
    [emp]
  );

  async function handleSavePersonal(values: EditPersonalForm) {
    await updateMut.mutateAsync({
      id: employeeId,
      data: {
        first_name: values.name,
        middle_name: values.middleName || null,
        last_name: values.surname,
        email: values.personalEmail || null,
        work_email: values.workEmail || null,
        nationality: values.nationality || null,
        date_of_birth: values.dateOfBirth || null,
        gender: values.gender || null,
        marital_status: values.maritalStatus || null,
        national_id_number: values.nationalIdNumber || null,
        passport_number: values.passportNumber || null,
        primary_country_code: values.primaryCountryCode || null,
        primary_phone: values.primaryContact || null,
        emergency_country_code: values.emergencyCountryCode || null,
        emergency_phone: values.emergencyContact || null,
        national_insurance_no: values.nationalInsuranceNo || null,
        tic: values.tic || null,
        dependants: values.dependants || null,
        work_permit_visa: values.workPermitVisa || null,
        residence_permit_expiry: values.residencePermitExpiry || null,
      },
    });
    setEditPersonalOpen(false);
  }

  async function handleSaveAddress(values: EditAddressForm) {
    await updateMut.mutateAsync({
      id: employeeId,
      data: {
        street_name: values.streetName || null,
        street_no: values.streetNumber || null,
        flat_apartment_no: values.flatApartmentNumber || null,
        floor: values.floor || null,
        postal_code: values.postalCode || null,
        city: values.city || null,
        province: values.provinceRegionState || null,
        country: values.country || null,
      },
    });
    setEditAddressOpen(false);
  }

  async function handleSaveEmployment(values: Record<string, string>) {
    await updateMut.mutateAsync({
      id: employeeId,
      data: {
        employee_no: values.employeeId || null,
        legal_entity: values.legalEntity || null,
        group_name: values.group || null,
        job_title: values.jobTitle || null,
        seniority_level: values.seniorityLevel || null,
        department: values.department || null,
        department_role: values.departmentRole || null,
        line_manager_email: values.lineManagerEmail || null,
        employment_type: values.employmentType || null,
        employee_status: values.status || "active",
        contract_start: values.startDate || null,
        contract_end: values.terminationDate || null,
        work_location_country: values.workLocationCountry || null,
      },
    });
    setEditEmploymentOpen(false);
  }

  async function handleSaveCompensation(values: Record<string, string>) {
    await updateMut.mutateAsync({
      id: employeeId,
      data: {
        payment_method: values.paymentMethod || null,
        payment_preference: values.paymentPreference || null,
        payment_currency_code: values.paymentCurrencyCode || null,
        gross_annual_salary: values.grossAnnualSalary || null,
        compensation_type: values.compensationType || null,
        working_hours: values.workingHours || null,
        shift_schedule: values.shiftSchedule || null,
        working_days_per_week: values.workingDaysPerWeek || null,
        probation_period: values.probationPeriod || null,
        notice_period: values.noticePeriod || null,
      },
    });
    setEditCompensationOpen(false);
  }

  async function handleSaveBank(values: Record<string, string>) {
    await updateMut.mutateAsync({
      id: employeeId,
      data: {
        bank_name: values.bankName || null,
        bank_address: values.bankAddress || null,
        swift_bic: values.swiftBic || null,
        iban: values.iban || null,
        default_payment_method: values.defaultPaymentMethod || null,
        currency_preference: values.currencyPreference || null,
        digital_wallet_address: values.digitalWalletAddress || null,
      },
    });
    setEditBankOpen(false);
  }

  async function handleSaveNotes(values: { notes: string }) {
    await updateMut.mutateAsync({
      id: employeeId,
      data: { internal_notes: values.notes || null },
    });
    setEditNotesOpen(false);
  }

  if (isLoading) {
    return (
      <div className="w-full rounded-xl bg-white p-8 text-sm text-gray-500">
        Loading employee…
      </div>
    );
  }

  if (error || !emp) {
    return (
      <div className="w-full rounded-xl bg-white p-8">
        <Link
          href={ROUTES.admin.employees}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to Employees
        </Link>
        <p className="mt-4 text-sm text-red-600">
          {(error as Error)?.message ?? "Employee not found."}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="bg-white px-6 py-5" style={{ borderRadius: "10px" }}>
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

      <div
        className="admin-tab-strip grid grid-cols-3 items-center gap-1"
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          padding: "8px",
          border: "1px solid #E5E7EB",
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`min-w-0 whitespace-nowrap rounded-[12px] px-2 py-2 text-center text-[13px] font-medium transition-colors sm:px-4 sm:py-2.5 sm:text-sm ${
              activeTab === tab.id ? "text-white" : "text-[#6C757D]"
            }`}
            style={activeTab === tab.id ? { backgroundColor: "#0F50DB" } : undefined}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "details" && (
        <div
          className="flex min-h-[200px] flex-col gap-4 rounded-2xl bg-white p-4"
          role="region"
          aria-label="View individual details"
        >
          <SectionCard title="Personal Details" onEdit={() => setEditPersonalOpen(true)}>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <DetailRow label="Employee no" value={v(emp.employee_no)} />
                <DetailRow label="Nationality" value={v(emp.nationality)} />
                <DetailRow label="Personal email" value={v(emp.email)} />
                <DetailRow label="Date of birth" value={fmtDate(emp.date_of_birth)} />
                <DetailRow
                  label="National insurance no"
                  value={v(emp.national_insurance_no)}
                />
                <DetailRow label="ID" value={`ID-${String(emp.id ?? "—")}`} />
              </div>
              <div>
                <DetailRow label="First name" value={v(emp.first_name)} />
                <DetailRow label="Last name" value={v(emp.last_name)} />
                <DetailRow
                  label="Emergency contact no"
                  value={v(emp.emergency_phone)}
                />
                <DetailRow label="Work email" value={v(emp.work_email)} />
                <DetailRow
                  label="Identification no (Passport)"
                  value={v(emp.passport_number)}
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Address" onEdit={() => setEditAddressOpen(true)}>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <DetailRow label="Street name" value={v(emp.street_name)} />
                <DetailRow
                  label="Flat/Apartment number"
                  value={v(emp.flat_apartment_no)}
                />
                <DetailRow label="Postal code" value={v(emp.postal_code)} />
                <DetailRow label="City" value={v(emp.city)} />
              </div>
              <div>
                <DetailRow label="Street number" value={v(emp.street_no)} />
                <DetailRow label="Floor" value={v(emp.floor)} />
                <DetailRow label="Province/region/state" value={v(emp.province)} />
                <DetailRow label="Country" value={v(emp.country)} />
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Employment & Role Details"
            onEdit={() => setEditEmploymentOpen(true)}
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <DetailRow label="Legal entity" value={v(emp.legal_entity)} />
                <DetailRow label="Job title" value={v(emp.job_title)} />
                <DetailRow label="Scope of work" value={v(emp.scope_of_work)} />
                <DetailRow label="Department role" value={v(emp.department_role)} />
                <DetailRow
                  label="Contract start date"
                  value={fmtDate(emp.contract_start)}
                />
                <DetailRow label="Employment type" value={v(emp.employment_type)} />
                <DetailRow label="Employee Status" value={v(emp.employee_status)} />
              </div>
              <div>
                <DetailRow label="Group (optional)" value={v(emp.group_name)} />
                <DetailRow label="Seniority level" value={v(emp.seniority_level)} />
                <DetailRow label="Department" value={v(emp.department)} />
                <DetailRow
                  label="Direct manager email"
                  value={v(emp.line_manager_email)}
                />
                <DetailRow
                  label="Contract end date"
                  value={fmtDate(emp.contract_end)}
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Compensation & Payment"
            onEdit={() => setEditCompensationOpen(true)}
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <DetailRow label="Payment method" value={v(emp.payment_method)} />
                <DetailRow
                  label="Payment preference"
                  value={v(emp.payment_preference)}
                />
                <DetailRow
                  label="Compensation type"
                  value={v(emp.compensation_type)}
                />
                <DetailRow label="Working hours" value={v(emp.working_hours)} />
                <DetailRow label="Shift schedule" value={v(emp.shift_schedule)} />
              </div>
              <div>
                <DetailRow
                  label="Payment currency code"
                  value={v(emp.payment_currency_code, "USD")}
                />
                <DetailRow
                  label="Gross annual salary"
                  value={fmtMoney(
                    emp.gross_annual_salary,
                    String(emp.payment_currency_code ?? "USD")
                  )}
                />
                <DetailRow
                  label="Working days per week"
                  value={v(emp.working_days_per_week)}
                />
                <DetailRow label="Probation period" value={v(emp.probation_period)} />
                <DetailRow label="Notice period" value={v(emp.notice_period)} />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Bank & Wallet Details" onEdit={() => setEditBankOpen(true)}>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <DetailRow label="Bank name" value={v(emp.bank_name)} />
                <DetailRow label="SWIFT/BIC" value={v(emp.swift_bic)} />
                <DetailRow
                  label="USDT_ERC Wallet Address"
                  value={v(emp.usdt_erc_wallet)}
                  valueClassName="break-all"
                />
                <DetailRow
                  label="USDC_Poly Wallet Address"
                  value={v(emp.usdc_polygon_wallet ?? emp.usdc_poly_wallet)}
                  valueClassName="break-all"
                />
              </div>
              <div>
                <DetailRow label="Bank address" value={v(emp.bank_address)} />
                <DetailRow label="IBAN" value={v(emp.iban)} />
                <DetailRow
                  label="USDC_ERC Wallet Address"
                  value={v(emp.usdc_erc_wallet)}
                  valueClassName="break-all"
                />
                <DetailRow
                  label="BTC Wallet Address"
                  value={v(emp.btc_wallet)}
                  valueClassName="break-all"
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Notes" onEdit={() => setEditNotesOpen(true)}>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {v(emp.internal_notes, "No notes yet.")}
            </p>
          </SectionCard>
        </div>
      )}

      {activeTab === "documents" && (
        <DocumentsTab
          documents={documentsQuery.data?.data ?? []}
          isLoading={documentsQuery.isLoading}
          error={documentsQuery.error as Error | null}
          onAddClick={() => setAddDocumentOpen(true)}
          onEdit={(d) =>
            setEditDocument({
              id: d.id,
              document_type: d.document_type,
              country: d.country,
              issue_date: d.issue_date,
              expiry_date: d.expiry_date,
              notes: d.notes,
              file_name: d.file_name,
            })
          }
          onDelete={async (d) => {
            if (!confirm(`Delete document "${d.file_name}"? This cannot be undone.`)) return;
            try {
              await deleteDocMut.mutateAsync(d.id);
            } catch (e) {
              alert(`Failed to delete: ${(e as Error).message}`);
            }
          }}
          isDeleting={deleteDocMut.isPending}
        />
      )}

      {activeTab === "accounts" && (
        <div className="rounded-2xl bg-white p-8 text-center text-sm text-gray-500">
          Accounts view coming soon.
        </div>
      )}

      {/* Shared modals — pre-fill from real data + save via mutation */}
      <EditPersonalDetailsModal
        open={editPersonalOpen}
        onClose={() => setEditPersonalOpen(false)}
        initialValues={personalInitial}
        onSave={handleSavePersonal}
      />
      <EditAddressModal
        open={editAddressOpen}
        onClose={() => setEditAddressOpen(false)}
        initialValues={addressInitial}
        onSave={handleSaveAddress}
      />
      <EditEmploymentModal
        open={editEmploymentOpen}
        onClose={() => setEditEmploymentOpen(false)}
        initialValues={employmentInitial}
        onSave={handleSaveEmployment}
      />
      <EditCompensationModal
        open={editCompensationOpen}
        onClose={() => setEditCompensationOpen(false)}
        initialValues={compensationInitial}
        onSave={handleSaveCompensation}
      />
      <EditBankWalletModal
        open={editBankOpen}
        onClose={() => setEditBankOpen(false)}
        initialValues={bankInitial}
        onSave={handleSaveBank}
      />
      <EditNotesModal
        open={editNotesOpen}
        onClose={() => setEditNotesOpen(false)}
        initialValues={{ notes: v(emp.internal_notes, "") }}
        onSave={handleSaveNotes}
      />

      <AddDocumentModal
        open={addDocumentOpen}
        onClose={() => setAddDocumentOpen(false)}
        entityType="employee"
        entityId={id}
      />

      <EditDocumentModal
        open={editDocument !== null}
        onClose={() => setEditDocument(null)}
        doc={editDocument}
        entityType="employee"
        entityId={id}
      />
    </div>
  );
}

function fmtBytes(n: number | null): string {
  if (n == null) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

function DocumentsTab({
  documents,
  isLoading,
  error,
  onAddClick,
  onEdit,
  onDelete,
  isDeleting,
}: {
  documents: AdminDocumentRow[];
  isLoading: boolean;
  error: Error | null;
  onAddClick: () => void;
  onEdit: (d: AdminDocumentRow) => void;
  onDelete: (d: AdminDocumentRow) => void;
  isDeleting: boolean;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-gray-900">Documents</h2>
        <button
          type="button"
          onClick={onAddClick}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Add Document
        </button>
      </div>

      {error ? (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
          Failed to load documents: {error.message}
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs uppercase text-gray-500">
              <th className="px-3 py-3">Uploaded</th>
              <th className="px-3 py-3">File</th>
              <th className="px-3 py-3">Type</th>
              <th className="px-3 py-3">Issue / Expiry</th>
              <th className="px-3 py-3">Size</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-gray-500">
                  Loading…
                </td>
              </tr>
            ) : documents.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-gray-500">
                  No documents uploaded yet.
                </td>
              </tr>
            ) : (
              documents.map((d) => (
                <tr key={d.id} className="border-b border-gray-100">
                  <td className="px-3 py-3 text-gray-700">
                    {new Date(d.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-3 font-medium text-gray-900">{d.file_name}</td>
                  <td className="px-3 py-3 text-gray-700">{d.document_type ?? "—"}</td>
                  <td className="px-3 py-3 text-gray-700">
                    {d.issue_date ? new Date(d.issue_date).toLocaleDateString() : "—"} /{" "}
                    {d.expiry_date ? new Date(d.expiry_date).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-3 py-3 text-gray-700">{fmtBytes(d.file_size)}</td>
                  <td className="px-3 py-3">
                    <span
                      className={
                        d.document_status === "approved"
                          ? "rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700"
                          : d.document_status === "rejected"
                          ? "rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700"
                          : "rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700"
                      }
                    >
                      {d.document_status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(d)}
                        className="rounded-md border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(d)}
                        disabled={isDeleting}
                        className="rounded-md border border-red-200 bg-white px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

