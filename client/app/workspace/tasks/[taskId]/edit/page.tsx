"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  CalendarDays,
  Tag,
  Flag,
  Clock,
  AlignLeft,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Trash2,
  Loader2,
} from "lucide-react";

import WorkspaceSidebar from "@/components/workspace/WorkspaceSidebar";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { Lang } from "@/lib/i18n";

import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { meThunk, selectAuthInitialized, selectAuthUser } from "@/lib/store/authSlice";

import {
  listTasksThunk,
  updateTaskThunk,
  deleteTaskThunk,
  clearTasksError,
  selectTasks,
  selectTasksLoading,
  selectTasksError,
} from "@/lib/store/taskSlice";

function cn(...c: Array<string | false | undefined | null>) {
  return c.filter(Boolean).join(" ");
}

/* ---------------- helpers ---------------- */

function toISODateInput(value: any) {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function splitTagsToString(v: any): string {
  if (!v) return "";
  if (Array.isArray(v)) return v.join(", ");
  if (typeof v === "string") return v;
  return "";
}

function parseTagsInput(s: string): string[] {
  return String(s || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 12);
}

/* ---------------- Page ---------------- */

export default function EditTaskPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = (params as any)?.taskId as string | undefined;

  const { lang } = useLocale();
  const dispatch = useAppDispatch();

  const initialized = useAppSelector(selectAuthInitialized);
  const user = useAppSelector(selectAuthUser);

  const tasks = useAppSelector(selectTasks);
  const loading = useAppSelector(selectTasksLoading);
  const tasksError = useAppSelector(selectTasksError);

  const copy = useMemo(() => {
    const tr = {
      title: "Görevi Düzenle",
      subtitle: "Detayları güncelle ve devam et.",
      back: "Geri",
      save: "Kaydet",
      saving: "Kaydediliyor…",
      deleting: "Siliniyor…",
      delete: "Sil",
      cancel: "Vazgeç",
      hint: "İpucu",
      hintText: "Etiketleri virgül ile ayır: design, frontend, urgent",
      sections: {
        basics: "Temel Bilgiler",
        planning: "Planlama",
        meta: "Etiket & Kategori",
      },
      fields: {
        title: "Görev Başlığı",
        description: "Açıklama",
        category: "Kategori",
        priority: "Öncelik",
        status: "Durum",
        due: "Son Tarih",
        duration: "Tahmini Süre (dk)",
        tags: "Etiketler",
      },
      placeholders: {
        title: "Örn: Tonica Dashboard tasarımını bitir",
        description: "Görevin detaylarını yaz…",
        tags: "Örn: design, frontend, urgent",
      },
      options: {
        category: {
          work: "İş",
          personal: "Kişisel",
          study: "Eğitim",
          health: "Sağlık",
          finance: "Finans",
        },
        priority: {
          low: "Düşük",
          medium: "Orta",
          high: "Yüksek",
          urgent: "Acil",
        },
        status: {
          todo: "Yapılacak",
          in_progress: "Devam",
          done: "Bitti",
        },
      },
      errors: {
        generic: "İşlem başarısız.",
        notFound: "Görev bulunamadı.",
        titleRequired: "Başlık zorunlu.",
      },
      confirmDelete: {
        title: "Görev silinsin mi?",
        desc: "Bu işlem geri alınamaz.",
        yes: "Evet, sil",
        no: "Vazgeç",
      },
    };

    const en = {
      title: "Edit Task",
      subtitle: "Update details and keep going.",
      back: "Back",
      save: "Save",
      saving: "Saving…",
      deleting: "Deleting…",
      delete: "Delete",
      cancel: "Cancel",
      hint: "Tip",
      hintText: "Separate tags with commas: design, frontend, urgent",
      sections: {
        basics: "Basics",
        planning: "Planning",
        meta: "Tags & Category",
      },
      fields: {
        title: "Task Title",
        description: "Description",
        category: "Category",
        priority: "Priority",
        status: "Status",
        due: "Due Date",
        duration: "Estimated time (min)",
        tags: "Tags",
      },
      placeholders: {
        title: "e.g. Finish Tonica dashboard UI",
        description: "Write details…",
        tags: "e.g. design, frontend, urgent",
      },
      options: {
        category: {
          work: "Work",
          personal: "Personal",
          study: "Study",
          health: "Health",
          finance: "Finance",
        },
        priority: {
          low: "Low",
          medium: "Medium",
          high: "High",
          urgent: "Urgent",
        },
        status: {
          todo: "To do",
          in_progress: "In progress",
          done: "Done",
        },
      },
      errors: {
        generic: "Operation failed.",
        notFound: "Task not found.",
        titleRequired: "Title is required.",
      },
      confirmDelete: {
        title: "Delete this task?",
        desc: "This action cannot be undone.",
        yes: "Yes, delete",
        no: "Cancel",
      },
    };

    return (lang as Lang) === "tr" ? tr : en;
  }, [lang]);

  useEffect(() => {
    if (!initialized) dispatch(meThunk());
  }, [initialized, dispatch]);

  useEffect(() => {
    if (!initialized) return;
    if (!user) router.replace("/login");
  }, [initialized, user, router]);

  // page enter: clear error + ensure tasks are loaded
  useEffect(() => {
    dispatch(clearTasksError());
  }, [dispatch]);

  useEffect(() => {
    if (!initialized || !user) return;
    dispatch(listTasksThunk());
  }, [initialized, user?._id, dispatch]);

  const task = useMemo(() => {
    if (!taskId) return null;
    return (tasks || []).find((t: any) => String(t._id) === String(taskId)) || null;
  }, [tasks, taskId]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "work",
    priority: "medium",
    status: "todo",
    dueAt: "",
    duration: "",
    tags: "",
  });

  const [localError, setLocalError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // fill form when task arrives
  useEffect(() => {
    if (!task) return;
    setForm({
      title: task.title || "",
      description: task.description || "",
      category: task.category || "work",
      priority: task.priority || "medium",
      status: task.status || "todo",
      dueAt: toISODateInput(task.dueAt),
      duration:
        typeof task.durationMinutes === "number"
          ? String(task.durationMinutes)
          : task.durationMinutes
          ? String(task.durationMinutes)
          : "",
      tags: splitTagsToString(task.tags),
    });
  }, [task]);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalError(null);
    dispatch(clearTasksError());

    const title = String(form.title || "").trim();
    if (!title) {
      setLocalError(copy.errors.titleRequired);
      return;
    }

    const priority =
      form.priority === "urgent" ? "high" : (form.priority as "low" | "medium" | "high");

    const payload: any = {
      taskId,
      title,
      description: String(form.description || "").trim() || "",
      status: form.status as "todo" | "in_progress" | "done",
      priority,
      category: form.category,
    };

    if (form.dueAt) payload.dueAt = form.dueAt;
    else payload.dueAt = null;

    if (form.duration !== "") {
      const n = Number(form.duration);
      if (!Number.isNaN(n) && n >= 0) payload.durationMinutes = n;
    } else {
      payload.durationMinutes = null;
    }

    const tagsArr = parseTagsInput(form.tags);
    payload.tags = tagsArr; // boşsa [] gönderelim, backend isterse boşaltır

    const r = await dispatch(updateTaskThunk(payload));
    if (updateTaskThunk.fulfilled.match(r)) {
      router.push("/workspace/tasks");
      return;
    }

    setLocalError(copy.errors.generic);
  }

  async function handleDeleteConfirmed() {
    if (!taskId) return;
    setLocalError(null);
    dispatch(clearTasksError());

    const r = await dispatch(deleteTaskThunk({ taskId }));
    if (deleteTaskThunk.fulfilled.match(r)) {
      router.push("/workspace/tasks");
      return;
    }

    setLocalError(copy.errors.generic);
  }

  if (!initialized || !user) return null;

  // ✅ IMPORTANT: boolean olsun (TS2322 fix)
  const hasTaskId = typeof taskId === "string" && taskId.length > 0;
  const notFound = Boolean(!loading && hasTaskId && !task);

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <WorkspaceSidebar />

          <section className="min-w-0 space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-[11px] font-bold text-slate-600 backdrop-blur dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  Tonica Workspace
                </div>

                <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {copy.title}
                </h1>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {copy.subtitle}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold transition",
                    "border border-slate-200 bg-white/70 text-slate-800 hover:bg-white",
                    "dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-200 dark:hover:bg-slate-900/60"
                  )}
                >
                  <ArrowLeft className="h-4 w-4" />
                  {copy.back}
                </button>

                <button
                  form="edit-task-form"
                  type="submit"
                  disabled={Boolean(loading || notFound)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-extrabold text-white shadow-md hover:opacity-95",
                    "bg-linear-to-r from-sky-500 to-indigo-600",
                    (loading || notFound) && "opacity-70 cursor-not-allowed"
                  )}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  {loading ? copy.saving : copy.save}
                </button>

                <button
                  type="button"
                  onClick={() => setConfirmOpen(true)}
                  disabled={Boolean(loading || notFound)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-extrabold transition",
                    "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
                    "dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200 dark:hover:bg-rose-500/20",
                    (loading || notFound) && "opacity-70 cursor-not-allowed"
                  )}
                  title={copy.delete}
                >
                  <Trash2 className="h-4 w-4" />
                  {copy.delete}
                </button>
              </div>
            </div>

            {/* Errors */}
            {(localError || tasksError) && (
              <div
                className={cn(
                  "rounded-2xl border p-4 text-sm font-semibold",
                  "border-rose-200 bg-rose-50 text-rose-700",
                  "dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200"
                )}
              >
                {localError || tasksError}
              </div>
            )}

            {/* Not found */}
            {notFound ? (
              <div className="rounded-3xl border border-slate-200 bg-white/80 p-10 text-center text-sm text-slate-600 dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-400">
                {copy.errors.notFound}
              </div>
            ) : (
              <form
                id="edit-task-form"
                onSubmit={handleSubmit}
                className={cn(
                  "rounded-3xl border p-6 sm:p-8 shadow-sm backdrop-blur-xl",
                  "border-slate-200 bg-white/80",
                  "dark:border-white/10 dark:bg-slate-900/40"
                )}
              >
                {/* Section: basics */}
                <SectionTitle title={copy.sections.basics} />

                <div className="grid gap-5 mt-4">
                  <InputField
                    label={copy.fields.title}
                    placeholder={copy.placeholders.title}
                    icon={<CheckCircle2 className="h-4 w-4" />}
                    value={form.title}
                    onChange={(v) => update("title", v)}
                    required
                  />

                  <TextareaField
                    label={copy.fields.description}
                    placeholder={copy.placeholders.description}
                    icon={<AlignLeft className="h-4 w-4" />}
                    value={form.description}
                    onChange={(v) => update("description", v)}
                  />
                </div>

                <div className="my-8 h-px bg-linear-to-r from-transparent via-slate-200 to-transparent dark:via-white/10" />

                {/* Section: planning */}
                <SectionTitle title={copy.sections.planning} />

                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                  <SelectField
                    label={copy.fields.status}
                    icon={<Clock className="h-4 w-4" />}
                    value={form.status}
                    onChange={(v) => update("status", v)}
                    options={[
                      { value: "todo", label: copy.options.status.todo },
                      { value: "in_progress", label: copy.options.status.in_progress },
                      { value: "done", label: copy.options.status.done },
                    ]}
                  />

                  <InputField
                    label={copy.fields.due}
                    icon={<CalendarDays className="h-4 w-4" />}
                    value={toISODateInput(form.dueAt)}
                    onChange={(v) => update("dueAt", v)}
                    type="date"
                  />

                  <InputField
                    label={copy.fields.duration}
                    icon={<Clock className="h-4 w-4" />}
                    value={form.duration}
                    onChange={(v) => update("duration", v)}
                    type="number"
                    min={0}
                    placeholder="45"
                  />

                  <SelectField
                    label={copy.fields.priority}
                    icon={<Flag className="h-4 w-4" />}
                    value={form.priority}
                    onChange={(v) => update("priority", v)}
                    options={[
                      { value: "low", label: copy.options.priority.low },
                      { value: "medium", label: copy.options.priority.medium },
                      { value: "high", label: copy.options.priority.high },
                      { value: "urgent", label: copy.options.priority.urgent },
                    ]}
                  />
                </div>

                <div className="my-8 h-px bg-linear-to-r from-transparent via-slate-200 to-transparent dark:via-white/10" />

                {/* Section: meta */}
                <SectionTitle title={copy.sections.meta} />

                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                  <SelectField
                    label={copy.fields.category}
                    icon={<Tag className="h-4 w-4" />}
                    value={form.category}
                    onChange={(v) => update("category", v)}
                    options={[
                      { value: "work", label: copy.options.category.work },
                      { value: "personal", label: copy.options.category.personal },
                      { value: "study", label: copy.options.category.study },
                      { value: "health", label: copy.options.category.health },
                      { value: "finance", label: copy.options.category.finance },
                    ]}
                  />

                  <InputField
                    label={copy.fields.tags}
                    placeholder={copy.placeholders.tags}
                    icon={<Tag className="h-4 w-4" />}
                    value={form.tags}
                    onChange={(v) => update("tags", v)}
                    hint={copy.hintText}
                  />
                </div>

                {/* Footer */}
                <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white/60 p-4 text-sm text-slate-700 dark:border-white/10 dark:bg-slate-950/30 dark:text-slate-200">
                    <div className="mt-0.5">
                      <Sparkles className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        {copy.hint}
                      </div>
                      <div className="mt-1 text-sm">{copy.hintText}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => router.push("/workspace/tasks")}
                      className={cn(
                        "rounded-2xl px-4 py-2 text-sm font-bold transition",
                        "border border-slate-200 bg-white/70 text-slate-800 hover:bg-white",
                        "dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-200 dark:hover:bg-slate-900/60"
                      )}
                    >
                      {copy.cancel}
                    </button>

                    <button
                      type="submit"
                      disabled={Boolean(loading || notFound)}
                      className={cn(
                        "rounded-2xl bg-linear-to-r from-sky-500 to-indigo-600 px-5 py-2 text-sm font-extrabold text-white shadow-md hover:opacity-95",
                        (loading || notFound) && "opacity-70 cursor-not-allowed"
                      )}
                    >
                      {loading ? copy.saving : copy.save}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </section>
        </div>
      </div>

      {/* Confirm delete modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {copy.confirmDelete.title}
                </div>
                <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {copy.confirmDelete.desc}
                </div>
              </div>
              <button
                onClick={() => setConfirmOpen(false)}
                className="rounded-xl px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-950/30 dark:text-slate-200 dark:hover:bg-white/10"
              >
                {copy.confirmDelete.no}
              </button>

              <button
                type="button"
                onClick={async () => {
                  setConfirmOpen(false);
                  await handleDeleteConfirmed();
                }}
                className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-4 py-2 text-sm font-extrabold text-white hover:opacity-95"
              >
                <Trash2 className="h-4 w-4" />
                {copy.confirmDelete.yes}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}


function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm font-extrabold text-slate-900 dark:text-white">{title}</div>
      <div className="h-px flex-1 ml-4 bg-linear-to-r from-slate-200 to-transparent dark:from-white/10" />
    </div>
  );
}

function FieldShell({
  label,
  icon,
  children,
  valuePresent,
  required,
  hint,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  valuePresent: boolean;
  required?: boolean;
  hint?: string;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative">
      <div
        className={cn(
          "group relative flex items-center gap-3 rounded-2xl px-4 pt-5 pb-2 transition-all",
          "border bg-white/80 backdrop-blur",
          "border-slate-200",
          "dark:bg-slate-900/50 dark:border-white/10",
          focused && "ring-2 ring-sky-500/30 border-sky-400 dark:border-sky-500"
        )}
        onFocusCapture={() => setFocused(true)}
        onBlurCapture={() => setFocused(false)}
      >
        <span className="text-slate-400 dark:text-slate-500">{icon}</span>
        <div className="min-w-0 flex-1">{children}</div>

        <label
          className={cn(
            "absolute left-12 transition-all text-xs font-semibold pointer-events-none",
            valuePresent || focused
              ? "top-1 text-sky-600 dark:text-sky-400"
              : "top-4 text-slate-400 dark:text-slate-500"
          )}
        >
          {label}
          {required ? <span className="ml-1 text-rose-500">*</span> : null}
        </label>
      </div>

      {hint ? (
        <div className="mt-2 text-[12px] text-slate-500 dark:text-slate-400">{hint}</div>
      ) : null}
    </div>
  );
}

function InputField({
  label,
  icon,
  value,
  onChange,
  type = "text",
  required,
  min,
  placeholder,
  hint,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  min?: number;
  placeholder?: string;
  hint?: string;
}) {
  const valuePresent = !!String(value || "").trim();

  return (
    <FieldShell label={label} icon={icon} valuePresent={valuePresent} required={required} hint={hint}>
      <input
        required={required}
        type={type}
        value={value}
        min={typeof min === "number" ? min : undefined}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || label}
        className={cn(
          "peer w-full bg-transparent text-sm outline-none",
          "text-slate-900 placeholder:text-transparent",
          "dark:text-white dark:placeholder:text-transparent",
          type === "date" && "text-slate-900 dark:text-white"
        )}
      />
    </FieldShell>
  );
}

function TextareaField({
  label,
  icon,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const valuePresent = !!String(value || "").trim();

  return (
    <FieldShell label={label} icon={icon} valuePresent={valuePresent}>
      <textarea
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || label}
        className="peer w-full resize-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-transparent dark:text-white dark:placeholder:text-transparent"
      />
    </FieldShell>
  );
}

function SelectField({
  label,
  icon,
  value,
  onChange,
  options,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const valuePresent = !!String(value || "").trim();

  return (
    <FieldShell label={label} icon={icon} valuePresent={valuePresent}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn("w-full bg-transparent text-sm outline-none appearance-none", "text-slate-900 dark:text-white")}
      >
        {options.map((o) => (
          <option
            key={o.value}
            value={o.value}
            className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
          >
            {o.label}
          </option>
        ))}
      </select>

      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
        ▾
      </span>
    </FieldShell>
  );
}
