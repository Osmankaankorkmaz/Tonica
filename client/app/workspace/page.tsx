"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { meThunk, selectAuthInitialized, selectAuthUser } from "@/lib/store/authSlice";

import WorkspaceSidebar from "@/components/workspace/WorkspaceSidebar";
import WorkspaceTopbar from "@/components/workspace/WorkspaceTopbar";
import WorkspaceBoard, { TaskLike } from "@/components/workspace/WorkspaceBoard";
import TaskSheet from "@/components/workspace/TaskSheet"
import Tonibot from "@/components/workspace/Tonibot"

export default function WorkspacePage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const initialized = useAppSelector(selectAuthInitialized);
  const user = useAppSelector(selectAuthUser);

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // init: me
  useEffect(() => {
    if (!initialized) dispatch(meThunk());
  }, [initialized, dispatch]);

  // guard
  useEffect(() => {
    if (!initialized) return;
    if (!user) router.replace("/login");
  }, [initialized, user, router]);

  const tasks = (user?.tasks || []) as TaskLike[];

  const selectedTask = useMemo(() => {
    if (!selectedTaskId) return null;
    return tasks.find((t) => String(t?._id) === String(selectedTaskId)) || null;
  }, [tasks, selectedTaskId]);

  function onSelectTask(taskId: string) {
    setSelectedTaskId(taskId);
    setSheetOpen(true);
  }

  if (!initialized) {
    return (
      <main className="min-h-[calc(100vh-72px)] bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="h-8 w-40 rounded-2xl bg-slate-100 dark:bg-white/10" />
          <div className="mt-6 grid gap-4 lg:grid-cols-[280px_1fr]">
            <div className="h-[680px] rounded-3xl bg-slate-100 dark:bg-white/10" />
            <div className="h-[680px] rounded-3xl bg-slate-100 dark:bg-white/10" />
          </div>
        </div>
      </main>
    );
  }

  // user yoksa zaten redirect olacak
  if (!user) return null;

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          {/* Sidebar */}
          <WorkspaceSidebar />

          {/* Main */}
          <section className="min-w-0">
            <WorkspaceTopbar />

            <div className="mt-4">
              <WorkspaceBoard tasks={tasks} onSelectTask={onSelectTask} />
            </div>
          </section>
        </div>
      </div>

      {/* Right Task Sheet */}
      <TaskSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        task={selectedTask}
      />

      {/* Bottom-left Tonibot */}
      <Tonibot model="gpt-4.1" />
    </main>
  );
}
