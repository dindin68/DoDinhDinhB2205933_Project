const ApiError = require("../api-error");
const ContactService = require("../services/contact.service");
const MongoDB = require("../utils/mongodb.util");
const bcrypt = require("bcryptjs");

// LẤY TẤT CẢ NHÂN VIÊN
exports.getAll = async (req, res) => {
  try {
    const client = await MongoDB.connect(process.env.MONGO_URI);
    const db = client.db("library_db");
    const employees = await db.collection("NhanVien").find().toArray();
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LẤY 1 NHÂN VIÊN
exports.getOne = async (req, res) => {
  try {
    const client = await MongoDB.connect(process.env.MONGO_URI);
    const db = client.db("library_db");
    const employee = await db
      .collection("NhanVien")
      .findOne({ MSNV: req.params.id }); // SỬA TÊN TRƯỜNG

    if (!employee)
      return res.status(404).json({ message: "Employee not found" });

    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// TẠO NHÂN VIÊN
exports.create = async (req, res) => {
  try {
    const client = await MongoDB.connect(process.env.MONGO_URI);
    const db = client.db("library_db");

    const employeeData = { ...req.body };
    // generate MSNV if not provided
    const { getNextCode } = require("../utils/code.util");
    if (!employeeData.MSNV && !employeeData.MaNhanVien) {
      employeeData.MSNV = await getNextCode("NhanVien", "NV", 3);
    }
    // Password is required and should be hashed
    const plainPassword =
      employeeData.Password ||
      employeeData.MatKhau ||
      employeeData.PasswordPlain;
    if (!plainPassword) {
      return res.status(400).json({ message: "Thiếu mật khẩu (Password)" });
    }
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    employeeData.Password = hashedPassword;
    const result = await db.collection("NhanVien").insertOne(employeeData);

    const newEmployee = await db
      .collection("NhanVien")
      .findOne({ _id: result.insertedId });

    res.status(201).json(newEmployee);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// UPDATE
exports.update = async (req, res) => {
  try {
    const client = await MongoDB.connect(process.env.MONGO_URI);
    const db = client.db("library_db");

    const updateData = { ...req.body };
    if (updateData._id) delete updateData._id;

    const result = await db
      .collection("NhanVien")
      .updateOne({ MSNV: req.params.id }, { $set: updateData });

    if (result.matchedCount === 0)
      return res.status(404).json({ message: "Employee not found" });

    const updatedEmployee = await db
      .collection("NhanVien")
      .findOne({ MSNV: req.params.id });

    res.json(updatedEmployee);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// XÓA
exports.delete = async (req, res) => {
  try {
    const client = await MongoDB.connect(process.env.MONGO_URI);
    const db = client.db("library_db");

    const result = await db
      .collection("NhanVien")
      .deleteOne({ MSNV: req.params.id });

    if (result.deletedCount === 0)
      return res.status(404).json({ message: "Employee not found" });

    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { MSNV, Password } = req.body;

    if (!MSNV || !Password) {
      return res
        .status(400)
        .json({ message: "Thiếu mã nhân viên hoặc mật khẩu" });
    }

    const client = await MongoDB.connect(process.env.MONGO_URI);
    const db = client.db("library_db");

    const employee = await db.collection("NhanVien").findOne({ MSNV });

    if (!employee) {
      return res.status(400).json({ message: "Sai mã nhân viên" });
    }

    const isMatch = await bcrypt.compare(Password, employee.Password);

    if (!isMatch) {
      return res.status(400).json({ message: "Sai mật khẩu" });
    }

    res.json({
      message: "Đăng nhập thành công",
      employee,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
