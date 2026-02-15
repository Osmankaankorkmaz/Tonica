const mongoose = require("mongoose");
const User = require("../models/user");
const ApiError = require("../error/ApiError.js");


function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

/* ===========================
   START SESSION
   POST /focus/sessions/start
   body: { durationSeconds, taskId? }
=========================== */
exports.startSession = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ ok: false, message: "Unauthorized" });

    const { durationSeconds, taskId } = req.body || {};
    const dur = Number(durationSeconds);

    if (!Number.isFinite(dur) || dur < 60 || dur > 24 * 60 * 60) {
      return res.status(400).json({ ok: false, message: "Geçersiz durationSeconds" });
    }

    let tid = null;
    if (taskId) {
      if (!mongoose.isValidObjectId(taskId)) {
        return res.status(400).json({ ok: false, message: "Geçersiz taskId" });
      }
      tid = new mongoose.Types.ObjectId(taskId);
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ ok: false, message: "User not found" });

    if (tid) {
      const t = user.tasks.id(taskId);
      if (!t) return res.status(404).json({ ok: false, message: "Task not found" });
    }

    user.focusSessions.push({
      taskId: tid,
      durationSeconds: dur,
      startedAt: new Date(),
      endedAt: null,
      completed: false,
      pausedSeconds: 0,
    });

    await user.save();
    const session = user.focusSessions[user.focusSessions.length - 1];

    return res.status(201).json({ ok: true, session });
  } catch (err) {
    console.error("FOCUS START ERROR:", err);
    const code = err?.statusCode || err?.status || 500;
    if (code !== 500) return res.status(code).json({ ok: false, message: err.message });
    return res.status(500).json({ ok: false, message: "Sunucu hatası" });
  }
};

/* ===========================
   FINISH SESSION (COMPLETE)
   POST /focus/sessions/:sessionId/finish
=========================== */
exports.finishSession = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { sessionId } = req.params || {};
    if (!userId) return res.status(401).json({ ok: false, message: "Unauthorized" });
    if (!mongoose.isValidObjectId(sessionId)) {
      return res.status(400).json({ ok: false, message: "Geçersiz sessionId" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ ok: false, message: "User not found" });

    const session = user.focusSessions.id(sessionId);
    if (!session) return res.status(404).json({ ok: false, message: "Session not found" });

    if (!session.endedAt) session.endedAt = new Date();
    session.completed = true;

    await user.save();
    return res.json({ ok: true, session });
  } catch (err) {
    console.error("FOCUS FINISH ERROR:", err);
    return res.status(500).json({ ok: false, message: "Sunucu hatası" });
  }
};

/* ===========================
   CANCEL SESSION (NOT COMPLETE)
   POST /focus/sessions/:sessionId/cancel
=========================== */
exports.cancelSession = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { sessionId } = req.params || {};
    if (!userId) return res.status(401).json({ ok: false, message: "Unauthorized" });
    if (!mongoose.isValidObjectId(sessionId)) {
      return res.status(400).json({ ok: false, message: "Geçersiz sessionId" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ ok: false, message: "User not found" });

    const session = user.focusSessions.id(sessionId);
    if (!session) return res.status(404).json({ ok: false, message: "Session not found" });

    if (!session.endedAt) session.endedAt = new Date();
    session.completed = false;

    await user.save();
    return res.json({ ok: true, session });
  } catch (err) {
    console.error("FOCUS CANCEL ERROR:", err);
    return res.status(500).json({ ok: false, message: "Sunucu hatası" });
  }
};

/* ===========================
   TODAY MINUTES
   GET /focus/today
   response: { minutes }
=========================== */
exports.today = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ ok: false, message: "Unauthorized" });

    const user = await User.findById(userId).select("focusSessions").lean();
    if (!user) return res.status(404).json({ ok: false, message: "User not found" });

    const s = startOfDay(new Date());
    const e = endOfDay(new Date());

    const sessions = Array.isArray(user.focusSessions) ? user.focusSessions : [];
    const totalSeconds = sessions
      .filter((x) => x?.completed && x?.startedAt)
      .filter((x) => {
        const ts = new Date(x.startedAt).getTime();
        return ts >= s.getTime() && ts <= e.getTime();
      })
      .reduce((sum, x) => sum + (Number(x.durationSeconds) || 0), 0);

    const minutes = Math.round(totalSeconds / 60);

    return res.json({ ok: true, minutes });
  } catch (err) {
    console.error("FOCUS TODAY ERROR:", err);
    return res.status(500).json({ ok: false, message: "Sunucu hatası" });
  }
};
