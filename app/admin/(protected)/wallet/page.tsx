"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Table from "@/components/ui/Table";
import { cn } from "@/lib/utils/cn";
import { ROUTES } from "@/lib/constants/routes";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import {
  getAdminCryptoWallets,
  getClientCryptoWallets,
  createAdminCryptoWallet,
  createClientCryptoWallet,
  type CryptoAdminWallet,
  type CryptoClientWallet,
} from "@/lib/api/admin/cryptoWallet";

type WalletTab = "client" | "master" | "gas" | "commission";

// Asset color map
const ASSET_COLORS: Record<string, string> = {
  BTC: "#F7931A",
  ETH: "#627EEA",
  USDC_ERC20: "#2775CA",
  USDT_ERC20: "#26A17B",
  USDC_BSC: "#2775CA",
  USDT_BSC: "#26A17B",
  USDC_TRC20: "#2775CA",
  USDT_TRC20: "#26A17B",
  USDC_POLYGON: "#2775CA",
  USDT_POLYGON: "#26A17B",
  USDC_e_POLYGON: "#2775CA",
};

const ASSET_SYMBOLS: Record<string, string> = {
  BTC: "B",
  ETH: "E",
  USDC_ERC20: "$",
  USDT_ERC20: "T",
  USDC_BSC: "$",
  USDT_BSC: "T",
  USDC_TRC20: "$",
  USDT_TRC20: "T",
  USDC_POLYGON: "$",
  USDT_POLYGON: "T",
  USDC_e_POLYGON: "$",
};

function maskAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return address.slice(0, 6) + "****" + address.slice(-4);
}

export default function AdminWalletPage() {
  const [activeTab, setActiveTab] = useState<WalletTab>("master");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [walletNameInput, setWalletNameInput] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Data states
  const [masterWallets, setMasterWallets] = useState<CryptoAdminWallet[]>([]);
  const [gasWallets, setGasWallets] = useState<CryptoAdminWallet[]>([]);
  const [clientWallets, setClientWallets] = useState<CryptoClientWallet[]>([]);

  const token = useAdminAuthStore((s) => s.token);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [adminData, clientData] = await Promise.all([
        getAdminCryptoWallets(token),
        getClientCryptoWallets(token, { pageSize: 100 }),
      ]);

      setMasterWallets(adminData.master || []);
      setGasWallets(adminData.gas || []);
      setClientWallets(clientData.wallets || []);
    } catch (err) {
      console.error("Failed to fetch wallet data:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreateAdminWallet = async (type: "MASTER" | "GAS") => {
    if (!token || creating) return;
    setCreating(true);
    try {
      await createAdminCryptoWallet(token, type);
      await fetchData();
    } catch (err) {
      console.error("Failed to create wallet:", err);
      alert(err instanceof Error ? err.message : "Failed to create wallet");
    } finally {
      setCreating(false);
    }
  };

  const handleCreateClientWallet = async () => {
    if (!token || !walletNameInput.trim() || creating) return;
    setCreating(true);
    try {
      await createClientCryptoWallet(token, { walletName: walletNameInput.trim() });
      setWalletNameInput("");
      setShowCreateModal(false);
      await fetchData();
    } catch (err) {
      console.error("Failed to create client wallet:", err);
      alert(err instanceof Error ? err.message : "Failed to create wallet");
    } finally {
      setCreating(false);
    }
  };

  const filteredClientWallets = clientWallets.filter(
    (w) =>
      w.wallet_name?.toLowerCase().includes(search.toLowerCase()) ||
      w.asset_id?.toLowerCase().includes(search.toLowerCase()) ||
      w.address?.toLowerCase().includes(search.toLowerCase()) ||
      w.company_name?.toLowerCase().includes(search.toLowerCase())
  );

  const tabs: { key: WalletTab; label: string }[] = [
    { key: "client", label: "Client Wallets" },
    { key: "master", label: "Master Wallet" },
    { key: "gas", label: "Gas Wallet" },
    { key: "commission", label: "Commission Wallet" },
  ];

  const clientColumns = [
    { key: "vault_id" as const, header: "Vault ID", headerClassName: "whitespace-nowrap" },
    {
      key: "created_at" as const,
      header: "Date",
      headerClassName: "whitespace-nowrap",
      render: (v: unknown) => {
        const d = new Date(String(v));
        return d.toLocaleDateString("en-GB") + " " + d.toLocaleTimeString("en-GB", { hour12: true });
      },
    },
    {
      key: "company_name" as const,
      header: "Company",
      headerClassName: "whitespace-nowrap",
      render: (_: unknown, row: CryptoClientWallet) =>
        row.company_id ? (
          <Link href={ROUTES.admin.companyDetail(String(row.company_id))} className="font-medium text-blue-600 hover:underline">
            {row.company_name || "N/A"}
          </Link>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
    {
      key: "wallet_name" as const,
      header: "Wallet",
      headerClassName: "whitespace-nowrap",
    },
    { key: "asset_id" as const, header: "Asset", headerClassName: "whitespace-nowrap" },
    {
      key: "address" as const,
      header: "Address",
      headerClassName: "whitespace-nowrap",
      className: "min-w-[200px]",
      render: (value: unknown) => (
        <span className="inline-flex items-center gap-1.5">
          <span className="font-mono text-gray-700">{maskAddress(String(value))}</span>
          <button type="button" onClick={() => navigator.clipboard.writeText(String(value))} className="inline-flex text-gray-400 hover:text-gray-600" title="Copy address">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </span>
      ),
    },
    { key: "balance" as const, header: "Balance", headerClassName: "whitespace-nowrap text-right", className: "text-right" },
  ];

  // Wallet card component for master/gas wallets
  const WalletCard = ({ wallet }: { wallet: CryptoAdminWallet }) => (
    <div className="admin-wallet-balance-card flex flex-col justify-between rounded-2xl border border-gray-100 bg-[#FBFBFB] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col items-start gap-2">
          <div className="flex h-[42px] w-[42px] items-center justify-center rounded-full shadow-sm overflow-hidden" style={{ backgroundColor: ASSET_COLORS[wallet.asset_id] || "#627EEA" }}>
            <span className="text-base font-semibold text-white">{ASSET_SYMBOLS[wallet.asset_id] || wallet.asset_id[0]}</span>
          </div>
          <div className="space-y-2 w-full">
            <p className="text-sm font-medium text-gray-800">{wallet.asset_name || wallet.asset_id}</p>
            <p className="font-semibold" style={{ fontFamily: "var(--font-poppins), Poppins, sans-serif", fontWeight: 600, fontSize: "24px", lineHeight: "20.54px", color: "#1B2A3C" }}>
              {parseFloat(wallet.balance || "0").toFixed(6)}
            </p>
            <p className="text-xs text-gray-400">{wallet.network}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-10">
          <button type="button" className="inline-flex h-[42px] w-[42px] items-center justify-center rounded-[12px] shadow-sm hover:opacity-90" style={{ backgroundColor: "#F3F5F9", color: "#9EA6B3" }} aria-label="Open wallet">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 3h7m0 0v7m0-7L10 14" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5l-.707.707A4 4 0 004 8.828V19a2 2 0 002 2h10.172a4 4 0 002.121-.586L19 20" />
            </svg>
          </button>
        </div>
      </div>
      <div className="mt-5 flex items-center gap-2 border-t border-gray-200 pt-3 text-xs">
        <span className="text-[11px] text-gray-400">Wallet address</span>
        <span className="font-mono font-medium text-gray-700">{maskAddress(wallet.address)}</span>
        <button type="button" onClick={() => navigator.clipboard.writeText(wallet.address)} className="inline-flex h-5 w-5 items-center justify-center text-gray-400 hover:text-gray-600" aria-label="Copy wallet address">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full space-y-6">
      {/* Card 1: Title only */}
      <div className="admin-page-title-strip w-full rounded-[10px] bg-white" style={{ padding: "24px" }}>
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
        className="admin-tab-strip w-full overflow-x-auto border-0 bg-white md:overflow-visible"
        style={{ height: 56, padding: 8, borderRadius: 16, boxShadow: "none" }}
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

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      )}

      {/* Client Wallets */}
      {!loading && activeTab === "client" && (
        <div className="w-full rounded-[10px] bg-white p-6">
          <div className="mb-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-semibold" style={{ fontFamily: "var(--font-poppins), Poppins, sans-serif", fontSize: "18px", lineHeight: "24px", color: "#0E1620" }}>
              Client Wallets
            </h2>
            <button type="button" onClick={() => setShowCreateModal(true)}
              className="w-full rounded-lg bg-[#2962FF] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#1f4ed6] sm:w-auto">
              + Create Client Wallet
            </button>
          </div>

          <label className="relative mb-6 block">
            <span className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </span>
            <input type="search" placeholder="Search wallets..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </label>

          {clientWallets.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No client wallets created yet. Click &quot;Create Client Wallet&quot; to get started.</p>
          ) : (
            <Table
              columns={clientColumns as never}
              data={filteredClientWallets as never}
              bordered={true}
              className="border-0"
              tableClassName="[&_td]:!py-5 [&_th]:!py-5"
              emptyMessage="No matching wallets found."
            />
          )}
        </div>
      )}

      {/* Master Wallet */}
      {!loading && activeTab === "master" && (
        <div className="w-full rounded-[10px] bg-white p-6">
          <div className="mb-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-semibold" style={{ fontFamily: "var(--font-poppins), Poppins, sans-serif", fontSize: "16px", lineHeight: "22px", color: "#0E1620" }}>
              Master Wallet
            </h2>
            {masterWallets.length === 0 && (
              <button type="button" onClick={() => handleCreateAdminWallet("MASTER")} disabled={creating}
                className="w-full rounded-lg bg-[#2962FF] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#1f4ed6] disabled:opacity-50 sm:w-auto">
                {creating ? "Creating..." : "+ Create Master Wallet"}
              </button>
            )}
          </div>

          {masterWallets.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No master wallet created yet.</p>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {masterWallets.map((wallet) => (
                <WalletCard key={wallet.id} wallet={wallet} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Gas Wallet */}
      {!loading && activeTab === "gas" && (
        <div className="w-full rounded-[10px] bg-white p-6">
          <div className="mb-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-semibold" style={{ fontFamily: "var(--font-poppins), Poppins, sans-serif", fontSize: "16px", lineHeight: "22px", color: "#0E1620" }}>
              Gas Wallet
            </h2>
            {gasWallets.length === 0 && (
              <button type="button" onClick={() => handleCreateAdminWallet("GAS")} disabled={creating}
                className="w-full rounded-lg bg-[#2962FF] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#1f4ed6] disabled:opacity-50 sm:w-auto">
                {creating ? "Creating..." : "+ Create Gas Wallet"}
              </button>
            )}
          </div>

          {gasWallets.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No gas wallet created yet.</p>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {gasWallets.map((wallet) => (
                <WalletCard key={wallet.id} wallet={wallet} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Commission Wallet — uses existing internal wallets, not crypto */}
      {!loading && activeTab === "commission" && (
        <div className="w-full rounded-[10px] bg-white p-6">
          <h2 className="mb-4 font-semibold" style={{ fontFamily: "var(--font-poppins), Poppins, sans-serif", fontSize: "16px", lineHeight: "22px", color: "#0E1620" }}>
            Commission Wallet
          </h2>
          <p className="text-center text-gray-400 py-8">Commission wallets are managed through the internal wallet system.</p>
        </div>
      )}

      {/* Create Client Wallet Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Create Client Wallet</h3>
            <label className="mb-1 block text-sm font-medium text-gray-700">Wallet Name</label>
            <input type="text" value={walletNameInput} onChange={(e) => setWalletNameInput(e.target.value)} placeholder="e.g. Company ABC Wallet"
              className="mb-4 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => { setShowCreateModal(false); setWalletNameInput(""); }}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button type="button" onClick={handleCreateClientWallet} disabled={creating || !walletNameInput.trim()}
                className="rounded-lg bg-[#2962FF] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#1f4ed6] disabled:opacity-50">
                {creating ? "Creating..." : "Create Wallet"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
