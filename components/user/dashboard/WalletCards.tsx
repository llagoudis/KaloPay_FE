"use client";

import { cn } from "@/lib/utils/cn";

const walletCards = [
  { currency: "Euro", amount: "€5.998600", eur: "€6.00 EUR", address: "1701*****6600", icon: "€", iconBg: "euro" },
  { currency: "BTC", amount: "€5.998600", eur: "€6.00 EUR", address: "1701*****6600", icon: "B", iconBg: "btc" },
  { currency: "USDT (ERC20)", amount: "€5.998600", eur: "€6.00 EUR", address: "1701*****6600", icon: "T", iconBg: "teal" },
  { currency: "USDT (ERC20)", amount: "€5.998600", eur: "€6.00 EUR", address: "1701*****6600", icon: "$", iconBg: "usdc" },
];

export default function WalletCards() {
  function handleCopy(address: string) {
    navigator.clipboard.writeText(address).catch(() => {});
  }

  return (
    <section className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {walletCards.map((card, i) => (
        <div
          key={`${card.currency}-${i}`}
          className="wallet-card box-border rounded-xl border border-solid border-[#d1d5db] bg-[#fafafa] p-6"
        >
          <div className="flex items-start justify-between">
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-white",
                card.iconBg !== "teal" && card.iconBg !== "btc" && card.iconBg !== "euro" && card.iconBg !== "usdc" && "bg-dash-icon"
              )}
              style={
                card.iconBg === "teal"
                  ? { backgroundColor: "#26A17B" }
                  : card.iconBg === "btc"
                    ? { backgroundColor: "#F7931A" }
                    : card.iconBg === "euro"
                      ? {
                          border: "2px solid rgba(255,255,255,0.9)",
                          background: "linear-gradient(180deg, #60A5FA 0%, #6366F1 100%)",
                        }
                      : card.iconBg === "usdc"
                        ? { backgroundColor: "#2775CA" }
                        : undefined
              }
            >
              {card.iconBg === "btc" ? (
                <span className="text-[22px] font-bold leading-none text-white">₿</span>
              ) : card.iconBg === "teal" ? (
                <svg width="26" height="26" viewBox="0 0 26 26" fill="none" className="text-white">
                  <rect x="2" y="4" width="22" height="4" rx="1.5" fill="currentColor" />
                  <rect x="10.5" y="8" width="5" height="14" rx="1.5" fill="currentColor" />
                  <ellipse cx="13" cy="14.5" rx="9" ry="2.8" stroke="currentColor" strokeWidth="2.2" fill="none" />
                </svg>
              ) : card.iconBg === "euro" ? (
                <span className="text-[22px] font-bold leading-none text-white">€</span>
              ) : card.iconBg === "usdc" ? (
                <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                  <circle cx="13" cy="13" r="10" stroke="white" strokeWidth="2" />
                  <text x="13" y="18" textAnchor="middle" fontSize="13" fontWeight="700" fill="white" fontFamily="Arial,sans-serif">$</text>
                </svg>
              ) : (
                card.icon
              )}
            </div>
            <button
              type="button"
              className="wallet-icon-btn wallet-expand-btn flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition"
              aria-label="Expand"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="19" x2="19" y2="5" />
                <polyline points="12 5 19 5 19 12" />
              </svg>
            </button>
          </div>
          <p className="mt-5 align-middle text-[14px] font-normal leading-[100%] tracking-normal text-dash-secondary [font-family:var(--font-poppins),Poppins,sans-serif]">
            {card.currency}
          </p>
          <div className="mt-1 flex items-center justify-between gap-2">
            <p className="align-middle text-[24px] font-semibold leading-[20.54px] tracking-normal text-dash-primary [font-family:var(--font-poppins),Poppins,sans-serif]">
              {card.amount}
            </p>
            <button
              type="button"
              className="flex shrink-0 items-center justify-center text-[#9fa8b5] transition hover:opacity-70"
              aria-label="Scan"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
                <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 9V4h5" />
                  <path d="M15 4h5v5" />
                  <path d="M4 15v5h5" />
                  <path d="M20 15v5h-5" />
                </g>
                <rect x="9.5" y="9.5" width="2.5" height="2.5" rx="0.4" fill="currentColor" />
                <rect x="12.5" y="9.5" width="2.5" height="2.5" rx="0.4" fill="currentColor" />
                <rect x="9.5" y="12.5" width="2.5" height="2.5" rx="0.4" fill="currentColor" />
                <rect x="12.5" y="12.5" width="2.5" height="2.5" rx="0.4" fill="currentColor" />
              </svg>
            </button>
          </div>
          <p className="mt-1 text-sm text-dash-secondary">{card.eur}</p>
          <div className="wallet-address-row mx-2 mt-6 flex items-center justify-between gap-2 border-t border-[#e5e7eb] pt-4">
            <span className="shrink-0 align-middle text-[13px] font-normal leading-[100%] tracking-normal text-dash-secondary [font-family:var(--font-poppins),Poppins,sans-serif]">
              Wallet address
            </span>
            <div className="flex min-w-0 items-center gap-2">
              <span className="truncate align-middle text-[11px] font-medium leading-[100%] tracking-normal text-dash-primary [font-family:var(--font-inter),Inter,sans-serif]">
                {card.address}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(card.address)}
                className="flex shrink-0 items-center justify-center transition hover:opacity-80"
                style={{ color: "#9da5b3" }}
                aria-label="Copy address"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.75" />
                  <path
                    d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    fill="none"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
