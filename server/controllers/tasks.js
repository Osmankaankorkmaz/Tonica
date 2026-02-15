const mongoose = require("mongoose");
const User = require("../models/user");
const ApiError = require("../error/ApiError.js");

/* ===========================
   Helpers
=========================== */

function normalizeTags(input) {
  if (!input) return [];
  if (typeof input === "string") {
    return input
      .split(",")
      .map((x) => x.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 20)
      .map((x) => x.slice(0, 24));
  }
  if (Array.isArray(input)) {
    return input
      .map((x) => String(x).trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 20)
      .map((x) => x.slice(0, 24));
  }
  return [];
}

function parseDueAt(dueAt) {
  if (dueAt === null) return null;
  if (typeof dueAt === "string" && dueAt.trim()) {
    const d = new Date(dueAt);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return undefined;
}

function parseDurationMinutes(body) {
  // Frontend: duration (string/number) gönderebilir
  const raw = body?.durationMinutes ?? body?.duration;
  if (raw === undefined || raw === null || raw === "") return undefined;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return undefined;
  return Math.min(Math.floor(n), 24 * 60);
}

function validateEnums({ status, priority }) {
  const okStatus = ["todo", "in_progress", "done"];
  const okPriority = ["low", "medium", "high"];

  if (status && !okStatus.includes(status)) {
    throw new ApiError("Geçersiz status", 400);
  }
  if (priority && !okPriority.includes(priority)) {
    throw new ApiError("Geçersiz priority", 400);
  }
}

function pickTaskPatch(body) {
  const patch = {};

  if (typeof body?.title === "string") patch.title = body.title.trim();
  if (typeof body?.description === "string") patch.description = body.description.trim();

  if (typeof body?.category === "string") patch.category = body.category.trim();

  if (typeof body?.status === "string") patch.status = body.status;

  if (typeof body?.priority === "string") {
    // UI "urgent" gönderebilir -> high map
    patch.priority = body.priority === "urgent" ? "high" : body.priority;
  }

  const dueParsed = parseDueAt(body?.dueAt);
  if (dueParsed !== undefined) patch.dueAt = dueParsed;

  const dm = parseDurationMinutes(body);
  if (dm !== undefined) patch.durationMinutes = dm;

  if (body?.tags !== undefined) patch.tags = normalizeTags(body.tags);

  // empty string'leri normalize et
  if (patch.title === "") delete patch.title;
  if (patch.category === "") delete patch.category;

  return patch;
}

/* ===========================
   LIST TASKS
   GET /tasks/list
=========================== */
exports.listTasks = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ ok: false, message: "Unauthorized" });

    const user = await User.findById(userId).select("tasks").lean();
    if (!user) return res.status(404).json({ ok: false, message: "User not found" });

    return res.json({ ok: true, tasks: user.tasks || [] });
  } catch (err) {
    console.error("LIST TASKS ERROR:", err);
    return res.status(500).json({ ok: false, message: "Sunucu hatası" });
  }
};

/* ===========================
   CREATE TASK
   POST /tasks/create
   body: {
     title, description?,
     status?, priority?, category?,
     dueAt?, durationMinutes? OR duration?,
     tags? (string or string[])
   }
=========================== */
exports.createTask = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ ok: false, message: "Unauthorized" });

    const { title, status, priority, category, dueAt, description, tags } = req.body || {};

    const t = String(title || "").trim();
    if (!t) return res.status(400).json({ ok: false, message: "Title zorunlu" });
    if (t.length > 140) return res.status(400).json({ ok: false, message: "Title çok uzun" });

    const pr = typeof priority === "string" && priority === "urgent" ? "high" : priority;
    validateEnums({ status, priority: pr });

    const task = {
      title: t,
      description: typeof description === "string" ? description.trim() : "",
      status: status || "todo",
      priority: pr || "medium",
      category: typeof category === "string" && category.trim() ? category.trim() : "General",
      dueAt: null,
      durationMinutes: 0,
      tags: normalizeTags(tags),
    };

    const dueParsed = parseDueAt(dueAt);
    if (dueParsed !== undefined) task.dueAt = dueParsed;

    const dm = parseDurationMinutes(req.body);
    if (dm !== undefined) task.durationMinutes = dm;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ ok: false, message: "User not found" });

    user.tasks.push(task);
    await user.save();

    const created = user.tasks[user.tasks.length - 1];
    return res.status(201).json({ ok: true, task: created });
  } catch (err) {
    console.error("CREATE TASK ERROR:", err);
    const code = err?.statusCode || err?.status || 500;
    if (code !== 500) return res.status(code).json({ ok: false, message: err.message });
    return res.status(500).json({ ok: false, message: "Sunucu hatası" });
  }
};

/* ===========================
   UPDATE TASK
   POST /tasks/update
   body: { taskId, ...patchFields }
=========================== */
exports.updateTask = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { taskId } = req.body || {};

    if (!userId) return res.status(401).json({ ok: false, message: "Unauthorized" });
    if (!mongoose.isValidObjectId(taskId)) {
      return res.status(400).json({ ok: false, message: "Geçersiz taskId" });
    }

    const patch = pickTaskPatch(req.body);

    // title varsa tekrar validate et
    if (patch.title && patch.title.length > 140) {
      return res.status(400).json({ ok: false, message: "Title çok uzun" });
    }

    validateEnums({ status: patch.status, priority: patch.priority });

    if (Object.keys(patch).length === 0) {
      return res.status(400).json({ ok: false, message: "Güncellenecek alan yok" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ ok: false, message: "User not found" });

    const task = user.tasks.id(taskId);
    if (!task) return res.status(404).json({ ok: false, message: "Task not found" });

    Object.assign(task, patch);
    await user.save();

    return res.json({ ok: true, task });
  } catch (err) {
    console.error("UPDATE TASK ERROR:", err);
    const code = err?.statusCode || err?.status || 500;
    if (code !== 500) return res.status(code).json({ ok: false, message: err.message });
    return res.status(500).json({ ok: false, message: "Sunucu hatası" });
  }
};

/* ===========================
   DELETE TASK
   POST /tasks/delete
   body: { taskId }
=========================== */
exports.deleteTask = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { taskId } = req.body || {};

    if (!userId) return res.status(401).json({ ok: false, message: "Unauthorized" });
    if (!mongoose.isValidObjectId(taskId)) {
      return res.status(400).json({ ok: false, message: "Geçersiz taskId" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ ok: false, message: "User not found" });

    const task = user.tasks.id(taskId);
    if (!task) return res.status(404).json({ ok: false, message: "Task not found" });

    task.deleteOne();
    await user.save();

    return res.json({ ok: true, message: "Task silindi" });
  } catch (err) {
    console.error("DELETE TASK ERROR:", err);
    return res.status(500).json({ ok: false, message: "Sunucu hatası" });
  }
};
