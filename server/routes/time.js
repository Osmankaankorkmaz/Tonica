const express = require("express");

const {
  getBayramNamaziSaati,
  getTodaySunrise,
  getTodaySunset,
} = require("../controllers/time.js");

const router = express.Router();

// GET /api/time/bayram-namazi?il=16770
router.get("/bayram-namazi", getBayramNamaziSaati);
router.get("/gun-batimi", getTodaySunset);
router.get("/gun-dogumu", getTodaySunrise);

module.exports = router;
