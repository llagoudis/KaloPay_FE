"use client";

import Link from "next/link";
import ReportsLineChart from "./ReportsLineChart";
import { DASHBOARD_ROUTES } from "@/components/user/dashboard/routes";

/** Figma Reports – Available Reports (node 130-8648) */
const AVAILABLE_REPORTS = [
  { id: "1", title: "Male vs Female Report", subtitle: "Comprehensive gender demographics breakdown showing distribution of male and female employees across the organization.", tag: "Demographics", icon: "people" as const },
  { id: "2", title: "Salaries Report by Entity/Group/Department/Seniority", subtitle: "Detailed salary analysis and breakdown by organizational entity, group, department, and seniority level for comprehensive compensation insights.", tag: "Compensation", icon: "chart" as const },
  { id: "3", title: "Time Tracking Report", subtitle: "Get a summary of all the hours worked by your workers, including dates, start time and end time.", tag: "Time Tracking", icon: "clock" as const },
  { id: "4", title: "Time Off Summary per Worker - This Year", subtitle: "Summary of time off requests and days consumed per year-to-date per active worker.", tag: "Time Off", icon: "calendar" as const },
  { id: "5", title: "Time Off Requests Report", subtitle: "Data summary of all your workers requests for time off including dates requested, time reasons and the status of the request.", tag: "Time Off Requests", icon: "document" as const },
  { id: "6", title: "Upcoming Terminations This Year", subtitle: "Shows the number of upcoming intended and involuntary terminations scheduled for the rest of the year.", tag: "Terminations", icon: "people" as const },
  { id: "7", title: "Monthly Paysheets", subtitle: "Access and download monthly paysheets for all employees.", tag: "Payroll", icon: "dollar" as const },
  { id: "8", title: "IR59 Forms", subtitle: "Generate and download IR59 tax forms for employees.", tag: "Tax", icon: "document" as const },
  { id: "9", title: "IR63 Forms", subtitle: "Generate and download IR63 tax forms for employees.", tag: "Tax", icon: "document" as const },
];

const waveData = [80, 55, 70, 100, 90, 75, 33, 45, 50, 63, 80, 83];
const growthData = waveData;
const startersChartData = waveData;
const payrollBalanceData = waveData;
const totalCompData = waveData;

export default function UserReportsScreen() {
  return (
    <div
      className="min-h-full w-full bg-dash-page"
      data-dashboard-theme
      data-page="reports"
    >
      <div className="dash-shell w-full">
        <main className="pb-8 pt-8 md:pt-10 space-y-4">
          {/* Header card */}
          <section className="rp-outer-card reports-header-card mx-auto max-w-[1245px] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
            <div className="flex items-center gap-3 px-6 py-5">
              <Link
                href={DASHBOARD_ROUTES.dashboard}
                className="rp-back-btn inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                aria-label="Back"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5" />
                  <path d="m12 19-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="reports-title dash-card-section-title">Reports</h1>
            </div>
          </section>

          {/* People card */}
          <section className="rp-outer-card people-card mx-auto max-w-[1245px] rounded-xl p-4 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
            <div className="mb-5 flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#DBEAFE] text-[#0F4FDB]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h2 className="rp-section-title text-lg font-bold">People</h2>
                  <p className="rp-muted mt-1 align-middle text-[14px] font-normal leading-[20px] tracking-normal [font-family:var(--font-poppins),Poppins,sans-serif]" spellCheck={false}>
                    Collected insights into people data across your organization.
                  </p>
                </div>
              </div>

              {/* People Analytics Summary Card */}
              <div className="rp-inner-card mb-6 flex max-w-[1232px] flex-col rounded-[8px] border px-4 py-2.5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div className="shrink-0">
                  <p className="rp-muted text-xs font-medium">Current headcount</p>
                  <p className="rp-primary mt-0.5" style={{ fontFamily: 'var(--font-poppins)', fontWeight: 600, fontSize: '32px', lineHeight: '1' }}>42</p>
                  <p className="mt-1 text-xs text-[#9ca3af]">
                    February 1st 2025 – October 1st 2025 · All countries
                  </p>
                </div>
                <div className="mt-3 flex shrink-0 overflow-x-auto items-stretch gap-0 sm:mt-0 sm:ml-auto">
                  <div className="flex flex-col justify-center px-3 first:pl-0 sm:px-4">
                    <span className="rp-muted text-xs font-medium">Starters</span>
                    <span className="rp-primary mt-0.5 text-base font-bold">5</span>
                  </div>
                  <div className="rp-divider h-8 w-px shrink-0 self-center sm:h-9" aria-hidden />
                  <div className="flex flex-col justify-center px-3 sm:px-4">
                    <span className="rp-muted text-xs font-medium">Leavers</span>
                    <span className="rp-primary mt-0.5 text-base font-bold">2</span>
                  </div>
                  <div className="rp-divider h-8 w-px shrink-0 self-center sm:h-9" aria-hidden />
                  <div className="flex flex-col justify-center px-3 sm:px-4">
                    <span className="rp-muted text-xs font-medium">Terminations</span>
                    <span className="rp-primary mt-0.5 text-base font-bold">2</span>
                  </div>
                  <div className="rp-divider h-8 w-px shrink-0 self-center sm:h-9" aria-hidden />
                  <div className="flex flex-col justify-center px-3 sm:px-4">
                    <span className="rp-muted text-xs font-medium">Top active country</span>
                    <span className="rp-primary mt-0.5 text-base font-bold uppercase">US</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rp-chart-card flex w-full max-w-[605px] flex-col overflow-x-auto rounded-[17.6px] border px-4 pb-3 pt-4">
                  <div className="min-w-[420px]">
                    <ReportsLineChart title="Growth Rate" value="100%" color="blue" data={growthData} highlightMonthIndex={5} showPercentYAxis />
                  </div>
                </div>
                <div className="rp-chart-card flex w-full max-w-[605px] flex-col overflow-x-auto rounded-[17.6px] border px-4 pb-3 pt-4">
                  <div className="min-w-[420px]">
                    <ReportsLineChart title="Starters" value="5" color="green" data={startersChartData} highlightMonthIndex={5} />
                  </div>
                </div>
              </div>
          </section>

          {/* Compensation card */}
          <section className="rp-outer-card compensation-card mx-auto max-w-[1245px] rounded-xl p-4 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
            <div className="mb-5 flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#DCFCE7] text-[#16A34A]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h2 className="rp-section-title dash-card-section-title">Compensation</h2>
                  <p className="rp-muted mt-1 align-middle text-[14px] font-normal leading-[20px] tracking-normal [font-family:var(--font-poppins),Poppins,sans-serif]" spellCheck={false}>
                    Collected insights into compensation data across your organization.
                  </p>
                </div>
              </div>

              {/* Compensation summary card */}
              <div className="rp-inner-card mb-6 flex flex-col rounded-xl border p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                <div className="shrink-0">
                  <p className="rp-muted align-middle text-[14px] font-normal leading-[20px] tracking-normal [font-family:var(--font-poppins),Poppins,sans-serif]" spellCheck={false}>
                    Total compensation
                  </p>
                  <p className="rp-primary mt-3 align-middle text-[32px] font-semibold leading-none tracking-normal [font-family:var(--font-poppins),Poppins,sans-serif]">
                    $1,254,890
                  </p>
                  <p className="mt-4 text-xs text-[#9ca3af]">
                    1st of January 2025 - 31st of October 2025 - All countries
                  </p>
                </div>
                <div className="mt-4 flex shrink-0 overflow-x-auto items-stretch gap-0 sm:mt-0 sm:ml-auto">
                  <div className="flex flex-col justify-center px-2 sm:px-4 first:pl-0">
                    <span className="rp-muted text-xs font-medium whitespace-nowrap">Total payroll</span>
                    <span className="rp-primary mt-1 align-middle text-[16px] sm:text-[20px] font-semibold leading-[20px] tracking-normal [font-family:var(--font-poppins),Poppins,sans-serif] whitespace-nowrap">$1,254,890</span>
                  </div>
                  <div className="rp-divider h-10 w-px shrink-0 self-center" aria-hidden />
                  <div className="flex flex-col justify-center px-2 sm:px-4">
                    <span className="rp-muted text-xs font-medium whitespace-nowrap">Highest month</span>
                    <span className="rp-primary mt-1 align-middle text-[16px] sm:text-[20px] font-semibold leading-[20px] tracking-normal [font-family:var(--font-poppins),Poppins,sans-serif] whitespace-nowrap">$234,567</span>
                  </div>
                  <div className="rp-divider h-10 w-px shrink-0 self-center" aria-hidden />
                  <div className="flex flex-col justify-center px-2 sm:px-4">
                    <span className="rp-muted text-xs font-medium whitespace-nowrap">Lowest month</span>
                    <span className="rp-primary mt-1 align-middle text-[16px] sm:text-[20px] font-semibold leading-[20px] tracking-normal [font-family:var(--font-poppins),Poppins,sans-serif] whitespace-nowrap">$198,432</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rp-chart-card flex w-full max-w-[605px] flex-col overflow-x-auto rounded-[17.6px] border px-4 pb-3 pt-4">
                  <div className="min-w-[420px]">
                    <ReportsLineChart title="Average Monthly Payroll (year to date)" value="$85,430" color="blue" data={payrollBalanceData} highlightMonthIndex={5} showDollarYAxis />
                  </div>
                </div>
                <div className="rp-chart-card flex w-full max-w-[605px] flex-col overflow-x-auto rounded-[17.6px] border px-4 pb-3 pt-4">
                  <div className="min-w-[420px]">
                    <ReportsLineChart title="Total compensation" value="$1,254,890" color="green" data={totalCompData} highlightMonthIndex={5} showDollarYAxis />
                  </div>
                </div>
              </div>
          </section>

          {/* Available Reports */}
          <section className="rp-outer-card mx-auto max-w-[1245px] rounded-xl p-4 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
              <h2 className="rp-primary mb-4 align-middle text-[20px] font-semibold leading-[32px] tracking-normal [font-family:var(--font-poppins),Poppins,sans-serif]">
                Available Reports
              </h2>
              <ul className="rp-list divide-y">
                {AVAILABLE_REPORTS.map((report) => (
                  <li
                    key={report.id}
                    className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0 last:pb-0 sm:flex-nowrap"
                  >
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#DBEAFE] text-[#0F4FDB] sm:h-10 sm:w-10">
                        {report.icon === "people" && (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                          </svg>
                        )}
                        {report.icon === "chart" && (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="20" x2="18" y2="10" />
                            <line x1="12" y1="20" x2="12" y2="4" />
                            <line x1="6" y1="20" x2="6" y2="14" />
                          </svg>
                        )}
                        {report.icon === "clock" && (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                        )}
                        {report.icon === "calendar" && (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                        )}
                        {report.icon === "document" && (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                            <polyline points="10 9 9 9 8 9" />
                          </svg>
                        )}
                        {report.icon === "people-out" && (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6" />
                            <path d="M18 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
                            <path d="M8 11v2" />
                            <path d="M2 21v-2a4 4 0 0 1 4-4h4" />
                            <path d="M4 15h8" />
                          </svg>
                        )}
                        {report.icon === "dollar" && (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="1" x2="12" y2="23" />
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                          </svg>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="rp-primary align-middle text-[12px] sm:text-[16px]" style={{ fontFamily: 'var(--font-poppins)', fontWeight: 400, lineHeight: '20px' }}>{report.title}</p>
                        <p className="rp-muted mt-0.5 text-sm">{report.subtitle}</p>
                        <span className="rp-tag mt-1.5 inline-block align-middle rounded-md px-2.5 py-0.5" style={{ fontFamily: 'var(--font-inter), Inter, sans-serif', fontWeight: 500, fontSize: '10.2px', lineHeight: '16px' }}>
                          {report.tag}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        className="rp-action-btn flex h-9 w-9 items-center justify-center rounded-lg transition"
                        aria-label="View"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="7" height="7" />
                          <rect x="14" y="3" width="7" height="7" />
                          <rect x="3" y="14" width="7" height="7" />
                          <rect x="14" y="14" width="7" height="7" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="rp-action-btn flex h-9 w-9 items-center justify-center rounded-lg transition"
                        aria-label="Download"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
          </section>
        </main>
      </div>
    </div>
  );
}
