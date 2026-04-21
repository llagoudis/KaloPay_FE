export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department?: string;
  position?: string;
  salary: number;
  currency: string;
  status: "active" | "inactive" | "terminated";
  hireDate: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}
