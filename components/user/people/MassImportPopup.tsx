"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils/cn";

type Props = {
  open: boolean;
  onClose: () => void;
  onImport?: (file: File) => void;
};

/** Mass Import modal – Figma 106-1036 + error state 119-3010. */
const ALLOWED_EXTENSIONS = [".csv", ".xlsx"];
const MAX_FILE_SIZE_MB = 10;

function isValidFile(file: File): boolean {
  const name = file.name.toLowerCase();
  const ok = ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));
  const sizeOk = file.size <= MAX_FILE_SIZE_MB * 1024 * 1024;
  return ok && sizeOk;
}

export default function MassImportPopup({ open, onClose, onImport }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files[0];
    if (!f) return;
    setError(null);
    if (isValidFile(f)) {
      setFile(f);
    } else {
      setFile(null);
      setError(getErrorMessage(f));
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setError(null);
    if (isValidFile(f)) {
      setFile(f);
    } else {
      setFile(null);
      setError(getErrorMessage(f));
    }
    e.target.value = "";
  }

  function getErrorMessage(file: File): string {
    const name = file.name.toLowerCase();
    const validExt = ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));
    const sizeOk = file.size <= MAX_FILE_SIZE_MB * 1024 * 1024;
    if (!validExt) return "File is not in the correct format. Please upload a .csv or .xlsx file.";
    if (!sizeOk) return `File size must be under ${MAX_FILE_SIZE_MB} MB.`;
    return "Invalid file.";
  }

  function handleNext() {
    if (!file) return;
    setError(null);
    if (!isValidFile(file)) {
      setError(getErrorMessage(file));
      return;
    }
    onImport?.(file);
    handleClose();
  }

  function handleClose() {
    setFile(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
    onClose();
  }

  function handleDownloadTemplate() {
    // TODO: serve actual template file
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[rgba(130,150,173,0.65)]" aria-hidden onClick={handleClose} />
      <div className="mass-import-modal relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#e5e7eb] px-4 py-4 sm:px-8 sm:py-5">
          <div className="min-w-0">
            <h2 className="dash-card-section-title mb-0">Import people</h2>
            <p className="mt-1 text-[11px] text-gray-500 sm:text-sm">
              Add workers to KaLoPay to manage them easily in one place.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="-mr-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-8">
        {/* Template and guidelines – card: #F9FAFB, 624×284, 8px radius, 24px pad, 10px gap */}
        <section className="mx-auto w-full max-w-[624px]">
          <div className="flex h-[284px] w-full flex-col gap-[10px] overflow-y-auto rounded-lg bg-[#F9FAFB] p-6">
            <h3 className="align-middle text-[16px] font-medium leading-6 tracking-normal text-[#111827] [font-family:var(--font-poppins),Poppins,sans-serif]">
              Template and guidelines
            </h3>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center text-[#94A3B8]" title="Info" aria-hidden>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="12" cy="8" r="1.25" fill="currentColor" />
                  <path d="M12 10.25V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </span>
              <span className="align-middle text-[16px] font-medium leading-[20px] tracking-normal text-[#1F2937] [font-family:var(--font-poppins),Poppins,sans-serif]">
                How to mass import employees
              </span>
            </div>
            <p className="text-sm text-gray-600">
              For a successful mass import, stick to the formatting suggested in the fill-in guidelines when populating the CSV template shown below.
            </p>
            <button
              type="button"
              className="self-start text-sm font-medium text-gray-800 hover:text-gray-900"
              onClick={(e) => e.preventDefault()}
            >
              View guidelines
            </button>

            {/* Mass import template (nested) */}
            <div className="mt-auto flex min-h-0 shrink-0 flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#94A3B8]">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                    <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    <line x1="9" y1="12" x2="15" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="9" y1="16" x2="15" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">Mass import template</p>
                  <p className="text-xs text-gray-500">Empty CSV file to import your data into Deal.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-[#374152] hover:bg-gray-50"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download
              </button>
            </div>
          </div>
        </section>

        {/* Upload CSV */}
        <section className="mt-6">
          <h3 className="text-base font-semibold text-gray-900">Upload CSV</h3>
          <p className="mt-1 text-sm text-gray-600">Use our CSV template to fast-filling your data.</p>
          {/* Error banner – Figma 119-3010 */}
          {error && (
            <div className="mt-3 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500 text-sm font-bold text-white" aria-hidden>
                !
              </span>
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}
          <div
            className={cn(
              "mt-3 mx-auto box-border flex w-full max-w-[624px] cursor-pointer items-center justify-center gap-[10px] rounded-[6px] border-2 border-dashed bg-white px-[26px] transition-colors",
              file ? "min-h-[72px] py-3" : "h-[72px]",
              drag
                ? "border-[#0f50db] bg-white"
                : "border-[#e4e6eb] hover:bg-white"
            )}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.xlsx"
              className="hidden"
              onChange={handleChange}
            />
            {file ? (
              <p className="w-full truncate text-center text-sm font-medium text-gray-900">{file.name}</p>
            ) : (
              <p className="text-center align-middle text-[16px] font-medium leading-[20px] tracking-normal text-[#0f50db] [font-family:var(--font-poppins),Poppins,sans-serif]">
                Click here or drag file to upload
              </p>
            )}
          </div>
          <p className="mt-2 text-xs text-gray-700">
            Supported format: .csv, .xlsx · Max file size: 10 MB, max rows allowed: 1000
          </p>
        </section>

        {/* Actions */}
        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={!file}
            className="inline-flex items-center justify-center rounded-lg bg-[rgb(15,80,219)] px-4 py-2 text-sm font-medium text-white transition enabled:hover:bg-[#0d46c3] disabled:cursor-not-allowed disabled:!bg-[rgb(15,80,219)] disabled:!opacity-100"
          >
            Next
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
