"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
  /** İstersen workspace seçili görev başlığını context olarak gönder (opsiyonel) */
  selectedTaskTitle?: string | null;

  /** Model seçimi (default hızlı) */
  model?: string; // "gpt-5-nano" | "gpt-5-mini" | "gpt-5.2-chat" vs
};

export default function Tonibot({
  selectedTaskTitle = null,
  model = "gpt-5-nano",
}: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [puterReady, setPuterReady] = useState(false);

  const [msgs, setMsgs] = useState<Msg[]>([
    {
      id: "m1",
      role: "bot",
      text:
        "Selam! Ben Tonibot 🤖\n\nNormal sohbet edebiliriz 😄 İstersen Tonica görevlerini de birlikte planlarız.\n\nBir şey sor 👇",
    },
  ]);

  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // ✅ Puter hazır mı kontrol
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

  useEffect(() => {
    if (!open) return;
    setTimeout(() => {
      inputRef.current?.focus();
      listRef.current?.scrollTo({ top: 999999, behavior: "smooth" });
    }, 60);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setTimeout(
      () => listRef.current?.scrollTo({ top: 999999, behavior: "smooth" }),
      40
    );
  }, [msgs.length, open]);

  const system = useMemo(() => {
    return [
      "You are Tonibot, a friendly chat assistant inside the Tonica app.",
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
      "- Friendly, short, practical. Use simple Turkish when user writes Turkish.",
      selectedTaskTitle
        ? `Context: user has a selected task titled: "${selectedTaskTitle}".`
        : "",
    ]
      .filter(Boolean)
      .join("\n");
  }, [selectedTaskTitle]);

  function push(role: Msg["role"], t: string) {
    setMsgs((s) => [...s, { id: crypto.randomUUID(), role, text: t }]);
  }

  function updateLastBotText(nextText: string) {
    setMsgs((prev) => {
      const copy = [...prev];
      const last = copy[copy.length - 1];
      if (!last || last.role !== "bot") return prev;
      copy[copy.length - 1] = { ...last, text: nextText };
      return copy;
    });
  }

  function quick(action: "hello" | "planDay" | "tonicaHelp" | "fun") {
    const map = {
      hello: "Naber 😄",
      planDay: "Bugün için küçük bir plan yapmama yardım eder misin?",
      tonicaHelp: "Tonica’da görevleri en iyi nasıl düzenlerim?",
      fun: "Bana kısa bir motivasyon cümlesi yaz 😅",
    } as const;

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

    // ✅ Puter yoksa
    if (!window.puter?.ai?.chat) {
      push(
        "bot",
        "Puter hazır değil / yüklenemedi.\n\n• Adblock kapat\n• js.puter.com engelli mi kontrol et\n• Sayfayı yenile\n\nAI yanıtı için Puter gerekli."
      );
      return;
    }

    try {
      setSending(true);

      // placeholder (stream ile dolacak)
      push("bot", "…");

      // ✅ Puter streaming
      const resp = await window.puter.ai.chat(
        [
          { role: "system", content: system },
          ...msgs.map((m) => ({
            role: m.role === "bot" ? "assistant" : "user",
            content: m.text,
          })),
          { role: "user", content: v },
        ],
        {
          model,
          stream: true,

          // ⚠️ Bazı modeller temperature/max_tokens kabul etmiyor.
          // O yüzden SAKIN zorla gönderme; hata alırsan fallback kullan.
        }
      );

      let acc = "";
      for await (const part of resp) {
        const t = part?.text ?? "";
        if (!t) continue;
        acc += t;
        updateLastBotText(acc);
      }

      if (!acc.trim()) updateLastBotText("Cevap alınamadı. (Boş yanıt)");
    } catch (e: any) {
      // ✅ Fallback: temperature/max_tokens kaldırıp tekrar dene
      try {
        const resp2 = await window.puter.ai.chat(
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

        let acc2 = "";
        for await (const part of resp2) {
          const t = part?.text ?? "";
          if (!t) continue;
          acc2 += t;
          updateLastBotText(acc2);
        }

        if (!acc2.trim()) updateLastBotText("Cevap alınamadı. (Boş yanıt)");
      } catch (e2: any) {
        updateLastBotText(
          `Şu an cevap veremiyorum: ${e2?.message || e?.message || "AI error"}`
        );
      }
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <div className="flex flex-col items-end gap-3">
        {/* Panel */}
        {open ? (
          <div
            className={cn(
              "w-[390px] overflow-hidden rounded-3xl border shadow-2xl",
              "border-slate-200 bg-white",
              "dark:border-white/10 dark:bg-slate-950"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-white/10">
              <div className="flex items-center gap-3">
                <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-sm">
                  <span className="absolute inset-0 rounded-2xl bg-linear-to-br from-blue-600 to-sky-500 dark:from-sky-500 dark:to-blue-600" />
                  <span className="relative">🤖</span>
                </span>

                <div className="min-w-0">
                  <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Tonibot
                  </div>
                  <div className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                    {puterReady ? "AI ready ✅" : "AI not ready ⚠️"}
                    {selectedTaskTitle ? ` • Context: ${selectedTaskTitle}` : ""}
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
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Quick */}
            <div className="flex flex-wrap gap-2 px-4 py-3">
              <Quick onClick={() => quick("hello")}>👋 Selam</Quick>
              <Quick onClick={() => quick("fun")}>😄 Muhabbet</Quick>
              <Quick onClick={() => quick("planDay")}>📅 Plan</Quick>
              <Quick onClick={() => quick("tonicaHelp")}>🧭 Tonica</Quick>
            </div>

            {/* Messages */}
            <div
              ref={listRef}
              className="max-h-[340px] space-y-2 overflow-auto px-4 pb-3"
            >
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
                  {/* ✅ Markdown mini render: bold + list */}
                  <div
                    className="prose prose-sm max-w-none prose-p:my-0 prose-ol:my-0 prose-ul:my-0 prose-li:my-0 dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: renderMessage(m.text) }}
                  />
                </div>
              ))}

              {sending ? (
                <div className="rounded-2xl bg-slate-100 px-3 py-2 text-sm text-slate-600 dark:bg-white/10 dark:text-slate-300">
                  Tonibot yazıyor…
                </div>
              ) : null}
            </div>

            {/* Input */}
            <div className="border-t border-slate-200 p-3 dark:border-white/10">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Mesaj yaz…"
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
                    "h-11 rounded-2xl px-4 text-sm font-extrabold text-white transition",
                    "bg-blue-600 hover:bg-blue-700",
                    "dark:bg-sky-500 dark:hover:bg-sky-400",
                    (!text.trim() || sending) && "opacity-60 cursor-not-allowed"
                  )}
                >
                  Send
                </button>
              </div>

              <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                Model: <span className="font-semibold">{model}</span>
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
            aria-label="Open Tonibot"
          >
            <span className="relative inline-flex h-11 w-11 items-center justify-center rounded-full text-white shadow-sm">
              <span className="absolute inset-0 rounded-full bg-linear-to-br from-blue-600 to-sky-500 dark:from-sky-500 dark:to-blue-600" />
              <span className="relative">🤖</span>
            </span>

            <div className="pr-1 text-left">
              <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                Tonibot
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Genel sohbet
              </div>
            </div>

            <span className="ml-1 inline-flex h-7 items-center rounded-full bg-blue-50 px-2 text-[11px] font-bold text-blue-700 dark:bg-white/10 dark:text-sky-200">
              Ask
            </span>
          </button>
        ) : null}
      </div>
    </div>
  );
}

function Quick({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-[11px] font-extrabold transition",
        "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
        "dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-200 dark:hover:bg-slate-950/70"
      )}
    >
      {children}
    </button>
  );
}

/** ✅ Mini markdown renderer: **bold** + numbered list
 * Not: sadece basit formatlar için. Daha kapsamlı istersen md parser ekleriz.
 */
function renderMessage(text: string) {
  let html = String(text || "");

  // Escape basic HTML to reduce XSS risk
  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // **bold**
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Numbered list: "1. item"
  html = html.replace(/^\s*\d+\.\s+(.*)$/gm, "<li>$1</li>");
  if (html.includes("<li>")) {
    html = `<ol class="list-decimal pl-5 space-y-1">${html}</ol>`;
  }

  // Newlines
  html = html.replace(/\n/g, "<br/>");

  return html;
}
