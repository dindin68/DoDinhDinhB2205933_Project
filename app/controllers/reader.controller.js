const MongoDB = require("../utils/mongodb.util");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");

exports.getAll = async (req, res) => {
  let client;
  try {
    client = await MongoDB.connect(process.env.MONGO_URI);
    const db = client.db("library_db");
    const readers = await db.collection("DOCGIA").find().toArray();
    res.json(readers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  } finally {
    if (client) await client.close();
  }
};

exports.getOne = async (req, res) => {
  let client;
  try {
    client = await MongoDB.connect(process.env.MONGO_URI);
    const db = client.db("library_db");

    const reader = await db
      .collection("DOCGIA")
      .findOne({ MADOCGIA: req.params.id });

    if (!reader) return res.status(404).json({ message: "Reader not found" });

    res.json(reader);
  } catch (err) {
    res.status(500).json({ message: err.message });
  } finally {
    if (client) await client.close();
  }
};

exports.create = async (req, res) => {
  let client;
  try {
    client = await MongoDB.connect(process.env.MONGO_URI);
    const db = client.db("library_db");

    const readerData = { ...req.body };

    const required = ["HOLOT", "TEN", "DIENTHOAI", "DIACHI", "PASSWORD"];
    const missing = required.filter(
      (f) => !readerData[f] || readerData[f].toString().trim() === ""
    );

    if (missing.length) {
      console.log("Thiếu trường:", missing);
      return res
        .status(400)
        .json({ message: `Thiếu trường: ${missing.join(", ")}` });
    }

    readerData.PASSWORD = await bcrypt.hash(readerData.PASSWORD, 10);

    const seqResult = await db
      .collection("SEQ")
      .findOneAndUpdate(
        { _id: "DOCGIA" },
        { $inc: { seq: 1 } },
        { returnDocument: "after", upsert: true }
      );

    const seq = seqResult.seq || seqResult.value?.seq;

    if (!seq) {
      throw new Error("Không thể tạo ID tự động (Lỗi SEQ)");
    }

    readerData.MADOCGIA = "DG" + String(seq).padStart(3, "0");

    const result = await db.collection("DOCGIA").insertOne(readerData);

    const newReader = await db
      .collection("DOCGIA")
      .findOne({ _id: result.insertedId });

    res.status(201).json(newReader);
  } catch (err) {
    console.error("Lỗi Create:", err);
    res.status(400).json({ message: err.message });
  } finally {
    if (client) await client.close();
  }
};

exports.update = async (req, res) => {
  let client;
  try {
    client = await MongoDB.connect(process.env.MONGO_URI);
    const db = client.db("library_db");

    const updateData = { ...req.body };

    if (updateData.Password) {
      updateData.PASSWORD = await bcrypt.hash(updateData.Password, 10);
      delete updateData.Password;
    }

    if (updateData._id) delete updateData._id;

    const result = await db
      .collection("DOCGIA")
      .updateOne({ MADOCGIA: req.params.id }, { $set: updateData });

    if (result.matchedCount === 0)
      return res.status(404).json({ message: "Reader not found" });

    const updatedReader = await db
      .collection("DOCGIA")
      .findOne({ MADOCGIA: req.params.id });

    res.json(updatedReader);
  } catch (err) {
    res.status(400).json({ message: err.message });
  } finally {
    if (client) await client.close();
  }
};

exports.getMe = async (req, res) => {
  let client;
  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer "))
      return res.status(401).json({ message: "Unauthorized" });

    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "change-this-secret"
    );

    client = await MongoDB.connect(process.env.MONGO_URI);
    const db = client.db("library_db");

    const reader = await db
      .collection("DOCGIA")
      .findOne({ MADOCGIA: payload.id });

    if (!reader) return res.status(404).json({ message: "Reader not found" });

    const { PASSWORD, ...safeReader } = reader;
    res.json(safeReader);
  } catch (err) {
    res.status(500).json({ message: err.message });
  } finally {
    if (client) await client.close();
  }
};

exports.updateMe = async (req, res) => {
  let client;
  try {
    //Kết nối & Xác thực
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer "))
      return res.status(401).json({ message: "Unauthorized" });
    const token = authHeader.split(" ")[1];
    let payload;
    try {
      payload = require("jsonwebtoken").verify(
        token,
        process.env.JWT_SECRET || "change-this-secret"
      );
    } catch (e) {
      return res.status(401).json({ message: "Token invalid" });
    }

    client = await MongoDB.connect(process.env.MONGO_URI);
    const db = client.db("library_db");

    //Tìm User hiện tại
    const currentUser = await db
      .collection("DOCGIA")
      .findOne({ MADOCGIA: payload.id });
    if (!currentUser)
      return res.status(404).json({ message: "Không tìm thấy độc giả" });

    // MAP DỮ LIỆU
    // Chuyển từ camelCase (Frontend) -> UPPERCASE (Database)
    const b = req.body;
    const updateFields = {};

    console.log("Dữ liệu nhận từ Vue:", b);

    if (b.HoLot !== undefined) updateFields.HOLOT = b.HoLot;
    if (b.Ten !== undefined) updateFields.TEN = b.Ten;
    if (b.NgaySinh !== undefined) updateFields.NGAYSINH = b.NgaySinh;
    if (b.Phai !== undefined) updateFields.PHAI = b.Phai;
    ("");

    // Xử lý các trường đặc biệt
    if (b.DIACHI !== undefined) updateFields.DIACHI = b.DIACHI;
    else if (b.DiaChi !== undefined) updateFields.DIACHI = b.DiaChi;

    if (b.DienThoai !== undefined) updateFields.DIENTHOAI = b.DienThoai; // Vue gửi DienThoai

    // 4. Xử lý Đổi Mật Khẩu (Nếu có)
    if (b.Password) {
      if (!b.OldPassword)
        return res.status(400).json({ message: "Thiếu mật khẩu cũ" });

      const stored = currentUser.PASSWORD || "";
      let isMatch = false;

      // So sánh mật khẩu cũ
      if (stored) {
        try {
          isMatch = await bcrypt.compare(b.OldPassword, stored);
        } catch (e) {}
      }
      if (!isMatch && stored && b.OldPassword === stored) isMatch = true;

      if (!isMatch)
        return res.status(400).json({ message: "Mật khẩu cũ không chính xác" });

      updateFields.PASSWORD = await bcrypt.hash(b.Password, 10);
      console.log("Đã tạo Hash mật khẩu mới");
    }

    console.log("Dữ liệu sẽ lưu vào DB:", updateFields);

    if (Object.keys(updateFields).length === 0) {
      return res.json({ message: "Không có gì thay đổi", reader: currentUser });
    }

    // Update và Trả về kết quả
    await db
      .collection("DOCGIA")
      .updateOne({ MADOCGIA: payload.id }, { $set: updateFields });

    // Xóa các trường "rác" (chữ thường) nếu lỡ tạo ra trước đó
    await db.collection("DOCGIA").updateOne(
      { MADOCGIA: payload.id },
      {
        $unset: { HoLot: "", Ten: "", DienThoai: "", NgaySinh: "", Phai: "" },
      }
    );

    const updatedReader = await db
      .collection("DOCGIA")
      .findOne({ MADOCGIA: payload.id });
    const { PASSWORD, ...safeReader } = updatedReader;

    res.json(safeReader);
  } catch (err) {
    console.error("Lỗi Server:", err);
    res.status(500).json({ message: err.message });
  } finally {
    if (client) await client.close();
  }
};

exports.delete = async (req, res) => {
  let client;
  try {
    client = await MongoDB.connect(process.env.MONGO_URI);
    const db = client.db("library_db");

    const result = await db
      .collection("DOCGIA")
      .deleteOne({ MADOCGIA: req.params.id });

    if (result.deletedCount === 0)
      return res.status(404).json({ message: "Reader not found" });

    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  } finally {
    if (client) await client.close();
  }
};
