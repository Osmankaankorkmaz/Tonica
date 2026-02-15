const express = require("express");

const {
  createTask,
  deleteTask,
  listTasks,
  updateTask,
} = require("../controllers/tasks.js");

const { authenticationMid } = require("../middleware/auth.js");

const router = express.Router();

router.get("/tasks/list", authenticationMid, listTasks);
router.post("/tasks/create", authenticationMid, createTask);
router.post("/tasks/update", authenticationMid, updateTask);
router.post("/tasks/delete", authenticationMid, deleteTask);

module.exports = router;
