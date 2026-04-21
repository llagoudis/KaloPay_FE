export interface Account {
  id: string;
  name: string;
  type: "crypto" | "fiat" | "bank";
  currency: string;
  balance: number;
  status: "active" | "inactive" | "frozen";
  ownerId: string;
  ownerType: "company" | "employee";
  createdAt: string;
  updatedAt: string;
}
