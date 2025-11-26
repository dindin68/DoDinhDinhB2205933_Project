const express = require("express");
const router = express.Router();
const controller = require("../controllers/book.controller");
const multer = require("multer");
const upload = multer({ dest: "public/uploads/" });

router.get("/", controller.getAll);
router.get("/:id", controller.getOne);
// accept multipart/form-data with field name 'image'
router.post("/", upload.single("image"), controller.create);
router.put("/:id", upload.single("image"), controller.update);
router.delete("/:id", controller.delete);

module.exports = router;
