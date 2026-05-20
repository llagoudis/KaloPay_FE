"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminCryptoWallet,
  getAdminCryptoWallets,
  type CryptoAdminWallet,
} from "@/lib/api/admin/cryptoWallet";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Table from "@/components/ui/Table";

function useAdminToken() {
  return useAdminAuthStore((s) => s.token);
}

function useAdminWallets() {
  const token = useAdminToken();
  return useQuery({
    queryKey: ["admin", "crypto-wallet", "summary"],
    queryFn: () => getAdminCryptoWallets(token!),
    enabled: !!token,
  });
}

function useCreateAdminWallet() {
  const token = useAdminToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (walletType: "MASTER" | "GAS") => createAdminCryptoWallet(token!, walletType),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "crypto-wallet"] });
    },
  });
}

type WalletRow = {
  id: number;
  type: string;
  asset: string;
  address: string;
  balance: string;
  network: string;
};

function toRow(w: CryptoAdminWallet, type: string): WalletRow {
  return {
    id: w.id,
    type,
    asset: w.asset_name ?? w.asset_id ?? "—",
    address: w.address ?? "—",
    balance: String(w.balance ?? "0"),
    network: w.network ?? "—",
  };
}

export default function AdminAdminWalletPage() {
  const { data, isLoading, error } = useAdminWallets();
  const createMut = useCreateAdminWallet();
  const [creating, setCreating] = useState<"MASTER" | "GAS" | null>(null);

  const rows: WalletRow[] = [
    ...(data?.master ?? []).map((w) => toRow(w, "MASTER")),
    ...(data?.gas ?? []).map((w) => toRow(w, "GAS")),
  ];

  const handleCreate = async (type: "MASTER" | "GAS") => {
    setCreating(type);
    try {
      await createMut.mutateAsync(type);
    } catch (e) {
      alert(`Failed to create ${type} wallet: ${(e as Error).message}`);
    } finally {
      setCreating(null);
    }
  };

  const columns = [
    {
      key: "type" as const,
      header: "Wallet Type",
      render: (v: unknown) => (
        <Badge label={String(v)} variant={String(v) === "MASTER" ? "info" : "warning"} />
      ),
    },
    { key: "asset" as const, header: "Asset" },
    {
      key: "address" as const,
      header: "Address",
      render: (v: unknown) => (
        <span className="break-all font-mono text-xs">{String(v)}</span>
      ),
    },
    { key: "balance" as const, header: "Balance" },
    { key: "network" as const, header: "Network" },
  ];

  return (
    <div className="w-full space-y-6">
      <div className="w-full rounded-[10px] bg-white" style={{ padding: "24px" }}>
        <h1
          className="admin-page-heading align-middle font-semibold"
          style={{
            fontFamily: "var(--font-poppins), Poppins, sans-serif",
            fontWeight: 600,
            fontSize: "24px",
            lineHeight: "26px",
            color: "#0E1620",
          }}
        >
          Admin Wallet
        </h1>
      </div>

      <div className="w-full rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Wallet Summary</h2>
            <p className="text-sm text-gray-500">
              Master &amp; Gas wallets across BTC, ETH, BSC, Polygon and Tron networks.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => handleCreate("MASTER")}
              loading={creating === "MASTER"}
              disabled={createMut.isPending}
            >
              + Create Master Wallet
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => handleCreate("GAS")}
              loading={creating === "GAS"}
              disabled={createMut.isPending}
            >
              + Create Gas Wallet
            </Button>
          </div>
        </div>

        {error ? (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            Failed to load wallets: {(error as Error).message}
          </div>
        ) : null}

        <Table<WalletRow>
          columns={columns}
          data={rows}
          emptyMessage={isLoading ? "Loading wallets…" : "No wallets yet. Click Create to add one."}
          className="border-0"
        />
      </div>
    </div>
  );
}
