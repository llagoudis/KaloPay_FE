import EmployeeLayoutClient from "./EmployeeLayoutClient";

export default function EmployeeProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <EmployeeLayoutClient>{children}</EmployeeLayoutClient>;
}
