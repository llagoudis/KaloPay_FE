"use client";

import Link from "next/link";
import { use, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants/routes";
import Button from "@/components/ui/Button";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { apiClient } from "@/lib/api/client";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import { useCompany, useUpdateCompany } from "@/hooks/admin/useCompanies";
import { useAdminEmployees } from "@/hooks/admin/useEmployees";
import { type AdminAccount } from "@/lib/api/admin/accounts";
import AddDocumentModal from "@/components/admin/documents/AddDocumentModal";
import EditDocumentModal, {
  type EditableDocument,
} from "@/components/admin/documents/EditDocumentModal";

type TabId = "details" | "documents" | "accounts" | "employees";

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

type CompanyEmployeeRow = {
  id: string;
  company: string;
  fullName: string;
  accessRoles: string;
  enabled: string;
};

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

export default function AdminCompanyDetailPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = use(params);
  const cid = Number(companyId);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("details");
  const [documentsSearch, setDocumentsSearch] = useState("");
  const [addDocumentOpen, setAddDocumentOpen] = useState(false);
  const [editDocument, setEditDocument] = useState<EditableDocument | null>(null);
  const [employeesSearch, setEmployeesSearch] = useState("");
  const [editCompanyOpen, setEditCompanyOpen] = useState(false);

  // Edit company form state
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editCountry, setEditCountry] = useState("");
  const [editBusinessType, setEditBusinessType] = useState("");
  const [editVerificationStatus, setEditVerificationStatus] = useState("");
  const [editAccountStatus, setEditAccountStatus] = useState("");

  const token = useAdminAuthStore((s) => s.token);

  // Real company data
  const companyQuery = useCompany(companyId);
  const updateCompanyMut = useUpdateCompany();

  const company = companyQuery.data?.company;
  const c = {
    name: company?.name ?? "—",
    clientId: company?.clientId ?? String(company?.id ?? "—"),
    companyType: company?.business_type ?? company?.businessType ?? "—",
    owner: company?.ownerName ?? company?.owner_name ?? "—",
    incorporationDate: company?.incorporation_date ? new Date(company.incorporation_date).toLocaleDateString() : "—",
    registrationNumber: company?.registration_number ?? "—",
    verificationLevel: company?.verification_level ?? "—",
    otherBusinessType: "—",
    accountStatus: company?.accountStatus ?? company?.account_status ?? "—",
    createdAt: company?.created_at ? new Date(company.created_at).toLocaleDateString() : "—",
    consentTerms: "—",
    taxIdentificationNumber: company?.tax_id ?? "—",
    verificationStatus: company?.verificationStatus ?? company?.verification_status ?? "—",
    businessType: company?.businessType ?? company?.business_type ?? "—",
    beneficialOwnerType: "—",
    statusReason: "—",
    uploadedAt: "—",
    accounts: { privateAccount: "—", vaultNumber: "—" },
    settings: { priceList: "—", actualPriceList: "—", skipTransferPreApproval: "—" },
    fees: { recurring: "—", fxMarkup: "—" },
    contacts: { phone: company?.phone ?? "—", email: company?.email ?? "—", url: "—", signalEnabled: "—" },
    country: company?.country ?? "—",
  };

  const statusTone = (() => {
    const s = (c.verificationStatus ?? "").toLowerCase();
    if (s === "active" || s === "approved") return { bg: "rgba(56,142,60,0.25)", fg: "#bff0c4", bd: "rgba(191,240,196,0.4)" };
    if (s === "suspended" || s === "terminated" || s === "rejected") return { bg: "rgba(220,38,38,0.25)", fg: "#ffc9c9", bd: "rgba(255,201,201,0.4)" };
    return { bg: "rgba(215,158,27,0.25)", fg: "#ffe39a", bd: "rgba(255,227,154,0.4)" };
  })();

  const documentsQuery = useQuery({
    queryKey: ["admin", "documents", "company", cid],
    queryFn: () =>
      apiClient<{ data: ApiDocumentRow[]; total: number }>(
        `/admin/documents?entityType=company&entityId=${cid}&limit=50`,
        { token: token! }
      ),
    enabled: !!token && Number.isFinite(cid),
  });
  const accountsQuery = useQuery({
    queryKey: ["admin", "accounts", "company", cid],
    queryFn: () => apiClient<{ data: AdminAccount[]; total: number }>(`/admin/accounts?companyId=${cid}&limit=50`, { token: token! }),
    enabled: !!token && Number.isFinite(cid),
  });

  const employeesQuery = useAdminEmployees(Number.isFinite(cid) ? { companyId: String(cid) } : undefined);

  const qc = useQueryClient();
  const deleteDocMut = useMutation({
    mutationFn: (docId: number) =>
      apiClient<{ message: string }>(`/admin/documents/${docId}`, {
        method: "DELETE",
        token: token!,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "documents", "company", cid] });
    },
  });

  const allEmployees: CompanyEmployeeRow[] = (employeesQuery.data?.data ?? []).map((e) => ({
    id: String(e.id),
    company: (e as Record<string, unknown>).company_name as string ?? c.name,
    fullName: `${(e as Record<string, unknown>).first_name ?? ""} ${(e as Record<string, unknown>).last_name ?? ""}`.trim() || "—",
    accessRoles: (e as Record<string, unknown>).role as string ?? "—",
    enabled: (e as Record<string, unknown>).is_active ? "Yes" : "No",
  }));

  const filteredCompanyEmployees = allEmployees.filter(
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

  const accountRows: AccountRow[] = (accountsQuery.data?.data ?? []).map((a) => ({
    number: a.account_number,
    providerNumber: a.provider ?? "—",
    type: a.account_type,
    providerCurrency: a.currency,
    currentBalance: a.balance,
  }));

  const handleEditCompanyOpen = () => {
    setEditName(company?.name ?? "");
    setEditEmail(company?.email ?? "");
    setEditPhone(company?.phone ?? "");
    setEditCountry(company?.country ?? "");
    setEditBusinessType(company?.business_type ?? company?.businessType ?? "");
    setEditVerificationStatus(company?.verificationStatus ?? company?.verification_status ?? "");
    setEditAccountStatus(company?.accountStatus ?? company?.account_status ?? "");
    setEditCompanyOpen(true);
  };

  const handleEditCompanySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await updateCompanyMut.mutateAsync({
      id: companyId,
      data: {
        name: editName,
        email: editEmail,
        phone: editPhone,
        country: editCountry,
        business_type: editBusinessType,
        verification_status: editVerificationStatus,
        account_status: editAccountStatus,
      },
    });
    setEditCompanyOpen(false);
  };

  if (companyQuery.isLoading) {
    return <div className="py-12 text-center text-gray-400">Loading…</div>;
  }

  return (
    <div className="w-full" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Navy Hero */}
      <div style={{ position: "relative", overflow: "hidden", borderRadius: 18, padding: "26px 28px", background: "linear-gradient(125deg, #0a1c36 0%, #12294c 55%, #1b3b66 100%)", color: "#fff" }}>
        <div style={{ position: "absolute", top: -80, right: -40, width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle, rgba(212,175,90,0.18), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -100, right: 130, width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle, rgba(46,110,210,0.22), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
          <div style={{ minWidth: 0 }}>
            <button onClick={() => router.push(ROUTES.admin.companies)} style={{ display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 14, padding: 0, border: "none", background: "transparent", color: "rgba(255,255,255,0.7)", fontSize: 12.5, fontWeight: 500, cursor: "pointer" }}>
              ← Companies
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 18, minWidth: 0 }}>
              <div style={{ width: 72, height: 72, borderRadius: 18, background: "linear-gradient(135deg, rgba(212,175,90,0.9), rgba(184,142,52,0.9))", display: "flex", alignItems: "center", justifyContent: "center", color: "#1a2336", fontWeight: 700, fontSize: 28, flexShrink: 0, boxShadow: "0 6px 18px rgba(0,0,0,0.25)" }}>
                {c.name.charAt(0)}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <h1 style={{ margin: 0, fontWeight: 700, fontSize: 25, color: "#fff", letterSpacing: "-0.01em" }}>{c.name}</h1>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 11px", borderRadius: 9999, fontSize: 12, fontWeight: 600, background: statusTone.bg, color: statusTone.fg, border: `1px solid ${statusTone.bd}` }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }} />{c.verificationStatus}
                  </span>
                </div>
                <p style={{ margin: "6px 0 0", fontSize: 14.5, color: "#cfe0ff" }}>{c.companyType} · {c.businessType}</p>
                <p style={{ margin: "3px 0 0", fontSize: 13, color: "#9db8ef", fontFamily: "monospace" }}>{c.clientId} · {c.contacts.email}</p>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
            <button onClick={() => router.push(ROUTES.admin.companies)} style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 40, padding: "0 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.1)", color: "#fff", fontWeight: 500, fontSize: 14, cursor: "pointer" }}>Back</button>
            <button onClick={handleEditCompanyOpen} style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 40, padding: "0 18px", borderRadius: 10, border: "none", background: "#fff", color: "#0a1c36", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Edit company</button>
          </div>
        </div>
        <div style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginTop: 24 }}>
          {[{ label: "Client ID", value: c.clientId }, { label: "Verification", value: c.verificationLevel }, { label: "Business Type", value: c.businessType }, { label: "Country", value: c.country }].map((k) => (
            <div key={k.label} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.16)", borderRadius: 12, padding: "13px 16px" }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "#9db8ef" }}>{k.label}</div>
              <div style={{ marginTop: 5, fontSize: 16, fontWeight: 600, color: "#fff" }}>{k.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab strip */}
      <div style={{ display: "inline-flex", gap: 4, background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: 5 }}>
        {([ { id: "details", label: "Details" }, { id: "documents", label: "Documents" }, { id: "accounts", label: "Accounts/Wallets" }, { id: "employees", label: "Employees" } ] as { id: TabId; label: string }[]).map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ padding: "8px 22px", borderRadius: 9, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14, background: activeTab === tab.id ? "#0F50DB" : "transparent", color: activeTab === tab.id ? "#fff" : "#6C757D", transition: "background 0.15s" }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Details tab */}
      {activeTab === "details" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>
          <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "15px 20px", borderBottom: "1px solid #E5E7EB" }}>
              <span style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(15,80,219,0.1)", color: "#0F50DB", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </span>
              <span style={{ fontWeight: 600, fontSize: 15, color: "#0E1620" }}>Company Details</span>
            </div>
            <div style={{ padding: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 28px" }}>
              {[
                ["Name", c.name], ["Client ID", c.clientId], ["Company Type", c.companyType], ["Owner", c.owner],
                ["Incorporation Date", c.incorporationDate], ["Tax Identification Number", c.taxIdentificationNumber],
                ["Registration Number", c.registrationNumber], ["Verification Status", c.verificationStatus],
                ["Verification Level", c.verificationLevel], ["Business Type", c.businessType],
                ["Beneficial Owner Type", c.beneficialOwnerType], ["Account Status", c.accountStatus],
                ["Status Reason", c.statusReason], ["Created At", c.createdAt],
                ["Consent Terms", c.consentTerms], ["Uploaded At", c.uploadedAt],
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "#9EA6B3" }}>{label}</span>
                  <span style={{ fontSize: 14, fontWeight: 500, color: "#0E1620" }}>{String(value) || "—"}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <FeesEstimateCard
              cycle={String((company as unknown as Record<string,unknown>)?.billing_cycle ?? "Monthly")}
              base={parseFloat(String((company as unknown as Record<string,unknown>)?.base_fee ?? "0")) || 0}
              per={parseFloat(String((company as unknown as Record<string,unknown>)?.per_employee_fee ?? "0")) || 0}
              count={allEmployees.length}
            />
            <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "15px 20px", borderBottom: "1px solid #E5E7EB" }}>
                <span style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(15,80,219,0.1)", color: "#0F50DB", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                </span>
                <span style={{ fontWeight: 600, fontSize: 15, color: "#0E1620" }}>Contacts</span>
              </div>
              <div style={{ padding: "6px 20px" }}>
                {[["Phone", c.contacts.phone], ["Email", c.contacts.email], ["URL", c.contacts.url], ["Signal", c.contacts.signalEnabled]].map(([label, value], i, arr) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "10px 0", borderBottom: i < arr.length - 1 ? "1px solid #E5E7EB" : "none" }}>
                    <span style={{ fontSize: 13, color: "#9EA6B3" }}>{label}</span>
                    <span style={{ fontSize: 13.5, fontWeight: 500, color: "#0E1620" }}>{String(value) || "—"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Documents tab */}
      {activeTab === "documents" && (
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #E5E7EB" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <label style={{ position: "relative", flex: 1, minWidth: 200 }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9EA6B3" }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </span>
              <input type="search" placeholder="Search documents" value={documentsSearch} onChange={(e) => setDocumentsSearch(e.target.value)}
                style={{ height: 40, width: "100%", borderRadius: 8, border: "1px solid #E5E7EB", background: "#fff", padding: "0 12px 0 36px", fontSize: 14, color: "#0E1620", outline: "none" }} />
            </label>
            <button onClick={() => setAddDocumentOpen(true)} style={{ height: 40, padding: "0 18px", borderRadius: 8, border: "none", background: "#0F50DB", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer", whiteSpace: "nowrap" }}>+ Add new</button>
          </div>
          <Table<DocumentRow>
            columns={[
              { key: "documentType", header: "Document Type" },
              { key: "status", header: "Status", render: (value: unknown) => { const v = String(value).toLowerCase(); const variant: "success" | "warning" | "danger" = v === "approved" ? "success" : v === "rejected" ? "danger" : "warning"; return <Badge label={String(value)} variant={variant} />; } },
              { key: "file", header: "File", render: (value: unknown) => <span style={{ fontWeight: 500, color: "#0F50DB" }}>{String(value)}</span> },
              { key: "country", header: "Country" },
              { key: "issueDate", header: "Issue Date" },
              { key: "validUntil", header: "Valid Until" },
              { key: "id" as const, header: "Actions", render: (_v: unknown, row: DocumentRow) => (
                <div style={{ display: "inline-flex", gap: 8 }}>
                  <button type="button" onClick={() => setEditDocument({ id: row.raw.id, document_type: row.raw.document_type, country: row.raw.country, issue_date: row.raw.issue_date, expiry_date: row.raw.expiry_date, notes: row.raw.notes, file_name: row.raw.file_name })}
                    style={{ borderRadius: 7, border: "1px solid #E5E7EB", background: "#fff", color: "#0E1620", padding: "4px 12px", fontSize: 12.5, fontWeight: 500, cursor: "pointer" }}>Edit</button>
                  <button type="button" onClick={async () => { if (!confirm(`Delete "${row.raw.file_name}"?`)) return; try { await deleteDocMut.mutateAsync(row.raw.id); } catch (e) { alert(`Failed: ${(e as Error).message}`); } }} disabled={deleteDocMut.isPending}
                    style={{ borderRadius: 7, border: "1px solid #fee2e2", background: "#fff", color: "#991b1b", padding: "4px 12px", fontSize: 12.5, fontWeight: 500, cursor: "pointer" }}>Delete</button>
                </div>
              ) },
            ]}
            data={filteredDocuments}
            emptyMessage={documentsQuery.isLoading ? "Loading…" : documentsQuery.error ? `Error: ${(documentsQuery.error as Error).message}` : "No documents found."}
            className="admin-list-table border-0"
          />
        </div>
      )}

      {/* Accounts tab */}
      {activeTab === "accounts" && (
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #E5E7EB" }}>
          <Table<AccountRow>
            columns={[
              { key: "number", header: "Account Number", render: (value: unknown) => <span style={{ fontFamily: "monospace", fontWeight: 600, color: "#0F50DB" }}>{String(value)}</span> },
              { key: "providerNumber", header: "Provider" },
              { key: "type", header: "Type" },
              { key: "providerCurrency", header: "Currency" },
              { key: "currentBalance", header: "Balance", render: (value: unknown) => <span style={{ fontFamily: "monospace", fontWeight: 600 }}>{String(value)}</span> },
            ]}
            data={accountRows}
            emptyMessage={accountsQuery.isLoading ? "Loading…" : "No accounts found."}
            className="admin-list-table border-0"
          />
        </div>
      )}

      {/* Employees tab */}
      {activeTab === "employees" && (
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #E5E7EB" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <label style={{ position: "relative", flex: 1 }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9EA6B3" }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </span>
              <input type="search" placeholder="Search employees" value={employeesSearch} onChange={(e) => setEmployeesSearch(e.target.value)}
                style={{ height: 40, width: "100%", borderRadius: 8, border: "1px solid #E5E7EB", background: "#fff", padding: "0 12px 0 36px", fontSize: 14, outline: "none" }} />
            </label>
            <Link href={ROUTES.admin.employeeAdd} style={{ height: 40, padding: "0 18px", borderRadius: 8, background: "#0F50DB", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", textDecoration: "none" }}>+ Add new employee</Link>
          </div>
          <Table<CompanyEmployeeRow>
            columns={[
              { key: "id", header: "ID", render: (value: unknown) => <span style={{ fontFamily: "monospace", fontSize: 12.5 }}>{String(value)}</span> },
              { key: "fullName", header: "Name", render: (value: unknown, row: CompanyEmployeeRow) => <Link href={ROUTES.admin.employeeDetail(row.id)} style={{ fontWeight: 500, color: "#0F50DB", textDecoration: "none" }}>{String(value)}</Link> },
              { key: "company", header: "Company" },
              { key: "accessRoles", header: "Role" },
              { key: "enabled", header: "Active" },
            ]}
            data={filteredCompanyEmployees}
            emptyMessage="No employees found."
            className="admin-list-table border-0"
          />
        </div>
      )}

      {/* Edit company modal */}
      <Modal isOpen={editCompanyOpen} onClose={() => setEditCompanyOpen(false)} title="Edit Company" size="lg">
        <form className="grid grid-cols-1 gap-5 sm:grid-cols-2" onSubmit={handleEditCompanySubmit}>
          <div><label className="mb-1.5 block text-sm font-medium text-gray-700">Name <span className="text-red-500">*</span></label><input required value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Company name" /></div>
          <div><label className="mb-1.5 block text-sm font-medium text-gray-700">Email</label><input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Email" /></div>
          <div><label className="mb-1.5 block text-sm font-medium text-gray-700">Phone</label><input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Phone" /></div>
          <div><label className="mb-1.5 block text-sm font-medium text-gray-700">Country</label><input value={editCountry} onChange={(e) => setEditCountry(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Country" /></div>
          <div><label className="mb-1.5 block text-sm font-medium text-gray-700">Business Type</label><input value={editBusinessType} onChange={(e) => setEditBusinessType(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Business type" /></div>
          <div><label className="mb-1.5 block text-sm font-medium text-gray-700">Verification Status</label>
            <select value={editVerificationStatus} onChange={(e) => setEditVerificationStatus(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
              <option value="">Select</option>
              {["active","pending","approved","rejected","suspended"].map(v => <option key={v} value={v}>{v.charAt(0).toUpperCase()+v.slice(1)}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2"><label className="mb-1.5 block text-sm font-medium text-gray-700">Account Status</label>
            <select value={editAccountStatus} onChange={(e) => setEditAccountStatus(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
              <option value="">Select</option>
              {["active","suspended","closed"].map(v => <option key={v} value={v}>{v.charAt(0).toUpperCase()+v.slice(1)}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" size="md" onClick={() => setEditCompanyOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" size="md" disabled={updateCompanyMut.isPending}>{updateCompanyMut.isPending ? "Saving…" : "Save Changes"}</Button>
          </div>
        </form>
      </Modal>

      <AddDocumentModal open={addDocumentOpen} onClose={() => setAddDocumentOpen(false)} entityType="company" entityId={cid} />
      <EditDocumentModal open={editDocument !== null} onClose={() => setEditDocument(null)} doc={editDocument} entityType="company" entityId={cid} />
    </div>
  );
}
