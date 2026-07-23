"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import BillingScreen from "@/components/user/billing/BillingScreen";

/**
 * Employer "Billing" route → plan, payment method and invoices.
 * `?pay=1` auto-opens the Pay-now modal on mount (see BillingScreen autoOpenPay).
 */
function BillingRoute() {
  const searchParams = useSearchParams();
  const autoOpenPay = searchParams.get("pay") === "1";
  return <BillingScreen autoOpenPay={autoOpenPay} />;
}

export default function BillingPage() {
  return (
    <Suspense fallback={<BillingScreen />}>
      <BillingRoute />
    </Suspense>
  );
}
