const express = require("express");

const {
  startSession,
  finishSession,
  cancelSession,
  today,
} = require("../controllers/focus.js");

const { authenticationMid } = require("../middleware/auth.js");

const router = express.Router();

router.post("/focus/sessions/start", authenticationMid, startSession);
router.post("/focus/sessions/:sessionId/finish", authenticationMid, finishSession);
router.post("/focus/sessions/:sessionId/cancel", authenticationMid, cancelSession);
router.get("/focus/today", authenticationMid, today);

module.exports = router;
