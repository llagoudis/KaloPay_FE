"use client";

import { useState } from "react";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import { createCryptoWithdrawal } from "@/lib/api/admin/cryptoWallet";

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  sourceAddress: string;
  assetId: string;
  walletType: "CLIENT" | "MASTER";
  balance: string;
}

type Step = "FORM" | "CONFIRM" | "RESULT";

export default function WithdrawalModal({
  isOpen,
  onClose,
  onSuccess,
  sourceAddress,
  assetId,
  walletType,
  balance,
}: WithdrawalModalProps) {
  const token = useAdminAuthStore((s) => s.token);
  const [step, setStep] = useState<Step>("FORM");
  const [targetAddress, setTargetAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; txHash?: string } | null>(null);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!targetAddress.trim() || !amount.trim() || parseFloat(amount) <= 0) return;
    setStep("CONFIRM");
  };

  const handleSubmit = async () => {
    if (!token) return;
    setSubmitting(true);
    try {
      const res = await createCryptoWithdrawal(token, {
        assetId,
        sourceAddress,
        targetAddress: targetAddress.trim(),
        amount: parseFloat(amount),
        note: note.trim() || undefined,
        wallet: walletType,
      });
      setResult({ success: true, message: res.message, txHash: res.txHash });
      setStep("RESULT");
      onSuccess();
    } catch (err) {
      setResult({ success: false, message: err instanceof Error ? err.message : "Withdrawal failed" });
      setStep("RESULT");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep("FORM");
    setTargetAddress("");
    setAmount("");
    setNote("");
    setResult(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        {/* FORM Step */}
        {step === "FORM" && (
          <>
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Withdraw {assetId}</h3>

            <div className="mb-3">
              <label className="mb-1 block text-xs font-medium text-gray-500">From</label>
              <p className="rounded-lg bg-gray-50 px-3 py-2 font-mono text-sm text-gray-700">{sourceAddress}</p>
            </div>

            <div className="mb-3">
              <label className="mb-1 block text-xs font-medium text-gray-500">Available Balance</label>
              <p className="text-sm font-semibold text-gray-900">{parseFloat(balance).toFixed(6)} {assetId}</p>
            </div>

            <div className="mb-3">
              <label className="mb-1 block text-sm font-medium text-gray-700">Target Address</label>
              <input type="text" value={targetAddress} onChange={(e) => setTargetAddress(e.target.value)} placeholder="Enter recipient address"
                className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>

            <div className="mb-3">
              <label className="mb-1 block text-sm font-medium text-gray-700">Amount</label>
              <input type="number" step="any" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00"
                className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">Note (optional)</label>
              <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional memo"
                className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={handleClose} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button type="button" onClick={handleConfirm} disabled={!targetAddress.trim() || !amount.trim() || parseFloat(amount) <= 0}
                className="rounded-lg bg-[#2962FF] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#1f4ed6] disabled:opacity-50">
                Continue
              </button>
            </div>
          </>
        )}

        {/* CONFIRM Step */}
        {step === "CONFIRM" && (
          <>
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Confirm Withdrawal</h3>

            <div className="mb-4 space-y-3 rounded-lg bg-gray-50 p-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Asset</span>
                <span className="font-medium text-gray-900">{assetId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Amount</span>
                <span className="font-medium text-gray-900">{amount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">From</span>
                <span className="font-mono text-xs text-gray-700">{sourceAddress.slice(0, 10)}...{sourceAddress.slice(-6)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">To</span>
                <span className="font-mono text-xs text-gray-700">{targetAddress.slice(0, 10)}...{targetAddress.slice(-6)}</span>
              </div>
              {note && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Note</span>
                  <span className="text-gray-700">{note}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setStep("FORM")} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Back</button>
              <button type="button" onClick={handleSubmit} disabled={submitting}
                className="rounded-lg bg-[#2962FF] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#1f4ed6] disabled:opacity-50">
                {submitting ? "Submitting..." : "Confirm Withdrawal"}
              </button>
            </div>
          </>
        )}

        {/* RESULT Step */}
        {step === "RESULT" && result && (
          <>
            <div className="mb-4 text-center">
              <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${result.success ? "bg-green-100" : "bg-red-100"}`}>
                {result.success ? (
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                )}
              </div>
              <h3 className={`text-lg font-semibold ${result.success ? "text-green-700" : "text-red-700"}`}>
                {result.success ? "Transaction Submitted" : "Transaction Failed"}
              </h3>
              <p className="mt-1 text-sm text-gray-500">{result.message}</p>
              {result.txHash && (
                <p className="mt-2 break-all font-mono text-xs text-gray-400">TxHash: {result.txHash}</p>
              )}
            </div>
            <div className="flex justify-center">
              <button type="button" onClick={handleClose} className="rounded-lg bg-[#2962FF] px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#1f4ed6]">Close</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
