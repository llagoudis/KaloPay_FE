import AdminTable from "@/components/admin/administrators/AdminTable";

export default function AdminAdministratorsPage() {
  return (
    <div className="admin-administrators-page w-full space-y-6">
      <div
        className="admin-administrators-title-card w-full rounded-[10px] bg-white"
        style={{ padding: "24px" }}
      >
        <h1
          className="admin-page-heading align-middle font-semibold"
          style={{
            fontFamily: "var(--font-poppins), Poppins, sans-serif",
            fontWeight: 600,
            fontStyle: "normal",
            fontSize: "24px",
            lineHeight: "26px",
            letterSpacing: "0px",
            color: "#0E1620",
          }}
        >
          Administrators
        </h1>
      </div>

      <AdminTable />
    </div>
  );
}