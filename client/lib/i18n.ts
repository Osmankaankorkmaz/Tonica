export type Lang = "tr" | "en";

export const dict = {
  tr: {
    nav: { features: "Özellikler", preview: "Önizleme", start: "Başla" },
    hero: {
      badge: "Next.js + Tailwind • Tonica TODO",
      title1: "Görevlerini",
      title2: "mavi bir akışla",
      title3: "yönet.",
      desc: "Ekle • Listele • Güncelle • Sil. Basit, hızlı ve modern bir TODO deneyimi.",
      cta1: "Hemen Başla",
      cta2: "Önizleme",
      stat1t: "Hızlı",
      stat1d: "Akıcı arayüz",
      stat2t: "Düzenli",
      stat2d: "Durum yönetimi",
      stat3t: "Güvenli",
      stat3d: "Tema + dil",
    },
    features: {
      title: "Özellikler",
      items: [
        { t: "Ekle", d: "Görev ekleme akışı." },
        { t: "Listele", d: "Duruma göre görüntüle." },
        { t: "Güncelle", d: "Başlık/durum düzenle." },
        { t: "Sil", d: "Tek tıkla kaldır." },
      ],
    },
    preview: {
      title: "Önizleme",
      desc: "Bu bölüm gerçek TODO ekranına dönüşecek.",
      col1: "Yapılacak",
      col2: "Devam",
      col3: "Bitti",
    },
    cta: {
      title: "Tonica ile başla",
      desc: "Bir sonraki adım: TODO formu + liste + edit + silme onayı.",
      btn1: "CRUD Ekranını Oluştur",
      btn2: "LocalStorage / API Seç",
    },
    footer: {
      desc: "Minimal, hızlı ve modern TODO deneyimi.",
      rights: "Tüm hakları saklıdır.",
    },
  },
  en: {
    nav: { features: "Features", preview: "Preview", start: "Start" },
    hero: {
      badge: "Next.js + Tailwind • Tonica TODO",
      title1: "Manage your tasks",
      title2: "with a clean",
      title3: "blue flow.",
      desc: "Create • List • Update • Delete. Simple, fast, modern.",
      cta1: "Get Started",
      cta2: "Preview",
      stat1t: "Fast",
      stat1d: "Smooth UI",
      stat2t: "Organized",
      stat2d: "Status workflow",
      stat3t: "Polished",
      stat3d: "Theme + language",
    },
    features: {
      title: "Features",
      items: [
        { t: "Create", d: "Add tasks instantly." },
        { t: "List", d: "View by status." },
        { t: "Update", d: "Edit title/status." },
        { t: "Delete", d: "Remove in one click." },
      ],
    },
    preview: {
      title: "Preview",
      desc: "This section will become the real TODO board.",
      col1: "To do",
      col2: "Doing",
      col3: "Done",
    },
    cta: {
      title: "Start with Tonica",
      desc: "Next step: form + list + edit + delete confirm.",
      btn1: "Build CRUD Screen",
      btn2: "Choose LocalStorage / API",
    },
    footer: {
      desc: "Minimal, fast and modern TODO experience.",
      rights: "All rights reserved.",
    },
  },
} as const;

export const LANG_KEY = "tonica-lang" as const;
export const LANG_EVENT = "tonica-lang-change" as const;

export function setLangPersist(next: Lang) {
  localStorage.setItem(LANG_KEY, next);
  window.dispatchEvent(new Event(LANG_EVENT)); // ✅ aynı sekmeye bildir
}

export function getLangPersist(): Lang {
  const v = localStorage.getItem(LANG_KEY);
  return (v === "en" || v === "tr") ? v : "tr";
}