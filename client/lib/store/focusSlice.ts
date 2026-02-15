import { createAsyncThunk, createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { apiFetch } from "../api";


export type FocusSession = {
  _id: string;
  taskId?: string | null;

  durationSeconds: number;

  startedAt: string; 
  endedAt?: string | null;

  completed: boolean;
  pausedSeconds?: number;

  createdAt?: string;
  updatedAt?: string;
};

type FocusState = {
  sessions: FocusSession[];

  todayMinutes: number;

  loading: boolean;
  error: string | null;
  initialized: boolean;
};

const initialState: FocusState = {
  sessions: [],
  todayMinutes: 0,
  loading: false,
  error: null,
  initialized: false,
};

const PATHS = {
  start: "/focus/sessions/start",
  finish: (sessionId: string) => `/focus/sessions/${sessionId}/finish`,
  cancel: (sessionId: string) => `/focus/sessions/${sessionId}/cancel`,
  today: "/focus/today",
};

const TOKEN_KEY = "tonica_token";

function loadToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

async function authedFetch<T>(path: string, opts: any = {}, token?: string | null) {
  const headers = { ...(opts.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  return apiFetch<T>(path, { ...opts, headers });
}


function toIsoStringSafe(v: any): string | null {
  if (!v) return null;
  if (typeof v === "string") return v;

  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v.toISOString();

  if (typeof v === "object" && v.$date) {
    const d = new Date(v.$date);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }

  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function normalizeSession(s: any): FocusSession {
  return {
    _id: String(s?._id || ""),
    taskId: s?.taskId ? String(s.taskId) : null,

    durationSeconds: Number(s?.durationSeconds || 0),

    startedAt: toIsoStringSafe(s?.startedAt) || new Date().toISOString(),
    endedAt: s?.endedAt ? toIsoStringSafe(s.endedAt) : null,

    completed: !!s?.completed,
    pausedSeconds: Number(s?.pausedSeconds || 0),

    createdAt: s?.createdAt ? toIsoStringSafe(s.createdAt) || undefined : undefined,
    updatedAt: s?.updatedAt ? toIsoStringSafe(s.updatedAt) || undefined : undefined,
  };
}


export const startFocusThunk = createAsyncThunk<
  { session: FocusSession },
  { durationSeconds: number; taskId?: string | null },
  { rejectValue: string }
>("focus/start", async (payload, thunkAPI) => {
  try {
    const token = loadToken();
    if (!token) return thunkAPI.rejectWithValue("Oturum bulunamadı.");

    const body: any = { durationSeconds: payload.durationSeconds };
    if (payload.taskId) body.taskId = payload.taskId;

    const res = await authedFetch<{ ok: boolean; session: any }>(
      PATHS.start,
      { method: "POST", json: body },
      token
    );

    return { session: normalizeSession(res.session) };
  } catch (e: any) {
    return thunkAPI.rejectWithValue(e?.message || "Focus oturumu başlatılamadı.");
  }
});


export const finishFocusThunk = createAsyncThunk<
  { session: FocusSession },
  { sessionId: string },
  { rejectValue: string }
>("focus/finish", async ({ sessionId }, thunkAPI) => {
  try {
    const token = loadToken();
    if (!token) return thunkAPI.rejectWithValue("Oturum bulunamadı.");

    const res = await authedFetch<{ ok: boolean; session: any }>(
      PATHS.finish(sessionId),
      { method: "POST" },
      token
    );

    return { session: normalizeSession(res.session) };
  } catch (e: any) {
    return thunkAPI.rejectWithValue(e?.message || "Focus oturumu bitirilemedi.");
  }
});

export const cancelFocusThunk = createAsyncThunk<
  { session: FocusSession },
  { sessionId: string },
  { rejectValue: string }
>("focus/cancel", async ({ sessionId }, thunkAPI) => {
  try {
    const token = loadToken();
    if (!token) return thunkAPI.rejectWithValue("Oturum bulunamadı.");

    const res = await authedFetch<{ ok: boolean; session: any }>(
      PATHS.cancel(sessionId),
      { method: "POST" },
      token
    );

    return { session: normalizeSession(res.session) };
  } catch (e: any) {
    return thunkAPI.rejectWithValue(e?.message || "Focus oturumu iptal edilemedi.");
  }
});


export const focusTodayThunk = createAsyncThunk<
  { minutes: number },
  void,
  { rejectValue: string }
>("focus/today", async (_, thunkAPI) => {
  try {
    const token = loadToken();
    if (!token) return { minutes: 0 };

    const res = await authedFetch<{ ok: boolean; minutes: number }>(PATHS.today, { method: "GET" }, token);
    return { minutes: Number(res.minutes || 0) };
  } catch (e: any) {
    return thunkAPI.rejectWithValue(e?.message || "Bugünkü focus süresi alınamadı.");
  }
});


const focusSlice = createSlice({
  name: "focus",
  initialState,
  reducers: {
    clearFocusError(state) {
      state.error = null;
    },
    setFocusSessions(state, action: PayloadAction<FocusSession[]>) {
      state.sessions = Array.isArray(action.payload) ? action.payload : [];
      state.initialized = true;
    },
    resetFocus(state) {
      state.sessions = [];
      state.todayMinutes = 0;
      state.loading = false;
      state.error = null;
      state.initialized = false;
    },
    markSessionEndedLocal(
      state,
      action: PayloadAction<{ sessionId: string; completed: boolean; endedAt?: string }>
    ) {
      const idx = state.sessions.findIndex((s) => s._id === action.payload.sessionId);
      if (idx < 0) return;
      state.sessions[idx] = {
        ...state.sessions[idx],
        endedAt: action.payload.endedAt || new Date().toISOString(),
        completed: action.payload.completed,
      };
    },
  },
  extraReducers: (b) => {
    b.addCase(startFocusThunk.pending, (s) => {
      s.loading = true;
      s.error = null;
    });
    b.addCase(startFocusThunk.fulfilled, (s, a) => {
      s.loading = false;
      s.sessions = [a.payload.session, ...s.sessions];
      s.initialized = true;
    });
    b.addCase(startFocusThunk.rejected, (s, a) => {
      s.loading = false;
      s.error = a.payload || "Focus oturumu başlatılamadı.";
    });

    b.addCase(finishFocusThunk.pending, (s) => {
      s.loading = true;
      s.error = null;
    });
    b.addCase(finishFocusThunk.fulfilled, (s, a) => {
      s.loading = false;
      const updated = a.payload.session;
      const idx = s.sessions.findIndex((x) => x._id === updated._id);
      if (idx >= 0) s.sessions[idx] = updated;
      else s.sessions = [updated, ...s.sessions];
      s.initialized = true;
    });
    b.addCase(finishFocusThunk.rejected, (s, a) => {
      s.loading = false;
      s.error = a.payload || "Focus oturumu bitirilemedi.";
    });

    b.addCase(cancelFocusThunk.pending, (s) => {
      s.loading = true;
      s.error = null;
    });
    b.addCase(cancelFocusThunk.fulfilled, (s, a) => {
      s.loading = false;
      const updated = a.payload.session;
      const idx = s.sessions.findIndex((x) => x._id === updated._id);
      if (idx >= 0) s.sessions[idx] = updated;
      else s.sessions = [updated, ...s.sessions];
      s.initialized = true;
    });
    b.addCase(cancelFocusThunk.rejected, (s, a) => {
      s.loading = false;
      s.error = a.payload || "Focus oturumu iptal edilemedi.";
    });

    b.addCase(focusTodayThunk.pending, (s) => {
      s.loading = true;
      s.error = null;
    });
    b.addCase(focusTodayThunk.fulfilled, (s, a) => {
      s.loading = false;
      s.todayMinutes = a.payload.minutes;
      s.initialized = true;
    });
    b.addCase(focusTodayThunk.rejected, (s, a) => {
      s.loading = false;
      s.error = a.payload || "Bugünkü focus süresi alınamadı.";
      s.initialized = true;
    });
  },
});

export const { clearFocusError, setFocusSessions, resetFocus, markSessionEndedLocal } = focusSlice.actions;
export default focusSlice.reducer;


const selectFocusSlice = (s: any): FocusState => (s?.focus ? (s.focus as FocusState) : initialState);

export const selectFocusSessions = createSelector([selectFocusSlice], (f) => f.sessions);
export const selectFocusTodayMinutes = createSelector([selectFocusSlice], (f) => f.todayMinutes);
export const selectFocusLoading = createSelector([selectFocusSlice], (f) => f.loading);
export const selectFocusInitialized = createSelector([selectFocusSlice], (f) => f.initialized);
export const selectFocusError = createSelector([selectFocusSlice], (f) => f.error);

export const selectActiveFocusSession = createSelector([selectFocusSessions], (sessions) => {
  return (sessions || []).find((s) => !s.endedAt) || null;
});

export const selectCompletedFocusSessions = createSelector([selectFocusSessions], (sessions) => {
  return (sessions || []).filter((s) => !!s.completed) || [];
});
