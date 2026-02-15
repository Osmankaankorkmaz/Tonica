const express = require("express");

const {
  register,
  login,
  me,
  logout
} = require("../controllers/Auth.js");

const { authenticationMid } = require("../middleware/auth.js");

const router = express.Router();


router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticationMid, me);
router.get("/logout", authenticationMid, logout);

module.exports = router;
