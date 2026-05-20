"use client";

import { useState } from "react";
import { useCreateAdminTransaction } from "@/hooks/admin/useTransactions";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AddTransactionModal({ open, onClose }: Props) {
  const createMut = useCreateAdminTransaction();
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-tx-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="add-tx-title" className="text-lg font-semibold text-gray-900 dark:text-slate-100">
            Add New Transaction
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Sender">
              <input value={sender} onChange={(e) => setSender(e.target.value)} className={INPUT_CLASS} placeholder="External / sender name" />
            </Field>
            <Field label="Beneficiary">
              <input value={beneficiary} onChange={(e) => setBeneficiary(e.target.value)} className={INPUT_CLASS} placeholder="Recipient name" />
            </Field>
            <Field label="Amount *">
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={INPUT_CLASS}
                placeholder="0.00"
                required
              />
            </Field>
            <Field label="Currency">
              <input value={currency} onChange={(e) => setCurrency(e.target.value)} className={INPUT_CLASS} placeholder="USD" />
            </Field>
            <Field label="Transaction type">
              <select value={transactionType} onChange={(e) => setTransactionType(e.target.value)} className={INPUT_CLASS}>
                <option>Outgoing Transfer</option>
                <option>Incoming Transfer</option>
                <option>Payroll</option>
                <option>Refund</option>
                <option>Adjustment</option>
              </select>
            </Field>
            <Field label="Payment type">
              <select value={paymentType} onChange={(e) => setPaymentType(e.target.value)} className={INPUT_CLASS}>
                <option>SEPA SCT</option>
                <option>SEPA Instant</option>
                <option>SWIFT</option>
                <option>ACH</option>
                <option>Card</option>
                <option>Crypto</option>
              </select>
            </Field>
            <Field label="Status">
              <select value={transactionStatus} onChange={(e) => setTransactionStatus(e.target.value)} className={INPUT_CLASS}>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </Field>
            <Field label="Description" className="sm:col-span-2">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className={INPUT_CLASS}
                placeholder="Optional note"
              />
            </Field>
          </div>
          {submitError ? (
            <div className="rounded-md bg-red-50 p-2 text-sm text-red-700 dark:bg-red-900/40 dark:text-red-200">
              {submitError}
            </div>
          ) : null}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
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
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600";

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
        {label}
      </span>
      {children}
    </label>
  );
}
