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
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { meThunk, selectAuthInitialized, selectAuthUser } from "@/lib/store/authSlice";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { Lang } from "@/lib/i18n";

import WorkspaceSidebar from "@/components/workspace/WorkspaceSidebar";

function cn(...c: Array<string | false | undefined | null>) {
  return c.filter(Boolean).join(" ");
}

function formatDateSmart(iso: string, lang: Lang) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;

  const locale = lang === "tr" ? "tr-TR" : "en-US";
  const date = d.toLocaleDateString(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const time = d.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${date} • ${time}`;
}

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
      dashboard: "Dashboard",
      subtitle: "Bugünün planını ve önceliklerini netleştir.",
      search: "Görev ara...",
      newTask: "Yeni Görev",
      completed: "Tamamlanan",
      upcoming: "Yaklaşan",
      high: "Yüksek Öncelik",
      deadlines: "Yaklaşan Deadline'lar",
      focus: "Bugünün Odağı",
      empty: "Henüz görev yok.",
    };

    const en = {
      dashboard: "Dashboard",
      subtitle: "Clarify your priorities and plan your day.",
      search: "Search tasks...",
      newTask: "New Task",
      completed: "Completed",
      upcoming: "Upcoming",
      high: "High Priority",
      deadlines: "Next Deadlines",
      focus: "Today’s Focus",
      empty: "No tasks yet.",
    };

    return (lang as Lang) === "tr" ? tr : en;
  }, [lang]);

  const tasks = useMemo(() => {
    const raw = (user as any)?.tasks;
    return Array.isArray(raw) ? raw : [];
  }, [user]);

  const filtered = useMemo(() => {
    if (!search) return tasks;
    return tasks.filter((t: any) =>
      String(t?.title || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [tasks, search]);

  const stats = useMemo(() => {
    let done = 0;
    let high = 0;
    let upcoming = 0;

    for (const t of tasks as any[]) {
      if (t?.status === "done") done++;
      if (t?.priority === "high") high++;
      if (t?.dueAt && new Date(t.dueAt).getTime() > Date.now()) upcoming++;
    }

    return { done, high, upcoming };
  }, [tasks]);

  if (!initialized) return null;
  if (!user) return null;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <WorkspaceSidebar />

          <section className="space-y-6">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {copy.dashboard}
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                  {copy.subtitle}
                </p>
              </div>

              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={copy.search}
                    className="h-11 w-64 rounded-2xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none
                               dark:border-white/10 dark:bg-slate-900/50 dark:text-white"
                  />
                </div>

                <button className="h-11 rounded-2xl bg-linear-to-br from-sky-500 to-indigo-600 px-4 text-sm font-bold text-white">
                  <Plus className="inline h-4 w-4 mr-1" />
                  {copy.newTask}
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <KPI icon={<CheckCircle2 />} label={copy.completed} value={stats.done} />
              <KPI icon={<Clock />} label={copy.upcoming} value={stats.upcoming} />
              <KPI icon={<Flame />} label={copy.high} value={stats.high} />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">

              <Card title={copy.deadlines} icon={<CalendarDays />}>
                {filtered.length === 0 ? (
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {copy.empty}
                  </div>
                ) : (
                  filtered.slice(0, 5).map((t: any) => (
                    <div
                      key={t._id}
                      className="rounded-2xl border border-slate-200 bg-white p-3 mb-3
                                 dark:border-white/10 dark:bg-slate-900/50"
                    >
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {t.title}
                      </div>
                      {t.dueAt && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {formatDateSmart(t.dueAt, lang as Lang)}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </Card>
              <Card title={copy.focus} icon={<Target />}>
                <div className="rounded-2xl bg-linear-to-br from-sky-50 to-white p-4
                                dark:from-slate-900 dark:to-slate-950">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-sky-600" />
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {tasks[0]?.title || (lang === "tr" ? "Bugün için hedef seç." : "Pick a goal.")}
                    </div>
                  </div>

                  <button className="mt-4 w-full rounded-2xl bg-linear-to-br from-sky-500 to-indigo-600 py-2 text-white font-bold">
                    {lang === "tr" ? "Focus Başlat" : "Start Focus"}
                  </button>
                </div>
              </Card>
            </div>

          </section>
        </div>
      </div>
    </main>
  );
}

function Card({ title, icon, children }: any) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm
                    dark:border-white/10 dark:bg-slate-900/40">
      <div className="flex items-center gap-2 mb-4 font-bold text-slate-900 dark:text-white">
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}

function KPI({ icon, label, value }: any) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm
                    dark:border-white/10 dark:bg-slate-900/40">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase text-slate-500">{label}</div>
        {icon}
      </div>
      <div className="text-3xl font-extrabold mt-3 text-slate-900 dark:text-white">
        {value}
      </div>
    </div>
  );
}
