// store/authSlice.ts
import { createAsyncThunk, createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { apiFetch } from "../api";

/** ---------- Types ---------- */
export type User = {
  _id: string;
  fullName?: string;
  email: string;
  locale?: "tr" | "en";

  settings?: {
    aiAssistEnabled?: boolean;
    ai?: {
      titleImprove?: boolean;
      priorityTagSuggest?: boolean;
      nextStepSuggest?: boolean;
      focusPlan?: boolean;
      tone?: "concise" | "balanced" | "detailed";
    };
  };

  tags?: Array<{ _id: string; name: string; color?: string }>;
  categories?: Array<{ _id: string; name: string; icon?: string }>;
  tasks?: any[];
  focusPlans?: any[];
  aiHistory?: any[];

  lastLoginAt?: string;

  createdAt?: string;
  updatedAt?: string;
};

type AuthState = {
  user: User | null;
  token: string | null;

  loading: boolean;
  error: string | null;
  initialized: boolean;
};

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  initialized: false,
};

/** ---------- API paths ---------- */
const PATHS = {
  register: "/register",
  login: "/login",
  me: "/me",
  logout: "/logout",
};

/** ---------- Token Storage Helpers ---------- */
const TOKEN_KEY = "tonica_token";

function loadToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}
function saveToken(token: string | null) {
  try {
    if (!token) localStorage.removeItem(TOKEN_KEY);
    else localStorage.setItem(TOKEN_KEY, token);
  } catch {}
}

/** apiFetch ile header geçmek için küçük helper */
async function authedFetch<T>(path: string, opts: any = {}, token?: string | null) {
  const headers = { ...(opts.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  return apiFetch<T>(path, { ...opts, headers });
}

/** ---------- Thunks (Auth) ---------- */

// ✅ Register: token gelir, sonra me ile user çek
export const registerThunk = createAsyncThunk<
  { token: string; user: User },
  { email: string; password: string; fullName?: string; locale?: "tr" | "en" },
  { rejectValue: string }
>("auth/register", async (payload, thunkAPI) => {
  try {
    const r = await apiFetch<{ ok: boolean; token: string }>(PATHS.register, { method: "POST", json: payload });
    const token = r.token;

    // token'ı sakla
    saveToken(token);

    // me ile user çek
    const meRes = await authedFetch<{ ok: boolean; user: User }>(PATHS.me, { method: "GET" }, token);
    return { token, user: meRes.user };
  } catch (e: any) {
    return thunkAPI.rejectWithValue(e?.message || "Kayıt başarısız.");
  }
});

// ✅ Login: token gelir, sonra me ile user çek
export const loginThunk = createAsyncThunk<
  { token: string; user: User },
  { email: string; password: string },
  { rejectValue: string }
>("auth/login", async (payload, thunkAPI) => {
  try {
    const r = await apiFetch<{ ok: boolean; token: string }>(PATHS.login, { method: "POST", json: payload });
    const token = r.token;

    saveToken(token);

    const meRes = await authedFetch<{ ok: boolean; user: User }>(PATHS.me, { method: "GET" }, token);
    return { token, user: meRes.user };
  } catch (e: any) {
    return thunkAPI.rejectWithValue(e?.message || "Giriş başarısız.");
  }
});

// ✅ Me: localStorage token'ı varsa user getir
export const meThunk = createAsyncThunk<
  { token: string | null; user: User | null },
  void,
  { rejectValue: string }
>("auth/me", async (_, thunkAPI) => {
  try {
    const token = loadToken();
    if (!token) return { token: null, user: null };

    const res = await authedFetch<{ ok: boolean; user: User }>(PATHS.me, { method: "GET" }, token);
    return { token, user: res.user };
  } catch (e: any) {
    // token geçersizse temizle
    saveToken(null);
    return thunkAPI.rejectWithValue(e?.message || "Oturum doğrulanamadı.");
  }
});

// ✅ Logout: backend sadece ok döner, token'ı localden sil
export const logoutThunk = createAsyncThunk<boolean, void, { rejectValue: string }>(
  "auth/logout",
  async (_, thunkAPI) => {
    try {
      const token = loadToken();
      // logout endpoint'i auth istiyor, token ile çağır
      await authedFetch(PATHS.logout, { method: "GET" }, token);
      saveToken(null);
      return true;
    } catch (e: any) {
      // logout hata verse bile local temizleyebilirsin
      saveToken(null);
      return thunkAPI.rejectWithValue(e?.message || "Çıkış başarısız.");
    }
  }
);

/** ---------- Slice ---------- */
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
    // dışarıdan user setlemek istersen
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
      state.initialized = true;
    },
    setToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload;
      saveToken(action.payload);
    },
  },
  extraReducers: (b) => {
    // register
    b.addCase(registerThunk.pending, (s) => {
      s.loading = true;
      s.error = null;
    });
    b.addCase(registerThunk.fulfilled, (s, a) => {
      s.loading = false;
      s.token = a.payload.token;
      s.user = a.payload.user;
      s.initialized = true;
    });
    b.addCase(registerThunk.rejected, (s, a) => {
      s.loading = false;
      s.error = a.payload || "Kayıt başarısız.";
      s.initialized = true;
    });

    // login
    b.addCase(loginThunk.pending, (s) => {
      s.loading = true;
      s.error = null;
    });
    b.addCase(loginThunk.fulfilled, (s, a) => {
      s.loading = false;
      s.token = a.payload.token;
      s.user = a.payload.user;
      s.initialized = true;
    });
    b.addCase(loginThunk.rejected, (s, a) => {
      s.loading = false;
      s.error = a.payload || "Giriş başarısız.";
      s.initialized = true;
    });

    // me
    b.addCase(meThunk.pending, (s) => {
      s.loading = true;
      s.error = null;
    });
    b.addCase(meThunk.fulfilled, (s, a) => {
      s.loading = false;
      s.token = a.payload.token;
      s.user = a.payload.user;
      s.initialized = true;
    });
    b.addCase(meThunk.rejected, (s) => {
      s.loading = false;
      s.user = null;
      s.token = null;
      s.initialized = true;
    });

    // logout
    b.addCase(logoutThunk.fulfilled, (s) => {
      s.user = null;
      s.token = null;
      s.initialized = true;
      s.loading = false;
      s.error = null;
    });
    b.addCase(logoutThunk.rejected, (s) => {
      // local token zaten silindi
      s.user = null;
      s.token = null;
      s.initialized = true;
      s.loading = false;
    });
  },
});

export const { clearAuthError, setUser, setToken } = authSlice.actions;
export default authSlice.reducer;

/** =========================
 * ✅ Selectors (MEMOIZED)
 * ========================= */
const selectAuthSlice = (s: any): AuthState => (s?.auth ? (s.auth as AuthState) : initialState);

export const selectAuthUser = createSelector([selectAuthSlice], (a) => a.user);
export const selectAuthToken = createSelector([selectAuthSlice], (a) => a.token);
export const selectAuthLoading = createSelector([selectAuthSlice], (a) => a.loading);
export const selectAuthInitialized = createSelector([selectAuthSlice], (a) => a.initialized);
export const selectAuthError = createSelector([selectAuthSlice], (a) => a.error);
