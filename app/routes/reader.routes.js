const express = require("express");
const router = express.Router();
const controller = require("../controllers/reader.controller");

// Định nghĩa các route cho CRUD
router.get("/", controller.getAll); // Lấy danh sách tất cả độc giả
// get and update current reader (by token)
router.get("/me", controller.getMe);
router.put("/me", controller.updateMe);
router.get("/:id", controller.getOne); // Lấy thông tin độc giả theo ID
router.post("/", controller.create); // Thêm mới độc giả
router.put("/:id", controller.update); // Cập nhật thông tin độc giả
router.delete("/:id", controller.delete); // Xóa độc giả

module.exports = router;
