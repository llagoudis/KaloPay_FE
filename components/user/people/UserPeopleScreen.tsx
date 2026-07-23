"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { DASHBOARD_ROUTES } from "@/components/user/dashboard/routes";
import { cn } from "@/lib/utils/cn";
import AddPeoplePopup from "@/components/user/people/AddPeoplePopup";
import MassImportPopup from "@/components/user/people/MassImportPopup";
import AbsencesTab, { type AbsencePerson } from "@/components/user/people/AbsencesTab";
import KpiTab, { type KpiPerson } from "@/components/user/people/KpiTab";
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

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function UserPeopleScreen() {
  const [subTab, setSubTab] = useState<PeopleSubTab>("list");
  // Shared roster for the Absences / KPI tabs (real data, mock fallback in the tabs).
  const { data: peopleData } = usePeople();
  const rosterPeople = (peopleData?.people ?? []) as PersonRecord[];
  const absencePeople: AbsencePerson[] = rosterPeople.map((p) => ({
    id: p.id,
    name: p.name,
    department: p.department ?? null,
  }));
  const kpiPeople: KpiPerson[] = rosterPeople.map((p) => ({
    id: p.id,
    name: p.name,
    email: p.email ?? null,
    jobTitle: p.jobTitle ?? null,
    status: p.status ?? null,
    startDate: p.startDate ?? null,
  }));

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
          {subTab === "absences" && <AbsencesTab people={absencePeople} />}
          {subTab === "kpi" && <KpiTab people={kpiPeople} />}
        </main>
      </div>
    </div>
  );
}
