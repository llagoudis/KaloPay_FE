"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Table from "@/components/ui/Table";
import Modal from "@/components/ui/Modal";
import { useAdminWallets, useCreateAdminWallet, useWithdrawFromWallet } from "@/hooks/admin/useAdminWallet";
import type { AdminWallet } from "@/lib/api/admin/wallet";

type WalletRow = AdminWallet & Record<string, unknown>;

const INPUT_CLASS =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

export default function AdminAdminWalletPage() {
  const { data, isLoading, error } = useAdminWallets();
  const createMut = useCreateAdminWallet();
  const withdrawMut = useWithdrawFromWallet();

  const [withdrawWallet, setWithdrawWallet] = useState<AdminWallet | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawDest, setWithdrawDest] = useState("");
  const [withdrawNote, setWithdrawNote] = useState("");
  const [withdrawErr, setWithdrawErr] = useState<string | null>(null);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [createType, setCreateType] = useState<"MASTER" | "GAS">("MASTER");
  const [createAsset, setCreateAsset] = useState("");
  const [createNetwork, setCreateNetwork] = useState("");
  const [createErr, setCreateErr] = useState<string | null>(null);

  const wallets = data?.data ?? [];

  async function handleWithdraw() {
    if (!withdrawWallet) return;
    setWithdrawErr(null);
    if (!withdrawAmount || !withdrawDest) {
      setWithdrawErr("Amount and destination are required.");
      return;
    }
    try {
      await withdrawMut.mutateAsync({
        id: withdrawWallet.id,
        data: {
          amount: withdrawAmount,
          destination: withdrawDest,
          network: withdrawWallet.network,
          note: withdrawNote || undefined,
        },
      });
      setWithdrawSuccess(true);
      setTimeout(() => {
        setWithdrawSuccess(false);
        setWithdrawWallet(null);
        setWithdrawAmount("");
        setWithdrawDest("");
        setWithdrawNote("");
      }, 2000);
    } catch (e) {
      setWithdrawErr((e as Error).message);
    }
  }

  async function handleCreate() {
    setCreateErr(null);
    if (!createAsset || !createNetwork) {
      setCreateErr("Asset and network are required.");
      return;
    }
    try {
      await createMut.mutateAsync({ type: createType, asset: createAsset, network: createNetwork });
      setCreateOpen(false);
      setCreateAsset("");
      setCreateNetwork("");
    } catch (e) {
      setCreateErr((e as Error).message);
    }
  }

  const columns = [
    {
      key: "type" as const,
      header: "Type",
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
    {
      key: "id" as const,
      header: "Actions",
      render: (_v: unknown, row: WalletRow) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setWithdrawWallet(row as AdminWallet);
            setWithdrawErr(null);
            setWithdrawAmount("");
            setWithdrawDest("");
            setWithdrawNote("");
          }}
        >
          Withdraw
        </Button>
      ),
    },
  ];

  return (
    <div className="w-full space-y-6">
      <div className="w-full rounded-[10px] bg-white p-6">
        <h1 className="text-2xl font-semibold text-[#0E1620]">Admin Wallet</h1>
      </div>

      <div className="w-full rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Wallet Summary</h2>
            <p className="text-sm text-gray-500">Master &amp; Gas wallets.</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => { setCreateType("MASTER"); setCreateOpen(true); setCreateErr(null); }}
            >
              + Create Master Wallet
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => { setCreateType("GAS"); setCreateOpen(true); setCreateErr(null); }}
            >
              + Create Gas Wallet
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            Failed to load wallets: {(error as Error).message}
          </div>
        )}

        <Table<WalletRow>
          columns={columns}
          data={wallets as WalletRow[]}
          emptyMessage={isLoading ? "Loading wallets…" : "No wallets yet. Click Create to add one."}
          className="border-0"
        />
      </div>

      {/* Withdraw modal */}
      <Modal
        isOpen={!!withdrawWallet}
        onClose={() => setWithdrawWallet(null)}
        title={`Withdraw from ${withdrawWallet?.asset ?? ""} wallet`}
        size="md"
      >
        {withdrawSuccess ? (
          <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700">
            Withdrawal submitted successfully.
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-400">
                Amount
              </label>
              <input
                type="text"
                placeholder="0.00"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-400">
                Destination Address
              </label>
              <input
                type="text"
                placeholder="0x..."
                value={withdrawDest}
                onChange={(e) => setWithdrawDest(e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-400">
                Note (optional)
              </label>
              <input
                type="text"
                placeholder="Internal note"
                value={withdrawNote}
                onChange={(e) => setWithdrawNote(e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            {withdrawErr && (
              <div className="rounded-md bg-red-50 p-2 text-sm text-red-700">{withdrawErr}</div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" size="md" onClick={() => setWithdrawWallet(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                loading={withdrawMut.isPending}
                onClick={handleWithdraw}
              >
                Confirm Withdraw
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create wallet modal */}
      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title={`Create ${createType} Wallet`}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-400">
              Asset
            </label>
            <input
              type="text"
              placeholder="e.g. BTC, ETH, USDT"
              value={createAsset}
              onChange={(e) => setCreateAsset(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-400">
              Network
            </label>
            <input
              type="text"
              placeholder="e.g. ethereum, tron"
              value={createNetwork}
              onChange={(e) => setCreateNetwork(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>
          {createErr && (
            <div className="rounded-md bg-red-50 p-2 text-sm text-red-700">{createErr}</div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="md" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              loading={createMut.isPending}
              onClick={handleCreate}
            >
              Create
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
