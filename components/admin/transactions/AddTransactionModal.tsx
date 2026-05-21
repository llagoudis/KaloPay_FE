"use client";

import { useEffect, useRef, useState } from "react";
import { useCreateAdminTransaction } from "@/hooks/admin/useTransactions";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AddTransactionModal({ open, onClose }: Props) {
  const createMut = useCreateAdminTransaction();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Mirror the admin panel theme — the panel uses `data-theme="light|dark"` on
  // its layout root (see app/admin/(protected)/AdminLayoutClient.tsx).
  useEffect(() => {
    if (!open) return;
    const update = () => {
      const root = document.querySelector("[data-dashboard-theme][data-theme]");
      const t = root?.getAttribute("data-theme") ?? "light";
      setTheme(t === "dark" ? "dark" : "light");
    };
    update();
    const observer = new MutationObserver(update);
    const root = document.querySelector("[data-dashboard-theme]");
    if (root) {
      observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    }
    return () => observer.disconnect();
  }, [open]);

  const [sender, setSender] = useState("");
  const [beneficiary, setBeneficiary] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [transactionType, setTransactionType] = useState("Outgoing Transfer");
  const [paymentType, setPaymentType] = useState("SEPA SCT");
  const [transactionStatus, setTransactionStatus] = useState("pending");
  const [description, setDescription] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setSubmitError("Amount must be a positive number.");
      return;
    }
    try {
      await createMut.mutateAsync({
        sender: sender || undefined,
        beneficiary: beneficiary || undefined,
        amount: numericAmount,
        currency: currency || undefined,
        transaction_type: transactionType || undefined,
        payment_type: paymentType || undefined,
        transaction_status: transactionStatus,
        description: description || undefined,
      });
      setSender("");
      setBeneficiary("");
      setAmount("");
      setDescription("");
      onClose();
    } catch (err) {
      setSubmitError((err as Error).message);
    }
  };

  const isDark = theme === "dark";
  const palette = isDark
    ? {
        backdrop: "rgba(2, 6, 23, 0.7)",
        modalBg: "#0F172A",
        modalBorder: "#1E293B",
        text: "#F1F5F9",
        label: "#CBD5E1",
        muted: "#94A3B8",
        inputBg: "#1E293B",
        inputBorder: "#334155",
        inputText: "#F1F5F9",
        placeholder: "#64748B",
        cancelBg: "#1E293B",
        cancelBorder: "#334155",
        cancelText: "#CBD5E1",
        errorBg: "rgba(127, 29, 29, 0.45)",
        errorText: "#FECACA",
      }
    : {
        backdrop: "rgba(0, 0, 0, 0.5)",
        modalBg: "#FFFFFF",
        modalBorder: "#E5E7EB",
        text: "#111827",
        label: "#374151",
        muted: "#9CA3AF",
        inputBg: "#FFFFFF",
        inputBorder: "#D1D5DB",
        inputText: "#111827",
        placeholder: "#9CA3AF",
        cancelBg: "#FFFFFF",
        cancelBorder: "#D1D5DB",
        cancelText: "#374151",
        errorBg: "#FEF2F2",
        errorText: "#B91C1C",
      };

  const inputStyle: React.CSSProperties = {
    backgroundColor: palette.inputBg,
    borderColor: palette.inputBorder,
    color: palette.inputText,
  };

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-tx-title"
      onClick={onClose}
      style={{ backgroundColor: palette.backdrop, colorScheme: isDark ? "dark" : "light" }}
    >
      <div
        className="w-full max-w-lg rounded-2xl p-6 shadow-xl border"
        style={{ backgroundColor: palette.modalBg, color: palette.text, borderColor: palette.modalBorder }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2
            id="add-tx-title"
            className="text-lg font-semibold"
            style={{ color: palette.text }}
          >
            Add New Transaction
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 hover:opacity-80"
            style={{ color: palette.muted }}
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Sender" palette={palette}>
              <input
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                className={INPUT_CLASS}
                style={inputStyle}
                placeholder="External / sender name"
              />
            </Field>
            <Field label="Beneficiary" palette={palette}>
              <input
                value={beneficiary}
                onChange={(e) => setBeneficiary(e.target.value)}
                className={INPUT_CLASS}
                style={inputStyle}
                placeholder="Recipient name"
              />
            </Field>
            <Field label="Amount *" palette={palette}>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={INPUT_CLASS}
                style={inputStyle}
                placeholder="0.00"
                required
              />
            </Field>
            <Field label="Currency" palette={palette}>
              <input
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className={INPUT_CLASS}
                style={inputStyle}
                placeholder="USD"
              />
            </Field>
            <Field label="Transaction type" palette={palette}>
              <select value={transactionType} onChange={(e) => setTransactionType(e.target.value)} className={INPUT_CLASS} style={inputStyle}>
                <option>Outgoing Transfer</option>
                <option>Incoming Transfer</option>
                <option>Payroll</option>
                <option>Refund</option>
                <option>Adjustment</option>
              </select>
            </Field>
            <Field label="Payment type" palette={palette}>
              <select value={paymentType} onChange={(e) => setPaymentType(e.target.value)} className={INPUT_CLASS} style={inputStyle}>
                <option>SEPA SCT</option>
                <option>SEPA Instant</option>
                <option>SWIFT</option>
                <option>ACH</option>
                <option>Card</option>
                <option>Crypto</option>
              </select>
            </Field>
            <Field label="Status" palette={palette}>
              <select value={transactionStatus} onChange={(e) => setTransactionStatus(e.target.value)} className={INPUT_CLASS} style={inputStyle}>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </Field>
            <Field label="Description" className="sm:col-span-2" palette={palette}>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className={INPUT_CLASS}
                style={inputStyle}
                placeholder="Optional note"
              />
            </Field>
          </div>
          {submitError ? (
            <div
              className="rounded-md p-2 text-sm"
              style={{ backgroundColor: palette.errorBg, color: palette.errorText }}
            >
              {submitError}
            </div>
          ) : null}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:opacity-90"
              style={{
                borderColor: palette.cancelBorder,
                backgroundColor: palette.cancelBg,
                color: palette.cancelText,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMut.isPending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {createMut.isPending ? "Saving…" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const INPUT_CLASS =
  "w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

interface Palette {
  label: string;
}

function Field({
  label,
  children,
  className,
  palette,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  palette: Palette;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1 block text-sm font-medium" style={{ color: palette.label }}>
        {label}
      </span>
      {children}
    </label>
  );
}
