import { API_BASE_URL } from "@/lib/constants/config";

export async function getPeople(params?: Record<string, string>) {
  const query = params ? `?${new URLSearchParams(params)}` : "";
  const res = await fetch(`${API_BASE_URL}/employer/people${query}`);
  if (!res.ok) throw new Error("Failed to fetch people");
  return res.json();
}

export async function getPerson(id: string) {
  const res = await fetch(`${API_BASE_URL}/employer/people/${id}`);
  if (!res.ok) throw new Error("Failed to fetch person");
  return res.json();
}

export async function createPerson(data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE_URL}/employer/people`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create person");
  return res.json();
}

export async function updatePerson(id: string, data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE_URL}/employer/people/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update person");
  return res.json();
}

export async function massImportPeople(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE_URL}/employer/people/mass-import`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to import people");
  return res.json();
}
