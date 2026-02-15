"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Target,
  Clock,
  CheckCircle2,
  Loader2,
  Brain,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import WorkspaceSidebar from "@/components/workspace/WorkspaceSidebar";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { Lang } from "@/lib/i18n";

import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { meThunk, selectAuthInitialized, selectAuthUser } from "@/lib/store/authSlice";

import { listTasksThunk, selectTasks } from "@/lib/store/taskSlice";

import {
  startFocusThunk,
  finishFocusThunk,
  cancelFocusThunk,
  focusTodayThunk,
  clearFocusError,
  selectActiveFocusSession,
  selectFocusError,
  selectFocusLoading,
  selectFocusTodayMinutes,
} from "@/lib/store/focusSlice";

function cn(...c: Array<string | false | undefined | null>) {
  return c.filter(Boolean).join(" ");
}


function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(sec % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}


export default function FocusPage() {
  const dispatch = useAppDispatch();
  const { lang } = useLocale();

  const initialized = useAppSelector(selectAuthInitialized);
  const user = useAppSelector(selectAuthUser);

  const tasks = useAppSelector(selectTasks);

  const apiLoading = useAppSelector(selectFocusLoading);
  const apiError = useAppSelector(selectFocusError);
  const todayMinutes = useAppSelector(selectFocusTodayMinutes);
  const activeSession = useAppSelector(selectActiveFocusSession);

  const copy = useMemo(() => {
    const tr = {
      badge: "Tonica Focus",
      title: "Odak Modu",
      subtitle: "Tek bir şeye odaklan. Başlat, akışa gir, bitir.",
      selectTask: "Görev Seç (Opsiyonel)",
      noTask: "Görevsiz Odak",
      presets: "Hızlı Süreler",
      custom: "Özel Süre",
      minShort: "dk",
      start: "Başlat",
      pause: "Duraklat",
      resume: "Devam Et",
      reset: "Sıfırla",
      cancel: "İptal Et",
      done: "Oturum Tamamlandı",
      status: {
        idle: "Hazır",
        running: "Çalışıyor",
        paused: "Duraklatıldı",
        completed: "Bitti",
      },
      today: "Bugünkü Odak",
      minutes: "dakika",
      activeTask: "Aktif Görev",
      session: "Oturum",
      duration: "Süre",
      left: "Kalan",
      refresh: "Yenile",
      tipTitle: "Mini İpucu",
      tipText: "Telefonu sessize al, bildirimleri kapat, tek hedefe odaklan.",
      errors: {
        invalidCustom: "1–240 dakika arası gir.",
        generic: "İşlem başarısız.",
      },
    };

    const en = {
      badge: "Tonica Focus",
      title: "Focus Mode",
      subtitle: "Focus on one thing. Start, flow, finish.",
      selectTask: "Select Task (Optional)",
      noTask: "Focus Without Task",
      presets: "Quick Presets",
      custom: "Custom Time",
      minShort: "min",
      start: "Start",
      pause: "Pause",
      resume: "Resume",
      reset: "Reset",
      cancel: "Cancel",
      done: "Session Completed",
      status: {
        idle: "Ready",
        running: "Running",
        paused: "Paused",
        completed: "Completed",
      },
      today: "Today's Focus",
      minutes: "minutes",
      activeTask: "Active Task",
      session: "Session",
      duration: "Duration",
      left: "Left",
      refresh: "Refresh",
      tipTitle: "Quick Tip",
      tipText: "Silence your phone, mute notifications, focus on one outcome.",
      errors: {
        invalidCustom: "Enter between 1–240 minutes.",
        generic: "Operation failed.",
      },
    };

    return (lang as Lang) === "tr" ? tr : en;
  }, [lang]);


  useEffect(() => {
    if (!initialized) dispatch(meThunk());
  }, [initialized, dispatch]);

  useEffect(() => {
    if (!initialized) return;
    if (!user) window.location.href = "/login";
  }, [initialized, user]);

  useEffect(() => {
    if (!initialized || !user) return;
    dispatch(listTasksThunk());
    dispatch(focusTodayThunk());
  }, [initialized, user?._id, dispatch]);

  useEffect(() => {
    dispatch(clearFocusError());
  }, [dispatch]);


  const [minutes, setMinutes] = useState<number>(25);

  const [runDuration, setRunDuration] = useState<number>(25 * 60);
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);

  const [running, setRunning] = useState<boolean>(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const hasBackendActive = !!activeSession && !activeSession.endedAt;
  const canCancel = hasBackendActive; 

  useEffect(() => {
    if (!running) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [running]);

  useEffect(() => {
    if (timeLeft !== 0) return;

    setRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;

    if (activeSession?._id) {
      dispatch(finishFocusThunk({ sessionId: activeSession._id })).then(() => {
        dispatch(focusTodayThunk());
      });
    } else {
      dispatch(focusTodayThunk());
    }
  }, [timeLeft, activeSession?._id, dispatch]);

  const progress = useMemo(() => {
    const total = runDuration || 1;
    return clamp(((total - timeLeft) / total) * 100, 0, 100);
  }, [runDuration, timeLeft]);

  const statusLabel = useMemo(() => {
    if (timeLeft === 0) return copy.status.completed;
    if (running) return copy.status.running;
    if (hasBackendActive && !running && timeLeft !== runDuration) return copy.status.paused;
    return copy.status.idle;
  }, [copy, running, timeLeft, runDuration, hasBackendActive]);


  async function start() {
    setLocalError(null);
    dispatch(clearFocusError());

    const m = Number(minutes);
    if (!Number.isFinite(m) || m < 1 || m > 240) {
      setLocalError(copy.errors.invalidCustom);
      return;
    }

    const dur = m * 60;
    if (running) return;

    const r = await dispatch(
      startFocusThunk({
        durationSeconds: dur,
        taskId: selectedTaskId || null,
      })
    );

    if (startFocusThunk.fulfilled.match(r)) {
      setRunDuration(dur);
      setTimeLeft(dur);
      setRunning(true);
      dispatch(focusTodayThunk());
      return;
    }

    setLocalError(copy.errors.generic);
  }

  function pause() {
    setRunning(false);
  }

  function resume() {
    if (timeLeft <= 0) return;
    setRunning(true);
  }

  function resetLocal() {
    setRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setTimeLeft(runDuration);
  }

  async function cancelSession() {
    setRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;

    if (activeSession?._id) {
      const r = await dispatch(cancelFocusThunk({ sessionId: activeSession._id }));
      if (cancelFocusThunk.fulfilled.match(r)) {
        dispatch(focusTodayThunk());
      } else {
        setLocalError(copy.errors.generic);
      }
    }

    setTimeLeft(runDuration);
  }

  async function refresh() {
    dispatch(clearFocusError());
    await dispatch(focusTodayThunk());
  }


  if (!initialized || !user) return null;

  const activeTaskTitle =
    selectedTaskId && Array.isArray(tasks)
      ? tasks.find((t: any) => String(t._id) === String(selectedTaskId))?.title
      : null;

  const statusPillClass =
    timeLeft === 0
      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-200"
      : running
      ? "bg-sky-500/10 text-sky-700 dark:text-sky-200"
      : "bg-amber-500/10 text-amber-700 dark:text-amber-200";

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <WorkspaceSidebar />

          <section className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-[11px] font-extrabold text-slate-600 backdrop-blur dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  {copy.badge}
                </div>

                <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {copy.title}
                </h1>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{copy.subtitle}</p>
              </div>

              <div className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-extrabold", statusPillClass)}>
                {timeLeft === 0 ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                {statusLabel}
              </div>
            </div>

            {(localError || apiError) && (
              <div
                className={cn(
                  "rounded-3xl border p-4 text-sm font-semibold",
                  "border-rose-200 bg-rose-50 text-rose-700",
                  "dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200"
                )}
              >
                {localError || apiError}
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-[1.35fr_.65fr]">
              <div
                className={cn(
                  "rounded-3xl border shadow-xl backdrop-blur-xl overflow-hidden",
                  "border-slate-200 bg-white/80",
                  "dark:border-white/10 dark:bg-slate-900/40"
                )}
              >
                <div className="h-1.5 bg-linear-to-r from-sky-500 via-indigo-600 to-purple-600" />

                <div className="p-8 sm:p-10">
                  <div className="text-center">
                    <div className="text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                      {formatTime(timeLeft)}
                    </div>

                    <div className="mt-5">
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                        <div
                          className="h-full rounded-full bg-linear-to-r from-sky-500 to-indigo-600 transition-[width]"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {Math.round(progress)}%
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 max-w-xl mx-auto">
                    <label className="text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {copy.selectTask}
                    </label>

                    <select
                      value={selectedTaskId || ""}
                      onChange={(e) => setSelectedTaskId(e.target.value || null)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800
                                 dark:border-white/10 dark:bg-slate-800 dark:text-white"
                      disabled={running || apiLoading}
                    >
                      <option value="">{copy.noTask}</option>
                      {(tasks || []).map((t: any) => (
                        <option key={t._id} value={t._id}>
                          {t.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-white/10 dark:bg-slate-950/20">
                      <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        {copy.presets}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <PresetButton active={minutes === 25} onClick={() => setMinutes(25)} disabled={running || apiLoading} label="25" />
                        <PresetButton active={minutes === 45} onClick={() => setMinutes(45)} disabled={running || apiLoading} label="45" />
                        <PresetButton active={minutes === 50} onClick={() => setMinutes(50)} disabled={running || apiLoading} label="50" />
                        <PresetButton active={minutes === 90} onClick={() => setMinutes(90)} disabled={running || apiLoading} label="90" />
                        <PresetButton active={minutes === 120} onClick={() => setMinutes(120)} disabled={running || apiLoading} label="120" />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-white/10 dark:bg-slate-950/20">
                      <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        {copy.custom} ({copy.minShort})
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          max={240}
                          value={minutes}
                          onChange={(e) => setMinutes(clamp(Number(e.target.value || 0), 1, 240))}
                          disabled={running || apiLoading}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-800
                                     dark:border-white/10 dark:bg-slate-900/40 dark:text-white"
                        />
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{copy.minShort}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-4">
                    <button
                      onClick={resetLocal}
                      disabled={apiLoading}
                      className={cn(
                        "inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-extrabold transition",
                        "border border-slate-200 bg-white/70 text-slate-800 hover:bg-white",
                        "dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-200 dark:hover:bg-slate-900/60",
                        apiLoading && "opacity-70 cursor-not-allowed"
                      )}
                    >
                      <RotateCcw className="h-4 w-4" />
                      {copy.reset}
                    </button>

                    {!running ? (
                      timeLeft === 0 ? (
                        <button
                          onClick={() => {
                            setTimeLeft(runDuration);
                            setMinutes(Math.round(runDuration / 60));
                          }}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg hover:opacity-95"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          {copy.done}
                        </button>
                      ) : (
                        <button
                          onClick={hasBackendActive ? resume : start}
                          disabled={apiLoading}
                          className={cn(
                            "inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-extrabold text-white shadow-lg hover:opacity-95",
                            "bg-linear-to-r from-sky-500 to-indigo-600",
                            apiLoading && "opacity-70 cursor-not-allowed"
                          )}
                        >
                          {apiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                          {hasBackendActive ? copy.resume : copy.start}
                        </button>
                      )
                    ) : (
                      <button
                        onClick={pause}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-6 py-3 text-sm font-extrabold text-white shadow-lg hover:opacity-95"
                      >
                        <Pause className="h-4 w-4" />
                        {copy.pause}
                      </button>
                    )}

                    <button
                      onClick={cancelSession}
                      disabled={apiLoading || !canCancel}
                      className={cn(
                        "inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-extrabold transition",
                        "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
                        "dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200 dark:hover:bg-rose-500/20",
                        (apiLoading || !canCancel) && "opacity-70 cursor-not-allowed"
                      )}
                    >
                      {apiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      {copy.cancel}
                    </button>
                  </div>
                </div>

                <div className="border-t border-slate-200 px-8 py-5 dark:border-white/10">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-sky-600 dark:text-sky-400">
                      <Brain className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        {copy.tipTitle}
                      </div>
                      <div className="mt-1 text-sm text-slate-700 dark:text-slate-200">{copy.tipText}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <StatCard
                  icon={<Clock className="h-5 w-5" />}
                  label={copy.today}
                  value={`${todayMinutes} ${copy.minutes}`}
                />

                <StatCard
                  icon={<Target className="h-5 w-5" />}
                  label={copy.activeTask}
                  value={activeTaskTitle || copy.noTask}
                  subtle
                />

                <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 dark:border-white/10 dark:bg-slate-900/40">
                  <div className="text-sm font-extrabold text-slate-900 dark:text-white">{copy.session}</div>

                  <div className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
                    <Row label={copy.duration} value={`${Math.round(runDuration / 60)} ${copy.minShort}`} />
                    <Row label={copy.left} value={formatTime(timeLeft)} />
                  </div>

                  <button
                    onClick={refresh}
                    disabled={apiLoading}
                    className={cn(
                      "mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/70 px-4 py-2 text-sm font-extrabold text-slate-800 hover:bg-white",
                      "dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-200 dark:hover:bg-slate-900/60",
                      apiLoading && "opacity-70 cursor-not-allowed"
                    )}
                  >
                    {apiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    {copy.refresh}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function PresetButton({
  label,
  active,
  onClick,
  disabled,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-full px-3 py-1.5 text-xs font-extrabold transition",
        active
          ? "bg-linear-to-r from-sky-500 to-indigo-600 text-white shadow-sm"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15",
        disabled && "opacity-70 cursor-not-allowed"
      )}
    >
      {label}
    </button>
  );
}

function StatCard({
  icon,
  label,
  value,
  subtle,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtle?: boolean;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/40">
      <div className="flex items-center gap-2 text-sm font-extrabold text-slate-600 dark:text-slate-300">
        {icon}
        {label}
      </div>

      <div className={cn("mt-3 text-2xl font-extrabold", subtle ? "text-slate-900 dark:text-white" : "text-slate-900 dark:text-white")}>
        {value}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className="font-extrabold">{value}</span>
    </div>
  );
}
