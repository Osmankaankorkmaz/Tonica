"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { logoutThunk, selectAuthUser } from "@/lib/store/authSlice";

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export default function WorkspaceSidebar() {
  const user = useAppSelector(selectAuthUser);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const items = useMemo(
    () => [
      { key: "board", label: "Board", href: "/workspace" },
      { key: "focus", label: "Focus Plan", href: "/workspace#focus" },
      { key: "history", label: "AI History", href: "/workspace#history" },
      { key: "settings", label: "Settings", href: "/workspace#settings" },
    ],
    []
  );

  async function onLogout() {
    await dispatch(logoutThunk());
    router.push("/login");
  }

  return (
    <aside
      className={cn(
        "sticky top-4 h-[calc(100vh-32px)] rounded-3xl border p-4",
        "border-slate-200 bg-white/90 backdrop-blur",
        "dark:border-white/10 dark:bg-slate-900/45"
      )}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 rounded-2xl px-2 py-2 hover:bg-slate-50 dark:hover:bg-white/5">
        <Image
          src="/TonicaLogo.png"
          alt="Tonica"
          width={132}
          height={40}
          priority
          className="h-auto w-32"
        />
      </Link>

      {/* Menu */}
      <nav className="mt-4 grid gap-1">
        {items.map((it) => (
          <Link
            key={it.key}
            href={it.href}
            className={cn(
              "rounded-2xl px-3 py-2.5 text-sm font-medium transition",
              "text-slate-700 hover:bg-blue-50 hover:text-blue-700",
              "dark:text-slate-200 dark:hover:bg-slate-950/50 dark:hover:text-sky-200"
            )}
          >
            {it.label}
          </Link>
        ))}
      </nav>

      {/* Footer / user */}
      <div className="mt-auto">
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-slate-950/30">
          <div className="text-xs text-slate-500 dark:text-slate-400">Signed in</div>
          <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
            {user?.fullName || "User"}
          </div>
          <div className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">
            {user?.email}
          </div>

          <button
            onClick={onLogout}
            className={cn(
              "mt-3 w-full rounded-xl px-3 py-2 text-sm font-semibold transition",
              "bg-slate-100 text-slate-700 hover:bg-slate-200",
              "dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15"
            )}
          >
            Logout
          </button>
        </div>

        <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} Tonica
        </div>
      </div>
    </aside>
  );
}
