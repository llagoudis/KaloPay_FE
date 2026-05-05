import { API_BASE_URL } from "@/lib/constants/config";

export async function cryptoTransfer(data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE_URL}/employer/transfers/crypto`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Crypto transfer failed");
  return res.json();
}

export async function fiatTransfer(data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE_URL}/employer/transfers/fiat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Fiat transfer failed");
  return res.json();
}
