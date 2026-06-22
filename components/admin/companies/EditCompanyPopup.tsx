"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { useUpdateCompany } from "@/hooks/admin/useCompanies";
import { type AdminCompany } from "@/lib/api/admin/companies";

interface EditCompanyPopupProps {
  isOpen: boolean;
  onClose: () => void;
  company: AdminCompany | null;
}

export default function EditCompanyPopup({ isOpen, onClose, company }: EditCompanyPopupProps) {
  const updateCompany = useUpdateCompany();

  const [name, setName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("");
  const [accountStatus, setAccountStatus] = useState("");
  const [taxId, setTaxId] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");

  useEffect(() => {
    if (company && isOpen) {
      setName(company.name ?? "");
      setOwnerName(company.ownerName ?? company.owner_name ?? "");
      setEmail(company.email ?? "");
      setPhone(company.phone ?? "");
      setCountry(company.country ?? "");
      setBusinessType(company.business_type ?? company.businessType ?? "");
      setVerificationStatus(company.verification_status ?? company.verificationStatus ?? "");
      setAccountStatus(company.account_status ?? company.accountStatus ?? "");
      setTaxId(company.tax_id ?? "");
      setRegistrationNumber(company.registration_number ?? "");
    }
  }, [company, isOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!company) return;
    await updateCompany.mutateAsync({
      id: String(company.id),
      data: {
        name,
        owner_name: ownerName,
        email,
        phone,
        country,
        business_type: businessType,
        verification_status: verificationStatus,
        account_status: accountStatus,
        tax_id: taxId,
        registration_number: registrationNumber,
      },
    });
    onClose();
  };

  const inputCls = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none";
  const labelCls = "mb-1.5 block text-sm font-medium text-gray-700";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Company" size="lg">
      <form className="grid grid-cols-1 gap-5 sm:grid-cols-2" onSubmit={handleSubmit}>
        <div>
          <label className={labelCls}>Name <span className="text-red-500">*</span></label>
          <input required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Company name" />
        </div>
        <div>
          <label className={labelCls}>Owner Name</label>
          <input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} className={inputCls} placeholder="Owner name" />
        </div>
        <div>
          <label className={labelCls}>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="Email" />
        </div>
        <div>
          <label className={labelCls}>Phone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} placeholder="Phone" />
        </div>
        <div>
          <label className={labelCls}>Country</label>
          <input value={country} onChange={(e) => setCountry(e.target.value)} className={inputCls} placeholder="Country" />
        </div>
        <div>
          <label className={labelCls}>Business Type</label>
          <input value={businessType} onChange={(e) => setBusinessType(e.target.value)} className={inputCls} placeholder="Business type" />
        </div>
        <div>
          <label className={labelCls}>Verification Status</label>
          <select value={verificationStatus} onChange={(e) => setVerificationStatus(e.target.value)} className={inputCls}>
            <option value="">Select</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Account Status</label>
          <select value={accountStatus} onChange={(e) => setAccountStatus(e.target.value)} className={inputCls}>
            <option value="">Select</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Tax ID</label>
          <input value={taxId} onChange={(e) => setTaxId(e.target.value)} className={inputCls} placeholder="Tax ID" />
        </div>
        <div>
          <label className={labelCls}>Registration Number</label>
          <input value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} className={inputCls} placeholder="Registration number" />
        </div>
        <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" disabled={updateCompany.isPending}>
            {updateCompany.isPending ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
