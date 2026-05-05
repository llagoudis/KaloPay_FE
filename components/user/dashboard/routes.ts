/**
 * Routes for the user (employer) app – used only by components in this dashboard folder.
 * Use these for links so navigation works (app lives under /user/...).
 */
export const DASHBOARD_ROUTES = {
  dashboard: "/user/dashboard",
  people: "/user/people",
  peopleAdd: "/user/people/add",
  personDetail: (id: string) => `/user/people/${id}`,
  payroll: "/user/payroll",
  payrollCreate: "/user/payroll/create",
  payrollReports: "/user/payroll/reports",
  payments: "/user/payments",
  bulkPayouts: "/user/bulk-payouts",
  transfers: "/user/transfers",
  reports: "/user/reports",
  settings: "/user/settings",
} as const;
