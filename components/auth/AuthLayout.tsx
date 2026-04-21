"use client";

import Logo from "./Logo";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  role: "admin" | "employer" | "employee";
}

const roleLabels = {
  admin: "Admin Portal",
  employer: "User Portal",
  employee: "Employee Portal",
};

const roleFeatures = {
  admin: [
    "Manage companies and employees",
    "Monitor all transactions",
    "Full platform oversight",
  ],
  employer: [
    "Run payroll seamlessly",
    "Manage your workforce",
    "Track payments in real-time",
  ],
  employee: [
    "View your pay details",
    "Request time off easily",
    "Access reports anytime",
  ],
};

export default function AuthLayout({
  children,
  title,
  subtitle,
  role,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Left branding panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[50%] bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
        </div>

        <div className="relative z-10 flex flex-col justify-between w-full p-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              KaloPay
            </span>
          </div>

          {/* Center content */}
          <div className="space-y-8">
            <div>
              <div className="inline-block px-3 py-1 mb-4 text-xs font-medium text-blue-100 bg-white/15 rounded-full backdrop-blur-sm">
                {roleLabels[role]}
              </div>
              <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
                Simplify your
                <br />
                payroll management
              </h1>
              <p className="mt-4 text-lg text-blue-100 max-w-md">
                Streamline payments, manage your team, and stay compliant — all
                in one platform.
              </p>
            </div>

            <div className="space-y-4">
              {roleFeatures[role].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-white/20 flex items-center justify-center">
                    <svg
                      className="h-3.5 w-3.5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-blue-50 text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-sm text-blue-200">
            &copy; {new Date().getFullYear()} KaloPay. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-gray-50">
        <div className="w-full max-w-[440px]">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <Logo size="md" />
          </div>

          <div className="space-y-2 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-gray-500">{subtitle}</p>
            )}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
