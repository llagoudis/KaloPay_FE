"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import Table from "@/components/ui/Table";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { cn } from "@/lib/utils/cn";
import {
  useAdministrators,
  useCreateAdministrator,
  useDeleteAdministrator,
  useUpdateAdministrator,
} from "@/hooks/admin/useAdministrators";

type AdministratorRow = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  enabled: boolean;
  twoFactorAuth: boolean;
};

type AdministratorTableRow = AdministratorRow & { actions: null };

function splitName(full: string): { firstName: string; lastName: string } {
  const trimmed = (full ?? "").trim();
  if (!trimmed) return { firstName: "", lastName: "" };
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

type AdminFormMode = "create" | "edit";

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-6 0-10-7-10-7a13.15 13.15 0 013.65-4.65M9.9 4.24A13.42 13.42 0 0112 4c6 0 10 7 10 7a13.15 13.15 0 01-3.65 4.65" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.75 10.75a3 3 0 004.25 4.25" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
    </svg>
  ) : (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 12s3.86-7 10-7 10 7 10 7-3.86 7-10 7S2 12 2 12z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
    </svg>
  );
}

export default function AdminTable() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const rootEl = rootRef.current?.closest("[data-theme]");
    if (!rootEl) return;

    const update = () => {
      const t = rootEl.getAttribute("data-theme") ?? "light";
      setTheme(t === "dark" ? "dark" : "light");
    };

    update();
    const obs = new MutationObserver(update);
    obs.observe(rootEl, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  const isLight = theme === "light";

  const { data: adminData, isLoading, error: loadError } = useAdministrators();
  const createMut = useCreateAdministrator();
  const updateMut = useUpdateAdministrator();
  const deleteMut = useDeleteAdministrator();

  const rows: AdministratorRow[] = useMemo(() => {
    return (adminData?.data ?? []).map((a) => {
      const { firstName, lastName } = splitName(a.name);
      return {
        id: a.id,
        firstName,
        lastName,
        email: a.email,
        role: "Super Admin",
        enabled: true,
        twoFactorAuth: !!a.two_factor_enabled,
      };
    });
  }, [adminData]);

  const [menuOpenForId, setMenuOpenForId] = useState<number | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<AdministratorRow | null>(null);

  const [formMode, setFormMode] = useState<AdminFormMode>("create");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdministratorRow | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Super Admin");
  const [enabled, setEnabled] = useState(true);
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!formOpen) return;

    setFormError(null);
    setShowPassword(false);
    setShowRePassword(false);
    setPassword("");
    setRePassword("");

    if (formMode === "edit" && editTarget) {
      setFirstName(editTarget.firstName);
      setLastName(editTarget.lastName);
      setEmail(editTarget.email);
      setRole(editTarget.role);
      setEnabled(editTarget.enabled);
      return;
    }

    // Create
    setFirstName("");
    setLastName("");
    setEmail("");
    setRole("Super Admin");
    setEnabled(true);
  }, [formOpen, formMode, editTarget]);

  const passwordCriteriaOk = useMemo(() => {
    // At least: 1 uppercase, 1 lowercase, 1 number, 1 symbol
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;
    return re.test(password);
  }, [password]);

  function closeForm() {
    setFormOpen(false);
  }

  function openCreate() {
    setFormMode("create");
    setEditTarget(null);
    setFormOpen(true);
  }

  function openEdit(target: AdministratorRow) {
    setFormMode("edit");
    setEditTarget(target);
    setFormOpen(true);
  }

  async function handleSubmit() {
    setFormError(null);

    const isCreate = formMode === "create";

    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setFormError("Please fill all required fields.");
      return;
    }

    if (isCreate) {
      if (!password) {
        setFormError("Password is required.");
        return;
      }
      if (!passwordCriteriaOk) {
        setFormError("Password does not match required criteria.");
        return;
      }
      if (password !== rePassword) {
        setFormError("Passwords do not match.");
        return;
      }
    }

    setSubmitting(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      if (formMode === "create") {
        await createMut.mutateAsync({
          name: fullName,
          email: email.trim(),
          password,
        });
      } else if (formMode === "edit" && editTarget) {
        await updateMut.mutateAsync({
          id: String(editTarget.id),
          data: {
            name: fullName,
            email: email.trim(),
            ...(password ? { password } : {}),
          },
        });
      }
      closeForm();
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(row: AdministratorRow) {
    try {
      await deleteMut.mutateAsync(String(row.id));
    } catch (err) {
      alert(`Failed to delete: ${(err as Error).message}`);
    }
  }

  const columns = useMemo(() => {
    return [
      { key: "id" as const, header: "ID", headerClassName: "whitespace-nowrap" },
      { key: "firstName" as const, header: "FIRST NAME" },
      { key: "lastName" as const, header: "LAST NAME" },
      {
        key: "email" as const,
        header: "EMAIL",
        render: (value: unknown) => {
          const emailStr = String(value ?? "");
          // Roughly mimic the truncated email in screenshot
          return (
            <span className="max-w-[160px] truncate block" title={emailStr}>
              {emailStr}
            </span>
          );
        },
      },
      {
        key: "role" as const,
        header: "ROLE",
        render: (value: unknown) => <span className="text-inherit">{String(value ?? "")}</span>,
      },
      {
        key: "enabled" as const,
        header: "ENABLED",
        render: (value: unknown) => String(Boolean(value)),
      },
      {
        key: "twoFactorAuth" as const,
        header: "TWO FACTOR AUTH",
        render: (value: unknown) => String(Boolean(value)),
      },
      {
        key: "actions" as const,
        header: "",
        className: "w-10",
        render: (_: unknown, row: AdministratorRow & { actions: null }) => (
          <div className="relative">
            <button
              type="button"
              aria-label="Actions"
              aria-haspopup="menu"
              aria-expanded={menuOpenForId === row.id}
              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpenForId((prev) => (prev === row.id ? null : row.id));
              }}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </button>

            {menuOpenForId === row.id && (
              <div
                className={cn(
                  "absolute right-0 top-10 z-50 w-44 rounded-lg border py-1 shadow-sm",
                  isLight ? "border-gray-200 bg-white" : "border-[#334155] bg-[#0f172a]"
                )}
              >
                <button
                  type="button"
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm",
                    isLight ? "text-gray-700 hover:bg-gray-100" : "text-gray-200 hover:bg-white/5"
                  )}
                  onClick={() => {
                    setMenuOpenForId(null);
                    openEdit(row);
                  }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm opacity-50 cursor-not-allowed",
                    isLight ? "text-gray-700" : "text-gray-200"
                  )}
                  title="2FA disable will be available in a future update"
                  onClick={() => {
                    setMenuOpenForId(null);
                  }}
                >
                  Delete 2FA
                </button>
                <button
                  type="button"
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm",
                    "text-red-600",
                    isLight ? "hover:bg-red-50" : "hover:bg-red-600/10"
                  )}
                  onClick={() => {
                    setMenuOpenForId(null);
                    setDeleteTarget(row);
                  }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ),
      },
    ];
  }, [menuOpenForId, rows, isLight]); // eslint-disable-line react-hooks/exhaustive-deps

  const tableData: AdministratorTableRow[] = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? rows.filter((r) => {
          return (
            String(r.id).includes(q) ||
            r.firstName.toLowerCase().includes(q) ||
            r.lastName.toLowerCase().includes(q) ||
            r.email.toLowerCase().includes(q) ||
            r.role.toLowerCase().includes(q) ||
            String(r.enabled).toLowerCase().includes(q) ||
            String(r.twoFactorAuth).toLowerCase().includes(q)
          );
        })
      : rows;

    return filtered.map((r) => ({ ...r, actions: null }));
  }, [rows, search]);

  const inputClassName = cn(
    "h-10 w-full rounded-lg border px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
    isLight ? "border-gray-200 bg-white text-gray-900 placeholder-gray-400" : "border-[#334155] bg-[#111827] text-gray-100 placeholder-gray-500"
  );

  const labelClassName = cn("mb-1 block text-sm font-medium", isLight ? "text-gray-700" : "text-gray-200");
  const helpTextClassName = cn("text-xs", isLight ? "text-gray-600" : "text-gray-300");
  const errorTextClassName = cn("text-sm", isLight ? "text-red-600" : "text-red-400");

  const searchInputClassName = cn(
    "h-10 w-full rounded-lg border px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
    isLight ? "border-gray-200 bg-white pl-9 pr-3 text-gray-900 placeholder-gray-400" : "border-[#334155] bg-[#111827] pl-9 pr-3 text-gray-100 placeholder-gray-500"
  );

  return (
    <div
      ref={rootRef}
      className="w-full rounded-xl border-0 bg-white p-6 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <label className="relative min-w-0 flex-1">
          <span className={cn("pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2", isLight ? "text-gray-400" : "text-gray-500")}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="search"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={searchInputClassName}
          />
        </label>
        <Button variant="primary" size="md" className="shrink-0" onClick={openCreate}>
          + Add new
        </Button>
      </div>

      {loadError ? (
        <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
          Failed to load administrators: {(loadError as Error).message}
        </div>
      ) : null}

      <Table<AdministratorTableRow>
        columns={columns}
        data={tableData}
        emptyMessage={isLoading ? "Loading administrators…" : "No administrators found."}
        className="admin-list-table admin-administrators-table mt-6 border-0 border-gray-100"
        tableClassName="min-w-max"
        bordered={false}
        rowDividers
        rowHover={false}
      />

      <Modal
        isOpen={formOpen}
        onClose={() => {
          if (!submitting) closeForm();
        }}
        title={formMode === "create" ? "Create administrators" : "Edit administrator"}
        size="2xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div />
          </div>

          {/* 2 inputs per row (desktop) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClassName}>
                First name <span className="text-red-500">*</span>
              </label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                className={inputClassName}
              />
            </div>
            <div>
              <label className={labelClassName}>
                Last name <span className="text-red-500">*</span>
              </label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                className={inputClassName}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClassName}>
                Email <span className="text-red-500">*</span>
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className={inputClassName}
              />
            </div>
            <div>
              <label className={labelClassName}>
                Role <span className="text-red-500">*</span>
              </label>
              <select value={role} onChange={(e) => setRole(e.target.value)} className={inputClassName}>
                <option value="Super Admin">Super Admin</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClassName}>
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className={cn(inputClassName, "pr-10")}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className={cn(
                    "absolute right-3 top-1/2 -translate-y-1/2 hover:text-gray-600",
                    isLight ? "text-gray-400" : "text-gray-300 hover:text-white/90"
                  )}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>
            <div>
              <label className={labelClassName}>
                Re enter Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showRePassword ? "text" : "password"}
                  value={rePassword}
                  onChange={(e) => setRePassword(e.target.value)}
                  placeholder="Re enter Password"
                  className={cn(inputClassName, "pr-10")}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowRePassword((v) => !v)}
                  className={cn(
                    "absolute right-3 top-1/2 -translate-y-1/2 hover:text-gray-600",
                    isLight ? "text-gray-400" : "text-gray-300 hover:text-white/90"
                  )}
                  aria-label={showRePassword ? "Hide password" : "Show password"}
                >
                  <EyeIcon open={showRePassword} />
                </button>
              </div>
            </div>
          </div>

          {formMode === "create" && password && !passwordCriteriaOk && (
            <div className={helpTextClassName + " " + (isLight ? "text-red-600" : "text-red-400")}>
              Password must include upper/lowercase, number, and symbol.
            </div>
          )}
          {formError && <div className={errorTextClassName}>{formError}</div>}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={closeForm} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
              {formMode === "create" ? "Create admin" : "Save"}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await handleDelete(deleteTarget);
          setDeleteTarget(null);
        }}
        title="Delete administrator"
        message="Are you sure you want to delete this administrator?"
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </div>
  );
}