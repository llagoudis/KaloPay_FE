"use client";

import { use } from "react";
import Button from "@/components/ui/Button";

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

const MOCK_TRANSACTION = {
  id: "b2d80-170-data-dms-b4d84eb0f2",
  virtualId: "c1dc2b03-604b-a1b008a827",
  transactionType: "Incoming Transfer",
  recurringTransfer: "No",
  createdAt: "14.12.2023 10:22:19 AM",
  updatedAt: "14.12.2023 10:22:19 AM",
  currency: "BTC_TEST",
  fee: "-",
  paymentType: "FREEBLOCK",
  rate: "-",
  fx: "-",
  transactionStatus: "COMPLETED",
  beneficiaryBank: {
    bankName: "Revolut",
    country: "Cyprus",
    bankAddress: "-",
    swiftBic: "-",
  },
  additionalInfo: {
    referenceTransaction: "-",
    referencedBy: "Zbo",
    error: "-",
    providerId: "-",
  },
  beneficiary: {
    name: "Justin Paul",
    type: "Person",
    accountNumber: "BTC_TEST",
    currency: "BTC_TEST",
    country: "-",
    addressLine1: "-",
  },
  parameters: {
    txHash: "E3K7xUlzxbdh5fp4cqkp2b3w3x3e3b5c02d1c6e87b42b8e51",
  },
  documents: [
    { id: "1", name: "Doc 1" },
    { id: "2", name: "Doc 2" },
  ],
};

export default function AdminTransactionDetailPage({
  params,
}: {
  params: Promise<{ transactionId: string }>;
}) {
  const { transactionId } = use(params);
  const t = MOCK_TRANSACTION;

  return (
    <div className="view-transaction-detail-page w-full space-y-6">
      {/* Transaction heading — alag div, parent ke andar NAHI */}
      <div className="bg-white px-6 py-5" style={{ borderRadius: "10px" }}>
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

      {/* Main grid — light: gray shell; dark: transparent (globals) */}
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
        {/* Left column — width 747px, gap 10px, teeno divs 416px min-height, padding 16px */}
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
              {t.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between gap-4 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
                >
                  <span className="text-sm font-medium text-gray-900">{doc.name}</span>
                  <Button variant="primary" size="sm">
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* Right column — bacha hua space bhar lega, right par empty space nahi */}
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