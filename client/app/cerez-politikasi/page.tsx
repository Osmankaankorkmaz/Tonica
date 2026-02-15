"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { Lang } from "@/lib/i18n";

function cn(...c: Array<string | false | undefined | null>) {
  return c.filter(Boolean).join(" ");
}

type Section = { id: string; title: string; body: string[] };

export default function CookiePolicyPage() {
  const { lang, ready } = useLocale();

  const copy = useMemo(() => {
    const tr = {
      badge: "Tonica • Yasal",
      title: "Çerez Politikası",
      subtitle:
        "Bu sayfa; Tonica web sitesinde kullanılan çerezlerin türlerini, amaçlarını ve tercihlerini nasıl yönetebileceğini açıklar.",
      updated: "Son güncelleme",
      toc: "İçindekiler",
      backHome: "Ana sayfaya dön",
      backStart: "Başlayalım",
      disclaimerTitle: "Not",
      disclaimerText:
        "Bu metin genel bilgilendirme amaçlıdır. Hukuki uyumluluk için kendi süreçlerinize göre güncelleyin.",
      sections: [
        {
          id: "what",
          title: "1) Çerez (Cookie) nedir?",
          body: [
            "Çerezler; ziyaret ettiğin web siteleri tarafından tarayıcına kaydedilen küçük metin dosyalarıdır.",
            "Site performansını artırmak, oturum yönetimi yapmak ve tercihlerini hatırlamak için kullanılır.",
          ],
        },
        {
          id: "why",
          title: "2) Tonica neden çerez kullanır?",
          body: [
            "Oturum ve güvenlik: giriş durumunu ve güvenlik kontrollerini yürütmek.",
            "Tercihler: dil seçimi gibi ayarları hatırlamak.",
            "Analitik/performans: sayfaların nasıl kullanıldığını ölçerek deneyimi geliştirmek (varsa).",
          ],
        },
        {
          id: "types",
          title: "3) Çerez türleri",
          body: [
            "Zorunlu çerezler: sitenin çalışması için gereklidir.",
            "Performans/analitik çerezleri: kullanım istatistiklerini toplar (opsiyonel).",
            "Fonksiyonel çerezler: tercihlerini hatırlar (örn. dil).",
          ],
        },
        {
          id: "manage",
          title: "4) Çerezleri nasıl yönetebilirsin?",
          body: [
            "Tarayıcı ayarlarından çerezleri silebilir veya engelleyebilirsin.",
            "Çerezleri devre dışı bırakmak, bazı özelliklerin düzgün çalışmamasına neden olabilir.",
          ],
        },
        {
          id: "third",
          title: "5) Üçüncü taraf çerezler",
          body: [
            "Bazı durumlarda üçüncü taraf hizmetleri (analitik vb.) çerez kullanabilir.",
            "Kullandığın servisler değiştikçe bu bölüm güncellenebilir.",
          ],
        },
        {
          id: "contact",
          title: "6) İletişim",
          body: [
            "Çerez politikasıyla ilgili soruların için bizimle iletişime geçebilirsin.",
          ],
        },
      ] as Section[],
      faq: {
        title: "Kısa SSS",
        items: [
          { q: "Çerezleri kapatırsam ne olur?", a: "Bazı sayfalar/özellikler beklediğin gibi çalışmayabilir." },
          { q: "Dil tercihim çerezle mi saklanır?", a: "Tercih yapısına göre evet, fonksiyonel çerezlerle saklanabilir." },
          { q: "Analitik çerezleri zorunlu mu?", a: "Hayır, opsiyonel tutulabilir. Kullanıyorsan açıkça belirtmelisin." },
        ],
      },
    };

    const en = {
      badge: "Tonica • Legal",
      title: "Cookie Policy",
      subtitle:
        "This page explains what cookies are, which cookies Tonica may use, and how you can manage your preferences.",
      updated: "Last updated",
      toc: "Contents",
      backHome: "Back to home",
      backStart: "Get started",
      disclaimerTitle: "Note",
      disclaimerText:
        "This text is provided for general information. Please adapt it to your legal and compliance requirements.",
      sections: [
        {
          id: "what",
          title: "1) What is a cookie?",
          body: [
            "Cookies are small text files saved in your browser by websites you visit.",
            "They help with session handling, remembering preferences, and improving performance.",
          ],
        },
        {
          id: "why",
          title: "2) Why does Tonica use cookies?",
          body: [
            "Session & security: keep you signed in and run security checks.",
            "Preferences: remember settings like language.",
            "Analytics/performance: understand usage to improve the experience (if enabled).",
          ],
        },
        {
          id: "types",
          title: "3) Types of cookies",
          body: [
            "Strictly necessary: required for the website to function.",
            "Performance/analytics: collect usage stats (optional).",
            "Functional: remember choices (e.g., language).",
          ],
        },
        {
          id: "manage",
          title: "4) How can you manage cookies?",
          body: [
            "You can delete or block cookies in your browser settings.",
            "Disabling cookies may cause some features to work improperly.",
          ],
        },
        {
          id: "third",
          title: "5) Third-party cookies",
          body: [
            "In some cases, third-party services (analytics, etc.) may set cookies.",
            "This section may change depending on the services you use.",
          ],
        },
        {
          id: "contact",
          title: "6) Contact",
          body: [
            "If you have questions about cookies, feel free to contact us.",
          ],
        },
      ] as Section[],
      faq: {
        title: "Quick FAQ",
        items: [
          { q: "What happens if I disable cookies?", a: "Some pages/features may not work as expected." },
          { q: "Is my language preference stored via cookies?", a: "Depending on implementation, yes—via functional cookies." },
          { q: "Are analytics cookies required?", a: "No. They can be optional—if you use them, disclose clearly." },
        ],
      },
    };

    return (lang as Lang) === "tr" ? tr : en;
  }, [lang]);

  if (!ready) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="h-8 w-48 rounded-2xl bg-blue-50 dark:bg-slate-900/60" />
        <div className="mt-4 h-4 w-full max-w-xl rounded-2xl bg-blue-50 dark:bg-slate-900/60" />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-44 rounded-3xl bg-blue-50 dark:bg-slate-900/60" />
          ))}
        </div>
      </div>
    );
  }

  const year = new Date().getFullYear();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* top glow */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-x-0 -top-10 mx-auto h-40 max-w-6xl rounded-[48px] bg-linear-to-r from-blue-500/10 via-sky-400/10 to-blue-500/10 blur-2xl dark:from-sky-400/10 dark:via-blue-500/10 dark:to-sky-400/10" />
        </div>

        {/* header */}
        <div className="relative rounded-3xl border border-blue-100 bg-white/80 p-8 shadow-sm backdrop-blur dark:border-blue-950/40 dark:bg-slate-900/60">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <div
                className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700
                           dark:border-blue-950/40 dark:bg-slate-950/40 dark:text-sky-200"
              >
                <span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-sky-500" />
                {copy.badge}
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                {copy.title}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {copy.subtitle}
              </p>

              <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                {copy.updated}: {year}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/"
                className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-white
                           dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-200 dark:hover:bg-slate-900/70"
              >
                {copy.backHome}
              </Link>
              <Link
                href="/#start"
                className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md
                           dark:bg-sky-500 dark:hover:bg-sky-400"
              >
                {copy.backStart}
              </Link>
            </div>
          </div>
        </div>

        {/* content grid */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* TOC */}
          <aside className="lg:col-span-1 space-y-4">
            <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm dark:border-blue-950/40 dark:bg-slate-900/60">
              <div className="text-sm font-semibold text-slate-900 dark:text-white">{copy.toc}</div>
              <div className="mt-4 space-y-2">
                {copy.sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="block rounded-2xl border border-blue-100 bg-blue-50 px-4 py-2 text-sm text-slate-800 transition hover:bg-blue-100/70
                               dark:border-blue-950/40 dark:bg-slate-950/40 dark:text-slate-200 dark:hover:bg-slate-950/60"
                  >
                    {s.title}
                  </a>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-linear-to-br from-blue-600 to-sky-500 p-6 text-white shadow-sm">
              <div className="text-sm font-semibold">{copy.disclaimerTitle}</div>
              <p className="mt-2 text-sm text-white/90">{copy.disclaimerText}</p>
            </div>
          </aside>

          {/* sections */}
          <section className="lg:col-span-2 space-y-4">
            {copy.sections.map((s) => (
              <div
                key={s.id}
                id={s.id}
                className="rounded-3xl border border-blue-100 bg-white p-7 shadow-sm dark:border-blue-950/40 dark:bg-slate-900/60"
              >
                <div className="text-lg font-semibold text-slate-900 dark:text-white">{s.title}</div>
                <div className="mt-3 space-y-2">
                  {s.body.map((p, i) => (
                    <p key={i} className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            ))}

            {/* FAQ mini */}
            <div className="rounded-3xl border border-blue-100 bg-white p-7 shadow-sm dark:border-blue-950/40 dark:bg-slate-900/60">
              <div className="text-lg font-semibold text-slate-900 dark:text-white">{copy.faq.title}</div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {copy.faq.items.map((x) => (
                  <div
                    key={x.q}
                    className="rounded-2xl bg-blue-50 p-4 dark:bg-slate-950/40"
                  >
                    <div className="text-[13px] font-semibold text-slate-900 dark:text-white">{x.q}</div>
                    <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">{x.a}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* bottom back */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/50">
              <div className="text-sm text-slate-600 dark:text-slate-300">
                {lang === "tr"
                  ? "Politika metnini ürün ve hukuki süreçlerine göre güncellemeyi unutma."
                  : "Remember to adapt this policy to your product and legal requirements."}
              </div>
              <Link
                href="/#start"
                className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md
                           dark:bg-sky-500 dark:hover:bg-sky-400"
              >
                {copy.backStart} →
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
