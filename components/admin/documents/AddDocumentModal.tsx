"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { useAdminAuthStore } from "@/store/adminAuthStore";

interface UploadDocBody {
  entityType: "employee" | "company";
  entityId: number;
  documentType?: string;
  country?: string;
  fileName: string;
  fileData: string;
  mimeType?: string;
  issueDate?: string;
  expiryDate?: string;
  notes?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  entityType: "employee" | "company";
  entityId: number;
}

function useAdminToken() {
  return useAdminAuthStore((s) => s.token);
}

export default function AddDocumentModal({ open, onClose, entityType, entityId }: Props) {
  const token = useAdminToken();
  const qc = useQueryClient();
  const uploadMut = useMutation({
    mutationFn: (body: UploadDocBody) =>
      apiClient<{ document: unknown }>("/admin/documents", {
        method: "POST",
        token: token!,
        body,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "documents", entityType, entityId] });
    },
  });

  const [documentType, setDocumentType] = useState("");
  const [country, setCountry] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!open) return null;

  const readAsBase64 = (f: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error ?? new Error("File read failed"));
      reader.readAsDataURL(f);
    });

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);
    if (!file) {
      setSubmitError("Please choose a file to upload.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSubmitError("File too large (max 5 MB).");
      return;
    }
    try {
      const fileData = await readAsBase64(file);
      await uploadMut.mutateAsync({
        entityType,
        entityId,
        documentType: documentType || undefined,
        country: country || undefined,
        fileName: file.name,
        fileData,
        mimeType: file.type || undefined,
        issueDate: issueDate || undefined,
        expiryDate: expiryDate || undefined,
        notes: notes || undefined,
      });
      setDocumentType("");
      setCountry("");
      setIssueDate("");
      setExpiryDate("");
      setNotes("");
      setFile(null);
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
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Add Document</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:bg-gray-100"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form className="space-y-4" onSubmit={submit}>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">Document type</span>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
            >
              <option value="">Select</option>
              <option value="passport">Passport</option>
              <option value="id_card">National ID</option>
              <option value="visa">Visa</option>
              <option value="work_permit">Work Permit</option>
              <option value="contract">Contract</option>
              <option value="tax_form">Tax Form</option>
              <option value="registration">Company Registration</option>
              <option value="incorporation">Incorporation Document</option>
              <option value="other">Other</option>
            </select>
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">Country</span>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. United States"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">File (max 5 MB)</span>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-gray-900 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-blue-700"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">Issue date</span>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">Valid Upto</span>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
              />
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">Notes</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
              placeholder="Optional"
            />
          </label>
          {submitError ? (
            <div className="rounded-md bg-red-50 p-2 text-sm text-red-700">{submitError}</div>
          ) : null}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploadMut.isPending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {uploadMut.isPending ? "Uploading…" : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
