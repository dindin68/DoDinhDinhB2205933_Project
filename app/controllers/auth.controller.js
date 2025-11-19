const MongoDB = require("../utils/mongodb.util");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  let client;
  try {
    // Accept multiple possible field names to be forgiving with front-end payloads
    const { phone, password } = req.body;
    const altPhone =
      req.body.SoDienThoai || req.body.DienThoai || req.body.username;
    const altPassword =
      req.body.Password || req.body.PasswordText || req.body.pass;
    const finalPhone = phone || altPhone;
    const finalPassword = password || altPassword;

    if (!finalPhone || !finalPassword) {
      return res
        .status(400)
        .json({ message: "Thiếu số điện thoại hoặc mật khẩu" });
    }

    client = await MongoDB.connect(process.env.MONGO_URI);
    const db = client.db("library_db");

    // Find employee by phone or MSNV
    const employee = await db.collection("NhanVien").findOne({
      $or: [{ SoDienThoai: finalPhone }, { MSNV: finalPhone }],
    });

    if (!employee) {
      return res.status(400).json({ message: "Tài khoản không tồn tại" });
    }

    const stored = employee.Password || "";
    let isMatch = false;

    if (stored) {
      try {
        isMatch = await bcrypt.compare(finalPassword, stored);
      } catch (e) {
        isMatch = false;
      }
    }

    // If stored password is plaintext, allow login and migrate to hash
    if (!isMatch && stored && finalPassword === stored) {
      isMatch = true;
      try {
        const newHash = await bcrypt.hash(finalPassword, 10);
        await db
          .collection("NhanVien")
          .updateOne({ _id: employee._id }, { $set: { Password: newHash } });
      } catch (e) {
        console.error("Failed to migrate plaintext password:", e.message);
      }
    }

    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu không đúng" });
    }

    const payload = { msnv: employee.MSNV || null };
    const secret = process.env.JWT_SECRET || "change-this-secret";
    const token = jwt.sign(payload, secret, { expiresIn: "8h" });

    const { Password: pw, ...safeEmployee } = employee;

    res.json({
      message: "Đăng nhập thành công",
      token,
      employee: safeEmployee,
    });
  } catch (err) {
    console.error("Auth login error:", err);
    res.status(500).json({ message: "Lỗi server: " + err.message });
  } finally {
    if (client) {
      try {
        await client.close();
      } catch (e) {
        // ignore
      }
    }
  }
};
