"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  CalendarDays,
  Flag,
  CheckCircle2,
  Flame,
  CircleDot,
  Pencil,
  Clock,
  Tag,
  Trash2,
} from "lucide-react";

import WorkspaceSidebar from "@/components/workspace/WorkspaceSidebar";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { Lang } from "@/lib/i18n";

import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { meThunk, selectAuthInitialized, selectAuthUser } from "@/lib/store/authSlice";

import {
  listTasksThunk,
  deleteTaskThunk,
  selectTasks,
  selectTasksLoading,
  selectTasksError,
  clearTasksError,
} from "@/lib/store/taskSlice";

function cn(...c: Array<string | false | undefined | null>) {
  return c.filter(Boolean).join(" ");
}

function toIsoStringSafe(v: any): string | null {
  if (!v) return null;
  if (typeof v === "string") return v;
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v.toISOString();
  if (typeof v === "object" && v.$date) {
    const d0 = new Date(v.$date);
    return Number.isNaN(d0.getTime()) ? null : d0.toISOString();
  }
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function startOfDay(ts: number) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function relativeLabel(iso: string, lang: Lang) {
  const due = new Date(iso).getTime();
  if (Number.isNaN(due)) return null;

  const today = startOfDay(Date.now());
  const target = startOfDay(due);
  const diff = Math.round((target - today) / (1000 * 60 * 60 * 24));

  if (diff < 0) return lang === "tr" ? "Gecikti" : "Overdue";
  if (diff === 0) return lang === "tr" ? "Bugün" : "Today";
  if (diff === 1) return lang === "tr" ? "Yarın" : "Tomorrow";
  return lang === "tr" ? `${diff} gün` : `${diff} days`;
}

function formatDate(iso: string, lang: Lang) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function splitTags(v: any): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(String).map((x) => x.trim()).filter(Boolean).slice(0, 6);
  if (typeof v === "string") {
    return v
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean)
      .slice(0, 6);
  }
  return [];
}

export default function TasksPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { lang } = useLocale();

  const initialized = useAppSelector(selectAuthInitialized);
  const user = useAppSelector(selectAuthUser);

  const tasksRaw = useAppSelector(selectTasks);
  const loading = useAppSelector(selectTasksLoading);
  const error = useAppSelector(selectTasksError);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!initialized) dispatch(meThunk());
  }, [initialized, dispatch]);

  useEffect(() => {
    if (!initialized) return;
    if (!user) router.replace("/login");
  }, [initialized, user, router]);

  useEffect(() => {
    if (!initialized || !user) return;
    dispatch(clearTasksError());
    dispatch(listTasksThunk());
  }, [initialized, user?._id, dispatch]);

  const copy = useMemo(() => {
    const tr = {
      title: "Görevler",
      subtitle: "Tüm görevlerini filtrele ve yönet.",
      search: "Görev ara...",
      all: "Tümü",
      todo: "Yapılacak",
      progress: "Devam",
      done: "Tamamlanan",
      newTask: "Yeni Görev",
      empty: "Görev bulunamadı.",
      loading: "Yükleniyor…",
      retry: "Tekrar Dene",
      edit: "Düzenle",
      del: "Sil",
      items: "görev",
      noDesc: "Açıklama yok.",
      noDue: "Tarih yok",
      min: "dk",
      confirmDel: "Bu görevi silmek istiyor musun?",
      cancel: "Vazgeç",
      deleting: "Siliniyor…",
      meta: {
        status: "Durum",
        priority: "Öncelik",
        due: "Son Tarih",
        duration: "Süre",
        category: "Kategori",
      },
      priority: { low: "Düşük", medium: "Orta", high: "Yüksek" },
      status: { todo: "Yapılacak", in_progress: "Devam", done: "Bitti" },
    };
    const en = {
      title: "Tasks",
      subtitle: "Filter and manage all your tasks.",
      search: "Search tasks...",
      all: "All",
      todo: "To do",
      progress: "In progress",
      done: "Completed",
      newTask: "New Task",
      empty: "No tasks found.",
      loading: "Loading…",
      retry: "Retry",
      edit: "Edit",
      del: "Delete",
      items: "tasks",
      noDesc: "No description.",
      noDue: "No date",
      min: "min",
      confirmDel: "Delete this task?",
      cancel: "Cancel",
      deleting: "Deleting…",
      meta: {
        status: "Status",
        priority: "Priority",
        due: "Due",
        duration: "Duration",
        category: "Category",
      },
      priority: { low: "Low", medium: "Medium", high: "High" },
      status: { todo: "To do", in_progress: "In progress", done: "Done" },
    };
    return (lang as Lang) === "tr" ? tr : en;
  }, [lang]);

  const tasks = useMemo(() => {
    return (tasksRaw || []).map((t: any) => ({
      ...t,
      dueAt: toIsoStringSafe(t.dueAt),
      createdAt: toIsoStringSafe(t.createdAt),
      tagsArr: splitTags(t.tags),
    }));
  }, [tasksRaw]);

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const categories = useMemo(() => {
    const set = new Set(tasks.map((t: any) => t.category).filter(Boolean));
    return Array.from(set);
  }, [tasks]);

  const filtered = useMemo(() => {
    return tasks.filter((t: any) => {
      const matchSearch =
        String(t.title || "").toLowerCase().includes(q.toLowerCase()) ||
        String(t.description || "").toLowerCase().includes(q.toLowerCase());

      const matchStatus = statusFilter === "all" || t.status === statusFilter;
      const matchCategory = categoryFilter === "all" || t.category === categoryFilter;

      return matchSearch && matchStatus && matchCategory;
    });
  }, [tasks, q, statusFilter, categoryFilter]);

  async function onDelete(taskId: string) {
    if (!taskId) return;
    const ok = window.confirm(copy.confirmDel);
    if (!ok) return;

    setDeletingId(taskId);
    dispatch(clearTasksError());

    const r = await dispatch(deleteTaskThunk({ taskId }));
    setDeletingId(null);

    if (deleteTaskThunk.fulfilled.match(r)) {
      dispatch(listTasksThunk());
    }
  }

  if (!initialized || !user) return null;

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <WorkspaceSidebar />

          <section className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-[11px] font-bold text-slate-600 backdrop-blur dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-300">
                  <CircleDot className="h-3.5 w-3.5" />
                  Tonica Workspace
                </div>

                <h1 className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">
                  {copy.title}
                </h1>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{copy.subtitle}</p>

                <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                  {filtered.length} {copy.items}
                </div>
              </div>

              <button
                onClick={() => router.push("/workspace/tasks/new")}
                className="inline-flex items-center gap-2 rounded-2xl bg-linear-to-r from-sky-500 to-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-md hover:opacity-95"
              >
                <Plus className="h-4 w-4" />
                {copy.newTask}
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={copy.search}
                  className="w-full h-10 rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm
                             dark:border-white/10 dark:bg-slate-900/40 dark:text-white"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 rounded-2xl border border-slate-200 bg-white px-4 text-sm
                           dark:border-white/10 dark:bg-slate-900/40 dark:text-white"
              >
                <option value="all">{copy.all}</option>
                <option value="todo">{copy.todo}</option>
                <option value="in_progress">{copy.progress}</option>
                <option value="done">{copy.done}</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-10 rounded-2xl border border-slate-200 bg-white px-4 text-sm
                           dark:border-white/10 dark:bg-slate-900/40 dark:text-white"
              >
                <option value="all">{copy.all}</option>
                {categories.map((c: any) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div
                className={cn(
                  "rounded-3xl border p-5 text-sm font-semibold",
                  "border-rose-200 bg-rose-50 text-rose-700",
                  "dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200"
                )}
              >
                <div>{error}</div>
                <button
                  onClick={() => dispatch(listTasksThunk())}
                  className="mt-3 inline-flex items-center rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:opacity-95"
                >
                  {copy.retry}
                </button>
              </div>
            )}

            {loading && !error ? (
              <div
                className="rounded-3xl border border-slate-200 bg-white/80 p-10 text-center text-sm text-slate-600
                           dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-400"
              >
                {copy.loading}
              </div>
            ) : filtered.length === 0 ? (
              <div
                className="rounded-3xl border border-slate-200 bg-white/80 p-10 text-center text-sm text-slate-600
                           dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-400"
              >
                {copy.empty}
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((task: any) => (
                  <TaskCard
                    key={task._id || task.title}
                    task={task}
                    lang={lang as Lang}
                    copy={copy}
                    deleting={deletingId === String(task._id)}
                    onEdit={() => router.push(`/workspace/tasks/${task._id}/edit`)}
                    onDelete={() => onDelete(String(task._id))}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}


function TaskCard({
  task,
  lang,
  copy,
  deleting,
  onEdit,
  onDelete,
}: {
  task: any;
  lang: Lang;
  copy: any;
  deleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const dueRel = task?.dueAt ? relativeLabel(task.dueAt, lang) : null;
  const overdue = dueRel === (lang === "tr" ? "Gecikti" : "Overdue");

  return (
    <div
      className={cn(
        "group rounded-3xl border bg-white/80 p-5 shadow-sm transition",
        "border-slate-200 hover:shadow-md hover:-translate-y-px",
        "dark:border-white/10 dark:bg-slate-900/40"
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="min-w-0">
            <div className="truncate text-base font-extrabold text-slate-900 dark:text-white">
              {task.title}
            </div>

            <div className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
              {String(task.description || "").trim() ? task.description : copy.noDesc}
            </div>
          </div>

          {/* Pills */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusPill status={task.status} lang={lang} copy={copy} />
            {task.priority ? <PriorityPill priority={task.priority} lang={lang} copy={copy} /> : null}

            {dueRel ? (
              <DuePill text={dueRel} overdue={!!overdue} />
            ) : (
              <MutedPill icon={<CalendarDays className="h-3.5 w-3.5" />} text={copy.noDue} />
            )}

            {typeof task.durationMinutes === "number" ? (
              <MutedPill icon={<Clock className="h-3.5 w-3.5" />} text={`${task.durationMinutes} ${copy.min}`} />
            ) : null}

            {task.category ? (
              <MutedPill icon={<Tag className="h-3.5 w-3.5" />} text={String(task.category)} />
            ) : null}
          </div>

          {/* Tags */}
          {Array.isArray(task.tagsArr) && task.tagsArr.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {task.tagsArr.map((t: string) => (
                <span
                  key={t}
                  className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700
                             dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-200"
                >
                  #{t}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {/* RIGHT */}
        <div className="flex items-center justify-end gap-2 sm:flex-col sm:items-end">
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className={cn(
                "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-extrabold transition",
                "border border-slate-200 bg-white/70 text-slate-800 hover:bg-white",
                "dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-200 dark:hover:bg-slate-900/60"
              )}
            >
              <Pencil className="h-4 w-4" />
              {copy.edit}
            </button>

            <button
              onClick={onDelete}
              disabled={deleting}
              className={cn(
                "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-extrabold transition",
                "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
                "dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200 dark:hover:bg-rose-500/20",
                deleting && "opacity-70 cursor-not-allowed"
              )}
              title={copy.del}
            >
              <Trash2 className="h-4 w-4" />
              {deleting ? copy.deleting : copy.del}
            </button>
          </div>

          <div className="hidden sm:block text-xs text-slate-500 dark:text-slate-400">
            {task.createdAt ? formatDate(task.createdAt, lang) : ""}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Pills ---------------- */

function StatusPill({ status, lang, copy }: { status: string; lang: Lang; copy: any }) {
  const map: any = {
    todo: {
      tr: copy.status?.todo ?? "Yapılacak",
      en: copy.status?.todo ?? "To do",
      cls: "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200",
      icon: CircleDot,
    },
    in_progress: {
      tr: copy.status?.in_progress ?? "Devam",
      en: copy.status?.in_progress ?? "In progress",
      cls: "bg-sky-500/10 text-sky-700 dark:text-sky-200",
      icon: Flame,
    },
    done: {
      tr: copy.status?.done ?? "Bitti",
      en: copy.status?.done ?? "Done",
      cls: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-200",
      icon: CheckCircle2,
    },
  };

  const v = map[status] || map.todo;
  const Icon = v.icon;

  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold", v.cls)}>
      <Icon className="h-3.5 w-3.5" />
      {lang === "tr" ? v.tr : v.en}
    </span>
  );
}

function PriorityPill({ priority, lang, copy }: { priority: string; lang: Lang; copy: any }) {
  const cls: any = {
    low: "bg-green-500/10 text-green-700 dark:text-green-300",
    medium: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    high: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  };

  const safe = ["low", "medium", "high"].includes(priority) ? priority : "medium";

  const labelTR = copy?.priority?.[safe] || (safe === "low" ? "Düşük" : safe === "medium" ? "Orta" : "Yüksek");
  const labelEN = copy?.priority?.[safe] || (safe === "low" ? "Low" : safe === "medium" ? "Medium" : "High");

  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold", cls[safe])}>
      <Flag className="h-3.5 w-3.5" />
      {lang === "tr" ? labelTR : labelEN}
    </span>
  );
}

function DuePill({ text, overdue }: { text: string; overdue: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold",
        overdue ? "bg-rose-500/10 text-rose-700 dark:text-rose-300" : "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"
      )}
    >
      <CalendarDays className="h-3.5 w-3.5" />
      {text}
    </span>
  );
}

function MutedPill({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-700 dark:bg-white/10 dark:text-slate-200">
      {icon}
      {text}
    </span>
  );
}
