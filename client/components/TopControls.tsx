"use client";

import { useEffect, useMemo, useState } from "react";
import { Sun, Moon, Globe } from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { Lang } from "@/lib/i18n";

type Variant = "header" | "workspace";

function getStoredTheme() {
  if (typeof window === "undefined") return "light";
  return (localStorage.getItem("tonica-theme") as "light" | "dark") || "light";
}

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export default function TopControls({ variant = "workspace" }: { variant?: Variant }) {
  const { lang, toggleLang } = useLocale();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const t = getStoredTheme();
    setTheme(t);
    document.documentElement.classList.toggle("dark", t === "dark");
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("tonica-theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  }

  /* ==============================
     TRANSLATIONS
     ============================== */

  const copy = useMemo(() => {
    const tr = {
      preferences: "Tercihler",
      language: "Dil",
      theme: "Tema",
      light: "Açık",
      dark: "Koyu",
    };

    const en = {
      preferences: "Preferences",
      language: "Language",
      theme: "Theme",
      light: "Light",
      dark: "Dark",
    };

    return (lang as Lang) === "tr" ? tr : en;
  }, [lang]);

  /* ==============================
     WORKSPACE VERSION
     ============================== */

  if (variant === "workspace") {
    return (
      <div
        className={cn(
          "mt-5 rounded-3xl border p-4",
          "border-slate-200 bg-white/70 backdrop-blur-xl",
          "dark:border-white/10 dark:bg-slate-900/40",
          "shadow-sm"
        )}
      >
        {/* Title */}
        <div className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {copy.preferences}
        </div>

        <div className="mt-3 space-y-4">
          {/* Language */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
              <Globe className="h-4 w-4 opacity-70" />
              {copy.language}
            </div>

            <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              <button
                onClick={() => lang !== "tr" && toggleLang()}
                className={cn(
                  "px-3 py-1 text-xs font-bold rounded-lg transition",
                  lang === "tr"
                    ? "bg-white shadow text-slate-900 dark:bg-slate-700 dark:text-white"
                    : "text-slate-600 dark:text-slate-300"
                )}
              >
                TR
              </button>

              <button
                onClick={() => lang !== "en" && toggleLang()}
                className={cn(
                  "px-3 py-1 text-xs font-bold rounded-lg transition",
                  lang === "en"
                    ? "bg-white shadow text-slate-900 dark:bg-slate-700 dark:text-white"
                    : "text-slate-600 dark:text-slate-300"
                )}
              >
                EN
              </button>
            </div>
          </div>

          {/* Theme */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
              {theme === "dark" ? (
                <Moon className="h-4 w-4 opacity-70" />
              ) : (
                <Sun className="h-4 w-4 opacity-70" />
              )}
              {copy.theme}
            </div>

            <button
              onClick={toggleTheme}
              className={cn(
                "relative w-14 h-7 rounded-full transition",
                theme === "dark"
                  ? "bg-sky-500"
                  : "bg-slate-300 dark:bg-slate-700"
              )}
            >
              <span
                className={cn(
                  "absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition",
                  theme === "dark" ? "right-1" : "left-1"
                )}
              />
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ==============================
     HEADER VERSION
     ============================== */

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleLang}
        className="h-9 w-9 flex items-center justify-center rounded-xl
                   bg-white/60 backdrop-blur border border-slate-200
                   hover:bg-white transition
                   dark:bg-slate-900/60 dark:border-white/10 dark:hover:bg-slate-800"
        aria-label={copy.language}
      >
        <Globe className="h-4 w-4 text-slate-700 dark:text-slate-200" />
      </button>

      <button
        onClick={toggleTheme}
        className="h-9 w-9 flex items-center justify-center rounded-xl
                   bg-white/60 backdrop-blur border border-slate-200
                   hover:bg-white transition
                   dark:bg-slate-900/60 dark:border-white/10 dark:hover:bg-slate-800"
        aria-label={copy.theme}
      >
        {theme === "dark" ? (
          <Sun className="h-4 w-4 text-yellow-500" />
        ) : (
          <Moon className="h-4 w-4 text-slate-700 dark:text-slate-200" />
        )}
      </button>
    </div>
  );
}
