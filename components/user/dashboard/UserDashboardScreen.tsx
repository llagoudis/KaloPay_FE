"use client";

import WelcomeBanner from "./WelcomeBanner";
import WalletCards from "./WalletCards";
import MonthlyAnalytics from "./MonthlyAnalytics";
import RecentPayrollBatchesTable from "./RecentPayrollBatchesTable";

/** Dashboard content only – header is in layout to avoid double nav */
export default function UserDashboardScreen() {
  return (
    <div className="min-h-screen w-full bg-dash-page" data-dashboard-theme>
      <div className="dash-shell w-full">
        <main className="pb-8 pt-8 md:pt-10">
          <WelcomeBanner />
          <WalletCards />
          <MonthlyAnalytics />
          <RecentPayrollBatchesTable />
        </main>
      </div>
    </div>
  );
}
