"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { DASHBOARD_ROUTES } from "@/components/user/dashboard/routes";
import { cn } from "@/lib/utils/cn";
import AddPeoplePopup from "@/components/user/people/AddPeoplePopup";
import MassImportPopup from "@/components/user/people/MassImportPopup";
import { usePeople } from "@/hooks/employer/useUserPanel";

const peopleFilterSelectClass =
  "people-select box-border h-[30px] min-h-[30px] min-w-0 max-w-full appearance-none rounded-lg border border-[#DFDFDF] bg-[#f7f7fa] py-[4px] pl-4 pr-9 text-[14px] font-normal leading-[20px] tracking-normal text-[#878787] [font-family:var(--font-poppins),Poppins,sans-serif] shadow-none focus:border-[var(--color-dash-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-dash-accent)] [color-scheme:light]";

/** Custom chevron: 12×6, 2px stroke, #878787DD; vertically centered; extra pr on select keeps gap from label text. */
function PeopleFilterSelect({ children }: { children: ReactNode }) {
  return (
    <div className="people-filter-select-wrap relative inline-flex h-[30px] max-w-full min-w-0 shrink-0 items-center">
      <select className={peopleFilterSelectClass}>{children}</select>
      <span className="people-filter-select-chevron pointer-events-none absolute right-3 top-1/2 z-[1] -translate-y-1/2" aria-hidden>
        <svg width="12" height="6" viewBox="0 0 12 6" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M1.5 2L6 5L10.5 2"
            stroke="#878787DD"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </div>
  );
}

/** People screen – Figma Payroll (node 42-1409): header card, info banner, people list card. */
export default function UserPeopleScreen() {
  const [search, setSearch] = useState("");
  const [addPopupOpen, setAddPopupOpen] = useState(false);
  const [massImportOpen, setMassImportOpen] = useState(false);
  const router = useRouter();

  const { data, isLoading } = usePeople({ search: search || undefined });
  const filtered = data?.people ?? [];

  function handleExport() {
    if (filtered.length === 0) return;
    const header = ["id", "name", "email", "jobTitle", "department", "country", "employmentType", "status", "startDate"];
    const escape = (v: string | number | null | undefined) => {
      const s = String(v ?? "");
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = filtered.map((p) =>
      [p.id, p.name, p.email, p.jobTitle, p.department, p.country, p.employmentType, p.status, p.startDate ?? ""]
        .map(escape)
        .join(",")
    );
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `people-export-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen w-full bg-dash-page people-page" data-dashboard-theme data-page="people">
      <div className="dash-shell w-full">
        <main className="pb-8 pt-8 md:pt-10 space-y-4">
          {/* Top header card – light: white; dark: dash-card */}
          <section className="people-header-card mx-auto max-w-[1245px] rounded-xl">
            <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
              <h1 className="people-title dash-card-section-title">People</h1>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleExport}
                  className="people-export-btn rounded-lg border border-[#d1d5db] bg-white px-4 py-2 text-sm font-medium text-[#6b7280] transition hover:bg-[#f9fafb] hover:border-[#9ca3af]"
                >
                  Export
                </button>
                <button
                  type="button"
                  onClick={() => setAddPopupOpen(true)}
                  className="inline-flex items-center justify-center rounded-lg bg-[var(--color-dash-accent)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                >
                  + Add People
                </button>
              </div>
            </div>
          </section>

          {/* Info banner – bg + text via globals.css (light gradient / dark #e1eafa) */}
          <div className="people-info-banner mx-auto max-w-[1245px] flex items-center gap-3 rounded-xl bg-[#e3ebfa] p-6" style={{ border: "1px solid #1453db", boxShadow: "none" }}>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#8aabed] text-sm font-bold text-[#2f66de]">
              !
            </span>
            <div className="min-w-0 flex-1">
              <p className="people-banner-title text-[14px] font-semibold leading-6 tracking-normal [font-family:var(--font-poppins),Poppins,sans-serif]">
                You selected one or several persons
              </p>
              <p className="people-banner-desc text-[13px] font-normal leading-5 tracking-normal [font-family:var(--font-poppins),Poppins,sans-serif]">
                You can only see the workers from the group selected from the filters.
              </p>
            </div>
          </div>

          {/* People list card – light: white; dark: dash-card */}
          <section className="people-list-card mx-auto max-w-[1245px] rounded-xl">
            <div className="people-list-header px-6 pt-5 pb-2">
              <h2 className="people-list-title dash-card-section-title">People List</h2>
            </div>
            <div className="people-list-filters flex w-full min-w-0 flex-wrap items-center gap-x-6 gap-y-[10px] px-6 py-4">
              {/* Search – 402×42, 8px radius, #DFDFDF border, 9/16 padding; light/dark via globals */}
              <div className="people-list-search-wrap relative h-[42px] w-[402px] max-w-full min-w-0 shrink-0">
                <span className="people-search-icon pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" aria-hidden>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </span>
                <input
                  type="search"
                  placeholder="Search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="people-search-input box-border h-[42px] w-full rounded-lg border border-[#DFDFDF] bg-[#f7f7fa] py-[9px] pl-[42px] pr-4 text-sm leading-normal text-[#374151] placeholder:text-[#6B7280] shadow-none focus:outline-none focus:ring-0"
                />
              </div>
              <div className="overflow-x-auto sm:ml-auto">
              <div className="inline-flex min-w-max items-center gap-[10px]">
                <PeopleFilterSelect>
                  <option value="">Select group</option>
                </PeopleFilterSelect>
                <PeopleFilterSelect>
                  <option value="">Select gender</option>
                </PeopleFilterSelect>
                <PeopleFilterSelect>
                  <option value="">Select department</option>
                </PeopleFilterSelect>
                <PeopleFilterSelect>
                  <option value="">Select seniority level</option>
                </PeopleFilterSelect>
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
                    <th scope="col" className="text-center">
                      Worker Status
                    </th>
                    <th scope="col" className="whitespace-nowrap">
                      Start Date
                    </th>
                    <th scope="col" className="w-12 text-center" aria-label="Actions"></th>
                  </tr>
                </thead>
                <tbody className="people-table-body">
                  {isLoading ? (
                    <tr><td colSpan={6} className="people-table-empty px-6 py-10 text-center text-[#6b7280]">Loading…</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="people-table-empty px-6 py-10 text-center text-[#6b7280]">
                        No people found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((person) => {
                      const isActive = person.status === "active";
                      return (
                        <tr
                          key={person.id}
                          className="people-table-row hover:bg-[#f9fafb] cursor-pointer"
                          onClick={() => router.push(`${DASHBOARD_ROUTES.people}/${person.id}`)}
                        >
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
                            <span
                              className={cn(
                                "inline-flex rounded-full px-2.5 py-1 text-xs font-medium people-status",
                                isActive && "bg-[#dcfce7] text-[#166534]",
                                !isActive && "bg-[#fee2e2] text-[#991b1b]"
                              )}
                            >
                              {isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="people-row-cell align-middle whitespace-nowrap px-6 py-5 text-[#374151]">
                            {person.startDate ?? "—"}
                          </td>
                          <td className="align-middle px-6 py-5 text-center" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              className="people-row-actions inline-flex h-9 w-9 items-center justify-center rounded-md text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#334155]"
                              aria-label="Actions"
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                                <circle cx="12" cy="6" r="1.75" stroke="currentColor" strokeWidth="1.5" />
                                <circle cx="12" cy="12" r="1.75" stroke="currentColor" strokeWidth="1.5" />
                                <circle cx="12" cy="18" r="1.75" stroke="currentColor" strokeWidth="1.5" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
      <AddPeoplePopup
        open={addPopupOpen}
        onClose={() => setAddPopupOpen(false)}
        onEmployee={() => {
          setAddPopupOpen(false);
          router.push(DASHBOARD_ROUTES.peopleAdd);
        }}
        onMassImport={() => {
          setAddPopupOpen(false);
          setMassImportOpen(true);
        }}
      />
      <MassImportPopup
        open={massImportOpen}
        onClose={() => setMassImportOpen(false)}
        onImport={() => setMassImportOpen(false)}
      />
    </div>
  );
}
