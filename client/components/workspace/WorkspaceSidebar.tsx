"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  Target,
  FolderKanban,
  Brain,
  BarChart3,
  Clock,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { logoutThunk, selectAuthUser } from "@/lib/store/authSlice";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { Lang } from "@/lib/i18n";
import TopControls from "../TopControls";

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export default function WorkspaceSidebar() {
  const user = useAppSelector(selectAuthUser);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { lang } = useLocale();

  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  const copy = useMemo(() => {
    const tr = {
      signedIn: "Giriş Yapıldı",
      logout: "Çıkış Yap",
    };
    const en = {
      signedIn: "Signed in",
      logout: "Logout",
    };
    return (lang as Lang) === "tr" ? tr : en;
  }, [lang]);

  const items = useMemo(
    () => [
      {
        label: lang === "tr" ? "Gösterge Paneli" : "Dashboard",
        href: "/workspace",
        icon: LayoutDashboard,
      },
      {
        label: lang === "tr" ? "Görevler" : "Tasks",
        href: "/workspace/tasks",
        icon: CheckSquare,
      },
      {
        label: lang === "tr" ? "Odak Modu" : "Focus Mode",
        href: "/workspace/focus",
        icon: Target,
      },
    ],
    [lang],
  );

  async function onLogout() {
    await dispatch(logoutThunk());
    router.push("/login");
  }

  return (
    <>
      <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 sticky top-0 z-40">
        <button
          onClick={() => setMobileOpen(true)}
          className="h-10 w-10 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-white/10"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Image
          src="/TonicaLogo.png"
          alt="Tonica"
          width={110}
          height={30}
          className="h-auto w-28"
        />
      </div>

      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50",
          "h-full lg:h-[calc(100vh-32px)]",
          "w-72",
          "transform transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "lg:rounded-3xl",
          "border-r lg:border",
          "border-slate-200 bg-white dark:border-white/10 dark:bg-slate-950",
          "shadow-xl lg:shadow-lg",
          "p-5 flex flex-col",
        )}
      >
        <div className="flex items-center justify-between lg:hidden mb-4">
          <span className="font-bold text-slate-900 dark:text-white">
            Tonica
          </span>
          <button
            onClick={() => setMobileOpen(false)}
            className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <Link
          href="/workspace"
          className="hidden lg:flex items-center gap-3 rounded-2xl px-2 py-2 hover:bg-slate-100 dark:hover:bg-white/5"
        >
          <Image
            src="/TonicaLogo.png"
            alt="Tonica"
            width={140}
            height={40}
            className="h-auto w-32"
          />
        </Link>

        <div className="my-5 h-px bg-slate-200 dark:bg-white/10" />
        <div className="overflow-y-auto invisible-scrollbar">
          <nav className="flex-1 space-y-1">
            {items.map((it) => {
              const Icon = it.icon;
              const active = pathname === it.href;

              return (
                <Link
                  key={it.href}
                  href={it.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition",
                    active
                      ? "bg-linear-to-r from-sky-500 to-indigo-600 text-white"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/5",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      active
                        ? "text-white"
                        : "text-slate-500 group-hover:text-slate-800 dark:text-slate-400 dark:group-hover:text-white",
                    )}
                  />
                  {it.label}
                </Link>
              );
            })}
          </nav>

          <TopControls variant="workspace" />

          <div className="mt-6 rounded-3xl border border-slate-200 bg-white/70 p-4 dark:border-white/10 dark:bg-slate-900/40">
            <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {copy.signedIn}
            </div>

            <div className="mt-2 text-sm font-bold text-slate-900 dark:text-white">
              {user?.fullName || "User"}
            </div>

            <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              {user?.email}
            </div>

            <button
              onClick={onLogout}
              className="mt-4 w-full rounded-xl px-3 py-2 text-sm font-semibold flex items-center justify-center gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/20"
            >
              <LogOut className="h-4 w-4" />
              {copy.logout}
            </button>
          </div>

          <div className="mt-4 text-center text-[11px] text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} Tonica
          </div>
        </div>
      </aside>
    </>
  );
}
