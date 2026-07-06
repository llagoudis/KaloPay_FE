"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { DASHBOARD_ROUTES } from "@/components/user/dashboard/routes";
import { cn } from "@/lib/utils/cn";
import AddPeoplePopup from "@/components/user/people/AddPeoplePopup";
import MassImportPopup from "@/components/user/people/MassImportPopup";
import { usePeople } from "@/hooks/employer/useUserPanel";

type PersonRecord = {
  id: number | string;
  name: string;
  email?: string | null;
  jobTitle?: string | null;
  department?: string | null;
  country?: string | null;
  employmentType?: string | null;
  status?: string | null;
  startDate?: string | null;
};

type PeopleSubTab = "list" | "absences" | "kpi";

function exportRowsAsCsv(rows: PersonRecord[], filename: string) {
  if (rows.length === 0) return;
  const header = ["id", "name", "email", "jobTitle", "department", "country", "employmentType", "status", "startDate"];
  const escape = (v: string | number | null | undefined) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = rows.map((p) =>
    [p.id, p.name, p.email, p.jobTitle, p.department, p.country, p.employmentType, p.status, p.startDate ?? ""]
      .map(escape).join(",")
  );
  const csv = [header.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const peopleFilterSelectClass =
  "people-select box-border h-[30px] min-h-[30px] min-w-0 max-w-full appearance-none rounded-lg border border-[#DFDFDF] bg-[#f7f7fa] py-[4px] pl-4 pr-9 text-[14px] font-normal leading-[20px] tracking-normal text-[#878787] [font-family:var(--font-poppins),Poppins,sans-serif] shadow-none focus:border-[var(--color-dash-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-dash-accent)] [color-scheme:light]";

function PeopleFilterSelect({ children }: { children: ReactNode }) {
  return (
    <div className="people-filter-select-wrap relative inline-flex h-[30px] max-w-full min-w-0 shrink-0 items-center">
      <select className={peopleFilterSelectClass}>{children}</select>
      <span className="people-filter-select-chevron pointer-events-none absolute right-3 top-1/2 z-[1] -translate-y-1/2" aria-hidden>
        <svg width="12" height="6" viewBox="0 0 12 6" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1.5 2L6 5L10.5 2" stroke="#878787DD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
    </div>
  );
}

// ─── Sub-tab definitions ─────────────────────────────────────────────────────

const SUB_TABS: { key: PeopleSubTab; label: string; icon: ReactNode }[] = [
  {
    key: "list",
    label: "People List",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    key: "absences",
    label: "Absences",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="3" y1="10" x2="21" y2="10" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    key: "kpi",
    label: "KPI",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

// ─── People List ─────────────────────────────────────────────────────────────

function PeopleList() {
  const [search, setSearch] = useState("");
  const [addPopupOpen, setAddPopupOpen] = useState(false);
  const [massImportOpen, setMassImportOpen] = useState(false);
  const [menuOpenForId, setMenuOpenForId] = useState<string | null>(null);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement | null>(null);

  const { data, isLoading } = usePeople({ search: search || undefined });
  const filtered: PersonRecord[] = (data?.people ?? []) as PersonRecord[];

  useEffect(() => {
    if (!menuOpenForId) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpenForId(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpenForId]);

  function handleExport() {
    exportRowsAsCsv(filtered, `people-export-${new Date().toISOString().slice(0, 10)}.csv`);
  }

  function exportSingle(person: PersonRecord) {
    exportRowsAsCsv([person], `person-${person.id}-${new Date().toISOString().slice(0, 10)}.csv`);
  }

  return (
    <>
      <section className="people-header-card mx-auto max-w-[1245px] rounded-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
          <h1 className="people-title dash-card-section-title">People</h1>
          <div className="flex items-center gap-3">
            <button type="button" onClick={handleExport} className="people-export-btn rounded-lg border border-[#d1d5db] bg-white px-4 py-2 text-sm font-medium text-[#6b7280] transition hover:bg-[#f9fafb] hover:border-[#9ca3af]">
              Export
            </button>
            <button type="button" onClick={() => setAddPopupOpen(true)} className="inline-flex items-center justify-center rounded-lg bg-[var(--color-dash-accent)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90">
              + Add People
            </button>
          </div>
        </div>
      </section>

      <div className="people-info-banner mx-auto max-w-[1245px] flex items-center gap-3 rounded-xl bg-[#e3ebfa] p-6" style={{ border: "1px solid #1453db" }}>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#8aabed] text-sm font-bold text-[#2f66de]">!</span>
        <div className="min-w-0 flex-1">
          <p className="people-banner-title text-[14px] font-semibold leading-6 tracking-normal [font-family:var(--font-poppins),Poppins,sans-serif]">You selected one or several persons</p>
          <p className="people-banner-desc text-[13px] font-normal leading-5 tracking-normal [font-family:var(--font-poppins),Poppins,sans-serif]">You can only see the workers from the group selected from the filters.</p>
        </div>
      </div>

      <section className="people-list-card mx-auto max-w-[1245px] rounded-xl">
        <div className="people-list-header px-6 pt-5 pb-2">
          <h2 className="people-list-title dash-card-section-title">People List</h2>
        </div>
        <div className="people-list-filters flex w-full min-w-0 flex-wrap items-center gap-x-6 gap-y-[10px] px-6 py-4">
          <div className="people-list-search-wrap relative h-[42px] w-[402px] max-w-full min-w-0 shrink-0">
            <span className="people-search-icon pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" aria-hidden>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </span>
            <input type="search" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} className="people-search-input box-border h-[42px] w-full rounded-lg border border-[#DFDFDF] bg-[#f7f7fa] py-[9px] pl-[42px] pr-4 text-sm leading-normal text-[#374151] placeholder:text-[#6B7280] shadow-none focus:outline-none focus:ring-0"/>
          </div>
          <div className="overflow-x-auto sm:ml-auto">
            <div className="inline-flex min-w-max items-center gap-[10px]">
              <PeopleFilterSelect><option value="">Select group</option></PeopleFilterSelect>
              <PeopleFilterSelect><option value="">Select gender</option></PeopleFilterSelect>
              <PeopleFilterSelect><option value="">Select department</option></PeopleFilterSelect>
              <PeopleFilterSelect><option value="">Select seniority level</option></PeopleFilterSelect>
            </div>
          </div>
        </div>
        <div className="people-table-wrap overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse text-[14px]">
            <thead>
              <tr className="people-table-head text-left">
                <th scope="col">Person</th>
                <th scope="col">Country</th>
                <th scope="col">Worker Type</th>
                <th scope="col" className="text-center">Worker Status</th>
                <th scope="col" className="whitespace-nowrap">Start Date</th>
                <th scope="col" className="w-12 text-center" aria-label="Actions"></th>
              </tr>
            </thead>
            <tbody className="people-table-body">
              {isLoading ? (
                <tr><td colSpan={6} className="people-table-empty px-6 py-10 text-center text-[#6b7280]">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="people-table-empty px-6 py-10 text-center text-[#6b7280]">No people found.</td></tr>
              ) : (
                filtered.map((person) => {
                  const isActive = person.status === "active";
                  return (
                    <tr key={person.id} className="people-table-row hover:bg-[#f9fafb] cursor-pointer" onClick={() => router.push(`${DASHBOARD_ROUTES.people}/${person.id}`)}>
                      <td className="align-middle px-6 py-5">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-dash-accent)] text-sm font-semibold text-white">
                            {person.name.split(" ").map((n) => n[0]).join("")}
                          </span>
                          <div>
                            <p className="people-row-name font-semibold text-[#1f2937]">{person.name}</p>
                            <p className="people-row-role text-[#6b7280]">{person.jobTitle}</p>
                          </div>
                        </div>
                      </td>
                      <td className="people-row-cell align-middle px-6 py-5 text-[#374151]">{person.country}</td>
                      <td className="people-row-cell align-middle px-6 py-5 text-[#374151]">{person.employmentType}</td>
                      <td className="align-middle px-6 py-5 text-center">
                        <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium people-status", isActive ? "bg-[#dcfce7] text-[#166534]" : "bg-[#fee2e2] text-[#991b1b]")}>
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="people-row-cell align-middle whitespace-nowrap px-6 py-5 text-[#374151]">{person.startDate ?? "—"}</td>
                      <td className="relative align-middle px-6 py-5 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="people-row-actions inline-flex h-9 w-9 items-center justify-center rounded-md text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#334155]"
                          aria-label="Actions"
                          onClick={(e) => { e.stopPropagation(); setMenuOpenForId((prev) => (prev === String(person.id) ? null : String(person.id))); }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                            <circle cx="12" cy="6" r="1.75" stroke="currentColor" strokeWidth="1.5"/>
                            <circle cx="12" cy="12" r="1.75" stroke="currentColor" strokeWidth="1.5"/>
                            <circle cx="12" cy="18" r="1.75" stroke="currentColor" strokeWidth="1.5"/>
                          </svg>
                        </button>
                        {menuOpenForId === String(person.id) && (
                          <div ref={menuRef} role="menu" className="people-row-menu absolute right-4 top-12 z-50 w-44 rounded-lg border border-[#e5e7eb] bg-white py-1 text-left text-sm shadow-lg">
                            <button type="button" role="menuitem" className="block w-full px-3 py-2 text-left text-[#374151] hover:bg-[#f3f4f6]" onClick={() => { setMenuOpenForId(null); router.push(`${DASHBOARD_ROUTES.people}/${person.id}`); }}>View</button>
                            <button type="button" role="menuitem" className="block w-full px-3 py-2 text-left text-[#374151] hover:bg-[#f3f4f6]" onClick={() => { setMenuOpenForId(null); router.push(`${DASHBOARD_ROUTES.people}/${person.id}?edit=1`); }}>Edit</button>
                            <button type="button" role="menuitem" className="block w-full px-3 py-2 text-left text-[#374151] hover:bg-[#f3f4f6]" onClick={() => { setMenuOpenForId(null); router.push(`${DASHBOARD_ROUTES.payments}?employee=${person.id}`); }}>Pay</button>
                            <button type="button" role="menuitem" className="block w-full px-3 py-2 text-left text-[#374151] hover:bg-[#f3f4f6]" onClick={() => { setMenuOpenForId(null); exportSingle(person); }}>Export CSV</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <AddPeoplePopup open={addPopupOpen} onClose={() => setAddPopupOpen(false)} onEmployee={() => { setAddPopupOpen(false); router.push(DASHBOARD_ROUTES.peopleAdd); }} onMassImport={() => { setAddPopupOpen(false); setMassImportOpen(true); }}/>
      <MassImportPopup open={massImportOpen} onClose={() => setMassImportOpen(false)} onImport={() => setMassImportOpen(false)}/>
    </>
  );
}

// ─── Absences ────────────────────────────────────────────────────────────────

type AbsenceDecisions = Record<string, "approved" | "rejected">;

const MOCK_ABSENCES = [
  { employee: "Alice Smith", reference: "ABS-001", type: "Annual", status: "Pending", from: "2026-07-10", to: "2026-07-14", hours: 40, subject: "Family vacation", note: "" },
  { employee: "Bob Jones", reference: "ABS-002", type: "Sick", status: "Pending", from: "2026-07-08", to: "2026-07-09", hours: 16, subject: "Illness", note: "Doctor note attached" },
  { employee: "Carol White", reference: "ABS-003", type: "Maternity", status: "Approved", from: "2026-06-01", to: "2026-08-31", hours: 480, subject: "Maternity leave", note: "" },
];

const LEAVE_TOTALS: { type: string; count: number; color: string }[] = [
  { type: "Annual", count: 3, color: "#0F50DB" },
  { type: "Sick", count: 1, color: "#F59E0B" },
  { type: "Maternity", count: 1, color: "#EC4899" },
  { type: "Parental", count: 0, color: "#8B5CF6" },
  { type: "Army", count: 0, color: "#6B7280" },
  { type: "Study", count: 0, color: "#10B981" },
];

function AbsencesTab() {
  const [decisions, setDecisions] = useState<AbsenceDecisions>(() => {
    try { return JSON.parse(localStorage.getItem("kp-abs-decisions") ?? "{}"); } catch { return {}; }
  });
  const [year, setYear] = useState(2026);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  function decide(key: string, action: "approved" | "rejected") {
    const next = { ...decisions, [key]: action };
    setDecisions(next);
    localStorage.setItem("kp-abs-decisions", JSON.stringify(next));
  }

  function undo(key: string) {
    const next = { ...decisions };
    delete next[key];
    setDecisions(next);
    localStorage.setItem("kp-abs-decisions", JSON.stringify(next));
  }

  const total = MOCK_ABSENCES.length;
  const totalPages = Math.ceil(total / rowsPerPage);
  const paginated = MOCK_ABSENCES.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <div className="space-y-4 mx-auto max-w-[1245px]">
      {/* Year selector + leave type totals */}
      <div className="rounded-xl bg-white p-5 shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-500">Year</label>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="h-8 rounded-lg border border-gray-200 px-2 text-sm text-gray-700 focus:outline-none">
            {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="flex flex-wrap gap-3 sm:ml-auto">
          {LEAVE_TOTALS.map((lt) => (
            <div key={lt.type} className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: `${lt.color}15`, color: lt.color }}>
              <span>{lt.type}</span>
              <span className="rounded-full bg-white/60 px-1.5">{lt.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Absences table */}
      <div className="rounded-xl bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="border-b border-gray-100">
              <tr className="text-left text-xs font-medium text-gray-400">
                {["Employee", "Reference", "Type", "Status", "From", "To", "Hours", "Subject", "Note", "Action"].map((h) => (
                  <th key={h} className="px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.map((row) => {
                const key = `${row.employee}|${row.reference}`;
                const decision = decisions[key];
                const isPending = !decision && row.status === "Pending";
                return (
                  <tr key={key} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-[#0E1620] whitespace-nowrap">{row.employee}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{row.reference}</td>
                    <td className="px-4 py-3 text-gray-600">{row.type}</td>
                    <td className="px-4 py-3">
                      <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        decision === "approved" || row.status === "Approved" ? "bg-emerald-100 text-emerald-700" :
                        decision === "rejected" ? "bg-red-100 text-red-700" :
                        "bg-amber-100 text-amber-700"
                      )}>
                        {decision ? (decision === "approved" ? "Approved" : "Rejected") : row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{row.from}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{row.to}</td>
                    <td className="px-4 py-3 text-gray-600">{row.hours}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[140px] truncate">{row.subject}</td>
                    <td className="px-4 py-3 text-gray-400 max-w-[100px] truncate">{row.note || "—"}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {decision ? (
                        <button type="button" onClick={() => undo(key)} className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-200">Undo</button>
                      ) : isPending ? (
                        <div className="flex gap-2">
                          <button type="button" onClick={() => decide(key, "approved")} className="rounded-lg px-3 py-1 text-xs font-semibold text-white" style={{ background: "#16A34A" }}>Approve</button>
                          <button type="button" onClick={() => decide(key, "rejected")} className="rounded-lg px-3 py-1 text-xs font-semibold text-white" style={{ background: "#DC2626" }}>Reject</button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-xs text-gray-500">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded px-2 py-1 hover:bg-gray-100 disabled:opacity-40">Prev</button>
            <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded px-2 py-1 hover:bg-gray-100 disabled:opacity-40">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── KPI ─────────────────────────────────────────────────────────────────────

const MOCK_KPIS = [
  { id: 1, empNo: "E001", name: "Alice Smith", manager: "manager@company.com", startDate: "2023-01-15", kpiCount: 4, active: true, kpis: [{ title: "Revenue Target", status: "On track" }, { title: "Customer Sat.", status: "At risk" }, { title: "Team Growth", status: "On track" }, { title: "Product Launch", status: "On track" }] },
  { id: 2, empNo: "E002", name: "Bob Jones", manager: "manager@company.com", startDate: "2022-06-01", kpiCount: 3, active: true, kpis: [{ title: "Sales Quota", status: "On track" }, { title: "Retention", status: "On track" }, { title: "NPS", status: "Behind" }] },
  { id: 3, empNo: "E003", name: "Carol White", manager: "director@company.com", startDate: "2021-03-10", kpiCount: 2, active: false, kpis: [{ title: "Project Delivery", status: "On track" }, { title: "Budget", status: "On track" }] },
];

function KpiTab() {
  const [activeOnly, setActiveOnly] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const filtered = MOCK_KPIS.filter((e) => (activeOnly ? e.active : !e.active));
  const selected = MOCK_KPIS.find((e) => e.id === selectedId);

  if (selected) {
    return (
      <div className="mx-auto max-w-[1245px] space-y-4">
        <button type="button" onClick={() => setSelectedId(null)} className="flex items-center gap-1 text-sm text-[#0F50DB] hover:underline">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Back to KPI List
        </button>
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="mb-1 text-base font-semibold text-[#0E1620]">{selected.name} — KPIs</h3>
          <p className="mb-4 text-sm text-gray-400">Employee No: {selected.empNo} · Start Date: {selected.startDate}</p>
          <div className="space-y-3">
            {selected.kpis.map((kpi, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                <span className="text-sm font-medium text-[#0E1620]">{kpi.title}</span>
                <span className={cn("rounded-full px-3 py-0.5 text-xs font-semibold",
                  kpi.status === "On track" ? "bg-emerald-100 text-emerald-700" :
                  kpi.status === "At risk" ? "bg-amber-100 text-amber-700" :
                  "bg-red-100 text-red-700"
                )}>{kpi.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1245px] space-y-4">
      <div className="rounded-xl bg-white p-5 shadow-sm flex items-center gap-3">
        <button type="button" onClick={() => setActiveOnly(true)} className={cn("rounded-full px-4 py-1.5 text-sm font-semibold", activeOnly ? "bg-[#0F50DB] text-white" : "text-gray-500 hover:bg-gray-100")}>Active</button>
        <button type="button" onClick={() => setActiveOnly(false)} className={cn("rounded-full px-4 py-1.5 text-sm font-semibold", !activeOnly ? "bg-[#0F50DB] text-white" : "text-gray-500 hover:bg-gray-100")}>Non-Active</button>
      </div>

      <div className="rounded-xl bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100">
            <tr className="text-left text-xs font-medium text-gray-400">
              <th className="px-6 py-3">Employee No</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Direct Manager</th>
              <th className="px-6 py-3">Start Date</th>
              <th className="px-6 py-3">KPI Count</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">No employees found.</td></tr>
            ) : filtered.map((e) => (
              <tr key={e.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedId(e.id)}>
                <td className="px-6 py-4 font-mono text-xs text-gray-500">{e.empNo}</td>
                <td className="px-6 py-4 font-medium text-[#0E1620]">{e.name}</td>
                <td className="px-6 py-4"><a href={`mailto:${e.manager}`} className="text-[#0F50DB] hover:underline" onClick={(ev) => ev.stopPropagation()}>{e.manager}</a></td>
                <td className="px-6 py-4 text-gray-500">{e.startDate}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center justify-center rounded-full bg-blue-100 text-blue-700 w-7 h-7 text-xs font-bold">{e.kpiCount}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function UserPeopleScreen() {
  const [subTab, setSubTab] = useState<PeopleSubTab>("list");

  return (
    <div className="min-h-screen w-full bg-dash-page people-page" data-dashboard-theme data-page="people">
      <div className="dash-shell w-full">
        <main className="pb-8 pt-8 md:pt-10 space-y-4">
          {/* Sub-tab pill nav */}
          <div className="mx-auto max-w-[1245px] overflow-x-auto">
            <div className="inline-flex min-w-max gap-2">
              {SUB_TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setSubTab(t.key)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold outline-none",
                    subTab === t.key ? "bg-[#0F50DB] text-white shadow-sm" : "text-gray-500 hover:bg-gray-100"
                  )}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {subTab === "list" && <PeopleList />}
          {subTab === "absences" && <AbsencesTab />}
          {subTab === "kpi" && <KpiTab />}
        </main>
      </div>
    </div>
  );
}
