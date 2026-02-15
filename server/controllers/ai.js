const ApiError = require("../error/ApiError");
const { getPuter } = require("../config/puter");

function clampStr(s, max) {
  const t = String(s ?? "");
  return t.length > max ? t.slice(0, max) : t;
}

function normalizeBody(body) {
  const model = clampStr(body?.model || "gpt-5-nano", 64);
  const system = clampStr(body?.system || "", 12000);

  const messages = Array.isArray(body?.messages) ? body.messages : [];
  const safeMessages = messages
    .filter((m) => m && (m.role === "user" || m.role === "bot"))
    .slice(0, 40)
    .map((m) => ({ role: m.role, text: clampStr(m.text || "", 8000) }));

  const text = clampStr(body?.text || "", 8000);
  const selectedTaskTitle = clampStr(body?.selectedTaskTitle || "", 200);
  const lang = clampStr(body?.lang || "", 10);

  return { model, system, messages: safeMessages, text, selectedTaskTitle, lang };
}

exports.chat = async (req, res, next) => {
  try {
    const { model, system, messages, text } = normalizeBody(req.body);

    const finalMessages = text ? [...messages, { role: "user", text }] : messages;
    if (!finalMessages.length) return next(new ApiError(400, "Mesaj boş"));

    const puter = getPuter();

    const payload = [
      ...(system ? [{ role: "system", content: system }] : []),
      ...finalMessages.map((m) => ({
        role: m.role === "bot" ? "assistant" : "user",
        content: m.text,
      })),
    ];

    const answer = await puter.ai.chat(payload, { model });
    
    return res.status(200).json({ ok: true, text: String(answer ?? "") });
  } catch (e) {
    return next(e);
  }
};
