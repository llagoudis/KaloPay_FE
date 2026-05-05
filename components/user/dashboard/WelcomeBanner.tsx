"use client";

import { useEmployerAuthStore } from "@/store/employerAuthStore";

export default function WelcomeBanner() {
  const { user } = useEmployerAuthStore();
  const companyName = (user as { companyName?: string })?.companyName ?? "Loukas LTD";

  return (
    <section className="mb-10">
      <div className="welcome-banner-card rounded-xl bg-dash-card p-5 sm:p-8">
        <h1
          className="text-[18px] font-semibold leading-[100%] tracking-[-0.01em] text-dash-primary [font-family:var(--font-poppins),Poppins,sans-serif] sm:text-[32px]"
        >
          Welcome, {companyName} 👋
        </h1>
        <p
          className="mt-3 align-middle text-[14px] font-normal leading-[100%] tracking-normal text-dash-secondary [font-family:var(--font-poppins),Poppins,sans-serif]"
        >
          Manage and streamline your global payroll – in fiat and digital payments, all in one place.
        </p>
      </div>
    </section>
  );
}
