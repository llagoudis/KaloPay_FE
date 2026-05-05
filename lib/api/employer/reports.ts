import { API_BASE_URL } from "@/lib/constants/config";

export async function getPayrollReports(params?: Record<string, string>) {
  const query = params ? `?${new URLSearchParams(params)}` : "";
  const res = await fetch(`${API_BASE_URL}/employer/reports${query}`);
  if (!res.ok) throw new Error("Failed to fetch reports");
  return res.json();
}

export async function downloadReport(reportId: string) {
  const res = await fetch(`${API_BASE_URL}/employer/reports/${reportId}/download`);
  if (!res.ok) throw new Error("Failed to download report");
  return res.blob();
}
