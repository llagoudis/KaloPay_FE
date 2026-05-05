import { API_BASE_URL } from "@/lib/constants/config";

export async function getPayrollRuns(params?: Record<string, string>) {
  const query = params ? `?${new URLSearchParams(params)}` : "";
  const res = await fetch(`${API_BASE_URL}/employer/payroll${query}`);
  if (!res.ok) throw new Error("Failed to fetch payroll runs");
  return res.json();
}

export async function createPayrollRun(data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE_URL}/employer/payroll`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create payroll run");
  return res.json();
}

export async function executePayrollRun(id: string) {
  const res = await fetch(`${API_BASE_URL}/employer/payroll/${id}/execute`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to execute payroll run");
  return res.json();
}
