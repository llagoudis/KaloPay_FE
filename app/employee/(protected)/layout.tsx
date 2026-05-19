import Sidebar from "@/components/shared/Sidebar";
import Header from "@/components/shared/Header";

export default function EmployeeProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <Sidebar role="employee" />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header role="employee" />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
