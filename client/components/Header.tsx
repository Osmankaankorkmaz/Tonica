"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import TopControls from "@/components/TopControls";
import { dict } from "@/lib/i18n";
import { useLocale } from "@/components/providers/LocaleProvider";

import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { meThunk, selectAuthInitialized, selectAuthUser } from "@/lib/store/authSlice";

type NavKey = "features" | "preview" | "about" | "faq" | "contact" | "blog" | "start";

type NavItem = {
  key: NavKey;
  href: string;
  label: { tr: string; en: string };
};

export default function Header() {
  const { lang, ready } = useLocale();
  const [mobileOpen, setMobileOpen] = useState(false);

  const router = useRouter();
  const dispatch = useAppDispatch();

  const user = useAppSelector(selectAuthUser);
  const initialized = useAppSelector(selectAuthInitialized);

  const t = dict[lang];

  const navItems: NavItem[] = useMemo(
    () => [
      { key: "features", href: "#features", label: { tr: "Özellikler", en: "Features" } },
      { key: "preview", href: "#preview", label: { tr: "Önizleme", en: "Preview" } },
      { key: "about", href: "#about", label: { tr: "Hakkımızda", en: "About" } },
      { key: "faq", href: "#faq", label: { tr: "SSS", en: "FAQ" } },
      { key: "contact", href: "#contact", label: { tr: "İletişim", en: "Contact" } },
      { key: "blog", href: "#blog", label: { tr: "Blog", en: "Blog" } },
      { key: "start", href: "#start", label: { tr: "Başla", en: "Start" } },
    ],
    []
  );

  function closeMobile() {
    setMobileOpen(false);
  }

  // ✅ Sayfa açılınca oturumu doğrula (bir kere)
  useEffect(() => {
    if (!initialized) {
      dispatch(meThunk() as any);
    }
  }, [initialized, dispatch]);

  // ✅ CTA davranışı
  function onCtaClick(e?: React.MouseEvent) {
    e?.preventDefault();
    closeMobile();

    // initialized değilse (daha me dönmeden) login yerine yönlendirmeyi bekletebilirsin.
    // Ben "initialized false" ise de login'e atmasın diye, önce workspace'e değil, login'e değil:
    // istersen burada bir loading state açarsın. Şimdilik: initialized false ise /login.
    const target = user ? "/workspace" : "/login";
    router.push(target);
  }

  // hydration sırasında TR/EN flicker olmasın diye
  if (!ready) {
    return (
      <header className="sticky top-0 z-50">
        <div className="h-0.75 w-full bg-linear-to-r from-blue-600 via-sky-500 to-blue-600" />
        <div className="border-b border-blue-100/70 bg-white/75 backdrop-blur dark:border-blue-950/40 dark:bg-slate-950/70">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
            <div className="h-10 w-40 rounded-2xl bg-blue-50 dark:bg-slate-900/60" />
            <div className="hidden h-10 w-96 rounded-2xl bg-blue-50 dark:bg-slate-900/60 md:block" />
            <div className="h-10 w-28 rounded-2xl bg-blue-50 dark:bg-slate-900/60" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50">
      {/* İnce üst accent */}
      <div className="h-0.75 w-full bg-linear-to-r from-blue-600 via-sky-500 to-blue-600" />

      <div className="border-b border-blue-100/70 bg-white/75 backdrop-blur dark:border-blue-950/40 dark:bg-slate-950/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3" aria-label="Tonica Home">
            <div className="relative">
              <div className="pointer-events-none absolute -inset-2 rounded-2xl bg-blue-500/10 blur-xl dark:bg-sky-400/10" />
              <Image
                src="/TonicaLogo.png"
                alt="Tonica Logo"
                width={132}
                height={40}
                priority
                className="relative h-auto w-33 select-none"
              />
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {navItems.map((item) => (
              <a
                key={item.key}
                href={item.href}
                className="rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition
                           dark:text-slate-300 dark:hover:bg-slate-900/60 dark:hover:text-sky-300"
              >
                {item.label[lang]}
              </a>
            ))}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            <TopControls />

            {/* ✅ Desktop CTA */}
            <a
              href="#start"
              onClick={onCtaClick}
              className="hidden rounded-2xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm
                         hover:bg-blue-700 transition
                         dark:bg-sky-500 dark:hover:bg-sky-400 md:inline-flex"
            >
              {t.hero.cta1}
            </a>

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileOpen((s) => !s)}
              className="inline-flex items-center justify-center rounded-2xl border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-700
                         hover:bg-blue-50 transition
                         dark:border-blue-900/60 dark:bg-slate-900 dark:text-sky-200 dark:hover:bg-slate-800 md:hidden"
              aria-label={lang === "tr" ? "Menü" : "Menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden">
            <div className="mx-auto max-w-6xl px-6 pb-4">
              <div className="rounded-2xl border border-blue-100 bg-white p-2 shadow-sm dark:border-blue-950/40 dark:bg-slate-950">
                {navItems.map((item) => (
                  <a
                    key={item.key}
                    href={item.href}
                    onClick={closeMobile}
                    className="block rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition
                               dark:text-slate-200 dark:hover:bg-slate-900/60 dark:hover:text-sky-300"
                  >
                    {item.label[lang]}
                  </a>
                ))}

                {/* ✅ Mobile CTA */}
                <a
                  href="#start"
                  onClick={onCtaClick}
                  className="mt-2 block rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition
                             dark:bg-sky-500 dark:hover:bg-sky-400"
                >
                  {t.hero.cta1}
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
