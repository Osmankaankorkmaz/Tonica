import { createAsyncThunk, createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { apiFetch } from "../api";

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export type Task = {
  tags(tags: any): string;
  durationMinutes: any;
  description: string;
  _id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  category?: string;
  dueAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type TaskState = {
  items: Task[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
};

const initialState: TaskState = {
  items: [],
  loading: false,
  error: null,
  initialized: false,
};

const PATHS = {
  list: "/tasks/list",
  create: "/tasks/create",
  update: "/tasks/update",
  delete: "/tasks/delete",
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

export const listTasksThunk = createAsyncThunk<
  { tasks: Task[] },
  void,
  { rejectValue: string }
>("tasks/list", async (_, thunkAPI) => {
  try {
    const token = loadToken();
    if (!token) return { tasks: [] };

    const res = await authedFetch<{ ok: boolean; tasks: Task[] }>(PATHS.list, { method: "GET" }, token);
    return { tasks: Array.isArray(res.tasks) ? res.tasks : [] };
  } catch (e: any) {
    return thunkAPI.rejectWithValue(e?.message || "Görevler alınamadı.");
  }
});

export const createTaskThunk = createAsyncThunk<
  { task: Task },
  { title: string; status?: TaskStatus; priority?: TaskPriority; category?: string; dueAt?: string | null },
  { rejectValue: string }
>("tasks/create", async (payload, thunkAPI) => {
  try {
    const token = loadToken();
    if (!token) return thunkAPI.rejectWithValue("Oturum bulunamadı.");

    const res = await authedFetch<{ ok: boolean; task: Task }>(
      PATHS.create,
      { method: "POST", json: payload },
      token
    );

    return { task: res.task };
  } catch (e: any) {
    return thunkAPI.rejectWithValue(e?.message || "Görev oluşturulamadı.");
  }
});

export const updateTaskThunk = createAsyncThunk<
  { task: Task },
  { taskId: string; title?: string; status?: TaskStatus; priority?: TaskPriority; category?: string; dueAt?: string | null },
  { rejectValue: string }
>("tasks/update", async (payload, thunkAPI) => {
  try {
    const token = loadToken();
    if (!token) return thunkAPI.rejectWithValue("Oturum bulunamadı.");

    const res = await authedFetch<{ ok: boolean; task: Task }>(
      PATHS.update,
      { method: "POST", json: payload },
      token
    );

    return { task: res.task };
  } catch (e: any) {
    return thunkAPI.rejectWithValue(e?.message || "Görev güncellenemedi.");
  }
});

export const deleteTaskThunk = createAsyncThunk<
  { taskId: string },
  { taskId: string },
  { rejectValue: string }
>("tasks/delete", async ({ taskId }, thunkAPI) => {
  try {
    const token = loadToken();
    if (!token) return thunkAPI.rejectWithValue("Oturum bulunamadı.");

    await authedFetch<{ ok: boolean; message?: string }>(
      PATHS.delete,
      { method: "POST", json: { taskId } },
      token
    );

    return { taskId };
  } catch (e: any) {
    return thunkAPI.rejectWithValue(e?.message || "Görev silinemedi.");
  }
});

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    clearTasksError(state) {
      state.error = null;
    },
    setTasks(state, action: PayloadAction<Task[]>) {
      state.items = action.payload || [];
      state.initialized = true;
    },
    resetTasks(state) {
      state.items = [];
      state.loading = false;
      state.error = null;
      state.initialized = false;
    },
  },
  extraReducers: (b) => {
    b.addCase(listTasksThunk.pending, (s) => {
      s.loading = true;
      s.error = null;
    });
    b.addCase(listTasksThunk.fulfilled, (s, a) => {
      s.loading = false;
      s.items = a.payload.tasks || [];
      s.initialized = true;
    });
    b.addCase(listTasksThunk.rejected, (s, a) => {
      s.loading = false;
      s.error = a.payload || "Görevler alınamadı.";
      s.initialized = true;
    });

    b.addCase(createTaskThunk.pending, (s) => {
      s.loading = true;
      s.error = null;
    });
    b.addCase(createTaskThunk.fulfilled, (s, a) => {
      s.loading = false;
      s.items = [a.payload.task, ...s.items];
      s.initialized = true;
    });
    b.addCase(createTaskThunk.rejected, (s, a) => {
      s.loading = false;
      s.error = a.payload || "Görev oluşturulamadı.";
    });

    b.addCase(updateTaskThunk.pending, (s) => {
      s.loading = true;
      s.error = null;
    });
    b.addCase(updateTaskThunk.fulfilled, (s, a) => {
      s.loading = false;
      const updated = a.payload.task;
      const idx = s.items.findIndex((t) => t._id === updated._id);
      if (idx >= 0) s.items[idx] = updated;
      else s.items = [updated, ...s.items];
      s.initialized = true;
    });
    b.addCase(updateTaskThunk.rejected, (s, a) => {
      s.loading = false;
      s.error = a.payload || "Görev güncellenemedi.";
    });

    b.addCase(deleteTaskThunk.pending, (s) => {
      s.loading = true;
      s.error = null;
    });
    b.addCase(deleteTaskThunk.fulfilled, (s, a) => {
      s.loading = false;
      s.items = s.items.filter((t) => t._id !== a.payload.taskId);
      s.initialized = true;
    });
    b.addCase(deleteTaskThunk.rejected, (s, a) => {
      s.loading = false;
      s.error = a.payload || "Görev silinemedi.";
    });
  },
});

export const { clearTasksError, setTasks, resetTasks } = tasksSlice.actions;
export default tasksSlice.reducer;


const selectTasksSlice = (s: any): TaskState => (s?.tasks ? (s.tasks as TaskState) : initialState);

export const selectTasks = createSelector([selectTasksSlice], (t) => t.items);
export const selectTasksLoading = createSelector([selectTasksSlice], (t) => t.loading);
export const selectTasksInitialized = createSelector([selectTasksSlice], (t) => t.initialized);
export const selectTasksError = createSelector([selectTasksSlice], (t) => t.error);

export const makeSelectTasksByStatus = (status: TaskStatus) =>
  createSelector([selectTasks], (items) => items.filter((t) => t.status === status));
