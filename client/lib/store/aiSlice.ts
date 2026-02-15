import { createAsyncThunk, createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { apiFetch } from "../api";
import type { Lang } from "@/lib/i18n";

export type AiRole = "user" | "bot";

export type AiMsg = {
  id: string;
  role: AiRole;
  text: string;
  at?: string;
};

export type AiChatRequest = {
  model?: string;
  system?: string;
  text: string; 
  selectedTaskTitle?: string | null;
  lang?: Lang;
};

export type AiChatResponse = {
  ok: boolean;
  text: string;
};

type AiState = {
  open: boolean;

  model: string;
  system: string;
  msgs: AiMsg[];

  sending: boolean;
  error: string | null;
  serverReady: boolean;

  initialized: boolean;
};

const PATHS = {
  chat: "/chat", 
};

const LS_KEY = "tonica_ai_state_v1";

function safeParse<T>(s: string | null): T | null {
  if (!s) return null;
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}

function loadAiState(): Partial<Pick<AiState, "model" | "msgs" | "open">> | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return safeParse(raw);
  } catch {
    return null;
  }
}

function saveAiState(patch: Partial<Pick<AiState, "model" | "msgs" | "open">>) {
  try {
    const current = loadAiState() || {};
    const next = { ...current, ...patch };
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  } catch {}
}

function uid() {
  const c: any = globalThis as any;
  return c?.crypto?.randomUUID ? c.crypto.randomUUID() : `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}
function nowIso() {
  return new Date().toISOString();
}
function clamp(s: string, n: number) {
  const t = String(s ?? "");
  return t.length > n ? t.slice(0, n) : t;
}

const initialState: AiState = {
  open: false,
  model: "gpt-5-nano",
  system: "",
  msgs: [],
  sending: false,
  error: null,
  serverReady: true,
  initialized: false,
};

export const aiInitThunk = createAsyncThunk<
  { open: boolean; model: string; msgs: AiMsg[] },
  void,
  { rejectValue: string }
>("ai/init", async (_, thunkAPI) => {
  try {
    const saved = loadAiState();
    const open = !!saved?.open;
    const model = (saved?.model && String(saved.model)) || initialState.model;
    const msgs = Array.isArray(saved?.msgs) ? (saved!.msgs as AiMsg[]) : [];
    return { open, model, msgs };
  } catch (e: any) {
    return thunkAPI.rejectWithValue(e?.message || "AI state yüklenemedi.");
  }
});

export const aiChatThunk = createAsyncThunk<
  { botText: string; model: string; system: string; userText: string },
  AiChatRequest,
  { rejectValue: string }
>("ai/chat", async (payload, thunkAPI) => {
  try {
    const state: any = thunkAPI.getState();
    const ai: AiState = state?.ai || initialState;

    const model = payload.model || ai.model || initialState.model;
    const system = payload.system ?? ai.system ?? "";
    const userText = clamp(payload.text, 8000);

    if (!userText.trim()) throw new Error("Mesaj boş.");

    const history = (Array.isArray(ai.msgs) ? ai.msgs : [])
      .slice(-40)
      .map((m) => ({ role: m.role, text: clamp(m.text, 8000) }));

    const res = await apiFetch<AiChatResponse>(PATHS.chat, {
      method: "POST",
      json: {
        model,
        system,
        messages: history,
        text: userText, 
        selectedTaskTitle: payload.selectedTaskTitle || null,
        lang: payload.lang,
      },
      auth: false,
    });

    if (!res?.ok) throw new Error("AI yanıtı alınamadı.");
    return { botText: String(res.text || ""), model, system, userText };
  } catch (e: any) {
    return thunkAPI.rejectWithValue(e?.message || "AI cevap veremedi.");
  }
});

const aiSlice = createSlice({
  name: "ai",
  initialState,
  reducers: {
    clearAiError(s) {
      s.error = null;
    },
    setAiOpen(s, a: PayloadAction<boolean>) {
      s.open = a.payload;
      saveAiState({ open: s.open });
    },
    setAiModel(s, a: PayloadAction<string>) {
      s.model = a.payload || initialState.model;
      saveAiState({ model: s.model });
    },
    setAiSystem(s, a: PayloadAction<string>) {
      s.system = a.payload || "";
    },
    resetAiChat(s) {
      s.msgs = [];
      s.error = null;
      s.sending = false;
      saveAiState({ msgs: [] });
    },
  },
  extraReducers: (b) => {
    b.addCase(aiInitThunk.pending, (s) => {
      s.error = null;
      s.initialized = false;
    });
    b.addCase(aiInitThunk.fulfilled, (s, a) => {
      s.open = a.payload.open;
      s.model = a.payload.model;
      s.msgs = Array.isArray(a.payload.msgs) ? a.payload.msgs : [];
      s.initialized = true;
      s.error = null;
    });
    b.addCase(aiInitThunk.rejected, (s, a) => {
      s.initialized = true;
      s.error = a.payload || "AI init başarısız.";
    });

    // ✅ chat
    b.addCase(aiChatThunk.pending, (s) => {
      s.sending = true;
      s.error = null;
      s.serverReady = true;
    });

    b.addCase(aiChatThunk.fulfilled, (s, a) => {
      s.sending = false;
      s.error = null;
      s.serverReady = true;

      s.model = a.payload.model;
      s.system = a.payload.system;

    
      s.msgs.push({ id: uid(), role: "user", text: a.payload.userText, at: nowIso() });
      s.msgs.push({ id: uid(), role: "bot", text: a.payload.botText || "", at: nowIso() });

      saveAiState({ model: s.model, msgs: s.msgs });
    });

    b.addCase(aiChatThunk.rejected, (s, a) => {
      s.sending = false;
      s.error = a.payload || "AI cevap veremedi.";
      s.serverReady = false;

      const userText = clamp((a.meta.arg?.text as any) || "", 8000);
      if (userText.trim()) s.msgs.push({ id: uid(), role: "user", text: userText, at: nowIso() });

      s.msgs.push({
        id: uid(),
        role: "bot",
        text: `Şu an cevap veremiyorum: ${s.error}`,
        at: nowIso(),
      });

      saveAiState({ msgs: s.msgs });
    });
  },
});

export const { clearAiError, setAiOpen, setAiModel, setAiSystem, resetAiChat } = aiSlice.actions;
export default aiSlice.reducer;

const selectAiSlice = (s: any): AiState => (s?.ai ? (s.ai as AiState) : initialState);

export const selectAiOpen = createSelector([selectAiSlice], (a) => a.open);
export const selectAiModel = createSelector([selectAiSlice], (a) => a.model);
export const selectAiSystem = createSelector([selectAiSlice], (a) => a.system);
export const selectAiMsgs = createSelector([selectAiSlice], (a) => a.msgs);
export const selectAiSending = createSelector([selectAiSlice], (a) => a.sending);
export const selectAiError = createSelector([selectAiSlice], (a) => a.error);
export const selectAiInitialized = createSelector([selectAiSlice], (a) => a.initialized);
export const selectAiServerReady = createSelector([selectAiSlice], (a) => a.serverReady);
