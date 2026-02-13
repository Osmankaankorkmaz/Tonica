"use client";

import { useEffect, useRef, useState } from "react";

function cn(...c: any[]) {
  return c.filter(Boolean).join(" ");
}

type Msg = {
  id: string;
  role: "user" | "bot";
  text: string;
};

declare global {
  interface Window {
    puter: any;
  }
}

export default function Tonibot() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      id: "init",
      role: "bot",
      text:
        "Ben Tonibot 🤖\n\nTonica hakkında, görev planlama, üretkenlik veya genel sorular sorabilirsin.",
    },
  ]);

  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => {
      listRef.current?.scrollTo({
        top: 999999,
        behavior: "smooth",
      });
    }, 50);
  }, [msgs.length, open]);

  function push(role: "user" | "bot", content: string) {
    setMsgs((s) => [...s, { id: crypto.randomUUID(), role, text: content }]);
  }

  async function onSend() {
    const v = text.trim();
    if (!v || sending) return;

    setText("");
    push("user", v);

    if (!window.puter?.ai?.chat) {
      push("bot", "Puter yüklenemedi.");
      return;
    }

    try {
      setSending(true);

      // boş bot mesajı ekle (stream dolduracak)
      const botId = crypto.randomUUID();
      setMsgs((s) => [...s, { id: botId, role: "bot", text: "" }]);

      const response = await window.puter.ai.chat(v, {
        model: "gpt-4.1",
        stream: true,
        temperature: 0.6,
      });

      for await (const part of response) {
        if (!part?.text) continue;

        setMsgs((s) =>
          s.map((m) =>
            m.id === botId
              ? { ...m, text: m.text + part.text }
              : m
          )
        );
      }
    } catch (err) {
      push("bot", "Bir hata oluştu.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <div className="flex flex-col items-end gap-3">
        {open && (
          <div className="w-[380px] overflow-hidden rounded-3xl border bg-white shadow-2xl dark:bg-slate-950 dark:border-white/10">
            
            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                  🤖
                </div>
                <div>
                  <div className="text-sm font-bold">Tonibot</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    AI Assistant
                  </div>
                </div>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* MESSAGES */}
            <div
              ref={listRef}
              className="max-h-[350px] overflow-auto space-y-2 px-4 py-3"
            >
              {msgs.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "rounded-2xl px-3 py-2 text-sm whitespace-pre-line",
                    m.role === "bot"
                      ? "bg-slate-100 dark:bg-white/10"
                      : "bg-blue-600 text-white"
                  )}
                >
                  {m.text || (sending && m.role === "bot" ? "..." : "")}
                </div>
              ))}
            </div>

            {/* INPUT */}
            <div className="border-t border-slate-200 p-3 dark:border-white/10">
              <div className="flex gap-2">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && onSend()}
                  placeholder="Mesaj yaz..."
                  className="w-full rounded-xl border px-3 py-2 text-sm dark:bg-slate-900 dark:border-white/10"
                />
                <button
                  onClick={onSend}
                  disabled={!text.trim() || sending}
                  className="rounded-xl bg-blue-600 px-4 text-white text-sm font-bold disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 rounded-full bg-blue-600 text-white px-4 py-3 shadow-xl"
          >
            🤖 Tonibot
          </button>
        )}
      </div>
    </div>
  );
}
