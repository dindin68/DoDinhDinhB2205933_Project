const express = require("express");
const router = express.Router();
const borrowingController = require("../controllers/borrowing.controller");

router.get("/", borrowingController.getAll);
// Route mới: Kiểm tra và cập nhật trạng thái tự động
router.get("/check-overdue", borrowingController.checkOverdueStatus);
router.get("/:id", borrowingController.getOne);
router.post("/", borrowingController.create);
// Route mới: Cập nhật trạng thái theo quy trình
router.put("/:maMuon/trangthai", borrowingController.updateStatus);
router.put("/:id", borrowingController.update);
router.delete("/:id", borrowingController.delete);

module.exports = router;
