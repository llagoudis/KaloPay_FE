import { apiClient } from "@/lib/api/client";

// ── Generic per-feature JSON store (app_settings-backed on the server) ──
// GET returns { data }, PUT accepts { key?, data } and returns { ok, data }.
export function getFeature<T>(path: string, token: string, key?: string): Promise<{ data: T | null }> {
  const q = key ? `?key=${encodeURIComponent(key)}` : "";
  return apiClient<{ data: T | null }>(`${path}${q}`, { token });
}
export function putFeature<T>(path: string, token: string, data: T, key?: string) {
  return apiClient<{ ok: boolean; data: T }>(path, {
    method: "PUT",
    token,
    body: key ? { key, data } : { data },
  });
}

// Billing (scoped to company)
export const getBilling = (token: string) => getFeature<Record<string, unknown>>("/employer/billing", token);
export const putBilling = (token: string, data: unknown) => putFeature("/employer/billing", token, data);

// Accounting link (scoped to company)
export const getAccounting = (token: string) => getFeature<Record<string, unknown>>("/employer/accounting", token);
export const putAccounting = (token: string, data: unknown) => putFeature("/employer/accounting", token, data);

// Notification preferences (role path: /employer|employee|admin + /settings/notifications)
export const getNotifPrefs = (rolePath: string, token: string) => getFeature<Record<string, unknown>>(rolePath, token);
export const putNotifPrefs = (rolePath: string, token: string, data: unknown) => putFeature(rolePath, token, data);

// Payslip edits (keyed by batch/employee)
export const getPayslip = (token: string, key: string) => getFeature<Record<string, unknown>>("/employer/payslips", token, key);
export const putPayslip = (token: string, key: string, data: unknown) => putFeature("/employer/payslips", token, data, key);

// Compensation earnings (per employee; PUT body is the raw object)
export const getCompensation = (token: string, employeeId: string | number) =>
  apiClient<{ data: Record<string, unknown> | null }>(`/employer/people/${employeeId}/compensation`, { token });
export const putCompensation = (token: string, employeeId: string | number, data: unknown) =>
  apiClient<{ ok: boolean; data: unknown }>(`/employer/people/${employeeId}/compensation`, { method: "PUT", token, body: data });

// KYC / employee documents
export interface EmployeeDocument {
  id: number;
  name: string;
  documentType: string;
  status: string;
  format: string;
  mimeType: string | null;
  size: number | null;
  createdAt: string;
}
export const getEmployeeDocuments = (token: string, employeeId: string | number) =>
  apiClient<{ documents: EmployeeDocument[] }>(`/employer/people/${employeeId}/documents`, { token });
export const uploadEmployeeDocument = (
  token: string,
  employeeId: string | number,
  body: { fileName: string; fileData?: string | null; fileSize?: number; mimeType?: string; documentType?: string }
) => apiClient<{ document: EmployeeDocument }>(`/employer/people/${employeeId}/documents`, { method: "POST", token, body });

// Record absence / leave for an employee (employer-side create)
export const createAbsence = (
  token: string,
  body: { employee: string; type?: string; leaveType?: string; startDate: string; endDate: string; reason?: string; status?: string }
) => apiClient<{ request: unknown }>(`/employer/leave-requests`, { method: "POST", token, body });

// ── Multi-company: list companies the user can act on + switch active company ──
export interface EmployerCompany {
  id: number;
  name: string;
  active: boolean;
}
export const listCompanies = (token: string) =>
  apiClient<{ companies: EmployerCompany[]; activeCompanyId: number | null }>(`/employer/companies`, { token });
export const switchCompanyApi = (token: string, companyId: number) =>
  apiClient<{ token: string; company: { id: number; name: string }; companyName: string }>(
    `/employer/companies/switch`,
    { method: "POST", token, body: { companyId } }
  );
