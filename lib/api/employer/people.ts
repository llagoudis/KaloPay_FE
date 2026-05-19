import { API_BASE_URL } from "@/lib/constants/config";
import { apiClient } from "@/lib/api/client";

export type PersonListItem = {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  department: string;
  country: string;
  employmentType: string;
  status: string;
  startDate: string | null;
};

export type PersonDetail = {
  id: number;
  employeeNo: string | null;
  // Personal
  firstName: string;
  middleName: string | null;
  lastName: string;
  email: string;
  personalEmail: string | null;
  workEmail: string | null;
  phone: string | null;
  primaryCountryCode: string | null;
  primaryPhone: string | null;
  emergencyCountryCode: string | null;
  emergencyPhone: string | null;
  nationality: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  maritalStatus: string | null;
  nationalIdNumber: string | null;
  passportNumber: string | null;
  nationalInsuranceNo: string | null;
  tic: string | null;
  dependants: string | null;
  workPermitVisa: string | null;
  residencePermitExpiry: string | null;
  // Address
  streetName: string | null;
  streetNo: string | null;
  flatApartmentNo: string | null;
  floor: string | null;
  postalCode: string | null;
  city: string | null;
  province: string | null;
  country: string | null;
  // Employment
  employeeIdExternal: string | null;
  groupName: string | null;
  seniorityLevel: string | null;
  departmentRole: string | null;
  lineManagerEmail: string | null;
  workLocationCountry: string | null;
  legalEntity: string | null;
  scopeOfWork: string | null;
  jobTitle: string | null;
  department: string | null;
  employmentType: string | null;
  employeeStatus: string;
  contractStart: string | null;
  contractEnd: string | null;
  terminationDate: string | null;
  partTimePercentage: string | null;
  // Compensation
  paymentMethod: string | null;
  paymentPreference: string | null;
  compensationType: string | null;
  shiftSchedule: string | null;
  probationPeriod: string | null;
  workingHours: string | null;
  workingDaysPerWeek: string | null;
  noticePeriod: string | null;
  grossAnnualSalary: number | null;
  paymentCurrencyCode: string | null;
  // Bank/Wallet
  bankName: string | null;
  bankAddress: string | null;
  swiftBic: string | null;
  iban: string | null;
  defaultPaymentMethod: string | null;
  currencyPreference: string | null;
  digitalWalletAddress: string | null;
  // Notes
  internalNotes: string | null;
  createdAt: string;
};

export const peopleApi = {
  list: (token: string, params: { search?: string; status?: string; department?: string } = {}) => {
    const qs = new URLSearchParams();
    if (params.search) qs.set("search", params.search);
    if (params.status) qs.set("status", params.status);
    if (params.department) qs.set("department", params.department);
    const q = qs.toString();
    return apiClient<{ people: PersonListItem[] }>(`/employer/people${q ? `?${q}` : ""}`, { token });
  },

  detail: (token: string, id: number) =>
    apiClient<{ person: PersonDetail }>(`/employer/people/${id}`, { token }),

  create: (token: string, data: Partial<PersonDetail>) =>
    apiClient<{ id: number }>(`/employer/people`, { token, method: "POST", body: data }),

  update: (token: string, id: number, partial: Partial<PersonDetail>) =>
    apiClient<{ person: PersonDetail }>(`/employer/people/${id}`, { token, method: "PATCH", body: partial }),

  remove: (token: string, id: number) =>
    apiClient<{ ok: boolean }>(`/employer/people/${id}`, { token, method: "DELETE" }),

  // Bulk import uses raw fetch because apiClient doesn't support FormData
  bulkImport: async (token: string, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`${API_BASE_URL}/employer/people/bulk-import`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error((data as { error?: string })?.error ?? `Bulk import failed (${res.status})`);
    }
    return data as { createdCount: number; errors: { row: number; message: string }[] };
  },
};
