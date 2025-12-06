const MongoDB = require("../utils/mongodb.util");
const bcrypt = require("bcryptjs");

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

    // Validate required fields
    const required = ["HOLOT", "TEN", "DIENTHOAI", "DIACHI", "PASSWORD"];
    const missing = required.filter(
      (f) => !readerData[f] || readerData[f].toString().trim() === ""
    );
    if (missing.length) {
      return res
        .status(400)
        .json({ message: `Thiếu trường: ${missing.join(", ")}` });
    }

    // Hash password if provided before inserting
    if (readerData.PASSWORD) {
      try {
        const hash = await bcrypt.hash(readerData.PASSWORD, 10);
        readerData.PASSWORD = hash;
      } catch (e) {
        console.error("Failed to hash reader password:", e.message);
      }
    }

    // Tạo MaDocGia với try-catch và upsert seq nếu cần
    if (!readerData.MADOCGIA) {
      try {
        const result = await db
          .collection("SEQ")
          .findOneAndUpdate(
            { _id: "DOCGIA" },
            { $inc: { seq: 1 } },
            { returnDocument: "after", upsert: true }
          );

        const seq = result.value.seq;
        const paddedSeq = String(seq).padStart(3, "0");
        readerData.MADOCGIA = "DG" + paddedSeq;
      } catch (e) {
        console.error("Lỗi tạo mã độc giả tự động:", e.message);
        // fallback tạm thời mã độc giả
        readerData.MADOCGIA = "DG" + Date.now();
      }
    }

    const result = await db.collection("DOCGIA").insertOne(readerData);
    const newReader = await db
      .collection("DOCGIA")
      .findOne({ _id: result.insertedId });

    res.status(201).json(newReader);
  } catch (err) {
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

    // normalize lowercase keys to DB uppercase fields
    if (updateData.HoLot) {
      updateData.HOLOT = updateData.HoLot;
      delete updateData.HoLot;
    }
    if (updateData.Ten) {
      updateData.TEN = updateData.Ten;
      delete updateData.Ten;
    }
    if (updateData.NgaySinh) {
      updateData.NGAYSINH = updateData.NgaySinh;
      delete updateData.NgaySinh;
    }
    if (updateData.Phai) {
      updateData.PHAI = updateData.Phai;
      delete updateData.Phai;
    }
    if (updateData.DIACHI) {
      updateData.DIACHI = updateData.DIACHI;
      delete updateData.DIACHI;
    }
    if (updateData.DienThoai) {
      updateData.DIENTHOAI = updateData.DienThoai;
      delete updateData.DienThoai;
    }
    if (updateData.Password) {
      updateData.PASSWORD = updateData.Password;
      delete updateData.Password;
    }
    if (updateData._id) delete updateData._id;
    // If password provided, hash it before update
    if (updateData.PASSWORD) {
      const hashed = await bcrypt.hash(updateData.PASSWORD, 10);
      updateData.PASSWORD = hashed;
    }
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

// Get current logged-in reader
exports.getMe = async (req, res) => {
  let client;
  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    let payload;
    try {
      payload = require("jsonwebtoken").verify(
        token,
        process.env.JWT_SECRET || "change-this-secret"
      );
    } catch (e) {
      return res.status(401).json({ message: "Invalid token" });
    }

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

// Update current logged-in reader
exports.updateMe = async (req, res) => {
  let client;
  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    let payload;
    try {
      payload = require("jsonwebtoken").verify(
        token,
        process.env.JWT_SECRET || "change-this-secret"
      );
    } catch (e) {
      return res.status(401).json({ message: "Invalid token" });
    }

    client = await MongoDB.connect(process.env.MONGO_URI);
    const db = client.db("library_db");
    const updateData = { ...req.body };
    if (updateData._id) delete updateData._id;
    // If password provided, hash it
    if (updateData.PASSWORD) {
      updateData.PASSWORD = await bcrypt.hash(updateData.PASSWORD, 10);
    }
    const result = await db
      .collection("DOCGIA")
      .updateOne({ MADOCGIA: payload.id }, { $set: updateData });
    if (result.matchedCount === 0)
      return res.status(404).json({ message: "Reader not found" });
    const updatedReader = await db
      .collection("DOCGIA")
      .findOne({ MADOCGIA: payload.id });
    const { PASSWORD, ...safeReader } = updatedReader;
    res.json(safeReader);
  } catch (err) {
    res.status(400).json({ message: err.message });
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
