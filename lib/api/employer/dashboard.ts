import { API_BASE_URL } from "@/lib/constants/config";

export async function getDashboardStats() {
  const res = await fetch(`${API_BASE_URL}/employer/dashboard`);
  if (!res.ok) throw new Error("Failed to fetch dashboard stats");
  return res.json();
}
