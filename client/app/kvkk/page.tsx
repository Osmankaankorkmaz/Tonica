// app/kvkk/page.tsx
"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { Lang } from "@/lib/i18n";

function cn(...c: Array<string | false | undefined | null>) {
  return c.filter(Boolean).join(" ");
}

type Section = { id: string; title: string; body: string[] };

export default function KvkkPage() {
  const { lang, ready } = useLocale();

  const copy = useMemo(() => {
    const tr = {
      badge: "Tonica • Yasal",
      title: "KVKK Aydınlatma Metni",
      subtitle:
        "Bu metin; 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında, Tonica’nın kişisel verileri nasıl işlediğine dair bilgilendirme sağlar.",
      updated: "Son güncelleme",
      toc: "İçindekiler",
      backHome: "Ana sayfaya dön",
      backStart: "Başlayalım",
      disclaimerTitle: "Not",
      disclaimerText:
        "Bu metin genel bir şablondur. Hukuki uyumluluk için şirket süreçlerine ve avukat görüşüne göre özelleştirilmelidir.",
      controllerTitle: "Veri Sorumlusu",
      controllerText:
        "Tonica (platform) kapsamında veri sorumlusu sıfatıyla hareket eden taraf; ürünü işleten gerçek/tüzel kişidir. (Buraya şirket/ünvan bilgisi ekleyin.)",
      sections: [
        {
          id: "definitions",
          title: "1) Tanımlar",
          body: [
            "Kişisel veri: Kimliği belirli veya belirlenebilir gerçek kişiye ilişkin her türlü bilgi.",
            "İşleme: Kişisel verilerin elde edilmesi, kaydedilmesi, depolanması, değiştirilmesi, açıklanması gibi her türlü işlem.",
            "Veri sorumlusu: Verilerin işleme amaçlarını ve vasıtalarını belirleyen, sistemin kurulmasından ve yönetilmesinden sorumlu kişi/kurum.",
          ],
        },
        {
          id: "data",
          title: "2) İşlenen Kişisel Veri Kategorileri",
          body: [
            "Kimlik/iletişim: ad-soyad, e-posta (kayıt ve iletişim için).",
            "Hesap bilgileri: kullanıcı kimliği, oturum belirteçleri (token) (güvenlik ve giriş için).",
            "Ürün kullanım verileri: görev başlıkları/açıklamaları, etiketler, kategori, odak oturumları (ürün işlevlerini sağlamak için).",
            "Teknik veriler: IP, tarayıcı bilgisi, cihaz/işletim sistemi (güvenlik ve performans için).",
          ],
        },
        {
          id: "purposes",
          title: "3) İşleme Amaçları",
          body: [
            "Hizmetlerin sunulması ve hesabın yönetilmesi (kayıt, giriş, görev/odak özellikleri).",
            "Güvenlik: yetkilendirme, kötüye kullanımın önlenmesi, sistem güvenliği.",
            "Destek ve iletişim: taleplerin yanıtlanması, hata çözümleri.",
            "Ürün iyileştirme: performans ölçümü ve kullanıcı deneyiminin geliştirilmesi (varsa analitik).",
          ],
        },
        {
          id: "legal",
          title: "4) Hukuki Sebepler",
          body: [
            "Bir sözleşmenin kurulması/ifası için zorunlu olması (KVKK m.5/2-c).",
            "Veri sorumlusunun hukuki yükümlülüğünü yerine getirmesi (KVKK m.5/2-ç) (uygulanabilir olduğu ölçüde).",
            "Meşru menfaat (KVKK m.5/2-f) (güvenlik ve hizmet kalitesi).",
            "Açık rıza (KVKK m.5/1) (analitik/pazarlama gibi isteğe bağlı alanlar için).",
          ],
        },
        {
          id: "transfer",
          title: "5) Aktarım ve Üçüncü Taraflar",
          body: [
            "Altyapı sağlayıcıları: barındırma (hosting), CDN, hata izleme, e-posta servisleri gibi tedarikçiler (gerektiği ölçüde).",
            "Yurt dışına aktarım: kullandığınız servislerin lokasyonuna bağlı olarak yurt dışına aktarım söz konusu olabilir. Gerekli hallerde açık rıza ve/veya KVKK’ya uygun güvenceler sağlanır.",
          ],
        },
        {
          id: "retention",
          title: "6) Saklama Süresi",
          body: [
            "Kişisel veriler; işleme amaçları için gerekli süre boyunca ve ilgili mevzuatın öngördüğü asgari süreler kadar saklanır.",
            "Hesap silme/kapama taleplerinde, teknik ve hukuki yükümlülükler saklı kalmak üzere silme/yok etme/anonimleştirme yapılır.",
          ],
        },
        {
          id: "rights",
          title: "7) KVKK Kapsamında Hakların",
          body: [
            "Kişisel verilerinin işlenip işlenmediğini öğrenme.",
            "İşlenmişse buna ilişkin bilgi talep etme.",
            "İşleme amacını ve amaca uygun kullanılıp kullanılmadığını öğrenme.",
            "Yurt içinde/yurt dışında aktarıldığı üçüncü kişileri bilme.",
            "Eksik/yanlış işlenmişse düzeltilmesini isteme.",
            "KVKK’da öngörülen şartlar çerçevesinde silinmesini/yok edilmesini isteme.",
            "Düzeltme/silme işlemlerinin aktarılan üçüncü kişilere bildirilmesini isteme.",
            "İşlenen verilerin münhasıran otomatik sistemler ile analiz edilmesi nedeniyle aleyhe sonucun ortaya çıkmasına itiraz etme.",
            "Kanuna aykırı işleme nedeniyle zarara uğraması hâlinde zararın giderilmesini talep etme.",
          ],
        },
        {
          id: "apply",
          title: "8) Başvuru Yöntemi",
          body: [
            "Taleplerini yazılı olarak veya KVKK’nın öngördüğü yöntemlerle iletebilirsin.",
            "İletişim: (Buraya destek e-postası / iletişim kanalı ekleyin.)",
          ],
        },
        {
          id: "cookies",
          title: "9) Çerezler",
          body: [
            "Çerez kullanımına ilişkin detaylar için Çerez Politikası sayfasını inceleyebilirsin.",
          ],
        },
      ] as Section[],
      quickLinks: {
        cookie: "Çerez Politikası",
        contact: "İletişim",
      },
    };

    const en = {
      badge: "Tonica • Legal",
      title: "Privacy Notice (KVKK / Data Protection)",
      subtitle:
        "This notice explains how Tonica processes personal data under applicable data protection principles (KVKK for Türkiye) and related regulations.",
      updated: "Last updated",
      toc: "Contents",
      backHome: "Back to home",
      backStart: "Get started",
      disclaimerTitle: "Note",
      disclaimerText:
        "This is a general template. Please adapt it to your organization and consult legal counsel for compliance.",
      controllerTitle: "Data Controller",
      controllerText:
        "Within the Tonica platform, the data controller is the entity operating the service. (Add your legal entity/name details here.)",
      sections: [
        {
          id: "definitions",
          title: "1) Definitions",
          body: [
            "Personal data: Any information relating to an identified or identifiable natural person.",
            "Processing: Any operation performed on personal data (collection, storage, disclosure, etc.).",
            "Data controller: The entity that determines purposes and means of processing.",
          ],
        },
        {
          id: "data",
          title: "2) Categories of Personal Data",
          body: [
            "Identity/contact: name, email (for account and communication).",
            "Account data: user ID, session tokens (for authentication/security).",
            "Product usage data: tasks (titles/descriptions/tags), focus sessions (to provide features).",
            "Technical data: IP, browser/device info (security and performance).",
          ],
        },
        {
          id: "purposes",
          title: "3) Purposes of Processing",
          body: [
            "Providing the service and account management (register/login, tasks/focus features).",
            "Security: authorization, abuse prevention, system protection.",
            "Support & communication: responding to requests, troubleshooting.",
            "Improvement: performance measurement and UX improvements (if analytics is enabled).",
          ],
        },
        {
          id: "legal",
          title: "4) Legal Grounds",
          body: [
            "Necessity for contract performance.",
            "Compliance with legal obligations (where applicable).",
            "Legitimate interests (security and service quality).",
            "Consent (for optional analytics/marketing activities).",
          ],
        },
        {
          id: "transfer",
          title: "5) Transfers & Third Parties",
          body: [
            "Vendors: hosting, CDN, error monitoring, email delivery providers (as needed).",
            "International transfers: may occur depending on vendor locations; appropriate safeguards and/or consent may be used where required.",
          ],
        },
        {
          id: "retention",
          title: "6) Retention Period",
          body: [
            "Data is retained for as long as necessary for purposes and for minimum periods required by law.",
            "Upon account deletion requests, deletion/destruction/anonymization may be applied subject to legal/technical obligations.",
          ],
        },
        {
          id: "rights",
          title: "7) Your Rights",
          body: [
            "Learn whether your personal data is processed.",
            "Request information if processed.",
            "Learn the purpose and whether it is used accordingly.",
            "Know third parties to whom data is transferred domestically/abroad.",
            "Request correction of incomplete/incorrect data.",
            "Request deletion/destruction under applicable conditions.",
            "Request notification of correction/deletion to third parties.",
            "Object to adverse results from fully automated processing.",
            "Claim compensation if you suffer damage due to unlawful processing.",
          ],
        },
        {
          id: "apply",
          title: "8) How to Submit a Request",
          body: [
            "You can submit your requests in writing or via methods allowed by applicable law.",
            "Contact: (Add your support email/contact channel here.)",
          ],
        },
        {
          id: "cookies",
          title: "9) Cookies",
          body: [
            "For details on cookie usage, please see the Cookie Policy page.",
          ],
        },
      ] as Section[],
      quickLinks: {
        cookie: "Cookie Policy",
        contact: "Contact",
      },
    };

    return (lang as Lang) === "tr" ? tr : en;
  }, [lang]);

  if (!ready) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="h-8 w-56 rounded-2xl bg-blue-50 dark:bg-slate-900/60" />
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
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
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
          {/* TOC + quick links */}
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

              <div className="mt-5 h-px w-full bg-linear-to-r from-transparent via-slate-200 to-transparent dark:via-white/10" />

              <div className="mt-4 grid gap-2">
                <Link
                  href="/cerez-politikasi"
                  className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-white
                             dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-200 dark:hover:bg-slate-900/70"
                >
                  {copy.quickLinks.cookie} →
                </Link>
                <Link
                  href="/#contact"
                  className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-white
                             dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-200 dark:hover:bg-slate-900/70"
                >
                  {copy.quickLinks.contact} →
                </Link>
              </div>
            </div>

            <div className="rounded-3xl bg-linear-to-br from-blue-600 to-sky-500 p-6 text-white shadow-sm">
              <div className="text-sm font-semibold">{copy.disclaimerTitle}</div>
              <p className="mt-2 text-sm text-white/90">{copy.disclaimerText}</p>
            </div>
          </aside>

          {/* sections */}
          <section className="lg:col-span-2 space-y-4">
            {/* controller card */}
            <div className="rounded-3xl border border-blue-100 bg-white p-7 shadow-sm dark:border-blue-950/40 dark:bg-slate-900/60">
              <div className="text-lg font-semibold text-slate-900 dark:text-white">{copy.controllerTitle}</div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {copy.controllerText}
              </p>
            </div>

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

            {/* bottom note */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/50">
              <div className="text-sm text-slate-600 dark:text-slate-300">
                {lang === "tr"
                  ? "İletişim alanını ve veri sorumlusu bilgilerini kendi şirket bilgilerinle güncelle."
                  : "Update the controller and contact details with your organization information."}
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/cerez-politikasi"
                  className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md
                             dark:bg-sky-500 dark:hover:bg-sky-400"
                >
                  {copy.quickLinks.cookie} →
                </Link>
                <Link
                  href="/#start"
                  className="rounded-2xl border border-white/10 bg-white/70 px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-white
                             dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-200 dark:hover:bg-slate-900/70"
                >
                  {copy.backStart} →
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
