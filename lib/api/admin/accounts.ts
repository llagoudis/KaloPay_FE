import { API_BASE_URL } from "@/lib/constants/config";

export async function getAccounts(params?: Record<string, string>) {
  const query = params ? `?${new URLSearchParams(params)}` : "";
  const res = await fetch(`${API_BASE_URL}/admin/accounts${query}`);
  if (!res.ok) throw new Error("Failed to fetch accounts");
  return res.json();
}

export async function getAccount(id: string) {
  const res = await fetch(`${API_BASE_URL}/admin/accounts/${id}`);
  if (!res.ok) throw new Error("Failed to fetch account");
  return res.json();
}
