const express = require("express");
const router = express.Router();
const controller = require("../controllers/employee.controller");

// Định nghĩa các route cho CRUD
router.get("/", controller.getAll); // Lấy danh sách tất cả nhân viên
router.get("/:id", controller.getOne); // Lấy thông tin nhân viên theo ID
router.post("/", controller.create); // Thêm mới nhân viên
router.put("/:id", controller.update); // Cập nhật thông tin nhân viên
router.delete("/:id", controller.delete); // Xóa nhân viên
router.post("/employees/login", controller.login);

module.exports = router;
