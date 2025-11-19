require("dotenv").config();
const express = require("express");
const cors = require("cors");
const ApiError = require("./app/api-error");
const MongoDB = require("./app/utils/mongodb.util");

const app = express();
app.use(cors());
app.use(express.json());

const readerRoutes = require("./app/routes/reader.routes");
const employeeRoutes = require("./app/routes/employee.routes");
const bookRoutes = require("./app/routes/book.routes");
const publisherRoutes = require("./app/routes/publisher.routes");
const borrowingRoutes = require("./app/routes/borrowing.routes");
const authRoutes = require("./app/routes/auth.routes");

app.use("/api/readers", readerRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/publishers", publisherRoutes);
app.use("/api/borrowings", borrowingRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to QUAN LY MUON SACH" });
});

//handle 404 response
app.use((req, res, next) => {
  //Code ở đây sẽ chạy khi không có route được định nghĩa nào khớp với yêu cầu
  //khớp với yêu cầu. Gọi next() để chuyển đến middleware xử lý lỗi
  return next(new ApiError(404, "Resource not found"));
});

app.use((err, req, res, next) => {
  //Middleware xử lý  lỗi tập trung
  //Trong các đoạn code xử lý ở các route, khi gọi next(err) sẽ chuyển về middleware xử lý lỗi này
  return res.status(err.statusCode || 500).json({
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;
