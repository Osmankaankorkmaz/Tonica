"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Lang } from "@/lib/i18n";

type LocaleCtx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  ready: boolean; // hydration sonrası hazır mı?
};

const LocaleContext = createContext<LocaleCtx | null>(null);

const LANG_KEY = "tonica-lang";

function readLang(): Lang {
  if (typeof window === "undefined") return "tr";
  const v = localStorage.getItem(LANG_KEY);
  return v === "en" || v === "tr" ? v : "tr";
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("tr");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // ilk açılışta localStorage'tan oku
    const initial = readLang();
    setLangState(initial);
    setReady(true);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem(LANG_KEY, l);
  };

  const toggleLang = () => setLang(lang === "tr" ? "en" : "tr");

  const value = useMemo(() => ({ lang, setLang, toggleLang, ready }), [lang, ready]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
