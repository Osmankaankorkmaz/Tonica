
import { createAsyncThunk, createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { apiFetch } from "../api";

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


const PATHS = {
  register: "/register",
  login: "/login",
  me: "/me",
  logout: "/logout",
};

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


async function authedFetch<T>(path: string, opts: any = {}, token?: string | null) {
  const headers = { ...(opts.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  return apiFetch<T>(path, { ...opts, headers });
}


export const registerThunk = createAsyncThunk<
  { token: string; user: User },
  { email: string; password: string; fullName?: string; locale?: "tr" | "en" },
  { rejectValue: string }
>("auth/register", async (payload, thunkAPI) => {
  try {
    const r = await apiFetch<{ ok: boolean; token: string }>(PATHS.register, { method: "POST", json: payload });
    const token = r.token;

    saveToken(token);

    const meRes = await authedFetch<{ ok: boolean; user: User }>(PATHS.me, { method: "GET" }, token);
    return { token, user: meRes.user };
  } catch (e: any) {
    return thunkAPI.rejectWithValue(e?.message || "Kayıt başarısız.");
  }
});


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
    saveToken(null);
    return thunkAPI.rejectWithValue(e?.message || "Oturum doğrulanamadı.");
  }
});

export const logoutThunk = createAsyncThunk<boolean, void, { rejectValue: string }>(
  "auth/logout",
  async (_, thunkAPI) => {
    try {
      const token = loadToken();
      await authedFetch(PATHS.logout, { method: "GET" }, token);
      saveToken(null);
      return true;
    } catch (e: any) {
      saveToken(null);
      return thunkAPI.rejectWithValue(e?.message || "Çıkış başarısız.");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
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

    b.addCase(logoutThunk.fulfilled, (s) => {
      s.user = null;
      s.token = null;
      s.initialized = true;
      s.loading = false;
      s.error = null;
    });
    b.addCase(logoutThunk.rejected, (s) => {
      s.user = null;
      s.token = null;
      s.initialized = true;
      s.loading = false;
    });
  },
});

export const { clearAuthError, setUser, setToken } = authSlice.actions;
export default authSlice.reducer;

const selectAuthSlice = (s: any): AuthState => (s?.auth ? (s.auth as AuthState) : initialState);

export const selectAuthUser = createSelector([selectAuthSlice], (a) => a.user);
export const selectAuthToken = createSelector([selectAuthSlice], (a) => a.token);
export const selectAuthLoading = createSelector([selectAuthSlice], (a) => a.loading);
export const selectAuthInitialized = createSelector([selectAuthSlice], (a) => a.initialized);
export const selectAuthError = createSelector([selectAuthSlice], (a) => a.error);
