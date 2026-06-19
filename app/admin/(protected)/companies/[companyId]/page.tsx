"use client";

import Link from "next/link";
import { use, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ROUTES } from "@/lib/constants/routes";
import Button from "@/components/ui/Button";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import { listDocuments, deleteDocument } from "@/lib/api/admin/documents";
import AddDocumentModal from "@/components/admin/documents/AddDocumentModal";
import EditDocumentModal, {
  type EditableDocument,
} from "@/components/admin/documents/EditDocumentModal";

type TabId = "details" | "documents" | "accounts" | "employees";

const SECTION_HEADER_STYLE =
  "border-b border-gray-200 px-4 py-3 flex items-center justify-between";
const SECTION_HEADER_BG = "rgb(222, 236, 250)";
const SECTION_HEADING_STYLE: React.CSSProperties = {
  fontFamily: "var(--font-poppins), Poppins, sans-serif",
  fontWeight: 500,
  fontSize: "16px",
  lineHeight: "20px",
  letterSpacing: "0%",
  color: "#000000",
};
const SECTION_BORDER = "1px solid #DFDFDF";
/** Form labels in Add Document modal — color from CSS via `.add-document-modal-label` + `data-modal-theme` (inline color was overriding dark theme) */
const ADD_DOCUMENT_LABEL_STYLE: React.CSSProperties = {
  fontFamily: "var(--font-poppins), Poppins, sans-serif",
  fontWeight: 500,
  fontSize: "16px",
  lineHeight: "20px",
  letterSpacing: "0%",
};
const DROPDOWN_ARROW_COLOR = "#878787DD";

function SelectWithArrow({
  children,
  className,
  surface = "default",
  ...props
}: React.ComponentPropsWithoutRef<"select"> & { surface?: "default" | "modal" }) {
  const isModal = surface === "modal";
  return (
    <div className={isModal ? "relative add-document-modal-select-wrap" : "relative"}>
      <select
        className={className}
        style={
          isModal
            ? { appearance: "none", paddingRight: "2.5rem" }
            : {
                appearance: "none",
                paddingRight: "2.5rem",
                border: "1px solid #E5E7EB",
                backgroundColor: "#FFFFFF",
              }
        }
        {...props}
      >
        {children}
      </select>
      <span
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
        style={isModal ? undefined : { color: DROPDOWN_ARROW_COLOR }}
      >
        <svg
          className={`h-4 w-4 ${isModal ? "text-gray-500" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </span>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="mb-4 flex flex-col gap-0.5">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}

/** Label left, value right — same row, for Accounts/Settings/Fees/Contacts brabar layout */
function DetailRowInline({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-gray-100 py-2.5 last:border-b-0">
      <span className="text-sm text-gray-500 shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right min-w-0">{value}</span>
    </div>
  );
}

const MOCK_COMPANY = {
  name: "Alexa",
  incorporationDate: "12-12-2025",
  registrationNumber: "-",
  verificationLevel: "-",
  otherBusinessType: "-",
  accountStatus: "-",
  createdAt: "12-12-2025",
  consentTerms: "12-12-2025",
  clientId: "35",
  companyType: "Test Company",
  owner: "Amar Hegde",
  taxIdentificationNumber: "-",
  verificationStatus: "PENDING",
  businessType: "-",
  beneficialOwnerType: "-",
  statusReason: "-",
  uploadedAt: "12-12-2025",
  accounts: { privateAccount: "-", vaultNumber: "-" },
  settings: {
    priceList: "-",
    actualPriceList: "-",
    skipTransferPreApproval: "-",
  },
  fees: { recurring: "-", fxMarkup: "-" },
  contacts: {
    phone: "-",
    email: "abc@gmail.com",
    url: "-",
    signalEnabled: "-",
  },
};

interface ApiDocumentRow {
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

type DocumentRow = {
  id: number;
  documentType: string;
  status: string;
  file: string;
  documentNumber: string;
  accountStatus: string;
  country: string;
  issueDate: string;
  validUntil: string;
  raw: ApiDocumentRow;
};

type AccountRow = {
  number: string;
  providerNumber: string;
  type: string;
  providerCurrency: string;
  currentBalance: string;
};

const MOCK_ACCOUNTS: AccountRow[] = [
  {
    number: "HE123129",
    providerNumber: "Bank Details: General Payments Gate LTD\nIBAN: GB50TRW23148510000949\nSWIFT/BIC: TRWIGB2LXXX\nBank Name: My EU Pay Ltd.",
    type: "Standard",
    providerCurrency: "BTC",
    currentBalance: "0.00",
  },
  {
    number: "HE123129",
    providerNumber: "ASdawoqqwe123121412",
    type: "Standard",
    providerCurrency: "BTC",
    currentBalance: "0.00",
  },
  {
    number: "HE123129",
    providerNumber: "Coin / Token: Bitcoin (BTC)\nNetwork: Bitcoin (BTC)\nWallet Address: bc1qxyzexamplebitcoi",
    type: "Standard",
    providerCurrency: "BTC",
    currentBalance: "0.00",
  },
  {
    number: "HE123129",
    providerNumber: "Asdawoqqwe12321412",
    type: "Standard",
    providerCurrency: "BTC",
    currentBalance: "0.00",
  },
  {
    number: "HE123129",
    providerNumber: "Bank Details: General Payments Gate LTD\nIBAN:GB50TRW123148510000949\nSWIFT/BIC: TRWIGB2LXXX\nBank Name: My EU Pay Ltd.",
    type: "Standard",
    providerCurrency: "BTC",
    currentBalance: "0.00",
  },
];

type CompanyEmployeeRow = {
  id: string;
  company: string;
  fullName: string;
  accessRoles: string;
  enabled: string;
};

const MOCK_COMPANY_EMPLOYEES: CompanyEmployeeRow[] = Array.from({ length: 5 }, () => ({
  id: "12",
  company: "Test",
  fullName: "John Doe",
  accessRoles: "Admin",
  enabled: "No",
}));

const TABS: { id: TabId; label: string }[] = [
  { id: "details", label: "Details" },
  { id: "documents", label: "Documents" },
  { id: "accounts", label: "Accounts" },
  { id: "employees", label: "Employees" },
];

export default function AdminCompanyDetailPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = use(params);
  const cid = Number(companyId);
  const [activeTab, setActiveTab] = useState<TabId>("details");
  const [documentsSearch, setDocumentsSearch] = useState("");
  const [addDocumentOpen, setAddDocumentOpen] = useState(false);
  const [editDocument, setEditDocument] = useState<EditableDocument | null>(null);
  const [employeesSearch, setEmployeesSearch] = useState("");
  const c = MOCK_COMPANY;

  const token = useAdminAuthStore((s) => s.token);
  const documentsQuery = useQuery({
    queryKey: ["admin", "documents", "company", cid],
    queryFn: () =>
      listDocuments(token!, { entityType: "company", entityId: String(cid), limit: 50 }),
    enabled: !!token && Number.isFinite(cid),
  });
  const qc = useQueryClient();
  const deleteDocMut = useMutation({
    mutationFn: (docId: number) => deleteDocument(token!, docId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "documents", "company", cid] });
    },
  });

  const filteredCompanyEmployees = MOCK_COMPANY_EMPLOYEES.filter(
    (e) =>
      e.fullName.toLowerCase().includes(employeesSearch.toLowerCase()) ||
      e.company.toLowerCase().includes(employeesSearch.toLowerCase()) ||
      e.id.includes(employeesSearch)
  );

  const filteredDocuments: DocumentRow[] = useMemo(() => {
    const rows: DocumentRow[] = (documentsQuery.data?.data ?? []).map((d) => ({
      id: d.id,
      documentType: d.document_type ?? "—",
      status: d.document_status ?? "pending",
      file: d.file_name,
      documentNumber: String(d.id),
      accountStatus: "—",
      country: d.country ?? "—",
      issueDate: d.issue_date ? new Date(d.issue_date).toLocaleDateString() : "—",
      validUntil: d.expiry_date ? new Date(d.expiry_date).toLocaleDateString() : "—",
      raw: d,
    }));
    if (!documentsSearch) return rows;
    const q = documentsSearch.toLowerCase();
    return rows.filter(
      (d) =>
        d.documentType.toLowerCase().includes(q) ||
        d.country.toLowerCase().includes(q) ||
        d.file.toLowerCase().includes(q)
    );
  }, [documentsQuery.data, documentsSearch]);

  return (
    <div className="view-company-detail-page w-full space-y-6">
      <div className="view-company-page-title-card rounded-[10px] bg-white px-6 py-5">
        <h1
          className="admin-page-heading font-semibold text-gray-900"
          style={{
            fontFamily: "var(--font-poppins), Poppins, sans-serif",
            fontSize: "22px",
            lineHeight: "28px",
            color: "#0E1620",
          }}
        >
          View Company
        </h1>
      </div>

      <div
        className="admin-tab-strip view-company-tab-card overflow-x-auto rounded-2xl border border-gray-200 lg:overflow-visible shadow-none"
        style={{
          backgroundColor: "#FFFFFF",
          padding: "8px",
        }}
      >
        <div className="flex min-w-max items-center gap-1 lg:min-w-0 lg:w-full">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors lg:flex-1 lg:shrink lg:whitespace-nowrap ${
                activeTab === tab.id
                  ? "admin-tab-btn--active text-white"
                  : "admin-tab-btn--inactive text-[#6C757D]"
              }`}
              style={
                activeTab === tab.id
                  ? { backgroundColor: "#0F50DB", borderRadius: "10px" }
                  : undefined
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "details" && (
        <div
          className="view-company-details-parent grid grid-cols-1 gap-4 rounded-2xl p-3 min-h-[200px] sm:p-4 sm:gap-6 lg:grid-cols-[1fr_auto] lg:grid-rows-[auto_auto_auto_auto] border border-gray-200"
          style={{ backgroundColor: "#FFFFFF" }}
          role="region"
          aria-label="View company details"
          data-figma="441-2527"
        >
          <div
            className="view-company-details-section overflow-hidden shadow-none lg:row-span-4"
            style={{ borderRadius: "10px", border: SECTION_BORDER }}
            data-section="Details"
          >
            <div
              className={SECTION_HEADER_STYLE}
              style={{ backgroundColor: SECTION_HEADER_BG }}
            >
              <span style={SECTION_HEADING_STYLE}>Details</span>
            </div>
            <div className="view-company-section-body p-4">
              {/* Top row: Photo + Name below icon (left) | Client ID, Company Type, Owner (right) */}
              <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="flex flex-col items-start gap-2">
                  <span className="text-sm text-gray-500">Photo</span>
                  <div
                    className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 text-2xl font-semibold text-gray-600"
                    aria-hidden
                  >
                    {c.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <DetailRow label="Name" value={c.name} />
                  </div>
                </div>
                <div>
                  <DetailRow label="Client ID" value={c.clientId} />
                  <DetailRow
                    label="Company Type"
                    value={
                      <span
                        className="company-detail-value-text"
                        style={{
                          fontFamily: "var(--font-poppins), Poppins, sans-serif",
                          fontWeight: 400,
                          fontStyle: "normal",
                          fontSize: "16px",
                          lineHeight: "20px",
                          letterSpacing: "0%",
                          verticalAlign: "middle",
                          color: "#000000",
                        }}
                      >
                        {c.companyType}
                      </span>
                    }
                  />
                  <DetailRow
                    label="Owner"
                    value={
                      <Link
                        href="#"
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {c.owner}
                      </Link>
                    }
                  />
                </div>
              </div>
              {/* Two columns aligned: left | right */}
              <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                <div>
                  <DetailRow label="Incorporation Date" value={c.incorporationDate} />
                  <DetailRow label="Registration Number" value={c.registrationNumber} />
                  <DetailRow label="Verification Level" value={c.verificationLevel} />
                  <DetailRow label="Other Business Type" value={c.otherBusinessType} />
                  <DetailRow label="Account Status" value={c.accountStatus} />
                  <DetailRow label="Created At" value={c.createdAt} />
                  <DetailRow label="Consent Terms" value={c.consentTerms} />
                </div>
                <div>
                  <DetailRow label="Tax Identification Number" value={c.taxIdentificationNumber} />
                  <DetailRow
                    label="Verification Status"
                    value={
                      <span
                        className="company-detail-value-text"
                        style={{
                          fontFamily: "var(--font-poppins), Poppins, sans-serif",
                          fontWeight: 400,
                          fontStyle: "normal",
                          fontSize: "16px",
                          lineHeight: "20px",
                          letterSpacing: "0%",
                          verticalAlign: "middle",
                          color: "#000000",
                        }}
                      >
                        {c.verificationStatus}
                      </span>
                    }
                  />
                  <DetailRow label="Business Type" value={c.businessType} />
                  <DetailRow label="Beneficial Owner Type" value={c.beneficialOwnerType} />
                  <DetailRow label="Status Reason" value={c.statusReason} />
                  <DetailRow label="Uploaded At" value={c.uploadedAt} />
                </div>
              </div>
            </div>
          </div>

          <div
            className="view-company-details-section w-full min-w-0 max-w-none overflow-hidden shadow-none lg:w-[320px] lg:max-w-[320px] lg:col-start-2 lg:row-start-1"
            style={{ borderRadius: "10px", border: SECTION_BORDER }}
            data-section="Accounts"
          >
              <div
                className={SECTION_HEADER_STYLE}
                style={{ backgroundColor: SECTION_HEADER_BG }}
              >
                <span style={SECTION_HEADING_STYLE}>Accounts</span>
              </div>
              <div className="view-company-section-body grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm text-gray-500">Private Account</span>
                  <span className="text-sm font-medium text-gray-900">{c.accounts.privateAccount}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm text-gray-500">Vault number</span>
                  <span className="text-sm font-medium text-gray-900">{c.accounts.vaultNumber}</span>
                </div>
              </div>
            </div>
          <div
              className="view-company-details-section w-full min-w-0 max-w-none overflow-hidden shadow-none lg:w-[320px] lg:max-w-[320px] lg:col-start-2 lg:row-start-2"
              style={{ borderRadius: "10px", border: SECTION_BORDER }}
              data-section="Settings"
            >
              <div
                className={SECTION_HEADER_STYLE}
                style={{ backgroundColor: SECTION_HEADER_BG }}
              >
                <span style={SECTION_HEADING_STYLE}>Settings</span>
              </div>
              <div className="view-company-section-body space-y-4 p-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm text-gray-500">Price List</span>
                    <span className="text-sm font-medium text-gray-900">{c.settings.priceList}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm text-gray-500">Actual Price List</span>
                    <span className="text-sm font-medium text-gray-900">{c.settings.actualPriceList}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm text-gray-500">Skip Transfer Pre Approval</span>
                  <span className="text-sm font-medium text-gray-900">{c.settings.skipTransferPreApproval}</span>
                </div>
              </div>
            </div>
          <div
              className="view-company-details-section w-full min-w-0 max-w-none overflow-hidden shadow-none lg:w-[320px] lg:max-w-[320px] lg:col-start-2 lg:row-start-3"
              style={{ borderRadius: "10px", border: SECTION_BORDER }}
              data-section="Fees"
            >
              <div
                className={SECTION_HEADER_STYLE}
                style={{ backgroundColor: SECTION_HEADER_BG }}
              >
                <span style={SECTION_HEADING_STYLE}>Fees</span>
              </div>
              <div className="view-company-section-body grid grid-cols-2 gap-4 p-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm text-gray-500">Recurring</span>
                  <span className="text-sm font-medium text-gray-900">{c.fees.recurring}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm text-gray-500">FX Markup</span>
                  <span className="text-sm font-medium text-gray-900">{c.fees.fxMarkup}</span>
                </div>
              </div>
            </div>
          <div
              className="view-company-details-section w-full min-w-0 max-w-none overflow-hidden shadow-none lg:w-[320px] lg:max-w-[320px] lg:col-start-2 lg:row-start-4"
              style={{ borderRadius: "10px", border: SECTION_BORDER }}
              data-section="Contacts"
            >
              <div
                className={SECTION_HEADER_STYLE}
                style={{ backgroundColor: SECTION_HEADER_BG }}
              >
                <span style={SECTION_HEADING_STYLE}>Contacts</span>
              </div>
              <div className="view-company-section-body grid grid-cols-1 gap-x-6 gap-y-4 p-4 sm:grid-cols-2">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm text-gray-500">Phone</span>
                  <span className="text-sm font-medium text-gray-900">{c.contacts.phone}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm text-gray-500">Email</span>
                  <span className="text-sm font-medium text-gray-900">{c.contacts.email}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm text-gray-500">URL</span>
                  <span className="text-sm font-medium text-gray-900">{c.contacts.url}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm text-gray-500">Signal Enabled</span>
                  <span className="text-sm font-medium text-gray-900">{c.contacts.signalEnabled}</span>
                </div>
              </div>
            </div>
        </div>
      )}

      {activeTab === "documents" && (
        <div className="view-company-tab-panel w-full rounded-2xl bg-white p-6 shadow-sm">
          <div className="view-company-tab-toolbar flex min-w-0 items-center gap-4">
            <label className="relative min-w-0 flex-1">
              <span className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="search"
                placeholder="Search"
                value={documentsSearch}
                onChange={(e) => setDocumentsSearch(e.target.value)}
                className="view-company-tab-search h-10 w-full min-w-0 rounded-lg bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-0 focus:ring-offset-0"
              />
            </label>
            <Button variant="primary" size="md" onClick={() => setAddDocumentOpen(true)}>
              + Add new
            </Button>
          </div>
          <Table<DocumentRow>
            columns={[
              { key: "documentType", header: "Document Type" },
              {
                key: "status",
                header: "Status",
                render: (value: unknown) => {
                  const v = String(value).toLowerCase();
                  const variant: "success" | "warning" | "danger" =
                    v === "approved" ? "success" : v === "rejected" ? "danger" : "warning";
                  return <Badge label={String(value)} variant={variant} />;
                },
              },
              {
                key: "file",
                header: "File",
                render: (value: unknown) => (
                  <span className="font-medium text-blue-600">{String(value)}</span>
                ),
              },
              { key: "country", header: "Country" },
              { key: "issueDate", header: "Issue Date" },
              { key: "validUntil", header: "Valid Until" },
              {
                key: "id" as const,
                header: "Actions",
                render: (_v: unknown, row: DocumentRow) => (
                  <div className="inline-flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setEditDocument({
                          id: row.raw.id,
                          document_type: row.raw.document_type,
                          country: row.raw.country,
                          issue_date: row.raw.issue_date,
                          expiry_date: row.raw.expiry_date,
                          notes: row.raw.notes,
                          file_name: row.raw.file_name,
                        })
                      }
                      className="rounded-md border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!confirm(`Delete document "${row.raw.file_name}"?`)) return;
                        try {
                          await deleteDocMut.mutateAsync(row.raw.id);
                        } catch (e) {
                          alert(`Failed to delete: ${(e as Error).message}`);
                        }
                      }}
                      disabled={deleteDocMut.isPending}
                      className="rounded-md border border-red-200 bg-white px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                ),
              },
            ]}
            data={filteredDocuments}
            emptyMessage={
              documentsQuery.isLoading
                ? "Loading documents…"
                : documentsQuery.error
                ? `Failed to load: ${(documentsQuery.error as Error).message}`
                : "No documents found."
            }
            className="admin-list-table mt-5 border-0 border-gray-100"
          />
        </div>
      )}

      {activeTab === "accounts" && (
        <div
          className="view-company-tab-panel w-full rounded-2xl bg-white p-6 shadow-sm text-gray-900"
          style={{
            fontFamily: "var(--font-poppins), Poppins, sans-serif",
            fontWeight: 400,
            fontStyle: "normal",
            fontSize: "14px",
            lineHeight: "20px",
            letterSpacing: "0%",
          }}
        >
          <Table<AccountRow>
            columns={[
              {
                key: "number",
                header: "Number",
                render: (value: unknown) => (
                  <Link href="#" className="font-medium text-blue-600 hover:underline">
                    {String(value)}
                  </Link>
                ),
              },
              {
                key: "providerNumber",
                header: "Provider Number",
                render: (value: unknown) => (
                  <span className="whitespace-pre-line text-left" style={{ verticalAlign: "middle" }}>{String(value)}</span>
                ),
              },
              { key: "type", header: "Type" },
              { key: "providerCurrency", header: "Provider Currency" },
              { key: "currentBalance", header: "Current Balance" },
            ]}
            data={MOCK_ACCOUNTS}
            emptyMessage="No accounts found."
            className="admin-list-table border-0 border-gray-100 [&_table]:text-sm [&_table]:leading-5 [&_th]:font-normal [&_td]:align-middle"
          />
        </div>
      )}

      {activeTab === "employees" && (
        <div className="view-company-tab-panel w-full rounded-2xl bg-white p-6 shadow-sm">
          <div className="view-company-tab-toolbar flex min-w-0 items-center gap-4">
            <label className="relative min-w-0 flex-1">
              <span className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="search"
                placeholder="Search"
                value={employeesSearch}
                onChange={(e) => setEmployeesSearch(e.target.value)}
                className="view-company-tab-search h-10 w-full min-w-0 rounded-lg bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-0 focus:ring-offset-0"
              />
            </label>
            <Link href={ROUTES.admin.companyAdd} className="shrink-0">
              <Button variant="primary" size="md" type="button">
                + Add new
              </Button>
            </Link>
          </div>
          <Table<CompanyEmployeeRow>
            columns={[
              { key: "id", header: "ID" },
              {
                key: "company",
                header: "Company",
                render: (value: unknown) => (
                  <Link href="#" className="font-medium text-blue-600 hover:underline">
                    {String(value)}
                  </Link>
                ),
              },
              {
                key: "fullName",
                header: "Full Name",
                render: (value: unknown) => (
                  <Link href="#" className="font-medium text-blue-600 hover:underline">
                    {String(value)}
                  </Link>
                ),
              },
              { key: "accessRoles", header: "Access Roles" },
              { key: "enabled", header: "Enabled" },
              {
                key: "actions",
                header: "",
                render: () => (
                  <button
                    type="button"
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    aria-label="Actions"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                    </svg>
                  </button>
                ),
              },
            ]}
            data={filteredCompanyEmployees.map((e) => ({ ...e, actions: null }))}
            emptyMessage="No employees found."
            className="admin-list-table mt-5 border-0 border-gray-100"
          />
        </div>
      )}

      <AddDocumentModal
        open={addDocumentOpen}
        onClose={() => setAddDocumentOpen(false)}
        entityType="company"
        entityId={cid}
      />

      <EditDocumentModal
        open={editDocument !== null}
        onClose={() => setEditDocument(null)}
        doc={editDocument}
        entityType="company"
        entityId={cid}
      />
    </div>
  );
}
