"use client";

import React, { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { DASHBOARD_ROUTES } from "@/components/user/dashboard/routes";
import { useCreateTransfer } from "@/hooks/employer/useUserPanel";

type AddressType = "whitelisted" | "onetime";

const FIAT_CURRENCIES = [
  "AED", "ARS", "AUD", "BDT", "BRL", "CAD", "CHF", "CLP", "CNY", "COP",
  "CZK", "DKK", "EGP", "EUR", "GBP", "HUF", "IDR", "ILS", "INR", "JPY",
  "KES", "KRW", "KWD", "MAD", "MXN", "MYR", "NGN", "NOK", "NPR", "NZD",
  "OMR", "PHP", "PKR", "PLN", "QAR", "RON", "RUB", "SAR", "SEK", "SGD",
  "THB", "TRY", "UAH", "USD", "VND", "ZAR",
];

const TRANSFER_COUNTRIES = [
  { value: "AF", label: "Afghanistan" }, { value: "AL", label: "Albania" }, { value: "DZ", label: "Algeria" },
  { value: "AR", label: "Argentina" }, { value: "AU", label: "Australia" }, { value: "AT", label: "Austria" },
  { value: "AZ", label: "Azerbaijan" }, { value: "BH", label: "Bahrain" }, { value: "BD", label: "Bangladesh" },
  { value: "BE", label: "Belgium" }, { value: "BR", label: "Brazil" }, { value: "BG", label: "Bulgaria" },
  { value: "CA", label: "Canada" }, { value: "CL", label: "Chile" }, { value: "CN", label: "China" },
  { value: "CO", label: "Colombia" }, { value: "HR", label: "Croatia" }, { value: "CY", label: "Cyprus" },
  { value: "CZ", label: "Czech Republic" }, { value: "DK", label: "Denmark" }, { value: "EG", label: "Egypt" },
  { value: "EE", label: "Estonia" }, { value: "FI", label: "Finland" }, { value: "FR", label: "France" },
  { value: "GE", label: "Georgia" }, { value: "DE", label: "Germany" }, { value: "GH", label: "Ghana" },
  { value: "GR", label: "Greece" }, { value: "HU", label: "Hungary" }, { value: "IN", label: "India" },
  { value: "ID", label: "Indonesia" }, { value: "IE", label: "Ireland" }, { value: "IL", label: "Israel" },
  { value: "IT", label: "Italy" }, { value: "JP", label: "Japan" }, { value: "JO", label: "Jordan" },
  { value: "KZ", label: "Kazakhstan" }, { value: "KE", label: "Kenya" }, { value: "KW", label: "Kuwait" },
  { value: "LV", label: "Latvia" }, { value: "LB", label: "Lebanon" }, { value: "LT", label: "Lithuania" },
  { value: "LU", label: "Luxembourg" }, { value: "MY", label: "Malaysia" }, { value: "MT", label: "Malta" },
  { value: "MX", label: "Mexico" }, { value: "MA", label: "Morocco" }, { value: "NP", label: "Nepal" },
  { value: "NL", label: "Netherlands" }, { value: "NZ", label: "New Zealand" }, { value: "NG", label: "Nigeria" },
  { value: "NO", label: "Norway" }, { value: "OM", label: "Oman" }, { value: "PK", label: "Pakistan" },
  { value: "PE", label: "Peru" }, { value: "PH", label: "Philippines" }, { value: "PL", label: "Poland" },
  { value: "PT", label: "Portugal" }, { value: "QA", label: "Qatar" }, { value: "RO", label: "Romania" },
  { value: "RU", label: "Russia" }, { value: "SA", label: "Saudi Arabia" }, { value: "RS", label: "Serbia" },
  { value: "SG", label: "Singapore" }, { value: "SK", label: "Slovakia" }, { value: "SI", label: "Slovenia" },
  { value: "ZA", label: "South Africa" }, { value: "KR", label: "South Korea" }, { value: "ES", label: "Spain" },
  { value: "LK", label: "Sri Lanka" }, { value: "SE", label: "Sweden" }, { value: "CH", label: "Switzerland" },
  { value: "TH", label: "Thailand" }, { value: "TR", label: "Turkey" }, { value: "UA", label: "Ukraine" },
  { value: "AE", label: "United Arab Emirates" }, { value: "UK", label: "United Kingdom" },
  { value: "US", label: "United States" }, { value: "UZ", label: "Uzbekistan" }, { value: "VN", label: "Vietnam" },
];

const labelClass = "transfers-label mb-2 block";
const labelStyle: React.CSSProperties = {
  fontFamily: "Poppins, var(--font-poppins)",
  fontWeight: 500,
  fontSize: "16px",
  lineHeight: "20px",
  letterSpacing: "0%",
  color: "#1F2937",
  verticalAlign: "middle",
};
const inputClass =
  "transfers-input h-11 w-full rounded-lg border border-[#e5e7eb] bg-transparent px-3 text-sm text-[#1f2937] placeholder:text-[#9ca3af] focus:border-[#0F4FDB] focus:outline-none focus:ring-1 focus:ring-[#0F4FDB]";
const poppins = { fontFamily: "var(--font-poppins)" as const };

function FiatTransfersForm({ onBack }: { onBack: () => void }) {
  const [currency, setCurrency] = useState("USD");
  const [amount, setAmount] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [iban, setIban] = useState("");
  const [bankName, setBankName] = useState("");
  const [reference, setReference] = useState("");
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const createMutation = useCreateTransfer();

  async function handleCreate() {
    setStatus(null);
    if (!currency || !accountHolder || !iban || !bankName) {
      setStatus({ ok: false, text: "Currency, account holder, IBAN and bank name are required" });
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setStatus({ ok: false, text: "Enter an amount greater than 0" });
      return;
    }
    try {
      const res = await createMutation.mutateAsync({
        kind: "fiat",
        currency,
        amount: Number(amount),
        beneficiary: accountHolder,
        address: iban,
        description: reference || `Fiat transfer to ${bankName}`,
      });
      setStatus({ ok: true, text: `Transfer ${res.ref} created (${res.status})` });
      setAmount(""); setAccountHolder(""); setIban(""); setBankName(""); setReference("");
    } catch (e) {
      setStatus({ ok: false, text: (e as Error).message ?? "Transfer failed" });
    }
  }

  return (
    <div className="w-full">
      <div className="transfers-outer-card mb-6 rounded-xl bg-[#f7f7fa] px-6 py-5 md:px-8">
        <h2 className="dash-card-section-title">Fiat Transfers</h2>
      </div>

      <div className="transfers-outer-card rounded-xl bg-[#f7f7fa] px-6 py-6 md:px-8">
        <h3
          className="mb-4 text-[#171717]"
          style={{ ...poppins, fontWeight: 600, fontSize: "16px", lineHeight: "100%" }}
        >
          Create a New Transfer
        </h3>
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass} style={labelStyle}>Select currency</label>
            <div className="relative">
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputClass + " pr-10 appearance-none"} style={poppins}>
                <option value="">Select currency</option>
                {FIAT_CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
              </span>
            </div>
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>Select template</label>
            <div className="relative">
              <select className={inputClass + " pr-10 appearance-none"} style={poppins}>
                <option value="">Select template</option>
                <option value="EUR">EUR Template</option>
                <option value="USD">USD Template</option>
                <option value="GBP">GBP Template</option>
                <option value="AED">AED Template</option>
                <option value="SAR">SAR Template</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-[#e5e7eb] pt-6">
          <h4 className="mb-4 text-[#171717]" style={{ ...poppins, fontWeight: 600, fontSize: "14px" }}>Beneficiary Details</h4>

          <div className="mb-6">
            <p className="mb-4 text-sm font-medium text-[#374151]" style={poppins}>Customer Info</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div><label className={labelClass} style={labelStyle}>Account holder name<span className="text-[#E22626]">*</span></label><input type="text" value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} placeholder="Enter account holder name" className={inputClass} style={poppins} /></div>
              <div><label className={labelClass} style={labelStyle}>IBAN<span className="text-[#E22626]">*</span></label><input type="text" value={iban} onChange={(e) => setIban(e.target.value)} placeholder="Enter IBAN no" className={inputClass} style={poppins} /></div>
              <div><label className={labelClass} style={labelStyle}>Street name<span className="text-[#E22626]">*</span></label><input type="text" placeholder="Enter street name" className={inputClass} style={poppins} /></div>
              <div><label className={labelClass} style={labelStyle}>BIC/SWIFT<span className="text-[#E22626]">*</span></label><input type="text" placeholder="Enter BIC/SWIFT" className={inputClass} style={poppins} /></div>
              <div><label className={labelClass} style={labelStyle}>Flat/Appartment number (if applicable)</label><input type="text" placeholder="Enter flat/appartment number" className={inputClass} style={poppins} /></div>
              <div><label className={labelClass} style={labelStyle}>Floor</label><input type="text" placeholder="Enter floor" className={inputClass} style={poppins} /></div>
              <div><label className={labelClass} style={labelStyle}>Postal code<span className="text-[#E22626]">*</span></label><input type="text" placeholder="Enter postal code" className={inputClass} style={poppins} /></div>
              <div><label className={labelClass} style={labelStyle}>Province/region/state</label><input type="text" placeholder="Enter province/region/state" className={inputClass} style={poppins} /></div>
              <div><label className={labelClass} style={labelStyle}>City<span className="text-[#E22626]">*</span></label><input type="text" placeholder="Enter city" className={inputClass} style={poppins} /></div>
              <div>
                <label className={labelClass} style={labelStyle}>Select country<span className="text-[#E22626]">*</span></label>
                <div className="relative">
                  <select className={inputClass + " pr-10 appearance-none"} style={poppins}>
                    <option value="">Select country</option>
                    {TRANSFER_COUNTRIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af]"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg></span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="mb-4 text-sm font-medium text-[#374151]" style={poppins}>Bank Info</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div><label className={labelClass} style={labelStyle}>Bank name<span className="text-[#E22626]">*</span></label><input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="Enter bank name" className={inputClass} style={poppins} /></div>
              <div><label className={labelClass} style={labelStyle}>Bank address<span className="text-[#E22626]">*</span></label><input type="text" placeholder="Enter bank address" className={inputClass} style={poppins} /></div>
              <div><label className={labelClass} style={labelStyle}>SWIFT/BIC<span className="text-[#E22626]">*</span></label><input type="text" placeholder="Enter SWIFT/BIC" className={inputClass} style={poppins} /></div>
              <div><label className={labelClass} style={labelStyle}>Amount<span className="text-[#E22626]">*</span></label><input type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" className={inputClass} style={poppins} /></div>
              <div className="md:col-span-2"><label className={labelClass} style={labelStyle}>Reference</label><input type="text" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Enter reference" className={inputClass} style={poppins} /></div>
              <div>
                <label className={labelClass} style={labelStyle}>Select country<span className="text-[#E22626]">*</span></label>
                <div className="relative">
                  <select className={inputClass + " pr-10 appearance-none"} style={poppins}>
                    <option value="">Select country</option>
                    {TRANSFER_COUNTRIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af]"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {status && (
          <div className={cn(
            "mt-6 rounded-lg px-4 py-3 text-sm",
            status.ok ? "bg-[#dcfce7] text-[#166534]" : "bg-[#fee2e2] text-[#991b1b]"
          )}>
            {status.text}
          </div>
        )}

        <div className="mt-8 flex justify-between gap-3">
          <button type="button" onClick={onBack} className="whitespace-nowrap rounded-[8px] border border-[#DFDFDF] bg-white px-4 py-3 text-[#6B7280] transition hover:bg-[#f9fafb] sm:px-6" style={{ ...poppins, fontWeight: 500, fontSize: "14px" }}>Back</button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={createMutation.isPending}
            className="whitespace-nowrap rounded-lg bg-[#0F50DB] px-4 py-3 text-white shadow-sm transition hover:bg-[#0D46C3] disabled:opacity-50 sm:px-6"
            style={{ ...poppins, fontWeight: 500, fontSize: "14px" }}
          >
            {createMutation.isPending ? "Creating…" : "Create Transfer"}
          </button>
        </div>
      </div>
    </div>
  );
}

const CURRENCY_OPTIONS = [
  { value: "BTC", label: "BTC", icon: "🟠" },
  { value: "ETH", label: "ETH", icon: "◆" },
  { value: "USDC", label: "USDC", icon: "U" },
];

function SecondaryNav() {
  return (
    <section className="mt-4 mb-6 overflow-x-auto">
      <div className="inline-flex min-w-max gap-2 text-xs font-medium text-[#878787] md:text-sm">
        <Link
          href={DASHBOARD_ROUTES.payroll}
          className="inline-flex items-center gap-2 rounded-full border-0 px-6 py-2 text-xs font-semibold outline-none focus:outline-none focus:ring-0 md:text-sm bg-transparent text-[#878787] shadow-none hover:bg-slate-100"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-transparent text-[#878787]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M7 9h4" />
              <path d="M7 13h2" />
            </svg>
          </span>
          Payments
        </Link>
        <Link
          href={DASHBOARD_ROUTES.bulkPayouts}
          className="inline-flex items-center gap-2 rounded-full border-0 px-6 py-2 text-xs font-medium outline-none focus:outline-none focus:ring-0 md:text-sm bg-transparent text-[#878787] shadow-none hover:bg-slate-100"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 7h14l-4-4" />
            <path d="M17 17H3l4 4" />
            <path d="M7 17l10-10" />
          </svg>
          Bulk Payouts
        </Link>
        <span className="inline-flex items-center gap-2 rounded-full border-0 px-6 py-2 text-xs font-medium md:text-sm bg-[#0F4FDB] text-white shadow-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M3 10h18" />
            <path d="M8 14h3v3H8z" />
          </svg>
          Transfers
        </span>
        <Link
          href={DASHBOARD_ROUTES.payrollReports}
          className="inline-flex items-center gap-2 rounded-full border-0 px-6 py-2 text-xs font-medium outline-none focus:outline-none focus:ring-0 md:text-sm bg-transparent text-[#878787] shadow-none hover:bg-slate-100"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="3" width="16" height="18" rx="2" />
            <path d="M8 7h8" />
            <path d="M8 11h8" />
            <path d="M8 15h5" />
          </svg>
          Payroll Reports
        </Link>
      </div>
    </section>
  );
}

export default function EmployerTransfersPage() {
  const [fromCurrency, setFromCurrency] = useState("BTC");
  const [amount, setAmount] = useState("");
  const [addressType, setAddressType] = useState<AddressType>("whitelisted");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFACode, setTwoFACode] = useState("");
  const [showFiatScreen, setShowFiatScreen] = useState(false);

  const createTransferMutation = useCreateTransfer();
  const [transferStatus, setTransferStatus] = useState<{ ok: boolean; text: string } | null>(null);

  const handleCreateTransfer = () => {
    if (!amount || Number(amount) <= 0) {
      setTransferStatus({ ok: false, text: "Enter an amount greater than 0" });
      return;
    }
    setTransferStatus(null);
    setShowConfirmModal(true);
  };

  const handleConfirmContinue = () => {
    setShowConfirmModal(false);
    setShow2FAModal(true);
  };

  const handle2FAContinue = async () => {
    setShow2FAModal(false);
    try {
      const res = await createTransferMutation.mutateAsync({
        kind: "crypto",
        currency: fromCurrency,
        amount: Number(amount),
        address: address || undefined,
        description: description || undefined,
      });
      setTransferStatus({ ok: true, text: `Transfer ${res.ref} submitted` });
      setAmount("");
      setAddress("");
      setDescription("");
      setTwoFACode("");
    } catch (e) {
      setTransferStatus({ ok: false, text: (e as Error).message ?? "Transfer failed" });
    }
  };

  const withdrawalAmount = amount || "0.3434343 871";
  const feeAmount = "0.3434343 871";
  const netAmount = amount ? (Math.max(0, Number(amount) - 0.001)).toFixed(8) : "0.34343438";
  const addressLabel = description || "asdaq23923";
  const destinationAddress = address || "bc1q3Sjdukjoc543kjkjkac543kj";

  return (
    <div className="min-h-screen w-full bg-dash-page" data-dashboard-theme data-page="transfers">
      <style>{`
        [data-theme="dark"] [data-page="transfers"] .transfers-input::placeholder {
          color: #cad4e0 !important;
          opacity: 1 !important;
        }
      `}</style>
      {/* Hide main crypto flow while Fiat is full-screen so SecondaryNav is not mounted twice (ghosting) */}
      {!showFiatScreen && (
      <main className="dash-shell pb-10 pt-6">
          <SecondaryNav />

          {/* Wrapper: same width/side space as Bulk Payout; form content center vs left when popup closes/opens */}
          <div className="w-full transition-all duration-200">
            {/* Page title */}
            <section className="transfers-outer-card mb-6 rounded-xl bg-[#f7f7fa] px-6 py-5 md:px-8">
              <h2 className="dash-card-section-title">Create a New Transfers</h2>
            </section>

            {/* Form card */}
            <div className="transfers-outer-card rounded-xl bg-[#f7f7fa] px-6 py-6 md:px-8">
              <h3
                className="transfers-basic-heading mb-6 text-center text-[#171717]"
                style={{ fontFamily: "Poppins, var(--font-poppins)", fontWeight: 600, fontSize: "16px", lineHeight: "100%" }}
              >
                Enter the basic details
              </h3>

              <div className={cn("max-w-[560px] w-full space-y-6", showConfirmModal || show2FAModal ? "ml-0 mr-auto" : "mx-auto")}>
              {/* From */}
              <div>
                <label className={labelClass} style={labelStyle}>
                  From
                </label>
                <div className="transfers-input-wrap relative flex h-[30px] w-full items-center rounded-lg border border-[#e5e7eb] bg-transparent focus-within:border-[#0F4FDB] focus-within:ring-1 focus-within:ring-[#0F4FDB]">
                  <span className="pointer-events-none flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F97316]/20 text-xs font-medium text-[#EA580C] ml-3">
                    {fromCurrency === "BTC" ? "₿" : fromCurrency === "ETH" ? "◆" : "U"}
                  </span>
                  <select
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value)}
                    className="transfers-from-select h-full w-full flex-1 appearance-none border-0 bg-transparent pl-3 pr-10 text-sm text-[#1f2937] focus:outline-none focus:ring-0"
                    style={{ fontFamily: "var(--font-poppins)" }}
                  >
                    {CURRENCY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-3 flex h-4 w-4 items-center justify-center text-[#9ca3af]">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className={labelClass} style={labelStyle}>
                  Amount
                </label>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="transfers-input h-11 w-full rounded-lg border border-[#e5e7eb] bg-transparent px-3 text-sm text-[#1f2937] placeholder:text-[#9ca3af] focus:border-[#0F4FDB] focus:outline-none focus:ring-1 focus:ring-[#0F4FDB]"
                  style={{ fontFamily: "var(--font-poppins)" }}
                />
              </div>

              {/* Address type */}
              <div>
                <label className={labelClass} style={labelStyle}>
                  Address type
                </label>
                <div className="mb-3 flex w-full items-center gap-1 sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setAddressType("whitelisted")}
                    className={cn(
                      "flex-1 whitespace-nowrap rounded-full px-2 py-2 text-center text-[11px] font-medium transition-all sm:flex-none sm:px-5 sm:py-2.5 sm:text-sm",
                      addressType === "whitelisted"
                        ? "bg-[#0F4FDB] text-white shadow-sm"
                        : "bg-transparent text-[#9ca3af] hover:text-[#6b7280]"
                    )}
                    style={{ fontFamily: "var(--font-poppins)" }}
                  >
                    White-listed address
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddressType("onetime")}
                    className={cn(
                      "flex-1 whitespace-nowrap rounded-full px-2 py-2 text-center text-[11px] font-medium transition-all sm:flex-none sm:px-5 sm:py-2.5 sm:text-sm",
                      addressType === "onetime"
                        ? "bg-[#0F4FDB] text-white shadow-sm"
                        : "bg-transparent text-[#9ca3af] hover:text-[#6b7280]"
                    )}
                    style={{ fontFamily: "var(--font-poppins)" }}
                  >
                    One time address
                  </button>
                </div>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter address"
                  className="transfers-input h-11 w-full rounded-lg border border-[#e5e7eb] bg-transparent px-3 text-sm text-[#1f2937] placeholder:text-[#9ca3af] focus:border-[#0F4FDB] focus:outline-none focus:ring-1 focus:ring-[#0F4FDB]"
                  style={{ fontFamily: "var(--font-poppins)" }}
                />
              </div>

              {/* Description */}
              <div>
                <label className={labelClass} style={labelStyle}>
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description..."
                  rows={4}
                  className="transfers-input w-full resize-none rounded-lg border border-[#e5e7eb] bg-transparent px-3 py-3 text-sm text-[#1f2937] placeholder:text-[#9ca3af] focus:border-[#0F4FDB] focus:outline-none focus:ring-1 focus:ring-[#0F4FDB]"
                  style={{ fontFamily: "var(--font-poppins)" }}
                />
              </div>

              {/* Status banner */}
              {transferStatus && (
                <div
                  className={cn(
                    "rounded-lg px-4 py-3 text-sm",
                    transferStatus.ok ? "bg-[#dcfce7] text-[#166534]" : "bg-[#fee2e2] text-[#991b1b]"
                  )}
                >
                  {transferStatus.text}
                </div>
              )}

              {/* Create transfer */}
              <button
                type="button"
                onClick={handleCreateTransfer}
                disabled={createTransferMutation.isPending}
                className="w-full rounded-lg bg-[#0F4FDB] py-3 text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
                style={{
                  fontFamily: "Poppins, var(--font-poppins)",
                  fontWeight: 500,
                  fontSize: "14px",
                  lineHeight: "100%",
                }}
              >
                Create transfer
              </button>
            </div>
          </div>
          </div>
        </main>
      )}

      {/* Confirm your withdrawal modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            className="transfers-modal-card relative w-full max-w-md rounded-xl bg-white p-6"
            style={{ fontFamily: "var(--font-poppins)" }}
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="transfers-modal-title text-lg font-semibold text-[#171717]">
                Confirm your withdrawal
              </h3>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="transfers-modal-close-btn flex h-8 w-8 items-center justify-center rounded-full text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#374151]"
                aria-label="Close"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between gap-4">
                <span className="transfers-modal-label text-[#6b7280]">Address label</span>
                <span className="transfers-modal-value text-right font-medium text-[#1f2937]">{addressLabel}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="transfers-modal-label text-[#6b7280]">Destination address</span>
                <span className="transfers-modal-value max-w-[220px] truncate text-right font-medium text-[#1f2937]">{destinationAddress}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="transfers-modal-label text-[#6b7280]">Withdrawal amount</span>
                <span className="transfers-modal-value text-right font-medium text-[#1f2937]">{withdrawalAmount} {fromCurrency}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="transfers-modal-label text-[#6b7280]">Fee amount</span>
                <span className="transfers-modal-value text-right font-medium text-[#1f2937]">{feeAmount} {fromCurrency}</span>
              </div>
              <div className="transfers-modal-divider border-t border-[#e5e7eb] pt-4">
                <div className="flex justify-between gap-4">
                  <span className="transfers-modal-label text-[#6b7280]">Withdrawal net amount</span>
                  <span className="transfers-modal-value text-right font-medium text-[#1f2937]">{netAmount} {fromCurrency}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="transfers-modal-cancel-btn flex-1 rounded-[8px] border border-[#DFDFDF] bg-white py-3 text-[#6B7280] transition hover:bg-[#f9fafb]"
                style={{ fontFamily: "var(--font-poppins)", fontWeight: 500, fontSize: "14px" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmContinue}
                className="flex-1 rounded-lg bg-[#0F4FDB] py-3 text-white shadow-sm transition hover:opacity-90"
                style={{ fontFamily: "var(--font-poppins)", fontWeight: 500, fontSize: "14px" }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Authorise action with 2FA modal */}
      {show2FAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            className="transfers-modal-card relative w-full max-w-md rounded-xl bg-white p-6"
            style={{ fontFamily: "var(--font-poppins)" }}
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="transfers-modal-title text-lg font-semibold text-[#171717]">
                Authorise action with 2FA
              </h3>
              <button
                type="button"
                onClick={() => setShow2FAModal(false)}
                className="transfers-modal-close-btn flex h-8 w-8 items-center justify-center rounded-full text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#374151]"
                aria-label="Close"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-6 flex h-16 w-16 shrink-0 items-center justify-center text-[#0F4FDB]">
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                >
                  {/* Thinner strokes; shield inset a bit more for space inside the ring */}
                  <g stroke="currentColor" strokeWidth="1.05" strokeLinecap="round" strokeLinejoin="round" fill="none">
                    <circle cx="12" cy="12" r="10" />
                  </g>
                  <g
                    stroke="currentColor"
                    strokeWidth={1.05 / 0.63}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    transform="translate(12 12) scale(0.63) translate(-12 -12)"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                    <path d="m9 12 2 2 4-4" />
                  </g>
                </svg>
              </div>
              <p className="transfers-modal-desc mb-6 text-sm text-[#374151]">
                Enter your{" "}
                <span className="font-medium text-[#0F4FDB]">2FA code</span>
                {" "}to authorise this action.
              </p>
              <input
                type="text"
                value={twoFACode}
                onChange={(e) => setTwoFACode(e.target.value)}
                placeholder="Enter 2FA code"
                className="mb-8 w-full rounded-lg border border-[#e5e7eb] bg-transparent px-3 py-3 text-sm text-[#1f2937] placeholder:text-[#9ca3af] focus:border-[#0F4FDB] focus:outline-none focus:ring-1 focus:ring-[#0F4FDB]"
                style={{ fontFamily: "var(--font-poppins)" }}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShow2FAModal(false)}
                className="transfers-modal-cancel-btn flex-1 rounded-[8px] border border-[#DFDFDF] bg-white py-3 text-[#6B7280] transition hover:bg-[#f9fafb]"
                style={{ fontFamily: "var(--font-poppins)", fontWeight: 500, fontSize: "14px" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handle2FAContinue}
                className="flex-1 rounded-lg bg-[#0F4FDB] py-3 text-white shadow-sm transition hover:opacity-90"
                style={{ fontFamily: "var(--font-poppins)", fontWeight: 500, fontSize: "14px" }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fiat Transfers (after 2FA): document flow like crypto view — no fixed full-screen layer (was under header z-40 + nested overflow = double scroll + nav overlap) */}
      {showFiatScreen && (
        <main className="dash-shell w-full pb-10 pt-6">
          <SecondaryNav />
          <FiatTransfersForm onBack={() => setShowFiatScreen(false)} />
        </main>
      )}
    </div>
  );
}
