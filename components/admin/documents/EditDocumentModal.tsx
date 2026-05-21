"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { useAdminAuthStore } from "@/store/adminAuthStore";

export interface EditableDocument {
  id: number;
  document_type: string | null;
  country: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  notes: string | null;
  file_name: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  doc: EditableDocument | null;
  entityType: "employee" | "company";
  entityId: number;
}

function useAdminToken() {
  return useAdminAuthStore((s) => s.token);
}

export default function EditDocumentModal({
  open,
  onClose,
  doc,
  entityType,
  entityId,
}: Props) {
  const token = useAdminToken();
  const qc = useQueryClient();
  const updateMut = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiClient<{ document: unknown }>(`/admin/documents/${doc?.id}`, {
        method: "PUT",
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
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !doc) return;
    setDocumentType(doc.document_type ?? "");
    setCountry(doc.country ?? "");
    setIssueDate(doc.issue_date ? String(doc.issue_date).slice(0, 10) : "");
    setExpiryDate(doc.expiry_date ? String(doc.expiry_date).slice(0, 10) : "");
    setNotes(doc.notes ?? "");
    setSubmitError(null);
  }, [open, doc]);

  if (!open || !doc) return null;

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);
    try {
      await updateMut.mutateAsync({
        document_type: documentType || null,
        country: country || null,
        issue_date: issueDate || null,
        expiry_date: expiryDate || null,
        notes: notes || null,
      });
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
          <h2 className="text-lg font-semibold text-gray-900">Edit Document</h2>
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
        <p className="mb-3 text-xs text-gray-500">
          File: <span className="font-mono">{doc.file_name}</span>
        </p>
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
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
              />
            </label>
            <span />
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
              disabled={updateMut.isPending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {updateMut.isPending ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
