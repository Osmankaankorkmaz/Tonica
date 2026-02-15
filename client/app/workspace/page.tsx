"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  CalendarDays,
  CheckCircle2,
  Flame,
  Clock,
  Sparkles,
  Target,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { meThunk, selectAuthInitialized, selectAuthUser } from "@/lib/store/authSlice";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { Lang } from "@/lib/i18n";

import WorkspaceSidebar from "@/components/workspace/WorkspaceSidebar";

function cn(...c: Array<string | false | undefined | null>) {
  return c.filter(Boolean).join(" ");
}

/* ---------------- date helpers ---------------- */

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

function formatDateSmart(iso: string, lang: Lang) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;

  const locale = lang === "tr" ? "tr-TR" : "en-US";
  const date = d.toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  return `${date} • ${time}`;
}

/* ---------------- page ---------------- */

export default function WorkspacePage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { lang } = useLocale();

  const initialized = useAppSelector(selectAuthInitialized);
  const user = useAppSelector(selectAuthUser);

  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!initialized) dispatch(meThunk());
  }, [initialized, dispatch]);

  useEffect(() => {
    if (!initialized) return;
    if (!user) router.replace("/login");
  }, [initialized, user, router]);

  const copy = useMemo(() => {
    const tr = {
      badge: "Tonica Workspace",
      dashboard: "Dashboard",
      subtitle: "Bugünün planını ve önceliklerini netleştir.",
      search: "Görev ara...",
      newTask: "Yeni Görev",
      seeAll: "Tümünü Gör",
      kpi: {
        completed: "Tamamlanan",
        upcoming: "Yaklaşan",
        high: "Yüksek Öncelik",
      },
      cards: {
        deadlines: "Yaklaşan Deadline'lar",
        focus: "Bugünün Odağı",
      },
      empty: {
        noTasks: "Henüz görev yok.",
        noDeadlines: "Deadline’ı olan görev bulunamadı.",
      },
      focus: {
        suggestion: "Bugün için bir hedef seç.",
        start: "Focus Başlat",
        openTasks: "Görevleri Aç",
        picked: "Seçili Hedef",
      },
    };

    const en = {
      badge: "Tonica Workspace",
      dashboard: "Dashboard",
      subtitle: "Clarify your priorities and plan your day.",
      search: "Search tasks...",
      newTask: "New Task",
      seeAll: "See all",
      kpi: {
        completed: "Completed",
        upcoming: "Upcoming",
        high: "High Priority",
      },
      cards: {
        deadlines: "Next Deadlines",
        focus: "Today’s Focus",
      },
      empty: {
        noTasks: "No tasks yet.",
        noDeadlines: "No tasks with due dates found.",
      },
      focus: {
        suggestion: "Pick a goal for today.",
        start: "Start Focus",
        openTasks: "Open Tasks",
        picked: "Picked Goal",
      },
    };

    return (lang as Lang) === "tr" ? tr : en;
  }, [lang]);

  // NOTE: burada taskları user üzerinden alıyorsun.
  // Eğer taskSlice kullanıyorsan: selectTasks + listTasksThunk ile çekmek daha doğru.
  const tasks = useMemo(() => {
    const raw = (user as any)?.tasks;
    return Array.isArray(raw) ? raw : [];
  }, [user]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tasks;

    return tasks.filter((t: any) => {
      const title = String(t?.title || "").toLowerCase();
      const desc = String(t?.description || "").toLowerCase();
      return title.includes(q) || desc.includes(q);
    });
  }, [tasks, search]);

  const stats = useMemo(() => {
    let done = 0;
    let high = 0;
    let upcoming = 0;

    for (const t of tasks as any[]) {
      if (t?.status === "done") done++;
      if (t?.priority === "high") high++;

      if (t?.dueAt) {
        const ts = new Date(t.dueAt).getTime();
        if (!Number.isNaN(ts) && ts > Date.now()) upcoming++;
      }
    }

    return { done, high, upcoming };
  }, [tasks]);

  const deadlines = useMemo(() => {
    const arr = (filtered || [])
      .filter((t: any) => !!t?.dueAt)
      .map((t: any) => {
        const dueTs = new Date(t.dueAt).getTime();
        return { ...t, dueTs };
      })
      .filter((t: any) => Number.isFinite(t.dueTs));

    // overdue first then nearest
    arr.sort((a: any, b: any) => a.dueTs - b.dueTs);
    return arr.slice(0, 6);
  }, [filtered]);

  const focusPick = useMemo(() => {
    // Önce "high" + dueAt en yakın
    const withDue = (tasks || [])
      .filter((t: any) => t?.status !== "done")
      .filter((t: any) => !!t?.dueAt)
      .map((t: any) => ({ ...t, dueTs: new Date(t.dueAt).getTime() }))
      .filter((t: any) => Number.isFinite(t.dueTs));

    withDue.sort((a: any, b: any) => {
      // high priority öne
      const ap = a?.priority === "high" ? 0 : a?.priority === "medium" ? 1 : 2;
      const bp = b?.priority === "high" ? 0 : b?.priority === "medium" ? 1 : 2;
      if (ap !== bp) return ap - bp;
      return a.dueTs - b.dueTs;
    });

    return withDue[0] || (tasks || []).find((t: any) => t?.status !== "done") || null;
  }, [tasks]);

  if (!initialized || !user) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <WorkspaceSidebar />

          <section className="space-y-6">
            {/* HEADER */}
            <div className="rounded-3xl border border-slate-200 bg-white/70 p-5 shadow-sm backdrop-blur
                            dark:border-white/10 dark:bg-slate-900/40">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-[11px] font-extrabold text-slate-600
                                  dark:border-white/10 dark:bg-slate-950/30 dark:text-slate-300">
                    <Sparkles className="h-3.5 w-3.5" />
                    {copy.badge}
                  </div>

                  <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    {copy.dashboard}
                  </h1>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    {copy.subtitle}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={copy.search}
                      className="h-11 w-full sm:w-72 rounded-2xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none
                                 dark:border-white/10 dark:bg-slate-900/50 dark:text-white"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push("/workspace/tasks/new")}
                      className="inline-flex h-11 items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 px-4 text-sm font-extrabold text-white shadow-sm hover:opacity-95"
                    >
                      <Plus className="h-4 w-4" />
                      {copy.newTask}
                    </button>

                    <button
                      onClick={() => router.push("/workspace/tasks")}
                      className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white/70 px-4 text-sm font-extrabold text-slate-800 hover:bg-white
                                 dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-200 dark:hover:bg-slate-900/60"
                    >
                      {copy.seeAll}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* KPI */}
            <div className="grid gap-4 sm:grid-cols-3">
              <KPI
                icon={<CheckCircle2 className="h-5 w-5" />}
                label={copy.kpi.completed}
                value={stats.done}
                accent="emerald"
              />
              <KPI
                icon={<Clock className="h-5 w-5" />}
                label={copy.kpi.upcoming}
                value={stats.upcoming}
                accent="indigo"
              />
              <KPI
                icon={<Flame className="h-5 w-5" />}
                label={copy.kpi.high}
                value={stats.high}
                accent="rose"
              />
            </div>

            {/* CONTENT */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* DEADLINES */}
              <Card
                title={copy.cards.deadlines}
                icon={<CalendarDays className="h-5 w-5" />}
                actionLabel={copy.seeAll}
                onAction={() => router.push("/workspace/tasks")}
              >
                {tasks.length === 0 ? (
                  <Empty text={copy.empty.noTasks} />
                ) : deadlines.length === 0 ? (
                  <Empty text={copy.empty.noDeadlines} />
                ) : (
                  <div className="space-y-3">
                    {deadlines.map((t: any) => {
                      const rel = t?.dueAt ? relativeLabel(t.dueAt, lang as Lang) : null;
                      const overdue = rel === (lang === "tr" ? "Gecikti" : "Overdue");

                      return (
                        <button
                          key={t._id}
                          onClick={() => router.push(`/workspace/tasks/${t._id}/edit`)}
                          className={cn(
                            "w-full text-left rounded-2xl border p-4 transition",
                            "border-slate-200 bg-white hover:shadow-sm hover:-translate-y-[1px]",
                            "dark:border-white/10 dark:bg-slate-900/50"
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="truncate font-extrabold text-slate-900 dark:text-white">
                                {t.title}
                              </div>
                              <div className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
                                {String(t.description || "").trim() || "—"}
                              </div>
                            </div>

                            {rel ? (
                              <span
                                className={cn(
                                  "shrink-0 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-extrabold",
                                  overdue
                                    ? "bg-rose-500/10 text-rose-700 dark:text-rose-200"
                                    : "bg-indigo-500/10 text-indigo-700 dark:text-indigo-200"
                                )}
                              >
                                {overdue ? <AlertTriangle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                                {rel}
                              </span>
                            ) : null}
                          </div>

                          {t.dueAt ? (
                            <div className="mt-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                              {formatDateSmart(t.dueAt, lang as Lang)}
                            </div>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                )}
              </Card>

              {/* FOCUS */}
              <Card title={copy.cards.focus} icon={<Target className="h-5 w-5" />}>
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-sky-50 to-white p-5
                                dark:border-white/10 dark:from-slate-900 dark:to-slate-950">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-sky-600 dark:text-sky-400">
                      <Sparkles className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        {focusPick ? copy.focus.picked : copy.cards.focus}
                      </div>

                      <div className="mt-1 text-base font-extrabold text-slate-900 dark:text-white">
                        {focusPick?.title || copy.focus.suggestion}
                      </div>

                      {focusPick?.dueAt ? (
                        <div className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                          <CalendarDays className="h-4 w-4" />
                          {formatDateSmart(focusPick.dueAt, lang as Lang)}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-2 sm:grid-cols-2">
                    <button
                      onClick={() => router.push("/workspace/focus")}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 px-4 py-3 text-sm font-extrabold text-white shadow-sm hover:opacity-95"
                    >
                      <Target className="h-4 w-4" />
                      {copy.focus.start}
                    </button>

                    <button
                      onClick={() => router.push("/workspace/tasks")}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm font-extrabold text-slate-800 hover:bg-white
                                 dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-200 dark:hover:bg-slate-900/60"
                    >
                      {copy.focus.openTasks}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

/* ---------------- UI ---------------- */

function Card({
  title,
  icon,
  children,
  actionLabel,
  onAction,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur
                    dark:border-white/10 dark:bg-slate-900/40">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900 dark:text-white">
          <span className="text-slate-500 dark:text-slate-300">{icon}</span>
          {title}
        </div>

        {actionLabel && onAction ? (
          <button
            onClick={onAction}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-[11px] font-extrabold text-slate-800 hover:bg-white
                       dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-200 dark:hover:bg-slate-900/60"
          >
            {actionLabel}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      {children}
    </div>
  );
}

function KPI({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent: "emerald" | "indigo" | "rose";
}) {
  const accentCls =
    accent === "emerald"
      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-200"
      : accent === "indigo"
      ? "bg-indigo-500/10 text-indigo-700 dark:text-indigo-200"
      : "bg-rose-500/10 text-rose-700 dark:text-rose-200";

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur
                    dark:border-white/10 dark:bg-slate-900/40">
      <div className="flex items-center justify-between">
        <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {label}
        </div>
        <span className={cn("inline-flex items-center justify-center rounded-2xl p-2", accentCls)}>
          {icon}
        </span>
      </div>

      <div className="mt-4 text-3xl font-extrabold text-slate-900 dark:text-white">{value}</div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white/60 p-4 text-sm text-slate-600 dark:border-white/10 dark:bg-slate-950/20 dark:text-slate-300">{text}</div>;
}
