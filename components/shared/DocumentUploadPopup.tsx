"use client";

import { useRef } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

interface DocumentUploadPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: FileList) => void;
  title?: string;
  accept?: string;
}

export default function DocumentUploadPopup({
  isOpen,
  onClose,
  onUpload,
  title = "Upload Document",
  accept = ".pdf,.doc,.docx,.jpg,.png",
}: DocumentUploadPopupProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files);
      onClose();
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div
        className="mb-4 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 text-center hover:border-blue-400"
        onClick={() => inputRef.current?.click()}
      >
        <p className="text-sm text-gray-500">Click to browse or drag files here</p>
        <p className="mt-1 text-xs text-gray-400">Accepted: {accept}</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={() => inputRef.current?.click()}>Browse Files</Button>
      </div>
    </Modal>
  );
}
