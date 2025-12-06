require("dotenv").config();
const express = require("express");
const cors = require("cors");
const ApiError = require("./app/api-error");
const MongoDB = require("./app/utils/mongodb.util");

const app = express();
app.use(cors());
app.use(express.json());
const path = require("path");

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

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

app.use((req, res, next) => {
  return next(new ApiError(404, "Resource not found"));
});

app.use((err, req, res, next) => {
  return res.status(err.statusCode || 500).json({
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;
