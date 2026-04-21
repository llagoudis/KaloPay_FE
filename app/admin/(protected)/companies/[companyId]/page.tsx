"use client";

import Link from "next/link";
import { use, useState, useEffect, useCallback } from "react";
import { ROUTES } from "@/lib/constants/routes";
import Button from "@/components/ui/Button";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import { getCompany } from "@/lib/api/admin/companies";
import {
  getDocuments,
  uploadDocument,
  deleteDocument,
  approveDocument,
  type Document as ApiDocument,
} from "@/lib/api/admin/documents";

type TabId = "details" | "documents" | "accounts" | "employees";

const SECTION_HEADER_STYLE =
  "border-b border-gray-200 px-4 py-3 flex items-center justify-between rounded-t-[16px]";
const SECTION_HEADER_BG = "#DEEEFF";
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

type DocumentRow = {
  _id?: number;
  _filePath?: string;
  documentType: string;
  status: string;
  file: string;
  documentNumber: string;
  accountStatus: string;
  country: string;
  issueDate: string;
  validUntil: string;
};

const MOCK_DOCUMENTS: DocumentRow[] = Array.from({ length: 5 }, () => ({
  documentType: "Certificate Of Formation",
  status: "Approved",
  file: "Link",
  documentNumber: "-",
  accountStatus: "-",
  country: "Cyprus",
  issueDate: "-",
  validUntil: "-",
}));

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
  const token = useAdminAuthStore((s) => s.token);
  const [activeTab, setActiveTab] = useState<TabId>("details");
  const [documentsSearch, setDocumentsSearch] = useState("");
  const [addDocumentOpen, setAddDocumentOpen] = useState(false);
  const [docType, setDocType] = useState("");
  const [docCountry, setDocCountry] = useState("");
  const [docNumber, setDocNumber] = useState("");
  const [docStatus, setDocStatus] = useState("");
  const [docIssueDate, setDocIssueDate] = useState("");
  const [docValidUptil, setDocValidUptil] = useState("");
  const [employeesSearch, setEmployeesSearch] = useState("");
  const [companyData, setCompanyData] = useState<Record<string, unknown> | null>(null);
  const [documents, setDocuments] = useState<ApiDocument[]>([]);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docSubmitting, setDocSubmitting] = useState(false);

  const fetchDocuments = useCallback(async () => {
    if (!token) return;
    try {
      const res = await getDocuments(token, { entityType: "company", entityId: companyId });
      setDocuments(res.data ?? []);
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    }
  }, [token, companyId]);

  useEffect(() => {
    if (!token) return;
    getCompany(token, companyId)
      .then((res) => setCompanyData(res.company as unknown as Record<string, unknown>))
      .catch((err) => console.error("Failed to fetch company:", err));
    fetchDocuments();
  }, [token, companyId, fetchDocuments]);

  const handleDeleteDocument = async (id: number) => {
    if (!token) return;
    if (!confirm("Delete this document?")) return;
    try {
      await deleteDocument(token, String(id));
      await fetchDocuments();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete document");
    }
  };

  const handleApproveDocument = async (id: number, status: "approved" | "rejected") => {
    if (!token) return;
    try {
      await approveDocument(token, String(id), status);
      await fetchDocuments();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update document");
    }
  };

  const c = {
    ...MOCK_COMPANY,
    ...(companyData
      ? {
          name: (companyData.name as string) ?? MOCK_COMPANY.name,
          incorporationDate:
            (companyData.incorporation_date as string) ?? MOCK_COMPANY.incorporationDate,
          registrationNumber:
            (companyData.registration_number as string) ?? MOCK_COMPANY.registrationNumber,
          businessType: (companyData.business_type as string) ?? MOCK_COMPANY.businessType,
          owner: (companyData.owner_name as string) ?? MOCK_COMPANY.owner,
          clientId: companyData.id ? String(companyData.id) : MOCK_COMPANY.clientId,
          accountStatus:
            (companyData.account_status as string) ?? MOCK_COMPANY.accountStatus,
          verificationStatus:
            (companyData.verification_status as string) ?? MOCK_COMPANY.verificationStatus,
          verificationLevel:
            (companyData.verification_level as string) ?? MOCK_COMPANY.verificationLevel,
          contacts: {
            ...MOCK_COMPANY.contacts,
            phone: (companyData.phone as string) ?? MOCK_COMPANY.contacts.phone,
            email: (companyData.email as string) ?? MOCK_COMPANY.contacts.email,
          },
        }
      : {}),
  };

  const filteredCompanyEmployees = MOCK_COMPANY_EMPLOYEES.filter(
    (e) =>
      e.fullName.toLowerCase().includes(employeesSearch.toLowerCase()) ||
      e.company.toLowerCase().includes(employeesSearch.toLowerCase()) ||
      e.id.includes(employeesSearch)
  );

  const filteredDocuments: DocumentRow[] = documents
    .filter((d) =>
      (d.document_type ?? "").toLowerCase().includes(documentsSearch.toLowerCase()) ||
      (d.country ?? "").toLowerCase().includes(documentsSearch.toLowerCase()) ||
      String(d.id).includes(documentsSearch)
    )
    .map((d) => ({
      _id: d.id,
      _filePath: d.file_path,
      documentType: d.document_type ?? "—",
      status: d.document_status ?? "pending",
      file: d.file_name ?? "—",
      documentNumber: String(d.id),
      accountStatus: "—",
      country: d.country ?? "—",
      issueDate: d.created_at ? new Date(d.created_at).toLocaleDateString("en-GB") : "—",
      validUntil: "—",
    }));
  void MOCK_DOCUMENTS;

  return (
    <div className="view-company-detail-page w-full space-y-6">
      <div className="view-company-page-title-card rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
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
        className="admin-tab-strip view-company-tab-card overflow-x-auto rounded-2xl border border-gray-200 shadow-sm lg:overflow-visible"
        style={{
          backgroundColor: "#F8F9FB",
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
                  ? { backgroundColor: "#0F50DB", borderRadius: "16px" }
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
          className="view-company-details-parent grid grid-cols-1 gap-4 rounded-2xl p-3 min-h-[200px] sm:p-4 sm:gap-6 lg:grid-cols-[1fr_auto] lg:grid-rows-[auto_auto_auto_auto]"
          style={{ backgroundColor: "#F5F6FA" }}
          role="region"
          aria-label="View company details"
          data-figma="441-2527"
        >
          <div
            className="view-company-details-section overflow-hidden bg-white shadow-sm lg:row-span-4"
            style={{ borderRadius: "16px", border: SECTION_BORDER }}
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
            className="view-company-details-section w-full min-w-0 max-w-none overflow-hidden bg-white shadow-sm lg:w-[320px] lg:max-w-[320px] lg:col-start-2 lg:row-start-1"
            style={{ borderRadius: "16px", border: SECTION_BORDER }}
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
              className="view-company-details-section w-full min-w-0 max-w-none overflow-hidden bg-white shadow-sm lg:w-[320px] lg:max-w-[320px] lg:col-start-2 lg:row-start-2"
              style={{ borderRadius: "16px", border: SECTION_BORDER }}
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
              className="view-company-details-section w-full min-w-0 max-w-none overflow-hidden bg-white shadow-sm lg:w-[320px] lg:max-w-[320px] lg:col-start-2 lg:row-start-3"
              style={{ borderRadius: "16px", border: SECTION_BORDER }}
              data-section="Fees"
            >
              <div
                className={SECTION_HEADER_STYLE}
                style={{ backgroundColor: SECTION_HEADER_BG }}
              >
                <span style={SECTION_HEADING_STYLE}>Fees</span>
              </div>
              <div className="view-company-section-body p-4">
                <DetailRowInline label="Recurring" value={c.fees.recurring} />
                <DetailRowInline label="FX Markup" value={c.fees.fxMarkup} />
              </div>
            </div>
          <div
              className="view-company-details-section w-full min-w-0 max-w-none overflow-hidden bg-white shadow-sm lg:w-[320px] lg:max-w-[320px] lg:col-start-2 lg:row-start-4"
              style={{ borderRadius: "16px", border: SECTION_BORDER }}
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
                  const s = String(value).toLowerCase();
                  const variant = s === "approved" ? "success" : s === "rejected" ? "danger" : "warning";
                  return <Badge label={String(value)} variant={variant} />;
                },
              },
              {
                key: "file",
                header: "File",
                render: (value: unknown, row: DocumentRow) =>
                  row._filePath ? (
                    <a
                      href={`${process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api", "")}/${row._filePath}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {String(value)}
                    </a>
                  ) : (
                    <span>{String(value)}</span>
                  ),
              },
              { key: "documentNumber", header: "ID" },
              { key: "country", header: "Country" },
              { key: "issueDate", header: "Issue Date" },
              {
                key: "actions" as keyof DocumentRow,
                header: "",
                render: (_v: unknown, row: DocumentRow) =>
                  row._id ? (
                    <div className="flex items-center gap-1">
                      {row.status !== "approved" && (
                        <button
                          type="button"
                          onClick={() => handleApproveDocument(row._id!, "approved")}
                          className="rounded px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-50"
                          title="Approve"
                        >
                          Approve
                        </button>
                      )}
                      {row.status !== "rejected" && (
                        <button
                          type="button"
                          onClick={() => handleApproveDocument(row._id!, "rejected")}
                          className="rounded px-2 py-1 text-xs font-medium text-amber-600 hover:bg-amber-50"
                          title="Reject"
                        >
                          Reject
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteDocument(row._id!)}
                        className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                        title="Delete"
                      >
                        Delete
                      </button>
                    </div>
                  ) : null,
              },
            ]}
            data={filteredDocuments}
            emptyMessage="No documents found."
            className="admin-list-table mt-5 border-0 border-gray-100"
            bordered={false}
            rowDividers
            rowHover={false}
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
            bordered={false}
            rowDividers
            rowHover={false}
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
            bordered={false}
            rowDividers
            rowHover={false}
          />
        </div>
      )}

      {/* Add New Document modal — Figma 441-4105 */}
      <Modal
        isOpen={addDocumentOpen}
        onClose={() => setAddDocumentOpen(false)}
        title="Add New Document"
        size="2xl"
        className="px-8 py-8 sm:px-10 sm:py-9"
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!token || docSubmitting) return;
            if (!docFile) {
              alert("Please choose a file");
              return;
            }
            setDocSubmitting(true);
            try {
              await uploadDocument(token, "company", companyId, docFile, {
                documentType: docType || undefined,
                country: docCountry || undefined,
              });
              await fetchDocuments();
              setDocFile(null);
              setDocType("");
              setDocCountry("");
              setDocNumber("");
              setDocStatus("");
              setDocIssueDate("");
              setDocValidUptil("");
              setAddDocumentOpen(false);
            } catch (err) {
              alert(err instanceof Error ? err.message : "Upload failed");
            } finally {
              setDocSubmitting(false);
            }
          }}
          className="add-document-modal space-y-8"
        >
          <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-5">
            <div>
              <label className="add-document-modal-label mb-2 block" style={ADD_DOCUMENT_LABEL_STYLE}>
                Document Type <span className="text-red-500">*</span>
              </label>
              <SelectWithArrow
                surface="modal"
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className={`add-document-modal-select w-full rounded-lg border border-gray-300 px-3 py-2 ${docType === "" ? "text-gray-500" : "text-gray-900"}`}
              >
                <option value="">Select</option>
                <option value="certificate">Certificate Of Formation</option>
              </SelectWithArrow>
            </div>
            <div>
              <label className="add-document-modal-label mb-2 block" style={ADD_DOCUMENT_LABEL_STYLE}>
                Country <span className="text-red-500">*</span>
              </label>
              <SelectWithArrow
                surface="modal"
                value={docCountry}
                onChange={(e) => setDocCountry(e.target.value)}
                className={`add-document-modal-select w-full rounded-lg border border-gray-300 px-3 py-2 ${docCountry === "" ? "text-gray-500" : "text-gray-900"}`}
              >
                <option value="">Select</option>
                <option value="cyprus">Cyprus</option>
              </SelectWithArrow>
            </div>
            <div>
              <label className="add-document-modal-label mb-2 block" style={ADD_DOCUMENT_LABEL_STYLE}>
                Document Number
              </label>
              <input
                type="text"
                placeholder="Enter document no"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400"
              />
            </div>
            <div>
              <label className="add-document-modal-label mb-2 block" style={ADD_DOCUMENT_LABEL_STYLE}>
                Document Status
              </label>
              <SelectWithArrow
                surface="modal"
                value={docStatus}
                onChange={(e) => setDocStatus(e.target.value)}
                className={`add-document-modal-select w-full rounded-lg border border-gray-300 px-3 py-2 ${docStatus === "" ? "text-gray-500" : "text-gray-900"}`}
              >
                <option value="">Select</option>
                <option value="approved">Approved</option>
              </SelectWithArrow>
            </div>
            <div>
              <label className="add-document-modal-label mb-2 block" style={ADD_DOCUMENT_LABEL_STYLE}>
                Issue Date
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Select"
                  value={docIssueDate}
                  onChange={(e) => setDocIssueDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-gray-900 placeholder-gray-400"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={{ color: DROPDOWN_ARROW_COLOR }}>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
              </div>
            </div>
            <div>
              <label className="add-document-modal-label mb-2 block" style={ADD_DOCUMENT_LABEL_STYLE}>
                Valid Uptil
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Select"
                  value={docValidUptil}
                  onChange={(e) => setDocValidUptil(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-gray-900 placeholder-gray-400"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={{ color: DROPDOWN_ARROW_COLOR }}>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
          <div>
            <label className="add-document-modal-label mb-3 block" style={ADD_DOCUMENT_LABEL_STYLE}>
              Upload Files
            </label>
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50/80 px-3 py-8 text-center sm:py-12">
              <svg className="mx-auto h-14 w-14 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <p className="mt-3 text-sm font-medium text-gray-700 break-words">
                {docFile ? docFile.name : "Choose a file or drag & drop it here"}
              </p>
              <p className="mt-1 text-xs text-gray-500">Max 5MB</p>
              <label className="mt-4 inline-flex cursor-pointer items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Browse Files
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setDocFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>
          </div>
          <div className="add-document-modal-footer flex justify-end gap-2 border-t pt-6 sm:gap-3">
            <Button type="button" variant="outline" onClick={() => setAddDocumentOpen(false)} disabled={docSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={docSubmitting}>
              {docSubmitting ? "Uploading..." : "Add"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}