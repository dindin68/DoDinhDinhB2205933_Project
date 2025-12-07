const MongoDB = require("../utils/mongodb.util");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  let client;
  try {
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

exports.readerLogin = async (req, res) => {
  let client;
  try {
    const { DIENTHOAI, MADOCGIA, PASSWORD } = req.body;
    const finalPhone = DIENTHOAI || req.body.SoDienThoai || MADOCGIA;
    const finalPassword = PASSWORD || req.body.pass;

    if (!finalPhone || !finalPassword) {
      return res
        .status(400)
        .json({ message: "Thiếu số điện thoại/mã độc giả hoặc mật khẩu" });
    }

    client = await MongoDB.connect(process.env.MONGO_URI);
    const db = client.db("library_db");

    // Tìm độc giả
    const reader = await db.collection("DOCGIA").findOne({
      $or: [{ DIENTHOAI: finalPhone }, { MADOCGIA: finalPhone }],
    });

    if (!reader) {
      return res
        .status(400)
        .json({ message: "Tài khoản độc giả không tồn tại" });
    }

    const stored = reader.PASSWORD || "";
    let isMatch = false;

    if (stored) {
      try {
        isMatch = await bcrypt.compare(finalPassword, stored);
      } catch (e) {
        isMatch = false;
      }
    }

    if (!isMatch && stored && finalPassword === stored) {
      isMatch = true;
      try {
        const newHash = await bcrypt.hash(finalPassword, 10);
        await db
          .collection("DOCGIA")
          .updateOne({ _id: reader._id }, { $set: { PASSWORD: newHash } });
      } catch (e) {
        console.error(
          "Failed to migrate reader plaintext password:",
          e.message
        );
      }
    }

    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu không đúng" });
    }

    const payload = { role: "reader", id: reader.MADOCGIA };
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || "change-this-secret",
      { expiresIn: "7d" }
    );

    const { PASSWORD: pw, ...safeReader } = reader;
    res.json({ message: "Đăng nhập thành công", token, reader: safeReader });
  } catch (err) {
    console.error("Reader login error:", err);
    res.status(500).json({ message: "Lỗi server: " + err.message });
  } finally {
    if (client) {
      try {
        await client.close();
      } catch (e) {}
    }
  }
};
