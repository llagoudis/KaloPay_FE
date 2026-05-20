"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import Table from "@/components/ui/Table";
import { cn } from "@/lib/utils/cn";
import { ROUTES } from "@/lib/constants/routes";
import {
  getAdminCryptoWallets,
  getClientCryptoWallets,
  type CryptoAdminWallet,
  type CryptoClientWallet,
} from "@/lib/api/admin/cryptoWallet";
import { useAdminAuthStore } from "@/store/adminAuthStore";

type WalletTab = "client" | "master" | "gas" | "commission";

type ClientWalletRow = {
  id: string;
  date: string;
  companyId: string;
  companyName: string;
  assetId: string;
  address: string;
  balance: string;
};

type MasterWalletCard = {
  id: string;
  currency: string;
  code: string;
  amount: string;
  fiatAmount: string;
  walletAddress: string;
  walletAddressMasked: string;
  iconBg: string;
  iconEmoji: string;
};

function assetIconBg(code: string): string {
  const c = code.toUpperCase();
  if (c.startsWith("BTC")) return "#F7931A";
  if (c.startsWith("ETH")) return "#627EEA";
  if (c.startsWith("USDT")) return "#26A17B";
  if (c.startsWith("USDC")) return "#2775CA";
  if (c.startsWith("EUR")) return "#E5F0FF";
  if (c.startsWith("BNB")) return "#F3BA2F";
  if (c.startsWith("MATIC") || c.startsWith("POL")) return "#8247E5";
  if (c.startsWith("TRX") || c.startsWith("TRON")) return "#EB0029";
  return "#94A3B8";
}

function assetIconChar(code: string): string {
  const c = code.toUpperCase();
  if (c.startsWith("BTC")) return "₿";
  if (c.startsWith("ETH")) return "Ξ";
  if (c.startsWith("USDT")) return "T";
  if (c.startsWith("USDC")) return "$";
  if (c.startsWith("EUR")) return "€";
  if (c.startsWith("BNB")) return "B";
  if (c.startsWith("MATIC") || c.startsWith("POL")) return "M";
  if (c.startsWith("TRX") || c.startsWith("TRON")) return "T";
  return c[0] ?? "?";
}

function maskAddress(addr: string): string {
  if (!addr || addr.length <= 10) return addr;
  return `${addr.slice(0, 5)}*****${addr.slice(-4)}`;
}

function toMasterCard(w: CryptoAdminWallet): MasterWalletCard {
  const code = (w.asset_id ?? w.kraken_asset_id ?? "?").toUpperCase();
  return {
    id: `${w.id}`,
    currency: w.asset_name ?? code,
    code,
    amount: `${Number(w.balance ?? 0).toFixed(6)} ${code}`,
    fiatAmount: "",
    walletAddress: w.address ?? "",
    walletAddressMasked: maskAddress(w.address ?? ""),
    iconBg: assetIconBg(code),
    iconEmoji: assetIconChar(code),
  };
}

type CommissionWalletRow = {
  currency: "USDT" | "BTC" | "USDC";
  address: string;
  balance: string;
  privateKey: string;
  publicKey: string;
};


export default function AdminWalletPage() {
  const [activeTab, setActiveTab] = useState<WalletTab>("master");
  const [search, setSearch] = useState("");
  const token = useAdminAuthStore((s) => s.token);

  const adminWalletsQuery = useQuery({
    queryKey: ["admin", "crypto-wallet", "all"],
    queryFn: () => getAdminCryptoWallets(token!),
    enabled: !!token,
  });
  const clientWalletsQuery = useQuery({
    queryKey: ["admin", "crypto-wallet", "client", search],
    queryFn: () =>
      getClientCryptoWallets(token!, { pageSize: 50, pageNumber: 1, search: search || undefined }),
    enabled: !!token,
  });

  const masterWallets: MasterWalletCard[] = useMemo(
    () => (adminWalletsQuery.data?.master ?? []).map(toMasterCard),
    [adminWalletsQuery.data]
  );
  const gasWallets: MasterWalletCard[] = useMemo(
    () => (adminWalletsQuery.data?.gas ?? []).map(toMasterCard),
    [adminWalletsQuery.data]
  );

  const filteredWallets: ClientWalletRow[] = useMemo(() => {
    const rows = (clientWalletsQuery.data?.wallets ?? []).map((w: CryptoClientWallet) => ({
      id: String(w.id),
      date: w.created_at ? new Date(w.created_at).toLocaleString() : "—",
      companyId: w.company_id != null ? String(w.company_id) : "",
      companyName: w.company_name ?? w.wallet_name ?? "—",
      assetId: w.asset_id ?? w.asset_name ?? "—",
      address: w.address ?? "—",
      balance: Number(w.balance ?? 0).toFixed(6),
    }));
    if (!search) return rows;
    const q = search.toLowerCase();
    return rows.filter(
      (w) =>
        w.id.toLowerCase().includes(q) ||
        w.companyName.toLowerCase().includes(q) ||
        w.assetId.toLowerCase().includes(q) ||
        w.address.toLowerCase().includes(q) ||
        w.balance.toLowerCase().includes(q)
    );
  }, [clientWalletsQuery.data, search]);

  const tabs: { key: WalletTab; label: string }[] = [
    { key: "client", label: "Client Wallets" },
    { key: "master", label: "Master Wallet" },
    { key: "gas", label: "Gas Wallet" },
    { key: "commission", label: "Commission Wallet" },
  ];

  const columns = [
    { key: "id" as const, header: "ID", headerClassName: "whitespace-nowrap" },
    { key: "date" as const, header: "Date", headerClassName: "whitespace-nowrap" },
    {
      key: "companyName" as const,
      header: "Company",
      headerClassName: "whitespace-nowrap",
      render: (_: unknown, row: ClientWalletRow) => (
        <Link
          href={ROUTES.admin.companyDetail(row.companyId)}
          className="font-medium text-blue-600 hover:underline"
        >
          {row.companyName}
        </Link>
      ),
    },
    { key: "assetId" as const, header: "Asset ID", headerClassName: "whitespace-nowrap" },
    {
      key: "address" as const,
      header: "Address",
      headerClassName: "whitespace-nowrap",
      className: "min-w-[200px]",
      render: (value: unknown) => (
        <span className="inline-flex items-center gap-1.5">
          <span className="font-mono text-gray-700">{String(value)}</span>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(String(value))}
            className="inline-flex text-gray-400 hover:text-gray-600"
            title="Copy address"
            aria-label="Copy address"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </span>
      ),
    },
    {
      key: "balance" as const,
      header: "Balance",
      headerClassName: "whitespace-nowrap text-right",
      className: "text-right",
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Card 1: Title only */}
      <div className="w-full rounded-[10px] bg-white" style={{ padding: "24px" }}>
        <h1
          className="admin-page-heading align-middle font-semibold"
          style={{
            fontFamily: "var(--font-poppins), Poppins, sans-serif",
            fontWeight: 600,
            fontSize: "24px",
            lineHeight: "26px",
            letterSpacing: "0px",
            color: "#0E1620",
          }}
        >
          Wallet Summary
        </h1>
      </div>

      {/* Tabs — responsive: scrollable on mobile, stretched buttons on desktop */}
      <div
        className="admin-tab-strip w-full overflow-x-auto bg-white md:overflow-visible"
        style={{
          height: 56,
          padding: 8,
          borderRadius: 16,
          boxShadow: "none",
          border: "1px solid #E5E5E5",
        }}
      >
        <div className="flex w-max items-center gap-[10px] md:w-full">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "rounded-[10px] px-4 py-2 text-center text-sm font-medium transition-all whitespace-nowrap md:min-w-0 md:flex-1",
                activeTab === tab.key
                  ? "admin-tab-btn--active bg-[#0F50DB] text-white"
                  : "admin-tab-btn--inactive bg-transparent text-gray-500"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Client Wallets content */}
      {activeTab === "client" && (
        <div className="w-full rounded-[10px] bg-white p-6">
          <h2
            className="admin-section-heading mb-4 font-semibold"
            style={{
              fontFamily: "var(--font-poppins), Poppins, sans-serif",
              fontSize: "18px",
              lineHeight: "24px",
              color: "#0E1620",
            }}
          >
            Client Wallets
          </h2>

          <label className="relative mb-6 block">
            <span className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="search"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </label>

          <Table<ClientWalletRow>
            columns={columns}
            data={filteredWallets}
            bordered={true}
            className="admin-list-table border-0"
            tableClassName="[&_td]:!py-5 [&_th]:!py-5"
            emptyMessage="No client wallets found."
          />
        </div>
      )}

      {/* Master Wallet content */}
      {activeTab === "master" && (
        <div className="w-full rounded-[10px] bg-white p-6">
          <div className="mb-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2
              className="admin-section-heading font-semibold"
              style={{
                fontFamily: "var(--font-poppins), Poppins, sans-serif",
              fontSize: "16px",
              lineHeight: "22px",
                color: "#0E1620",
              }}
            >
              Master Wallet
            </h2>
            <button
              type="button"
              className="w-full rounded-lg bg-[#0F50DB] px-4 py-2 text-sm font-medium text-white  hover:bg-[#0D46C3] sm:w-auto"
            >
              + Create Client Wallet
            </button>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {masterWallets.length === 0 ? (
              <div className="col-span-full rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
                {adminWalletsQuery.isLoading
                  ? "Loading master wallets…"
                  : "No master wallets yet. Create one from the /admin/admin-wallet panel."}
              </div>
            ) : null}
            {masterWallets.map((card) => (
              <div
                key={card.id}
                className="admin-wallet-balance-card flex flex-col justify-between rounded-2xl p-5"
              >
                {/* Top block: icon, Euro, amount, €5.00 EUR stacked; right side icons same */}
                <div className="flex items-start justify-between gap-4">
                  {/* Left: icon, Euro, amount, €5.00 EUR vertically aligned under icon */}
                  <div className="flex flex-col items-start gap-2">
                    <div
                      className={`flex h-[48px] w-[48px] items-center justify-center rounded-full ${card.id === "eur" ? "overflow-hidden" : card.id === "usdt2" ? "p-1" : "p-2.5"}`}
                      style={{ backgroundColor: card.iconBg }}
                    >
                      {card.id === "eur" ? (
                        <img
                          src="/icons/Euro.png"
                          alt="Euro"
                          className="h-full w-full object-cover"
                        />
                      ) : card.id === "usdt1" ? (
                        /* Tether (USDT) logo */
                        <svg viewBox="0 0 100 100" className="h-8 w-8" fill="white" aria-hidden="true">
                          {/* Top horizontal bar */}
                          <rect x="10" y="18" width="80" height="14" rx="7" />
                          {/* Upper stem */}
                          <rect x="43" y="32" width="14" height="16" />
                          {/* Oval ring band */}
                          <ellipse cx="50" cy="56" rx="26" ry="7" fill="white" />
                          <ellipse cx="50" cy="54" rx="20" ry="4.5" fill="#26a17b" />
                          {/* Lower stem */}
                          <rect x="43" y="60" width="14" height="22" rx="3" />
                        </svg>
                      ) : card.id === "usdt2" ? (
                        /* USD Coin (USDC) logo */
                        <svg viewBox="0 0 100 100" className="h-9 w-9" fill="none" aria-hidden="true">
                          {/* Outer ring */}
                          <circle cx="50" cy="50" r="44" stroke="white" strokeWidth="7" />
                          {/* Dollar top dandi */}
                          <line x1="50" y1="20" x2="50" y2="36" stroke="white" strokeWidth="7" strokeLinecap="round"/>
                          {/* Dollar bottom dandi */}
                          <line x1="50" y1="74" x2="50" y2="80" stroke="white" strokeWidth="7" strokeLinecap="round"/>
                          {/* Dollar S-curve */}
                          <path d="M57 37c-2-4-6-6-10-5-4 1-7 4-7 8 0 6 4.5 8.5 9 10 4.5 1.5 9 4 9 10 0 4.5-3 7-7 8-4 .8-8-1-10-5"
                            stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <span
                          className={cn(
                            "text-base font-semibold text-white",
                            card.id === "btc" && "text-2xl rotate-6"
                          )}
                        >
                          {card.iconEmoji}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2 w-full">
                      <p className="text-sm font-medium text-gray-400">{card.currency}</p>
                      {/* Amount row only on left; scan icon moves to right column under arrow */}
                    <p
                      className="admin-wallet-balance-amount font-semibold text-gray-900"
                      style={{
                        fontFamily: "var(--font-poppins), Poppins, sans-serif",
                        fontWeight: 600,
                        fontSize: "24px",
                        lineHeight: "20.54px",
                        letterSpacing: "0%",
                        verticalAlign: "middle",
                      }}
                    >
                      {card.amount}
                    </p>
                      <p className="text-xs text-gray-400">{card.fiatAmount}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-10">
                    <button
                      type="button"
                      className="inline-flex h-[42px] w-[42px] items-center justify-center rounded-[12px] hover:opacity-90"
                      style={{ backgroundColor: "#F3F5F9" }}
                      aria-label="Expand wallet"
                    >
                      <span className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-[7px]" style={{ backgroundColor: "#dadce0" }}>
                        <svg className="h-4 w-4" fill="none" stroke="#5f6368" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 17L17 7M17 7H7M17 7v10" />
                        </svg>
                      </span>
                    </button>
                    <button
                      type="button"
                      className="inline-flex h-[42px] w-[42px] items-center justify-center rounded-[12px] hover:opacity-90"
                      style={{ backgroundColor: "#F3F5F9", color: "#9EA6B3" }}
                      aria-label="Show QR code"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {/* Outer corner brackets */}
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                          d="M3 9V6a3 3 0 013-3h3M15 3h3a3 3 0 013 3v3M21 15v3a3 3 0 01-3 3h-3M9 21H6a3 3 0 01-3-3v-3" />
                        {/* 4 inner squares */}
                        <rect x="6.5" y="6.5" width="4" height="4" rx="0.8" strokeWidth={1.6} />
                        <rect x="13.5" y="6.5" width="4" height="4" rx="0.8" strokeWidth={1.6} />
                        <rect x="6.5" y="13.5" width="4" height="4" rx="0.8" strokeWidth={1.6} />
                        <rect x="13.5" y="13.5" width="4" height="4" rx="0.8" strokeWidth={1.6} />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-2 border-t border-gray-200 pt-3 text-xs">
                  <span className="text-[11px] text-gray-400">Wallet address</span>
                  <span className="font-mono font-medium text-gray-700">
                    {card.walletAddressMasked}
                  </span>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(card.walletAddress)}
                    className="inline-flex h-5 w-5 items-center justify-center text-gray-400 hover:text-gray-600"
                    aria-label="Copy wallet address"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gas Wallet content */}
      {activeTab === "gas" && (
        <div className="w-full rounded-[10px] bg-white p-6">
          <div className="mb-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2
              className="admin-section-heading font-semibold"
              style={{
                fontFamily: "var(--font-poppins), Poppins, sans-serif",
              fontSize: "16px",
              lineHeight: "22px",
                color: "#0E1620",
              }}
            >
              Gas Wallet
            </h2>
            <button
              type="button"
              className="w-full rounded-lg bg-[#2962FF] px-4 py-2 text-sm font-medium text-white  hover:bg-[#1f4ed6] sm:w-auto"
            >
              + Create Gas Wallet
            </button>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-2">
            {gasWallets.length === 0 ? (
              <div className="col-span-full rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
                {adminWalletsQuery.isLoading
                  ? "Loading gas wallets…"
                  : "No gas wallets yet. Create one from the /admin/admin-wallet panel."}
              </div>
            ) : null}
            {gasWallets.map((card) => (
            <div key={card.id} className="admin-wallet-balance-card flex flex-col justify-between rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col items-start gap-2">
                  <div
                    className="flex h-[48px] w-[48px] items-center justify-center rounded-full p-2.5 text-white font-semibold"
                    style={{ backgroundColor: card.iconBg }}
                  >
                    {card.iconEmoji}
                  </div>
                  <div className="space-y-2 w-full">
                    <p className="text-sm font-medium text-gray-400">{card.currency}</p>
                    <p
                      className="admin-wallet-balance-amount font-semibold text-gray-900"
                      style={{
                        fontFamily: "var(--font-poppins), Poppins, sans-serif",
                        fontWeight: 600,
                        fontSize: "24px",
                        lineHeight: "20.54px",
                        letterSpacing: "0%",
                        verticalAlign: "middle",
                      }}
                    >
                      {card.amount}
                    </p>
                    <p className="text-xs text-gray-400">{card.fiatAmount}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-10">
                  <button
                    type="button"
                    className="inline-flex h-[42px] w-[42px] items-center justify-center rounded-[12px] hover:opacity-90"
                    style={{ backgroundColor: "#F3F5F9", color: "#9EA6B3" }}
                    aria-label="Expand wallet"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 17L17 7M17 7H7M17 7v10"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-[42px] w-[42px] items-center justify-center rounded-[12px] hover:opacity-90"
                    style={{ backgroundColor: "#F3F5F9", color: "#9EA6B3" }}
                    aria-label="Show QR code"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 5h4v4H5zM15 5h4v4h-4zM5 15h4v4H5zM15 15h1m2 0h1m-4 4h1m2 0h1m-5-5v-1m0-2v-1"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 border-t border-gray-200 pt-3 text-xs">
                <span className="text-[11px] text-gray-400">Wallet address</span>
                <span className="font-mono font-medium text-gray-700">
                  {card.walletAddressMasked}
                </span>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(card.walletAddress)}
                  className="inline-flex h-5 w-5 items-center justify-center text-gray-400 hover:text-gray-600"
                  aria-label="Copy wallet address"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>
              </div>
            </div>
            ))}
          </div>
        </div>
      )}

      {/* Commission Wallet content */}
      {activeTab === "commission" && (
        <div className="w-full rounded-[10px] bg-white p-6">
          <div className="mb-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2
              className="admin-section-heading font-semibold"
              style={{
                fontFamily: "var(--font-poppins), Poppins, sans-serif",
              fontSize: "16px",
              lineHeight: "22px",
                color: "#0E1620",
              }}
            >
              Commission Wallet
            </h2>
          </div>
          <div className="mb-4 rounded-md border border-dashed border-gray-300 p-4 text-sm text-gray-500">
            Commission wallet configuration isn&apos;t live yet — coming in the next release. Master and gas wallets above are fully functional.
          </div>

          <label className="relative mb-4 block w-full">
            <span className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
            <input
              type="search"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </label>

          {/* Single content area: table directly inside, no extra inner card */}
          <div className="admin-wallet-commission-table-wrap overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm text-gray-700">
              <thead className="text-xs font-medium text-gray-500">
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 font-medium">Currency</th>
                  <th className="px-4 py-3 font-medium">Address</th>
                  <th className="px-4 py-3 font-medium text-right">Balance</th>
                  <th className="px-4 py-3 font-medium text-center">Private Key</th>
                  <th className="px-4 py-3 font-medium text-center">Public Key</th>
                  <th className="px-4 py-3 font-medium text-center">Transfer</th>
                </tr>
              </thead>
              <tbody className="admin-table-row-dividers">
                {([] as Array<{ currency: "USDT" | "BTC" | "USDC"; address: string; balance: string; privateKey: string; publicKey: string }>).map((row, idx) => (
                  <tr key={`${row.currency}-${idx}`} className="bg-transparent">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white"
                          style={{
                            backgroundColor:
                              row.currency === "USDT"
                                ? "#26A17B"
                                : row.currency === "BTC"
                                ? "#F7931A"
                                : "#2775CA",
                          }}
                        >
                          {row.currency === "USDC" ? "$" : row.currency[0]}
                        </div>
                        <span className="text-sm font-medium text-gray-800">
                          {row.currency}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="font-mono text-gray-700">{row.address}</span>
                        <button
                          type="button"
                          onClick={() => navigator.clipboard.writeText(row.address)}
                          className="inline-flex h-5 w-5 items-center justify-center text-gray-400 hover:text-gray-600"
                          aria-label="Copy address"
                        >
                          <svg
                            className="h-3.5 w-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        </button>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-800">
                      <span className="inline-flex items-center justify-end gap-1.5 w-full">
                        <span>{row.balance}</span>
                        <button
                          type="button"
                          onClick={() => navigator.clipboard.writeText(row.balance)}
                          className="inline-flex h-5 w-5 items-center justify-center text-gray-400 hover:text-gray-600"
                          aria-label="Copy balance"
                        >
                          <svg
                            className="h-3.5 w-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        </button>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        className="inline-flex h-5 w-5 items-center justify-center text-gray-400"
                        aria-label="Copy private key"
                      >
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        className="inline-flex h-5 w-5 items-center justify-center text-gray-400"
                        aria-label="Copy public key"
                      >
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        className="inline-flex h-5 w-5 items-center justify-center text-gray-400"
                        aria-label="Transfer"
                      >
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 10.5l18-7-7 18-3.5-6.5L3 10.5z"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}