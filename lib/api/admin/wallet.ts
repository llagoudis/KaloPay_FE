import { API_BASE_URL } from "@/lib/constants/config";

export async function getWalletSummary() {
  const res = await fetch(`${API_BASE_URL}/admin/wallet`);
  if (!res.ok) throw new Error("Failed to fetch wallet summary");
  return res.json();
}
