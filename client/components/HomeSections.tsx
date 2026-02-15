"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { useLocale } from "@/components/providers/LocaleProvider";
import type { Lang } from "@/lib/i18n";

import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { meThunk, selectAuthInitialized, selectAuthUser } from "@/lib/store/authSlice";
import Tonibot from "./workspace/Tonibot";

type FAQItem = { q: string; a: string };
type BlogItem = { title: string; desc: string; tag: string; date: string };

export default function HomeSections() {
  const { lang, ready } = useLocale();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const router = useRouter();
  const dispatch = useAppDispatch();

  const user = useAppSelector(selectAuthUser);
  const initialized = useAppSelector(selectAuthInitialized);

  // ✅ page mount -> me
  useEffect(() => {
    if (!initialized) dispatch(meThunk() as any);
  }, [initialized, dispatch]);

  // ✅ ortak yönlendirme
  function goWorkspaceOrLogin() {
    const target = user ? "/workspace" : "/login";
    router.push(target);
  }

  // initialized gelmeden tıklanırsa yanlış yönlendirme olmasın diye
  const ctaDisabled = !initialized;

  const copy = useMemo(() => {
    const tr = {
      featuresTitle: "Özellikler",
      featuresDesc:
        "Tonica, görevlerini düzenlerken sana akıllı öneriler sunan yapay destekli bir TODO deneyimidir. Hızlı karar ver, doğru işi seç, odaklan.",
      featureCards: [
        {
          title: "Akıllı Görev Önerileri",
          desc: "Günlük rutinine göre yeni görev önerileri ve mantıklı sonraki adımlar.",
          badge: "AI",
        },
        {
          title: "Başlık İyileştirme",
          desc: "Kısa ve belirsiz görevleri daha net hale getirir, anlaşılır başlık önerir.",
          badge: "AI",
        },
        {
          title: "Öncelik & Etiketleme",
          desc: "Öncelik (yüksek/orta/düşük) ve etiket önerileriyle hızlı düzenleme.",
          badge: "AI",
        },
        {
          title: "Focus Plan",
          desc: "Bugün için küçük, uygulanabilir bir plan çıkarır: önce ne, sonra ne?",
          badge: "AI",
        },
      ],
      previewTitle: "Önizleme",
      previewDesc:
        "Board akışı net: Todo → Doing → Done. Yapay destekli önerilerle görevleri hızla netleştirip ilerletirsin.",
      columns: [
        { title: "Todo", bullets: ["Görev ekle", "AI ile başlığı netleştir"] },
        {
          title: "Doing",
          bullets: ["Öncelik belirle", "Akıllı sonraki adım önerisi"],
        },
        { title: "Done", bullets: ["Tamamla", "Kısa özet oluştur (AI)"] },
      ],
      aboutTitle: "Tonica Hakkında",

      aboutDesc:
        "Tonica, karar verme süreçlerini sadeleştirmek ve dijital karmaşayı ortadan kaldırmak için tasarlanmış odaklı bir üretkenlik platformudur. Netlik ve düzen prensibiyle geliştirilen Tonica, dağınık görevleri yapılandırılmış bir akışa dönüştürerek niyetten aksiyona geçişi kesintisiz hale getirir. Osman Kaan Korkmaz tarafından tasarlanıp geliştirilen Tonica, gerçek üretkenliğin sadelik, akıllı destek ve temiz bir kullanıcı deneyimi ile mümkün olduğuna inanır.",

      aboutPoints: [
        "Minimal, tutarlı ve dikkat dağıtmayan arayüz",
        "Karar süreçlerini hızlandıran akıllı öneriler",
        "Yapılandırılmış akış sistemi: Planla → Uygula → Tamamla",
        "Derin odak ve netlik için tasarlandı",
        "Temiz mimari ve ölçeklenebilir yapı",
      ],

      stats: [
        { k: "Akış Sistemi", v: "Planla → Yapılıyor → Tamamlandı" },
        { k: "Temel Yaklaşım", v: "Sadelik + Akıllı Destek" },
        { k: "Ana Hedef", v: "Netlik, odak ve anlamlı ilerleme" },
        { k: "Geliştirici", v: "Osman Kaan Korkmaz" },
      ],
      faqTitle: "Sık Sorulan Sorular",
      faq: [
        {
          q: "Yapay destek ne işe yarar?",
          a: "Görev başlıklarını netleştirir, öncelik/etiket önerir ve gün planı için mantıklı adımlar sunar.",
        },
        {
          q: "Önerileri kapatabilir miyim?",
          a: "Evet. Yapay destek opsiyoneldir; istersen tamamen kapatıp klasik TODO olarak kullanabilirsin.",
        },
        {
          q: "Verilerim kaybolur mu?",
          a: "Görevler kalıcı olarak kaydedilir. Sayfayı yenilesen de listeni aynı şekilde görürsün.",
        },
      ] as FAQItem[],
      contactTitle: "İletişim",
      contactDesc:
        "Geri bildirim, istek veya hata bildirimi gönderebilirsin. Tonica’yı daha iyi hale getirelim.",
      form: {
        name: "Ad Soyad",
        email: "E-posta",
        message: "Mesaj",
        send: "Gönder",
      },
      blogTitle: "Blog",
      blogDesc: "Güncellemeler, kullanım ipuçları ve üretkenlik notları.",
      blog: [
        {
          tag: "İpucu",
          date: "2026",
          title: "Görev başlıklarını daha net yazmanın yolu",
          desc: "Belirsiz görevleri, uygulanabilir adımlara dönüştürmenin pratik yöntemi.",
        },
        {
          tag: "Odak",
          date: "2026",
          title: "Focus Plan ile günü bölmeden ilerle",
          desc: "3 adımlı planla dağılmadan iş bitirme alışkanlığı.",
        },
        {
          tag: "Akış",
          date: "2026",
          title: "Todo → Doing → Done: küçük bir sistem",
          desc: "Basit bir akışla karmaşayı azaltıp ilerlemeyi görünür kıl.",
        },
      ] as BlogItem[],
      startTitle: "Başlayalım",
      startDesc:
        "TODO board’a geç. Yapay destekle görevlerini netleştir, önceliklendir ve planla.",
      startBtn: "TODO Board'a Git",
      secondaryBtn: "Kısa Rehber",
      boardBtn: "Board'a Git",
      loadingCta: "Kontrol ediliyor…",
    };

    const en = {
      featuresTitle: "Features",
      featuresDesc:
        "Tonica is an AI-assisted TODO experience that helps you organize tasks with smart suggestions. Decide faster, pick the right next step, stay focused.",
      featureCards: [
        {
          title: "Smart Task Suggestions",
          desc: "Suggests useful tasks and logical next steps based on your routine.",
          badge: "AI",
        },
        {
          title: "Title Improvement",
          desc: "Turns vague tasks into clear, actionable titles with better wording.",
          badge: "AI",
        },
        {
          title: "Priority & Tagging",
          desc: "Recommends priority and tags so you can organize in seconds.",
          badge: "AI",
        },
        {
          title: "Focus Plan",
          desc: "Builds a small, doable plan for today: what first, what next.",
          badge: "AI",
        },
      ],
      previewTitle: "Preview",
      previewDesc:
        "The flow is clear: Todo → Doing → Done. With AI assistance, you can refine tasks and move forward faster.",
      columns: [
        { title: "Todo", bullets: ["Create a task", "Refine title with AI"] },
        {
          title: "Doing",
          bullets: ["Set priority", "Get smart next-step suggestions"],
        },
        { title: "Done", bullets: ["Complete", "Generate a short recap (AI)"] },
      ],
      aboutTitle: "About Tonica",

      aboutDesc:
        "Tonica is a focused productivity platform crafted to simplify decision-making and eliminate digital noise. Built with precision and clarity in mind, Tonica transforms scattered tasks into a structured flow — helping you move from intention to execution without distraction. Designed and developed by Osman Kaan Korkmaz, Tonica reflects a belief that true productivity comes from simplicity, smart assistance, and a clean user experience.",

      aboutPoints: [
        "Minimal, consistent and distraction-free interface",
        "Smart suggestions that accelerate decisions",
        "Structured flow system: Plan → Execute → Complete",
        "Designed for deep focus and clarity",
        "Engineered with scalability and clean architecture",
      ],

      stats: [
        { k: "Flow System", v: "Plan → Doing → Done" },
        { k: "Core Philosophy", v: "Simplicity powered by intelligence" },
        { k: "Primary Goal", v: "Clarity, focus & meaningful progress" },
        { k: "Created By", v: "Osman Kaan Korkmaz" },
      ],
      faqTitle: "FAQ",
      faq: [
        {
          q: "What does AI assistance do?",
          a: "It refines task titles, suggests priority/tags, and offers logical steps for your daily plan.",
        },
        {
          q: "Can I turn suggestions off?",
          a: "Yes. AI assistance is optional—you can disable it and use Tonica as a classic TODO app.",
        },
        {
          q: "Will my data disappear?",
          a: "Tasks are stored persistently. Even after refresh, your list remains the same.",
        },
      ] as FAQItem[],
      contactTitle: "Contact",
      contactDesc:
        "Send feedback, requests, or bug reports. Let’s make Tonica better together.",
      form: {
        name: "Full name",
        email: "Email",
        message: "Message",
        send: "Send",
      },
      blogTitle: "Blog",
      blogDesc: "Updates, tips, and productivity notes.",
      blog: [
        {
          tag: "Tip",
          date: "2026",
          title: "How to write clearer task titles",
          desc: "A practical method to turn vague tasks into actionable steps.",
        },
        {
          tag: "Focus",
          date: "2026",
          title: "Move forward without breaking your day",
          desc: "A 3-step plan to finish work without context switching.",
        },
        {
          tag: "Workflow",
          date: "2026",
          title: "Todo → Doing → Done: a small system",
          desc: "Reduce chaos and make progress visible with a simple flow.",
        },
      ] as BlogItem[],
      startTitle: "Let’s start",
      startDesc:
        "Open the TODO board. Refine, prioritize, and plan your tasks with AI assistance.",
      startBtn: "Open TODO Board",
      secondaryBtn: "Quick Guide",
      boardBtn: "Open board",
      loadingCta: "Checking…",
    };

    return lang === "tr" ? tr : en;
  }, [lang]);

  if (!ready) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="h-8 w-48 rounded-2xl bg-blue-50 dark:bg-slate-900/60" />
        <div className="mt-4 h-4 w-full max-w-xl rounded-2xl bg-blue-50 dark:bg-slate-900/60" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 rounded-3xl bg-blue-50 dark:bg-slate-900/60" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>

      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 -top-10 mx-auto h-40 max-w-6xl rounded-[48px] bg-linear-to-r from-blue-500/10 via-sky-400/10 to-blue-500/10 blur-2xl dark:from-sky-400/10 dark:via-blue-500/10 dark:to-sky-400/10" />
      </div>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{copy.featuresTitle}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {copy.featuresDesc}
            </p>
          </div>

          <div
            className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700
                          dark:border-blue-950/40 dark:bg-slate-950/40 dark:text-sky-200"
          >
            <span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-sky-500" />
            {lang === "tr" ? "Yapay destek açık" : "AI assist on"}
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {copy.featureCards.map((c) => (
            <div
              key={c.title}
              className="group relative overflow-hidden rounded-3xl border border-blue-100 bg-white p-6 shadow-sm transition
                         hover:-translate-y-0.5 hover:shadow-md hover:border-blue-200
                         dark:border-blue-950/40 dark:bg-slate-900/60 dark:hover:border-blue-900/60"
            >
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-500/10 blur-2xl opacity-0 transition group-hover:opacity-100 dark:bg-sky-400/10" />

              <div className="flex items-start justify-between gap-3">
                <div className="text-sm font-semibold text-slate-900 dark:text-white">{c.title}</div>
                <span
                  className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700
                                 dark:bg-slate-950/40 dark:text-sky-200"
                >
                  {c.badge}
                </span>
              </div>

              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{c.desc}</p>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs text-slate-500 dark:text-slate-400">{lang === "tr" ? "Detay" : "Details"}</div>
                <div className="text-sm font-medium text-blue-700 transition group-hover:translate-x-0.5 dark:text-sky-200">
                  →
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PREVIEW */}
      <section id="preview" className="mx-auto max-w-6xl px-6 py-12">
        <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-white p-8 shadow-sm dark:border-blue-950/40 dark:bg-slate-900/60">
          <div className="pointer-events-none absolute -left-24 -bottom-24 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl dark:bg-blue-500/10" />

          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{copy.previewTitle}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {copy.previewDesc}
              </p>
            </div>

            {/* ✅ aynı davranış */}
            <button
              type="button"
              disabled={ctaDisabled}
              onClick={goWorkspaceOrLogin}
              className={[
                "inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-medium shadow-sm transition",
                ctaDisabled
                  ? "bg-slate-200 text-slate-500 cursor-not-allowed dark:bg-white/10 dark:text-slate-400"
                  : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md dark:bg-sky-500 dark:hover:bg-sky-400",
              ].join(" ")}
            >
              {ctaDisabled ? copy.loadingCta : copy.boardBtn}
            </button>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {copy.columns.map((col) => (
              <div
                key={col.title}
                className="group rounded-2xl bg-blue-50 p-5 transition
                           hover:bg-blue-100/70
                           dark:bg-slate-950/40 dark:hover:bg-slate-950/60"
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">{col.title}</div>
                  <span
                    className="rounded-full bg-white px-2 py-1 text-[11px] font-medium text-slate-600 shadow-sm
                                   dark:bg-slate-900/60 dark:text-slate-300"
                  >
                    {lang === "tr" ? "Öneri" : "Assist"}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  {col.bullets.map((it) => (
                    <div
                      key={it}
                      className="rounded-xl border border-blue-100 bg-white px-3 py-2 text-sm text-slate-900 transition
                                 hover:border-blue-200
                                 dark:border-blue-950/40 dark:bg-slate-900/60 dark:text-white dark:hover:border-blue-900/60"
                    >
                      {it}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {lang === "tr"
                ? "Öneriler, işi hızlandırmak için tasarlanır — kontrol sende."
                : "Suggestions are designed to speed you up — you stay in control."}
            </p>

            <div
              className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700
                            dark:border-blue-950/40 dark:bg-slate-950/40 dark:text-sky-200"
            >
              {lang === "tr" ? "Responsive" : "Responsive"}
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-3xl border border-blue-100 bg-white p-8 shadow-sm dark:border-blue-950/40 dark:bg-slate-900/60">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{copy.aboutTitle}</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{copy.aboutDesc}</p>

            <ul className="mt-6 space-y-2">
              {copy.aboutPoints.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200">
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-50 text-blue-700 dark:bg-slate-950/40 dark:text-sky-200">
                    ✓
                  </span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl bg-linear-to-br from-blue-600 to-sky-500 p-8 text-white shadow-sm">
            <div className="text-sm font-semibold">{lang === "tr" ? "Özet" : "Summary"}</div>
            <div className="mt-5 space-y-3">
              {copy.stats.map((s) => (
                <div key={s.k} className="rounded-2xl bg-white/10 p-4">
                  <div className="text-xs text-white/80">{s.k}</div>
                  <div className="mt-1 text-sm font-semibold">{s.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">{copy.faqTitle}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Tonica ile ilgili en çok sorulan sorular. Tek tıkla aç, hızlıca netleşsin.
            </p>
          </div>

          <div className="hidden md:flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs text-slate-600 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-300">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            Quick answers
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {(copy.faq as FAQItem[]).map((item, idx) => {
            const opened = openFaq === idx;

            return (
              <div key={item.q} className="relative">
                <button
                  type="button"
                  onClick={() => setOpenFaq(opened ? null : idx)}
                  className={[
                    "group relative w-full text-left rounded-[26px] border p-6",
                    "bg-white/80 backdrop-blur shadow-sm transition-all",
                    "hover:-translate-y-0.5 hover:shadow-md",
                    "border-slate-200 hover:border-slate-300",
                    "dark:bg-slate-900/60 dark:border-white/10 dark:hover:border-white/15",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                    "dark:focus-visible:ring-offset-slate-950",
                  ].join(" ")}
                  aria-expanded={opened}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-[13px] font-semibold leading-snug text-slate-900 dark:text-white">{item.q}</div>
                      <div
                        className="mt-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-600
                                dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-300"
                      >
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500" />
                        Tonica FAQ
                      </div>
                    </div>

                    <span
                      className={[
                        "shrink-0 mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full",
                        "border border-slate-200 bg-white text-slate-700 shadow-sm transition",
                        "group-hover:border-slate-300",
                        "dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-200",
                      ].join(" ")}
                    >
                      <svg
                        className={["h-4 w-4 transition-transform duration-200", opened ? "rotate-180" : "rotate-0"].join(" ")}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </span>
                  </div>

                  <div className={["grid transition-all duration-300 ease-out", opened ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0 mt-0"].join(" ")}>
                    <div className="overflow-hidden">
                      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{item.a}</p>
                      <div className="mt-4 h-px w-full bg-linear-to-r from-transparent via-slate-200 to-transparent dark:via-white/10" />
                      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <span>Son güncelleme: {new Date().getFullYear()}</span>
                        <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400">
                          Detay
                          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M7 17L17 7" />
                            <path d="M7 7h10v10" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1 rounded-3xl border border-blue-100 bg-white p-8 shadow-sm dark:border-blue-950/40 dark:bg-slate-900/60">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{copy.contactTitle}</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{copy.contactDesc}</p>

            <div className="mt-6 space-y-3">
              <div className="rounded-2xl bg-blue-50 p-4 dark:bg-slate-950/40">
                <div className="text-xs text-slate-500 dark:text-slate-400">{lang === "tr" ? "Yanıt Süresi" : "Response time"}</div>
                <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{lang === "tr" ? "24–48 saat" : "24–48 hours"}</div>
              </div>
              <div className="rounded-2xl bg-blue-50 p-4 dark:bg-slate-950/40">
                <div className="text-xs text-slate-500 dark:text-slate-400">{lang === "tr" ? "Konu" : "Topic"}</div>
                <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                  {lang === "tr" ? "Geri bildirim / öneri" : "Feedback / request"}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 rounded-3xl border border-blue-100 bg-white p-8 shadow-sm dark:border-blue-950/40 dark:bg-slate-900/60">
            <form className="grid gap-4 md:grid-cols-2">
              <input
                className="rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition
                           focus:border-blue-300 focus:ring-2 focus:ring-blue-200
                           dark:border-blue-950/40 dark:bg-slate-950/40 dark:text-white dark:focus:ring-sky-900/40"
                placeholder={copy.form.name}
              />
              <input
                className="rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition
                           focus:border-blue-300 focus:ring-2 focus:ring-blue-200
                           dark:border-blue-950/40 dark:bg-slate-950/40 dark:text-white dark:focus:ring-sky-900/40"
                placeholder={copy.form.email}
              />
              <textarea
                className="md:col-span-2 min-h-35 rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition
                           focus:border-blue-300 focus:ring-2 focus:ring-blue-200
                           dark:border-blue-950/40 dark:bg-slate-950/40 dark:text-white dark:focus:ring-sky-900/40"
                placeholder={copy.form.message}
              />
              <button
                type="button"
                className="md:col-span-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-medium text-white shadow-sm transition
                           hover:bg-blue-700 hover:shadow-md
                           dark:bg-sky-500 dark:hover:bg-sky-400"
              >
                {copy.form.send}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* BLOG */}
      <section id="blog" className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Blog</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{copy.blogDesc}</p>
          </div>
          <a
            href="#"
            className="text-sm font-medium text-blue-700 hover:text-blue-800 transition
                       dark:text-sky-300 dark:hover:text-sky-200"
          >
            {lang === "tr" ? "Tüm yazılar →" : "All posts →"}
          </a>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {(copy.blog as BlogItem[]).map((p) => (
            <div
              key={p.title}
              className="group rounded-3xl border border-blue-100 bg-white p-6 shadow-sm transition
                         hover:-translate-y-0.5 hover:shadow-md hover:border-blue-200
                         dark:border-blue-950/40 dark:bg-slate-900/60 dark:hover:border-blue-900/60"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-slate-950/40 dark:text-sky-200">
                  {p.tag}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{p.date}</span>
              </div>

              <div className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">{p.title}</div>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{p.desc}</p>

              <div className="mt-4 text-sm font-medium text-blue-700 transition group-hover:translate-x-0.5 dark:text-sky-200">
                {lang === "tr" ? "Devamını oku →" : "Read more →"}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* START */}
      <section id="start" className="mx-auto max-w-6xl px-6 pb-16">
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-blue-600 to-sky-500 p-10 text-white shadow-sm">
          <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-2xl" />

          <h3 className="text-2xl font-semibold">{copy.startTitle}</h3>
          <p className="mt-2 max-w-2xl text-white/90">{copy.startDesc}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            {/* ✅ aynı davranış */}
            <button
              type="button"
              disabled={ctaDisabled}
              onClick={goWorkspaceOrLogin}
              className={[
                "rounded-2xl px-5 py-3 text-sm font-medium shadow-sm transition",
                ctaDisabled ? "bg-white/30 text-white/80 cursor-not-allowed" : "bg-white text-blue-700 hover:bg-blue-50 hover:shadow-md",
              ].join(" ")}
            >
              {ctaDisabled ? copy.loadingCta : copy.startBtn}
            </button>

            <button
              type="button"
              className="rounded-2xl border border-white/30 px-5 py-3 text-sm font-medium transition hover:bg-white/10"
            >
              {copy.secondaryBtn}
            </button>
          </div>
        </div>
        <Tonibot />
      </section>
    </>
  );
}
