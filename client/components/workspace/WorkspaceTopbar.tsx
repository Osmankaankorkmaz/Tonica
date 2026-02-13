"use client";

import { useMemo, useState } from "react";
import { useAppSelector } from "@/lib/store/hooks";
import { selectAuthUser } from "@/lib/store/authSlice";

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export default function WorkspaceTopbar() {
  const user = useAppSelector(selectAuthUser);
  const [q, setQ] = useState("");

  const subtitle = useMemo(() => {
    const name = user?.fullName || "there";
    return `Welcome, ${name}. Keep it simple.`;
  }, [user?.fullName]);

  return (
    <div
      className={cn(
        "rounded-3xl border p-4 sm:p-5",
        "border-slate-200 bg-white/90 backdrop-blur",
        "dark:border-white/10 dark:bg-slate-900/45"
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xs font-semibold tracking-wide text-blue-700 dark:text-sky-200">
            WORKSPACE
          </div>
          <div className="mt-1 text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Board
          </div>
          <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">{subtitle}</div>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tasks..."
            className={cn(
              "h-11 w-full rounded-2xl border px-4 text-sm outline-none transition sm:w-80",
              "border-slate-200 bg-white text-slate-900 focus:border-blue-300 focus:ring-2 focus:ring-blue-200/60",
              "dark:border-white/10 dark:bg-slate-950/40 dark:text-white dark:focus:border-sky-500/50 dark:focus:ring-sky-900/40"
            )}
          />

          <button
            type="button"
            className={cn(
              "h-11 rounded-2xl px-4 text-sm font-semibold transition",
              "bg-blue-600 text-white hover:bg-blue-700",
              "dark:bg-sky-500 dark:hover:bg-sky-400"
            )}
          >
            + New Task
          </button>
        </div>
      </div>
    </div>
  );
}
