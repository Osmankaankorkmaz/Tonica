"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  X,
  Send,
  Sparkles,
  CalendarDays,
  Compass,
  MessageCircle,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

import { useLocale } from "@/components/providers/LocaleProvider";
import type { Lang } from "@/lib/i18n";

import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  aiInitThunk,
  aiChatThunk,
  setAiOpen,
  selectAiOpen,
  selectAiMsgs,
  selectAiSending,
  selectAiServerReady,
  selectAiModel,
  setAiModel,
} from "@/lib/store/aiSlice";

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

type Props = {
  selectedTaskTitle?: string | null;
  model?: string;
};

type UiMsg = { id: string; role: "user" | "bot"; text: string };

function normalizeMsgs(input: any): UiMsg[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((m, idx) => {
      const id =
        (typeof m?.id === "string" && m.id) ||
        (typeof m?._id === "string" && m._id) ||
        `m_${idx}`;

      const rawRole = m?.role;
      const role: "user" | "bot" =
        rawRole === "bot" || rawRole === "assistant" ? "bot" : "user";

      const text =
        (typeof m?.text === "string" && m.text) ||
        (typeof m?.content === "string" && m.content) ||
        (typeof m?.message === "string" && m.message) ||
        "";

      return { id, role, text };
    })
    .filter((m) => typeof m.text === "string");
}

export default function Tonibot({
  selectedTaskTitle = null,
  model = "gpt-5-nano",
}: Props) {
  const { lang, ready } = useLocale();
  const dispatch = useAppDispatch();

  const open = !!useAppSelector(selectAiOpen);
  const msgsRaw = useAppSelector(selectAiMsgs);
  const sending = !!useAppSelector(selectAiSending);
  const serverReady = !!useAppSelector(selectAiServerReady);

  const storedModelRaw = useAppSelector(selectAiModel);
  const storedModel =
    typeof storedModelRaw === "string" && storedModelRaw
      ? storedModelRaw
      : model;

  const [text, setText] = useState("");

  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    dispatch(aiInitThunk());
  }, [dispatch]);


  useEffect(() => {
    if (model && model !== storedModel) dispatch(setAiModel(model));
  }, [model, dispatch]);

  const copy = useMemo(() => {
    const tr = {
      a11y: {
        open: "Tonibot'u aç",
        close: "Kapat",
        closeOverlay: "Arka planı kapat",
      },
      ui: {
        title: "Tonibot",
        subtitle: "Tonica Asistanı",
        ask: "Sor",
        placeholder: "Mesaj yaz… (Enter: gönder, Shift+Enter: satır)",
        send: "Gönder",
        model: "Model",
        typing: "Tonibot yazıyor…",
        aiReady: "Bağlı",
        aiNotReady: "Bağlantı yok",
        quickTitle: "Hızlı Başlat",
      },
      bot: {
        welcome:
          "Selam! 👋 Ben Tonibot.\n\nİstersen 2-3 kısa hedef belirleyelim ya da görevlerini hızlıca toparlayalım.\n\nBaşlayalım mı?",
      },
      quick: {
        hello: "Selam",
        fun: "Motivasyon",
        planDay: "Gün Planı",
        tonicaHelp: "Tonica Düzen",
      },
      quickPrompts: {
        hello: "Selam! Nasılsın? 😄",
        fun: "Bana tek cümlelik bir motivasyon yaz 😅",
        planDay: "Bugün için 3 küçük hedef belirleyelim.",
        tonicaHelp: "Tonica’da görevleri en iyi nasıl düzenlerim?",
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
        subtitle: "Tonica Assistant",
        ask: "Ask",
        placeholder: "Type a message… (Enter: send, Shift+Enter: new line)",
        send: "Send",
        model: "Model",
        typing: "Tonibot is typing…",
        aiReady: "Online",
        aiNotReady: "Offline",
        quickTitle: "Quick start",
      },
      bot: {
        welcome:
          "Hi! 👋 I’m Tonibot.\n\nWe can set 2–3 small goals or quickly organize your tasks.\n\nWant to start?",
      },
      quick: {
        hello: "Hello",
        fun: "Motivation",
        planDay: "Plan Today",
        tonicaHelp: "Organize",
      },
      quickPrompts: {
        hello: "Hello! How are you? 😄",
        fun: "Write me a one-line motivation 😅",
        planDay: "Let’s set 3 small goals for today.",
        tonicaHelp: "How should I organize tasks in Tonica best?",
      },
    };

    return (lang as Lang) === "tr" ? tr : en;
  }, [lang]);

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
      "STYLE:",
      isTR
        ? "- Friendly, short, practical. Use simple Turkish."
        : "- Friendly, short, practical. Use simple English.",
      selectedTaskTitle
        ? `Context: user has a selected task titled: "${selectedTaskTitle}".`
        : "",
    ]
      .filter(Boolean)
      .join("\n");
  }, [selectedTaskTitle, lang]);

  const safeMsgs = useMemo(() => normalizeMsgs(msgsRaw), [msgsRaw]);
  const viewMsgs: UiMsg[] =
    safeMsgs.length > 0
      ? safeMsgs
      : [{ id: "welcome", role: "bot", text: copy.bot.welcome }];

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      inputRef.current?.focus();
      listRef.current?.scrollTo({ top: 999999, behavior: "smooth" });
    }, 80);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(
      () => listRef.current?.scrollTo({ top: 999999, behavior: "smooth" }),
      60,
    );
    return () => clearTimeout(t);
  }, [open, viewMsgs.length, sending]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dispatch(setAiOpen(false));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch]);

  function quick(action: keyof typeof copy.quickPrompts) {
    dispatch(setAiOpen(true));
    const v = copy.quickPrompts[action] || "";
    setText(v);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function send(v: string) {
    const t = v.trim();
    if (!t || sending) return;

    setText("");
    dispatch(
      aiChatThunk({
        model: storedModel,
        system,
        text: t,
        selectedTaskTitle,
        lang: lang as Lang,
      }),
    );
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  if (!ready) return null;

  return (
    <>
      {open ? (
        <button
          type="button"
          onClick={() => dispatch(setAiOpen(false))}
          className="fixed inset-0 z-9998 bg-black/50 backdrop-blur-[2px]"
          aria-label={copy.a11y.closeOverlay}
        />
      ) : null}

      {!open ? (
        <div className="fixed bottom-5 right-5 z-9999">
          <button
            onClick={() => dispatch(setAiOpen(true))}
            className={cn(
              "group relative flex items-center gap-3 rounded-2xl px-4 py-3 shadow-xl transition",
              "bg-slate-900 text-white hover:opacity-95",
              "dark:bg-white dark:text-slate-900",
            )}
            aria-label={copy.a11y.open}
          >
            <span className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 dark:bg-black/10">
              <Bot className="h-5 w-5" />
            </span>
            <div className="hidden sm:block text-left">
              <div className="text-sm font-extrabold leading-tight">
                {copy.ui.title}
              </div>
              <div className="text-[11px] opacity-80">{copy.ui.subtitle}</div>
            </div>
            <span className="ml-0 sm:ml-2 inline-flex h-7 items-center rounded-full bg-white/10 px-2 text-[11px] font-bold">
              {copy.ui.ask}
            </span>
          </button>
        </div>
      ) : null}

      {open ? (
        <aside
          className={cn(
            "fixed z-9999 right-0 top-0 h-dvh w-full sm:w-110",
            "bg-white dark:bg-slate-950",
            "shadow-2xl",
            "flex flex-col",
          )}
        >
          <div className="relative px-5 pt-5 pb-4">
            <div className="absolute inset-0 bg-linear-to-br from-sky-500/20 via-indigo-500/10 to-transparent dark:from-sky-500/10 dark:via-indigo-500/10" />
            <div className="relative flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-11 w-11 rounded-2xl bg-linear-to-br from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-sm">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-extrabold text-slate-900 dark:text-white">
                    {copy.ui.title}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-bold",
                        serverReady
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                          : "bg-amber-500/10 text-amber-700 dark:text-amber-300",
                      )}
                    >
                      {serverReady ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <AlertTriangle className="h-3.5 w-3.5" />
                      )}
                      {serverReady ? copy.ui.aiReady : copy.ui.aiNotReady}
                    </span>
                    {selectedTaskTitle ? (
                      <span className="truncate opacity-80">
                        • {selectedTaskTitle}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <button
                onClick={() => dispatch(setAiOpen(false))}
                className={cn(
                  "h-10 w-10 rounded-2xl border flex items-center justify-center transition",
                  "border-slate-200 bg-white hover:bg-slate-50 text-slate-700",
                  "dark:border-white/10 dark:bg-slate-950 dark:hover:bg-slate-900 dark:text-slate-200",
                )}
                aria-label={copy.a11y.close}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative mt-4">
              <div className="text-[11px] font-extrabold tracking-wide text-slate-700 dark:text-slate-200">
                {copy.ui.quickTitle}
              </div>
              <div className="mt-2 flex gap-2 overflow-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <QuickPill
                  onClick={() => quick("hello")}
                  icon={<MessageCircle className="h-4 w-4" />}
                >
                  {copy.quick.hello}
                </QuickPill>
                <QuickPill
                  onClick={() => quick("fun")}
                  icon={<Sparkles className="h-4 w-4" />}
                >
                  {copy.quick.fun}
                </QuickPill>
                <QuickPill
                  onClick={() => quick("planDay")}
                  icon={<CalendarDays className="h-4 w-4" />}
                >
                  {copy.quick.planDay}
                </QuickPill>
                <QuickPill
                  onClick={() => quick("tonicaHelp")}
                  icon={<Compass className="h-4 w-4" />}
                >
                  {copy.quick.tonicaHelp}
                </QuickPill>
              </div>
            </div>
          </div>

          <div
            ref={listRef}
            className={cn(
              "flex-1 min-h-0",
              "px-5 pb-6",
              "overflow-y-auto overscroll-contain",
              "invisible-scrollbar",
              "scroll-smooth",
            )}
          >
            <div
              ref={listRef}
              className={cn(
                "h-full overflow-auto pr-1",
                "rounded-3xl border",
                "border-slate-200 bg-slate-50",
                "dark:border-white/10 dark:bg-slate-900/30",
              )}
            >
              <div className="p-4 space-y-3">
                {viewMsgs.map((m) => (
                  <Bubble key={m.id} role={m.role} text={m.text} />
                ))}

                {sending ? (
                  <div className="flex justify-start">
                    <div className="rounded-2xl bg-white px-3 py-2 text-sm text-slate-700 shadow-sm dark:bg-white/10 dark:text-slate-200">
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
                        {copy.ui.typing}
                      </span>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-white/10 px-5 py-4">
            <div className="flex items-end gap-2">
              <div className="flex-1 rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-950">
                <textarea
                  ref={inputRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={copy.ui.placeholder}
                  rows={2}
                  className={cn(
                    "w-full resize-none bg-transparent px-3 py-2 text-sm outline-none",
                    "text-slate-900 placeholder:text-slate-500",
                    "dark:text-white dark:placeholder:text-slate-500",
                  )}
                  disabled={sending}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send(text);
                    }
                  }}
                />
                <div className="px-3 pb-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>
                    {copy.ui.model}:{" "}
                    <span className="font-semibold">{storedModel}</span>
                  </span>
                  <span className="hidden sm:inline opacity-80">
                    Enter: gönder • Shift+Enter
                  </span>
                </div>
              </div>

              <button
                onClick={() => send(text)}
                disabled={!text.trim() || sending}
                className={cn(
                  "h-11.5 px-4 rounded-2xl font-extrabold text-white text-sm inline-flex items-center gap-2 transition",
                  "bg-linear-to-br from-sky-500 to-indigo-600 hover:opacity-95",
                  (!text.trim() || sending) && "opacity-50 cursor-not-allowed",
                )}
              >
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">{copy.ui.send}</span>
              </button>
            </div>
          </div>
        </aside>
      ) : null}
    </>
  );
}

function QuickPill({
  children,
  onClick,
  icon,
}: {
  children: React.ReactNode;
  onClick: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 inline-flex items-center gap-2 rounded-full px-3 py-2 text-[12px] font-extrabold transition",
        "bg-white border border-slate-200 text-slate-800 hover:bg-slate-50",
        "dark:bg-slate-950 dark:border-white/10 dark:text-slate-200 dark:hover:bg-slate-900",
      )}
    >
      {icon ? <span className="opacity-90">{icon}</span> : null}
      {children}
    </button>
  );
}

function Bubble({ role, text }: { role: "user" | "bot"; text: string }) {
  const isBot = role === "bot";

  return (
    <div className={cn("flex", isBot ? "justify-start" : "justify-end")}>
      <div
        className={cn(
          "max-w-[88%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm",
          isBot
            ? "bg-white text-slate-800 dark:bg-white/10 dark:text-slate-200"
            : "bg-linear-to-br from-slate-900 to-slate-700 text-white dark:from-sky-500 dark:to-indigo-600",
        )}
      >
        <div
          className="prose prose-sm max-w-none prose-p:my-0 prose-ol:my-0 prose-ul:my-0 prose-li:my-0 dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: renderMessage(text) }}
        />
      </div>
    </div>
  );
}

function renderMessage(text: string) {
  const safe = typeof text === "string" ? text : "";
  let html = safe;

  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  const lines = html.split("\n");
  const looksLikeList = lines.some((l) => /^\s*\d+\.\s+/.test(l));

  if (looksLikeList) {
    const items = lines
      .map((l) => {
        const m = l.match(/^\s*\d+\.\s+(.*)$/);
        return m ? `<li>${m[1]}</li>` : l ? `<li>${l}</li>` : "";
      })
      .filter(Boolean)
      .join("");
    html = `<ol class="list-decimal pl-5 space-y-1">${items}</ol>`;
  } else {
    html = html.replace(/\n/g, "<br/>");
  }

  return html;
}
