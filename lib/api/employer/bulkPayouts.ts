import { API_BASE_URL } from "@/lib/constants/config";

export async function getBulkPayouts(params?: Record<string, string>) {
  const query = params ? `?${new URLSearchParams(params)}` : "";
  const res = await fetch(`${API_BASE_URL}/employer/bulk-payouts${query}`);
  if (!res.ok) throw new Error("Failed to fetch bulk payouts");
  return res.json();
}

export async function createBulkPayout(data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE_URL}/employer/bulk-payouts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create bulk payout");
  return res.json();
}
