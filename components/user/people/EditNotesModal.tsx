"use client";

import { useState, useEffect, useRef } from "react";

export type EditNotesForm = {
  notes: string;
};

const defaultForm: EditNotesForm = {
  notes: "",
};

interface EditNotesModalProps {
  open: boolean;
  onClose: () => void;
  initialValues?: Partial<EditNotesForm>;
  onSave?: (values: EditNotesForm) => void;
}

/** Edit Notes modal – Figma 124-6461. Backdrop #002B5775. */
export default function EditNotesModal({
  open,
  onClose,
  initialValues,
  onSave,
}: EditNotesModalProps) {
  const [form, setForm] = useState<EditNotesForm>(defaultForm);
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

  function handleSave() {
    onSave?.(form);
    onClose();
  }

  const labelClass =
    "edit-personal-label mb-1.5 block text-base font-medium text-gray-700";
  const textareaClass =
    "edit-notes-textarea min-h-[120px] w-full flex-1 resize-y overflow-y-auto rounded-[8px] border border-[#DFDFDF] bg-white px-4 py-3 text-[14px] font-normal leading-[1.65] [word-spacing:0.06em] [letter-spacing:0.01em] [font-family:var(--font-poppins),Poppins,sans-serif] focus:border-[#0F4FDB] focus:outline-none focus:ring-1 focus:ring-[#0F4FDB]";

  return (
    <>
      <div
        className="fixed inset-0 z-50"
        style={{ backgroundColor: "#002B5775" }}
        aria-hidden
        onClick={onClose}
      />
      <div
        className="edit-personal-details-modal edit-modal-container edit-notes-modal fixed left-1/2 top-1/2 z-50 flex h-[min(446px,90vh)] w-[min(672px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] shadow-[0_4px_24px_rgba(15,23,42,0.08)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-notes-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="edit-modal-header flex shrink-0 items-center justify-between px-6 py-4">
          <h2 id="edit-notes-title" className="dash-card-section-title">
            Edit Notes
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

        <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden px-6 py-5">
          <label className={labelClass} htmlFor="edit-notes-field">
            Notes
          </label>
          <textarea
            id="edit-notes-field"
            value={form.notes}
            onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
            placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat"
            className={textareaClass}
          />
        </div>

        <div className="edit-notes-footer flex shrink-0 justify-end gap-3 border-t border-[#e5e7eb] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#DFDFDF] bg-transparent px-4 py-2 text-sm font-medium text-[#374151] transition hover:bg-[#f9fafb] [font-family:var(--font-poppins),Poppins,sans-serif]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="edit-personal-save-btn rounded-lg bg-[#0f50db] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90 [font-family:var(--font-poppins),Poppins,sans-serif]"
          >
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
}
