"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { dict } from "@/lib/i18n";
import { useLocale } from "@/components/providers/LocaleProvider";

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

type SectionKey = "features" | "preview" | "start";

function ArrowUpIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M12 19V5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="m6 11 6-6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Footer() {
  const { lang, ready } = useLocale();
  const t = dict[lang];
  const year = new Date().getFullYear();

  const [active, setActive] = useState<SectionKey>("features");
  const [showTop, setShowTop] = useState(false);

  const nav = useMemo(
    () =>
      [
        { key: "features" as const, href: "#features", label: t.nav?.features ?? (lang === "tr" ? "Özellikler" : "Features") },
        { key: "preview" as const, href: "#preview", label: t.nav?.preview ?? (lang === "tr" ? "Önizleme" : "Preview") },
        { key: "start" as const, href: "#start", label: t.nav?.start ?? (lang === "tr" ? "Başla" : "Start") },
      ] as const,
    [t, lang]
  );

  useEffect(() => {
    if (!ready) return;

    const ids: SectionKey[] = ["features", "preview", "start"];
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];

        if (visible?.target?.id) setActive(visible.target.id as SectionKey);
      },
      { threshold: [0.25, 0.4, 0.55], rootMargin: "-10% 0px -60% 0px" }
    );

    els.forEach((el) => obs.observe(el));

    const onScroll = () => setShowTop(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      obs.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [ready]);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!ready) {
    return (
      <footer className="border-t border-blue-100/70 bg-white dark:border-blue-950/40 dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="grid gap-6 md:grid-cols-2 md:items-center">
            <div className="space-y-2">
              <div className="h-10 w-40 rounded-2xl bg-blue-50 dark:bg-slate-900/60" />
              <div className="h-4 w-72 rounded-2xl bg-blue-50 dark:bg-slate-900/60" />
            </div>
            <div className="flex gap-3 md:justify-end">
              <div className="h-9 w-24 rounded-2xl bg-blue-50 dark:bg-slate-900/60" />
              <div className="h-9 w-24 rounded-2xl bg-blue-50 dark:bg-slate-900/60" />
              <div className="h-9 w-24 rounded-2xl bg-blue-50 dark:bg-slate-900/60" />
            </div>
          </div>
          <div className="mt-8 h-4 w-56 rounded-2xl bg-blue-50 dark:bg-slate-900/60" />
        </div>
      </footer>
    );
  }

  const footerDesc =
    t.footer?.desc ??
    (lang === "tr"
      ? "Netlik ve odak için tasarlanmış AI destekli TODO deneyimi."
      : "An AI-assisted TODO experience built for clarity and focus.");

  const rights = t.footer?.rights ?? (lang === "tr" ? "Tüm hakları saklıdır." : "All rights reserved.");

  const privacyLabel = (t as any)?.footer?.links?.privacy ?? (lang === "tr" ? "KVKK / Gizlilik" : "Privacy");
  const cookiesLabel = (t as any)?.footer?.links?.cookies ?? (lang === "tr" ? "Çerez Politikası" : "Cookies");
  const contactLabel = (t as any)?.footer?.links?.contact ?? (lang === "tr" ? "İletişim" : "Contact");

  return (
    <footer className="relative border-t border-blue-100/70 bg-white dark:border-blue-950/40 dark:bg-slate-950">
      <div className="pointer-events-none absolute inset-x-0 -top-12 mx-auto h-24 max-w-6xl rounded-[48px] bg-linear-to-r from-blue-500/10 via-sky-400/10 to-blue-500/10 blur-2xl dark:from-sky-400/10 dark:via-blue-500/10 dark:to-sky-400/10" />

      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-2 md:items-start">
          <div>
            <Link href="/" className="inline-flex items-center gap-3" aria-label="Tonica Home">
              <div className="relative">
                <div className="pointer-events-none absolute -inset-2 rounded-2xl bg-blue-500/10 blur-xl dark:bg-sky-400/10" />
                <Image
                  src="/TonicaLogo.png"
                  alt="Tonica Logo"
                  width={132}
                  height={40}
                  className="relative h-auto w-33 select-none"
                />
              </div>
            </Link>

            <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">{footerDesc}</div>

            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <Link
                href="/kvkk"
                className="text-slate-600 hover:text-blue-700 transition dark:text-slate-300 dark:hover:text-sky-200"
              >
                {privacyLabel}
              </Link>
              <Link
                href="/cerez-politikasi"
                className="text-slate-600 hover:text-blue-700 transition dark:text-slate-300 dark:hover:text-sky-200"
              >
                {cookiesLabel}
              </Link>
              <a
                href="#contact"
                className="text-slate-600 hover:text-blue-700 transition dark:text-slate-300 dark:hover:text-sky-200"
              >
                {contactLabel}
              </a>
            </div>
          </div>

          <div className="md:justify-self-end">
            <div className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">
              {lang === "tr" ? "KISAYOLLAR" : "SHORTCUTS"}
            </div>

            <nav className="mt-4 flex flex-wrap gap-2" aria-label="Footer navigation">
              {nav.map((item) => {
                const isActive = active === item.key;
                return (
                  <a
                    key={item.key}
                    href={item.href}
                    className={cn(
                      "rounded-2xl px-4 py-2 text-sm transition border",
                      isActive
                        ? "border-blue-200 bg-blue-50 text-blue-800 dark:border-sky-500/30 dark:bg-slate-950/40 dark:text-sky-200"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-700 dark:border-white/10 dark:bg-slate-950/30 dark:text-slate-200 dark:hover:bg-slate-900/60"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {item.label}
                  </a>
                );
              })}
            </nav>

            <div className="mt-6 flex items-center justify-between gap-3">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {lang === "tr" ? "Daha hızlı gezin" : "Navigate faster"}
              </div>

              <button
                type="button"
                onClick={scrollToTop}
                className={cn(
                  "inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-medium transition",
                  showTop
                    ? "border-blue-200 bg-white text-blue-700 hover:bg-blue-50 dark:border-white/10 dark:bg-slate-950/30 dark:text-sky-200 dark:hover:bg-slate-900/60"
                    : "border-slate-200 bg-slate-50 text-slate-400 cursor-default dark:border-white/10 dark:bg-slate-950/30 dark:text-slate-500"
                )}
                disabled={!showTop}
                aria-label={lang === "tr" ? "Yukarı çık" : "Back to top"}
              >
                <ArrowUpIcon className="h-4 w-4" />
                {lang === "tr" ? "Yukarı" : "Top"}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-slate-200/70 pt-6 text-xs text-slate-500 dark:border-white/10 dark:text-slate-400 md:flex-row md:items-center md:justify-between">
          <div>
            © {year} Tonica • {rights}
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 dark:border-white/10 dark:bg-slate-950/30">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {lang === "tr" ? "Sistem aktif" : "Online"}
            </span>

            <a
              href="/workspace"
              className="font-medium text-blue-700 hover:text-blue-800 transition dark:text-sky-200 dark:hover:text-sky-100"
            >
              {lang === "tr" ? "Hemen başla →" : "Get started →"}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
