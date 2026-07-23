"use client";

import { useState } from "react";

type SavedSession = {
  id: number;
  batchRef: string;
  empId: string | null;
  step: number;
  savedAt: string;
};

const STEP_LABELS: Record<number, string> = { 1: "Create Run", 2: "Calculation", 3: "Review", 4: "Execution", 5: "Files" };

/** Read the current in-progress pointers from localStorage. */
function readCurrent(): { batchRef: string | null; empId: string | null; step: number } {
  if (typeof window === "undefined") return { batchRef: null, empId: null, step: 1 };
  return {
    batchRef: localStorage.getItem("kp-cpr-batch"),
    empId: localStorage.getItem("kp-cpr-emp"),
    step: Number(localStorage.getItem("kp-cpr-step")) || 1,
  };
}

export type PayrollDataBackupProps = {
  /** Called after the localStorage pointers are set, so the shell can navigate into the batch/employee. */
  onResume: (target: { batchRef: string; empId: string | null }) => void;
};

/**
 * Payroll Data Backup — resume in-progress work, save the current place for later,
 * and manage a list of saved sessions. Pointers live in `kp-cpr-batch` / `kp-cpr-emp`
 * / `kp-cpr-step`; the saved list lives in `kp-payroll-sessions`.
 */
export default function PayrollDataBackup({ onResume }: PayrollDataBackupProps) {
  const [sessions, setSessions] = useState<SavedSession[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem("kp-payroll-sessions") || "[]") as SavedSession[]; } catch { return []; }
  });
  const [toast, setToast] = useState<string | null>(null);
  // Current in-progress pointer, read from localStorage. Not reactive on its own,
  // so we refresh it explicitly after resume/save.
  const [current, setCurrent] = useState(() => readCurrent());

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast((t) => (t === msg ? null : t)), 2600); };
  function persistSessions(list: SavedSession[]) {
    setSessions(list);
    if (typeof window !== "undefined") localStorage.setItem("kp-payroll-sessions", JSON.stringify(list));
  }

  function describe(s: SavedSession): string {
    if (s.empId) return `Reviewing EMP-${1000 + Number(s.empId || 0)}`;
    if (s.batchRef) return "Batch overview";
    return STEP_LABELS[s.step] || `Step ${s.step}`;
  }

  function savePause() {
    if (!current.batchRef) { flash("No payroll run is currently open."); return; }
    const snap: SavedSession = {
      id: Date.now(), batchRef: current.batchRef, empId: current.empId || null,
      step: current.step, savedAt: new Date().toISOString(),
    };
    const filtered = sessions.filter((s) => !(s.batchRef === snap.batchRef && (s.empId || "") === (snap.empId || "")));
    persistSessions([snap, ...filtered].slice(0, 20));
    flash("Work saved — resume it anytime.");
  }

  function resume(s: { batchRef: string; empId: string | null; step: number }) {
    if (typeof window !== "undefined") {
      localStorage.setItem("kp-cpr-step", String(s.step || 1));
      localStorage.setItem("kp-cpr-batch", s.batchRef);
      if (s.empId) localStorage.setItem("kp-cpr-emp", s.empId); else localStorage.removeItem("kp-cpr-emp");
    }
    setCurrent(readCurrent());
    onResume({ batchRef: s.batchRef, empId: s.empId });
  }

  function deleteSession(id: number) { persistSessions(sessions.filter((s) => s.id !== id)); }

  const resumeBtn = "inline-flex h-10 items-center gap-2 rounded-lg bg-[#0F50DB] px-4.5 text-[13.5px] font-semibold text-white hover:bg-blue-700";
  const ghostBtn = "inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-[13.5px] font-medium text-gray-700 hover:bg-gray-50";

  return (
    <div className="flex flex-col gap-5">
      <div className="overflow-hidden rounded-xl bg-[var(--dash-card,#fff)] shadow-sm ring-1 ring-gray-100">
        <div className="border-b border-gray-100 px-6 py-5">
          <h2 className="text-xl font-semibold text-[#0E1620]">Resume payroll work</h2>
          <p className="mt-1.5 text-[13.5px] text-gray-500">Stopped mid-run? Save your place and pick up exactly where you left off — same batch, same employee.</p>
        </div>

        <div className={sessions.length ? "border-b border-gray-100 px-6 py-4.5" : "px-6 py-4.5"}>
          {current.batchRef ? (
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-blue-100 bg-gray-50 px-4.5 py-4">
              <div className="flex min-w-0 items-center gap-3.5">
                <span className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-[#0F50DB] text-white">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
                </span>
                <div className="min-w-0">
                  <div className="text-[14.5px] font-bold text-[#0E1620]">Payroll run {current.batchRef}</div>
                  <div className="text-[12.5px] text-gray-500">
                    {current.empId ? `Reviewing EMP-${1000 + Number(current.empId || 0)}` : "Batch overview"} · Step: {STEP_LABELS[current.step] || current.step}
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 gap-2.5">
                <button type="button" onClick={savePause} className={ghostBtn}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  Save for later
                </button>
                <button
                  type="button"
                  onClick={() => resume({ batchRef: current.batchRef!, empId: current.empId, step: current.step })}
                  className={resumeBtn}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                  Resume work
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 px-4 py-5.5 text-center text-[13px] text-gray-400">
              No payroll run in progress. Open a batch under Create Payroll Run and your place will appear here.
            </div>
          )}
        </div>

        {sessions.length > 0 && (
          <div className="px-3 pb-3 pt-2">
            <div className="px-3 pb-1 pt-2 text-[11.5px] font-semibold uppercase tracking-wide text-gray-400">Saved sessions</div>
            <div className="flex flex-col gap-2">
              {sessions.map((s) => (
                <div key={s.id} className="flex items-center gap-3.5 rounded-xl border border-gray-100 px-3.5 py-3">
                  <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-lg bg-gray-50 text-[#0F50DB]">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7L21 8" /><path d="M21 3v5h-5" /></svg>
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13.5px] font-semibold text-[#0E1620]">Run {s.batchRef} · {describe(s)}</div>
                    <div className="text-[11.5px] text-gray-400">
                      Saved {new Date(s.savedAt).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })} · Step: {STEP_LABELS[s.step] || s.step}
                    </div>
                  </div>
                  <button
                    type="button" onClick={() => resume(s)}
                    className="inline-flex h-9 items-center rounded-lg border border-[#0F50DB] bg-white px-3.5 text-[13px] font-semibold text-[#0F50DB] hover:bg-blue-50"
                  >Resume</button>
                  <button
                    type="button" onClick={() => deleteSession(s.id)} aria-label="Delete session"
                    className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-gray-600"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-7 left-1/2 z-[1200] inline-flex -translate-x-1/2 items-center gap-2.5 rounded-lg bg-[#0E1620] px-4.5 py-3 text-[13.5px] font-medium text-white shadow-xl">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          {toast}
        </div>
      )}
    </div>
  );
}
