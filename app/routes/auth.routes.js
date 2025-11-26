const express = require("express");
const router = express.Router();
const controller = require("../controllers/auth.controller");

router.post("/login", controller.login);
router.post("/reader-login", controller.readerLogin);

module.exports = router;
