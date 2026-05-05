import { API_BASE_URL } from "@/lib/constants/config";

export async function getEmployeeReports(params?: Record<string, string>) {
  const query = params ? `?${new URLSearchParams(params)}` : "";
  const res = await fetch(`${API_BASE_URL}/employee/reports${query}`);
  if (!res.ok) throw new Error("Failed to fetch reports");
  return res.json();
}
