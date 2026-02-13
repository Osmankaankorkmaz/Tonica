"use client";

import { useMemo } from "react";

export type TaskLike = {
  _id: string;
  title: string;
  description?: string;
  status?: "todo" | "doing" | "done";
  priority?: "low" | "medium" | "high";
  tagIds?: string[];
  categoryId?: string;
  dueAt?: string | Date;
  archived?: boolean;
};

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-300">
      {children}
    </span>
  );
}

function Column({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/40">
      <div className="flex items-center justify-between">
        <div className="text-sm font-extrabold text-slate-900 dark:text-white">{title}</div>
        <Chip>{count}</Chip>
      </div>
      <div className="mt-3 grid gap-3">{children}</div>
    </div>
  );
}

export default function WorkspaceBoard({
  tasks,
  onSelectTask,
}: {
  tasks: TaskLike[];
  onSelectTask: (taskId: string) => void;
}) {
  const active = useMemo(
    () => (tasks || []).filter((t) => !t?.archived),
    [tasks]
  );

  const by = useMemo(() => {
    const todo = active.filter((t) => (t.status || "todo") === "todo");
    const doing = active.filter((t) => t.status === "doing");
    const done = active.filter((t) => t.status === "done");
    return { todo, doing, done };
  }, [active]);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Column title="Todo" count={by.todo.length}>
        {by.todo.map((t) => (
          <TaskCard key={t._id} task={t} onClick={() => onSelectTask(t._id)} />
        ))}
        {by.todo.length === 0 ? <EmptyHint /> : null}
      </Column>

      <Column title="Doing" count={by.doing.length}>
        {by.doing.map((t) => (
          <TaskCard key={t._id} task={t} onClick={() => onSelectTask(t._id)} />
        ))}
        {by.doing.length === 0 ? <EmptyHint /> : null}
      </Column>

      <Column title="Done" count={by.done.length}>
        {by.done.map((t) => (
          <TaskCard key={t._id} task={t} onClick={() => onSelectTask(t._id)} />
        ))}
        {by.done.length === 0 ? <EmptyHint /> : null}
      </Column>
    </div>
  );
}

function EmptyHint() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-4 text-sm text-slate-500 dark:border-white/10 dark:bg-slate-950/30 dark:text-slate-400">
      No tasks here yet.
    </div>
  );
}

function TaskCard({ task, onClick }: { task: TaskLike; onClick: () => void }) {
  const pr = task.priority || "medium";
  const prLabel = pr === "high" ? "High" : pr === "low" ? "Low" : "Medium";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group w-full rounded-3xl border p-4 text-left shadow-sm transition",
        "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md",
        "dark:border-white/10 dark:bg-slate-950/30 dark:hover:border-sky-500/30"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">
            {task.title}
          </div>
          {task.description ? (
            <div className="mt-1 line-clamp-2 text-xs text-slate-600 dark:text-slate-300">
              {task.description}
            </div>
          ) : null}
        </div>

        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold",
            pr === "high"
              ? "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200"
              : pr === "low"
              ? "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200"
              : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200"
          )}
        >
          {prLabel}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          {task.status || "todo"}
        </span>
        <span className="text-sm font-semibold text-blue-700 transition group-hover:translate-x-0.5 dark:text-sky-200">
          →
        </span>
      </div>
    </button>
  );
}
