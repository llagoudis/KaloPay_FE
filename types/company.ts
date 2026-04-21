export interface Company {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  country: string;
  industry?: string;
  status: "active" | "inactive" | "suspended";
  employeeCount: number;
  createdAt: string;
  updatedAt: string;
}
