"use client";

import type { TaskLike } from "./WorkspaceBoard";

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export default function TaskSheet({
  open,
  onClose,
  task,
}: {
  open: boolean;
  onClose: () => void;
  task: TaskLike | null;
}) {
  return (
    <>
      {/* overlay */}
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 transition",
          open ? "pointer-events-auto bg-black/20 opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      {/* panel */}
      <aside
        className={cn(
          "fixed right-0 top-0 z-50 h-full w-full max-w-[460px] transform transition",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="h-full border-l border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-950">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold tracking-wide text-blue-700 dark:text-sky-200">
                TASK
              </div>
              <div className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">
                {task?.title || "Select a task"}
              </div>
              <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                {task?.status ? `Status: ${task.status}` : "—"}
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-200 dark:hover:bg-slate-950/70"
            >
              ✕
            </button>
          </div>

          <div className="mt-5 grid gap-4">
            <section className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-950/30">
              <div className="text-xs font-bold text-slate-900 dark:text-white">Description</div>
              <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {task?.description || "—"}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-950/30">
              <div className="text-xs font-bold text-slate-900 dark:text-white">AI Actions</div>

              <div className="mt-3 grid gap-2">
                <ActionButton>✨ Improve title</ActionButton>
                <ActionButton>🏷 Suggest priority & tags</ActionButton>
                <ActionButton>➡️ Next step</ActionButton>
                <ActionButton>🧾 Generate recap</ActionButton>
              </div>

              <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">
                (Şimdilik UI. API bağlayınca buradan çağıracağız.)
              </div>
            </section>
          </div>
        </div>
      </aside>
    </>
  );
}

function ActionButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-200 dark:hover:bg-slate-950/60"
    >
      {children}
    </button>
  );
}
