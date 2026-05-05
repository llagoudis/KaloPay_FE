"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils/cn";

export type EditBankWalletForm = {
  bankName: string;
  bankAddress: string;
  swiftBic: string;
  iban: string;
  defaultPaymentMethod: string;
  currencyPreference: string;
  digitalWalletAddress: string;
};

const defaultForm: EditBankWalletForm = {
  bankName: "",
  bankAddress: "",
  swiftBic: "",
  iban: "",
  defaultPaymentMethod: "",
  currencyPreference: "",
  digitalWalletAddress: "",
};

interface EditBankWalletModalProps {
  open: boolean;
  onClose: () => void;
  initialValues?: Partial<EditBankWalletForm>;
  onSave?: (values: EditBankWalletForm) => void;
}

/** Edit Bank & Wallet Details modal – Figma 124-6163. Backdrop #002B5775. */
export default function EditBankWalletModal({
  open,
  onClose,
  initialValues,
  onSave,
}: EditBankWalletModalProps) {
  const [form, setForm] = useState<EditBankWalletForm>(defaultForm);
  const prevOpenRef = useRef(false);

  useEffect(() => {
    if (open) {
      if (!prevOpenRef.current && initialValues) {
        setForm({ ...defaultForm, ...initialValues });
      }
    } else {
      setForm(defaultForm);
    }
    prevOpenRef.current = open;
  }, [open, initialValues]);

  if (!open) return null;

  function update(field: keyof EditBankWalletForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSave() {
    onSave?.(form);
    onClose();
  }

  const inputClass =
    "w-full rounded-lg border border-[#DFDFDF] px-3 py-2 text-sm focus:border-[var(--color-dash-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-dash-accent)]";
  const labelClass =
    "edit-personal-label mb-1.5 block text-base font-medium text-gray-700";

  return (
    <>
      <div
        className="fixed inset-0 z-50"
        style={{ backgroundColor: "#002B5775" }}
        aria-hidden
        onClick={onClose}
      />
      <div
        className="edit-personal-details-modal edit-modal-container fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-[calc(100%-2rem)] max-w-4xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl shadow-xl edit-modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-bank-wallet-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between px-4 py-4 edit-modal-header sm:px-6">
          <h2 id="edit-bank-wallet-title" className="dash-card-section-title">
            Edit Bank & Wallet Details
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="max-h-[calc(90vh-11rem)] min-h-0 overflow-y-auto px-4 py-5 sm:px-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Bank name <span className="edit-personal-asterisk">*</span></label>
              <input
                type="text"
                value={form.bankName}
                onChange={(e) => update("bankName", e.target.value)}
                placeholder="Enter bank name"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Bank address <span className="edit-personal-asterisk">*</span></label>
              <input
                type="text"
                value={form.bankAddress}
                onChange={(e) => update("bankAddress", e.target.value)}
                placeholder="Enter bank address"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>SWIFT/BIC <span className="edit-personal-asterisk">*</span></label>
              <input
                type="text"
                value={form.swiftBic}
                onChange={(e) => update("swiftBic", e.target.value)}
                placeholder="Enter SWIFT/BIC"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>IBAN <span className="edit-personal-asterisk">*</span></label>
              <input
                type="text"
                value={form.iban}
                onChange={(e) => update("iban", e.target.value)}
                placeholder="Enter IBAN"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Default payment method (fiat or crypto)</label>
              <input
                type="text"
                value={form.defaultPaymentMethod}
                onChange={(e) => update("defaultPaymentMethod", e.target.value)}
                placeholder="Enter"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Currency Preference</label>
              <input
                type="text"
                value={form.currencyPreference}
                onChange={(e) => update("currencyPreference", e.target.value)}
                placeholder="Enter"
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Digital wallet address (if crypto)</label>
              <input
                type="text"
                value={form.digitalWalletAddress}
                onChange={(e) => update("digitalWalletAddress", e.target.value)}
                placeholder="Enter Digital wallet address"
                className={inputClass}
              />
            </div>
          </div>
          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#d1d5db] bg-white px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#f9fafb]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="edit-personal-save-btn rounded-lg px-4 py-2 text-white hover:opacity-90"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
