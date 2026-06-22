"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants/routes";
import Button from "@/components/ui/Button";
import { apiClient } from "@/lib/api/client";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import { type AdminTransaction } from "@/lib/api/admin/transactions";

const SECTION_HEADER_STYLE =
  "border-b border-gray-200 px-4 py-3";
const SECTION_HEADER_BG = "#DEEEFF";
const SECTION_HEADING_STYLE: React.CSSProperties = {
  fontFamily: "var(--font-poppins), Poppins, sans-serif",
  fontWeight: 500,
  fontSize: "16px",
  lineHeight: "20px",
  letterSpacing: "0%",
  color: "#000000",
};
function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="mb-3 flex flex-col gap-0.5">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}

function SectionCard({
  title,
  children,
  className,
  contentClassName,
  style,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={["view-transaction-section-card overflow-hidden", className].filter(Boolean).join(" ")}
      style={{ borderRadius: "10px", border: "none", backgroundColor: "#fcfcfc", ...style }}
    >
      <div
        className={`view-transaction-section-header ${SECTION_HEADER_STYLE}`}
        style={{ backgroundColor: SECTION_HEADER_BG }}
      >
        <span className="view-transaction-section-heading" style={SECTION_HEADING_STYLE}>
          {title}
        </span>
      </div>
      <div className={["view-transaction-section-body p-4", contentClassName].filter(Boolean).join(" ")}>{children}</div>
    </div>
  );
}

export default function AdminTransactionDetailPage({
  params,
}: {
  params: Promise<{ transactionId: string }>;
}) {
  const { transactionId } = use(params);
  const router = useRouter();
  const token = useAdminAuthStore((s) => s.token);

  const transactionQuery = useQuery({
    queryKey: ["admin", "transactions", transactionId],
    queryFn: () => apiClient<{ transaction: AdminTransaction }>(`/admin/transactions/${transactionId}`, { token: token! }),
    enabled: !!token && !!transactionId,
  });

  if (transactionQuery.isLoading) {
    return <div className="py-12 text-center text-gray-400">Loading…</div>;
  }

  if (transactionQuery.error) {
    return <div className="py-12 text-center text-red-500">Failed to load transaction: {(transactionQuery.error as Error).message}</div>;
  }

  const tx = transactionQuery.data?.transaction;

  const t = {
    id: tx?.transaction_ref ?? String(tx?.id ?? "—"),
    virtualId: String(tx?.id ?? "—"),
    transactionType: tx?.transaction_type ?? tx?.transactionType ?? "—",
    recurringTransfer: "—",
    createdAt: tx?.created_at ? new Date(tx.created_at).toLocaleString() : "—",
    updatedAt: "—",
    currency: tx?.currency ?? "—",
    fee: "—",
    paymentType: tx?.payment_type ?? tx?.paymentType ?? "—",
    rate: "—",
    fx: "—",
    transactionStatus: tx?.transaction_status ?? tx?.transactionStatus ?? "—",
    beneficiaryBank: {
      bankName: "—",
      country: "—",
      bankAddress: "—",
      swiftBic: "—",
    },
    additionalInfo: {
      referenceTransaction: "—",
      referencedBy: "—",
      error: "—",
      providerId: "—",
    },
    beneficiary: {
      name: "—",
      type: "—",
      accountNumber: "—",
      currency: tx?.currency ?? "—",
      country: "—",
      addressLine1: "—",
    },
    parameters: {
      txHash: "—",
    },
    documents: [] as { id: string; name: string }[],
  };

  return (
    <div className="view-transaction-detail-page w-full space-y-6">
      {/* Transaction heading */}
      <div className="bg-white px-6 py-5 flex items-center gap-4" style={{ borderRadius: "10px" }}>
        <button
          type="button"
          onClick={() => router.push(ROUTES.admin.transactions)}
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          ← Back
        </button>
        <h1
          className="admin-page-heading font-semibold text-gray-900"
          style={{
            fontFamily: "var(--font-poppins), Poppins, sans-serif",
            fontSize: "22px",
            lineHeight: "28px",
            color: "#0E1620",
          }}
        >
          Transaction
        </h1>
      </div>

      {/* Main grid */}
      <div
        className="view-transaction-detail-shell grid grid-cols-1 lg:grid-cols-[747px_1fr]"
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "10px",
          padding: "16px",
          gap: "32px",
          border: "none",
          opacity: 1,
        }}
        role="region"
        aria-label="Transaction details"
      >
        {/* Left column */}
        <div
          className="flex flex-col w-full"
          style={{ width: "747px", maxWidth: "100%", gap: "10px" }}
        >
          <SectionCard title="Transaction Details" style={{ minHeight: "416px" }}>
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-[1fr_0.85fr]">
              <DetailRow label="ID" value={t.id} />
              <DetailRow label="Virtual ID" value={t.virtualId} />
              <DetailRow label="Transaction Type" value={t.transactionType} />
              <DetailRow label="Recurring Transfer" value={t.recurringTransfer} />
              <DetailRow label="Created At" value={t.createdAt} />
              <DetailRow label="Updated At" value={t.updatedAt} />
              <DetailRow label="Currency" value={t.currency} />
              <DetailRow label="Fee" value={t.fee} />
              <DetailRow label="Payment Type" value={t.paymentType} />
              <DetailRow label="Rate" value={t.rate} />
              <DetailRow label="FX" value={t.fx} />
              <DetailRow
                label="Transaction Status"
                value={<span className="font-medium text-green-600">{t.transactionStatus}</span>}
              />
            </div>
          </SectionCard>

          <SectionCard title="Beneficiary">
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-[1fr_0.85fr]">
              <DetailRow label="Name" value={t.beneficiary.name} />
              <DetailRow label="Type" value={t.beneficiary.type} />
              <DetailRow label="Account Number" value={t.beneficiary.accountNumber} />
              <DetailRow label="Currency" value={t.beneficiary.currency} />
              <DetailRow label="Country" value={t.beneficiary.country} />
              <DetailRow label="Address Line 1" value={t.beneficiary.addressLine1} />
            </div>
          </SectionCard>

          <SectionCard title="Uploaded Documents">
            <div className="space-y-4">
              {t.documents.length === 0 ? (
                <p className="text-sm text-gray-400">No documents uploaded.</p>
              ) : (
                t.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between gap-4 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
                  >
                    <span className="text-sm font-medium text-gray-900">{doc.name}</span>
                    <Button variant="primary" size="sm">
                      Download
                    </Button>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6 min-w-0">
          <SectionCard title="Beneficiary Bank">
            <DetailRow label="Bank name" value={t.beneficiaryBank.bankName} />
            <DetailRow label="Country" value={t.beneficiaryBank.country} />
            <DetailRow label="Bank address" value={t.beneficiaryBank.bankAddress} />
            <DetailRow label="Swift/BIC" value={t.beneficiaryBank.swiftBic} />
          </SectionCard>

          <SectionCard title="Additional Information">
            <DetailRow label="Reference transaction" value={t.additionalInfo.referenceTransaction} />
            <DetailRow label="Referenced by" value={t.additionalInfo.referencedBy} />
            <DetailRow label="Error" value={t.additionalInfo.error} />
            <DetailRow label="Provider ID" value={t.additionalInfo.providerId} />
          </SectionCard>

          <SectionCard title="Parameters">
            <DetailRow
              label="TxHash"
              value={
                <span className="break-all font-mono text-xs text-gray-700">
                  {t.parameters.txHash}
                </span>
              }
            />
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
