"use client";

import { dict } from "@/lib/i18n";
import { useLocale } from "@/components/providers/LocaleProvider";

type MockItem = { title: { tr: string; en: string }; status: "todo" | "doing" | "done" };
type Stat = { a: string; b: string };

export default function TodoHero() {
  const { lang, ready } = useLocale();
  const t = dict[lang];

  // ✅ Gerçek proje metinleri (UI aynı, içerik profesyonel)
  const copy = {
    badge: lang === "tr" ? "AI destekli görev yönetimi" : "AI-assisted task management",
    title1: lang === "tr" ? "Günün işlerini" : "Keep your day",
    title2: lang === "tr" ? "netleştir," : "clear,",
    title3: lang === "tr" ? "odaklan ve bitir." : "focused, and done.",
    desc:
      lang === "tr"
        ? "Tonica, görevlerini sade bir akışta toplar ve yapay destekle başlıkları netleştirmenize, öncelik belirlemenize ve bir sonraki adımı seçmenize yardımcı olur."
        : "Tonica keeps your tasks in a clean workflow and uses AI assistance to refine titles, set priorities, and suggest the next best step.",

    cta1: lang === "tr" ? "TODO Board’a Git" : "Open TODO Board",
    cta2: lang === "tr" ? "Nasıl Çalışır?" : "How it works",

    stats: [
      lang === "tr"
        ? ({ a: "Hızlı akış", b: "Todo → Doing → Done" } as Stat)
        : ({ a: "Fast flow", b: "Todo → Doing → Done" } as Stat),
      lang === "tr"
        ? ({ a: "Akıllı destek", b: "Net başlık + öncelik" } as Stat)
        : ({ a: "Smart assist", b: "Clear title + priority" } as Stat),
      lang === "tr"
        ? ({ a: "Kalıcı kayıt", b: "Sayfa yenilense de aynı" } as Stat)
        : ({ a: "Persistent", b: "Stays after refresh" } as Stat),
    ],

    mockTitle: "Tonica Board",
    mockMeta: lang === "tr" ? "Bugün" : "Today",
    mockItems: [
      {
        title: { tr: "Faturaları öde (internet/elektrik)", en: "Pay bills (internet/electricity)" },
        status: "doing",
      },
      {
        title: { tr: "Sunum taslağını düzenle", en: "Refine presentation draft" },
        status: "todo",
      },
      {
        title: { tr: "Haftalık planı çıkar (3 madde)", en: "Create weekly plan (3 items)" },
        status: "todo",
      },
    ] as MockItem[],

    tipLabel: lang === "tr" ? "Akıllı öneri" : "Smart tip",
    tipText:
      lang === "tr"
        ? "Belirsiz görevleri tek cümlelik, yapılabilir adımlara çevir. Önce netleştir, sonra önceliklendir."
        : "Turn vague tasks into one-line, actionable steps. Clarify first, then prioritize.",
  };

  const statusLabel = (s: MockItem["status"]) => {
    if (lang === "tr") {
      if (s === "todo") return "Todo";
      if (s === "doing") return "Devam";
      return "Bitti";
    }
    // EN
    if (s === "todo") return "Todo";
    if (s === "doing") return "Doing";
    return "Done";
  };

  if (!ready) {
    return (
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-blue-50 to-white dark:from-slate-950 dark:to-slate-950" />
        <div className="relative mx-auto max-w-6xl px-6 pt-14 pb-10">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <div className="h-7 w-56 rounded-full bg-white/70 dark:bg-slate-900/60" />
              <div className="mt-5 h-12 w-full max-w-xl rounded-2xl bg-white/70 dark:bg-slate-900/60" />
              <div className="mt-4 h-6 w-full max-w-lg rounded-2xl bg-white/70 dark:bg-slate-900/60" />
              <div className="mt-6 flex gap-3">
                <div className="h-11 w-36 rounded-2xl bg-white/70 dark:bg-slate-900/60" />
                <div className="h-11 w-36 rounded-2xl bg-white/70 dark:bg-slate-900/60" />
              </div>
            </div>
            <div className="h-80 rounded-3xl bg-white/70 dark:bg-slate-900/60" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-b from-blue-50 to-white dark:from-slate-950 dark:to-slate-950" />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-130 w-130 -translate-x-1/2 rounded-full
                   bg-linear-to-br from-blue-500/25 to-sky-300/10 blur-3xl"
      />
      <div
        className="pointer-events-none absolute -bottom-44 right-10 h-130 w-130 rounded-full
                   bg-linear-to-br from-sky-400/20 to-blue-700/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-6 pt-14 pb-10">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <div
              className="inline-flex items-center gap-2 rounded-full border border-blue-200/70 bg-white/70 px-3 py-1 text-xs text-blue-700
                         dark:border-blue-900/40 dark:bg-slate-900/60 dark:text-sky-200"
            >
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              {copy.badge}
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl dark:text-white">
              {copy.title1}{" "}
              <span className="bg-linear-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">
                {copy.title2}
              </span>{" "}
              {copy.title3}
            </h1>

            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">{copy.desc}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="/todos"
                className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition
                           dark:bg-sky-500 dark:hover:bg-sky-400"
              >
                {copy.cta1}
              </a>
              <a
                href="#features"
                className="rounded-2xl border border-blue-200 bg-white px-5 py-3 text-sm font-medium text-blue-700 hover:bg-blue-50 transition
                           dark:border-blue-900/50 dark:bg-slate-900 dark:text-sky-200 dark:hover:bg-slate-800"
              >
                {copy.cta2}
              </a>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3">
              {copy.stats.map((s) => (
                <div
                  key={s.a}
                  className="rounded-2xl border border-blue-100 bg-white/70 p-4 shadow-sm
                             dark:border-blue-950/40 dark:bg-slate-900/60"
                >
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">{s.a}</div>
                  <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">{s.b}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right mock */}
          <div className="relative">
            <div className="absolute -inset-2 rounded-3xl bg-linear-to-br from-blue-600/15 to-sky-400/5 blur-2xl" />
            <div
              className="relative rounded-3xl border border-blue-100 bg-white/80 p-6 shadow-sm
                         dark:border-blue-950/40 dark:bg-slate-900/70"
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-900 dark:text-white">{copy.mockTitle}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{copy.mockMeta}</div>
              </div>

              <div className="mt-5 space-y-3">
                {copy.mockItems.map((x) => (
                  <div
                    key={x.title.tr}
                    className="flex items-center justify-between rounded-2xl border border-blue-100 bg-white px-4 py-3
                               dark:border-blue-950/40 dark:bg-slate-950/40"
                  >
                    <div className="text-sm text-slate-900 dark:text-white">{x.title[lang]}</div>
                    <span className="rounded-full bg-blue-600 px-2.5 py-1 text-xs text-white dark:bg-sky-500">
                      {statusLabel(x.status)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl bg-blue-50 p-4 dark:bg-slate-950/50">
                <div className="text-xs text-slate-600 dark:text-slate-300">{copy.tipLabel}</div>
                <div className="mt-1 text-sm text-slate-900 dark:text-white">{copy.tipText}</div>
              </div>

              {/* küçük güven notu (gerçek proje hissi) */}
              <div className="mt-4 text-[11px] text-slate-500 dark:text-slate-400">
                {lang === "tr"
                  ? "Not: Öneriler destek amaçlıdır. Kontrol her zaman sende."
                  : "Note: Suggestions are assistive. You remain in control."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
