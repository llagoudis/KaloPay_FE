import { API_BASE_URL } from "@/lib/constants/config";

export async function getDuePayments(params?: Record<string, string>) {
  const query = params ? `?${new URLSearchParams(params)}` : "";
  const res = await fetch(`${API_BASE_URL}/employer/payments/due${query}`);
  if (!res.ok) throw new Error("Failed to fetch due payments");
  return res.json();
}

export async function getExecutedPayments(params?: Record<string, string>) {
  const query = params ? `?${new URLSearchParams(params)}` : "";
  const res = await fetch(`${API_BASE_URL}/employer/payments/executed${query}`);
  if (!res.ok) throw new Error("Failed to fetch executed payments");
  return res.json();
}
