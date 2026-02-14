"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, X, Send, Sparkles, CalendarDays, Compass, MessageCircle } from "lucide-react";

import { useLocale } from "@/components/providers/LocaleProvider";
import type { Lang } from "@/lib/i18n";

declare global {
  interface Window {
    puter?: any;
  }
}

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

type Msg = { id: string; role: "user" | "bot"; text: string };

type Props = {
  selectedTaskTitle?: string | null;
  model?: string; // "gpt-5-nano" vb
};

export default function Tonibot({ selectedTaskTitle = null, model = "gpt-5-nano" }: Props) {
  const { lang, ready } = useLocale(); // ✅ senin app dili buradan geliyor
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [puterReady, setPuterReady] = useState(false);

  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const copy = useMemo(() => {
    const tr = {
      a11y: {
        open: "Tonibot'u aç",
        close: "Kapat",
        closeOverlay: "Arka planı kapat",
      },
      ui: {
        title: "Tonibot",
        subtitle: "Genel sohbet",
        ask: "Sor",
        placeholder: "Mesaj yaz…",
        send: "Gönder",
        model: "Model",
        typing: "Tonibot yazıyor…",
        aiReady: "AI hazır ✅",
        aiNotReady: "AI hazır değil ⚠️",
      },
      bot: {
        welcome:
          "Selam! Ben Tonibot 🤖\n\nNormal sohbet edebiliriz 😄 İstersen Tonica görevlerini de birlikte planlarız.\n\nBir şey sor 👇",
        puterNotReady:
          "Puter hazır değil / yüklenemedi.\n\n• Adblock kapat\n• js.puter.com engelli mi kontrol et\n• Sayfayı yenile\n\nAI yanıtı için Puter gerekli.",
        emptyAnswer: "Cevap alınamadı. (Boş yanıt)",
        cantAnswer: "Şu an cevap veremiyorum",
      },
      quick: {
        hello: "Selam: naber 😄",
        fun: "Muhabbet: motivasyon 😅",
        planDay: "Günlük Plan Yap: hızlı",
        tonicaHelp: "Tonica Yardım: düzen",
      },
      quickPrompts: {
        hello: "Selam: naber 😄",
        fun: "Muhabbet: Bana kısa bir motivasyon cümlesi yaz 😅",
        planDay: "Günlük Plan Yap: Bugün için küçük bir plan yapmama yardım eder misin?",
        tonicaHelp: "Tonica Yardım: Tonica’da görevleri en iyi nasıl düzenlerim?",
      },
    };

    const en = {
      a11y: {
        open: "Open Tonibot",
        close: "Close",
        closeOverlay: "Close overlay",
      },
      ui: {
        title: "Tonibot",
        subtitle: "General chat",
        ask: "Ask",
        placeholder: "Type a message…",
        send: "Send",
        model: "Model",
        typing: "Tonibot is typing…",
        aiReady: "AI ready ✅",
        aiNotReady: "AI not ready ⚠️",
      },
      bot: {
        welcome:
          "Hi! I’m Tonibot 🤖\n\nWe can chat casually 😄 and I can also help you plan your Tonica tasks.\n\nAsk me something 👇",
        puterNotReady:
          "Puter is not ready / failed to load.\n\n• Disable Adblock\n• Check if js.puter.com is blocked\n• Refresh the page\n\nPuter is required for AI replies.",
        emptyAnswer: "No answer received. (Empty response)",
        cantAnswer: "I can’t answer right now",
      },
      quick: {
        hello: "Hello: what’s up 😄",
        fun: "Chat: motivation 😅",
        planDay: "Daily Plan: quick",
        tonicaHelp: "Tonica Help: organize",
      },
      quickPrompts: {
        hello: "Hello: what’s up 😄",
        fun: "Chat: write a short motivation line 😅",
        planDay: "Daily Plan: can you help me make a small plan for today?",
        tonicaHelp: "Tonica Help: how should I organize my tasks best?",
      },
    };

    return (lang as Lang) === "tr" ? tr : en;
  }, [lang]);

  // ✅ mesajları init et (dil değişince, kullanıcı yazmadıysa welcome’ı güncelle)
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: "m1", role: "bot", text: "…" }, // ready gelince replace edeceğiz
  ]);

  useEffect(() => {
    if (!ready) return;
    setMsgs((prev) => {
      const userHasWritten = prev.some((m) => m.role === "user");
      if (userHasWritten) return prev;

      const copyMsgs = [...prev];
      if (copyMsgs[0]?.role === "bot") {
        copyMsgs[0] = { ...copyMsgs[0], text: copy.bot.welcome };
      }
      return copyMsgs;
    });
  }, [ready, copy.bot.welcome]);

  // Puter hazır mı kontrol
  useEffect(() => {
    const tick = setInterval(() => {
      if (window.puter?.ai?.chat) {
        setPuterReady(true);
        clearInterval(tick);
      }
    }, 120);

    setTimeout(() => {
      clearInterval(tick);
      setPuterReady(!!window.puter?.ai?.chat);
    }, 5000);

    return () => clearInterval(tick);
  }, []);

  // open olduğunda fokus + scroll
  useEffect(() => {
    if (!open) return;
    setTimeout(() => {
      inputRef.current?.focus();
      listRef.current?.scrollTo({ top: 999999, behavior: "smooth" });
    }, 60);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => listRef.current?.scrollTo({ top: 999999, behavior: "smooth" }), 40);
  }, [msgs.length, open]);

  // ESC ile kapat
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const system = useMemo(() => {
    const isTR = (lang as Lang) === "tr";
    return [
      "You are Tonibot, a friendly chat assistant inside the Tonica app.",
      `Language: respond in ${isTR ? "Turkish" : "English"}.`,
      "",
      "SCOPE (soft restriction):",
      "- You can answer: Tonica usage, tasks, TODO workflows, productivity, planning, focus, habits, motivation, light casual chat.",
      "- You should avoid: medical/legal/financial advice, politics, explicit adult content, hacking/illegal instructions, or anything unrelated to Tonica/productivity.",
      "",
      "SELF-DECISION RULE:",
      "- Decide whether to answer based on whether the question is within scope.",
      "- If it is clearly in-scope: answer helpfully.",
      "- If it is borderline: ask ONE short clarifying question OR gently redirect to a Tonica/productivity angle.",
      "- If it is out-of-scope: politely refuse in 1-2 sentences and offer a relevant Tonica/productivity alternative.",
      "",
      "STYLE:",
      isTR ? "- Friendly, short, practical. Use simple Turkish." : "- Friendly, short, practical. Use simple English.",
      selectedTaskTitle ? `Context: user has a selected task titled: "${selectedTaskTitle}".` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }, [selectedTaskTitle, lang]);

  function push(role: Msg["role"], t: string) {
    setMsgs((s) => [...s, { id: crypto.randomUUID(), role, text: t }]);
  }

  function updateLastBotText(nextText: string) {
    setMsgs((prev) => {
      const copyMsgs = [...prev];
      const last = copyMsgs[copyMsgs.length - 1];
      if (!last || last.role !== "bot") return prev;
      copyMsgs[copyMsgs.length - 1] = { ...last, text: nextText };
      return copyMsgs;
    });
  }

  function quick(action: "hello" | "planDay" | "tonicaHelp" | "fun") {
    const map = copy.quickPrompts;
    setOpen(true);
    setTimeout(() => {
      setText(map[action]);
      inputRef.current?.focus();
    }, 0);
  }

  async function onSend() {
    const v = text.trim();
    if (!v || sending) return;

    setText("");
    push("user", v);

    if (!window.puter?.ai?.chat) {
      push("bot", copy.bot.puterNotReady);
      return;
    }

    try {
      setSending(true);
      push("bot", "…");

      const resp = await window.puter.ai.chat(
        [
          { role: "system", content: system },
          ...msgs.map((m) => ({
            role: m.role === "bot" ? "assistant" : "user",
            content: m.text,
          })),
          { role: "user", content: v },
        ],
        { model, stream: true }
      );

      let acc = "";
      for await (const part of resp) {
        const t = part?.text ?? "";
        if (!t) continue;
        acc += t;
        updateLastBotText(acc);
      }
      if (!acc.trim()) updateLastBotText(copy.bot.emptyAnswer);
    } catch (e: any) {
      updateLastBotText(`${copy.bot.cantAnswer}: ${e?.message || "AI error"}`);
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }

  // ✅ Hydration flicker olmasın (senin HomeSections gibi)
  if (!ready) return null;

  return (
    <>
      {/* Mobil overlay */}
      {open ? (
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-[2px] sm:hidden"
          aria-label={copy.a11y.closeOverlay}
        />
      ) : null}

      <div className="fixed bottom-4 right-4 z-[9999] sm:bottom-6 sm:right-6">
        <div className="flex flex-col items-end gap-3">
          {open ? (
            <div
              className={cn(
                "w-[calc(100vw-2rem)] sm:w-[400px]",
                "max-h-[70vh] sm:max-h-[520px]",
                "overflow-hidden rounded-3xl border shadow-2xl",
                "border-slate-200 bg-white",
                "dark:border-white/10 dark:bg-slate-950"
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-white/10">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-sm">
                    <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 dark:from-sky-500 dark:to-blue-600" />
                    <Bot className="relative h-5 w-5" />
                  </span>

                  <div className="min-w-0">
                    <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {copy.ui.title}
                    </div>
                    <div className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                      {puterReady ? copy.ui.aiReady : copy.ui.aiNotReady}
                      {selectedTaskTitle ? ` • ${selectedTaskTitle}` : ""}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setOpen(false)}
                  className={cn(
                    "inline-flex h-9 w-9 items-center justify-center rounded-2xl border text-sm font-bold transition",
                    "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                    "dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-200 dark:hover:bg-slate-950/70"
                  )}
                  aria-label={copy.a11y.close}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Quick */}
              <div className="flex flex-wrap gap-2 px-4 py-3">
                <Quick onClick={() => quick("hello")} icon={<MessageCircle className="h-3.5 w-3.5" />}>
                  {copy.quick.hello}
                </Quick>
                <Quick onClick={() => quick("fun")} icon={<Sparkles className="h-3.5 w-3.5" />}>
                  {copy.quick.fun}
                </Quick>
                <Quick onClick={() => quick("planDay")} icon={<CalendarDays className="h-3.5 w-3.5" />}>
                  {copy.quick.planDay}
                </Quick>
                <Quick onClick={() => quick("tonicaHelp")} icon={<Compass className="h-3.5 w-3.5" />}>
                  {copy.quick.tonicaHelp}
                </Quick>
              </div>

              {/* Messages */}
              <div
                ref={listRef}
                className="px-4 pb-3 overflow-auto"
                style={{ maxHeight: "calc(70vh - 176px)" }}
              >
                <div className="space-y-2">
                  {msgs.map((m) => (
                    <div
                      key={m.id}
                      className={cn(
                        "rounded-2xl px-3 py-2 text-sm leading-relaxed",
                        m.role === "bot"
                          ? "bg-slate-100 text-slate-800 dark:bg-white/10 dark:text-slate-200"
                          : "bg-blue-600 text-white dark:bg-sky-500"
                      )}
                    >
                      <div
                        className="prose prose-sm max-w-none prose-p:my-0 prose-ol:my-0 prose-ul:my-0 prose-li:my-0 dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: renderMessage(m.text) }}
                      />
                    </div>
                  ))}

                  {sending ? (
                    <div className="rounded-2xl bg-slate-100 px-3 py-2 text-sm text-slate-600 dark:bg-white/10 dark:text-slate-300">
                      {copy.ui.typing}
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Input */}
              <div className="border-t border-slate-200 p-3 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={copy.ui.placeholder}
                    className={cn(
                      "h-11 w-full rounded-2xl border px-3 text-sm outline-none transition",
                      "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400",
                      "focus:border-blue-300 focus:ring-2 focus:ring-blue-200/60",
                      "dark:border-white/10 dark:bg-slate-950/40 dark:text-white dark:placeholder:text-slate-500",
                      "dark:focus:border-sky-500/50 dark:focus:ring-sky-900/40"
                    )}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") onSend();
                    }}
                  />

                  <button
                    onClick={onSend}
                    disabled={!text.trim() || sending}
                    className={cn(
                      "h-11 rounded-2xl px-4 text-sm font-extrabold text-white transition inline-flex items-center gap-2",
                      "bg-blue-600 hover:bg-blue-700",
                      "dark:bg-sky-500 dark:hover:bg-sky-400",
                      (!text.trim() || sending) && "opacity-60 cursor-not-allowed"
                    )}
                  >
                    <Send className="h-4 w-4" />
                    {copy.ui.send}
                  </button>
                </div>

                <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                  {copy.ui.model}: <span className="font-semibold">{model}</span>
                </div>
              </div>
            </div>
          ) : null}

          {/* Floating button */}
          {!open ? (
            <button
              onClick={() => setOpen(true)}
              className={cn(
                "group relative flex items-center gap-3 rounded-full border px-3 py-3 shadow-2xl transition",
                "border-slate-200 bg-white hover:bg-slate-50",
                "dark:border-white/10 dark:bg-slate-950/70 dark:hover:bg-slate-950"
              )}
              aria-label={copy.a11y.open}
            >
              <span className="relative inline-flex h-11 w-11 items-center justify-center rounded-full text-white shadow-sm">
                <span className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-600 to-sky-500 dark:from-sky-500 dark:to-blue-600" />
                <Bot className="relative h-5 w-5" />
              </span>

              <div className="pr-1 text-left hidden sm:block">
                <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {copy.ui.title}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {copy.ui.subtitle}
                </div>
              </div>

              <span className="ml-0 sm:ml-1 inline-flex h-7 items-center rounded-full bg-blue-50 px-2 text-[11px] font-bold text-blue-700 dark:bg-white/10 dark:text-sky-200">
                {copy.ui.ask}
              </span>
            </button>
          ) : null}
        </div>
      </div>
    </>
  );
}

function Quick({
  children,
  onClick,
  icon,
}: {
  children: React.ReactNode;
  onClick: () => void;
  icon?: React.ReactNode;
}) {
  const rendered = (() => {
    if (typeof children !== "string") return children;
    const idx = children.indexOf(":");
    if (idx > -1) {
      const head = children.slice(0, idx + 1);
      const rest = children.slice(idx + 1);
      return (
        <>
          <span className="font-extrabold">{head}</span>
          <span>{rest}</span>
        </>
      );
    }
    return children;
  })();

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-extrabold transition",
        "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
        "dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-200 dark:hover:bg-slate-950/70"
      )}
    >
      {icon ? <span className="opacity-90">{icon}</span> : null}
      {rendered}
    </button>
  );
}

function renderMessage(text: string) {
  let html = String(text || "");
  html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  const hasList = /^\s*\d+\.\s+/m.test(html);
  html = html.replace(/^\s*\d+\.\s+(.*)$/gm, "<li>$1</li>");
  if (hasList) html = `<ol class="list-decimal pl-5 space-y-1">${html}</ol>`;

  html = html.replace(/\n/g, "<br/>");
  return html;
}
