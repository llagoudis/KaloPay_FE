export type Role = "admin" | "employer" | "employee";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
  companyId?: number | null;
  companyName?: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}
