"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/components/providers/LocaleProvider";

function getStoredTheme() {
  if (typeof window === "undefined") return "light";
  return (localStorage.getItem("tonica-theme") as "light" | "dark") || "light";
}

export default function TopControls() {
  const { lang, toggleLang, ready } = useLocale();
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

  // ready false iken TR/EN flicker olmasın diye (istersen kaldır)
  if (!ready) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-9 w-12 rounded-xl border border-blue-200 bg-white/60 dark:border-blue-900/60 dark:bg-slate-900/50" />
        <div className="h-9 w-16 rounded-xl border border-blue-200 bg-white/60 dark:border-blue-900/60 dark:bg-slate-900/50" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleLang}
        className="rounded-xl border border-blue-200 bg-white px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-50 transition
                   dark:border-blue-900/60 dark:bg-slate-900 dark:text-blue-200 dark:hover:bg-slate-800"
        aria-label="Toggle language"
        type="button"
      >
        {lang === "tr" ? "TR" : "EN"}
      </button>

      <button
        onClick={toggleTheme}
        className="rounded-xl border border-blue-200 bg-white px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-50 transition
                   dark:border-blue-900/60 dark:bg-slate-900 dark:text-blue-200 dark:hover:bg-slate-800"
        aria-label="Toggle theme"
        type="button"
      >
        {theme === "dark" ? "Light" : "Dark"}
      </button>
    </div>
  );
}
