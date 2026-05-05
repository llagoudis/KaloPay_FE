import UserLayoutClient from "./UserLayoutClient";

export default function EmployerProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UserLayoutClient>{children}</UserLayoutClient>;
}
