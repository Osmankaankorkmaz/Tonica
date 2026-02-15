
const router = require("express").Router();
const { chat } = require("../controllers/ai");


router.post("/chat", chat);

module.exports = router;
