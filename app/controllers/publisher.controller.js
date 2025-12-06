const MongoDB = require("../utils/mongodb.util");
const { getNextCode } = require("../utils/code.util");
const { ObjectId } = require("mongodb"); // Import ObjectId (đã có)

// Helper để mở DB, tự close sau callback
async function withDb(callback) {
  const client = await MongoDB.connect(process.env.MONGO_URI);
  try {
    const db = client.db("library_db");
    return await callback(db);
  } finally {
    try {
      await client.close();
    } catch (e) {}
  }
}

// Lấy tất cả nhà xuất bản
exports.getAll = async (req, res) => {
  try {
    const publishers = await withDb((db) =>
      db.collection("NHAXUATBAN").find().toArray()
    );
    console.log("Fetched publishers:", publishers);
    res.json(publishers);
  } catch (err) {
    console.error("Get publishers error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Lấy một NXB theo MANXB
exports.getOne = async (req, res) => {
  try {
    const publisher = await withDb((db) =>
      db.collection("NHAXUATBAN").findOne({ MANXB: req.params.id })
    );
    if (!publisher)
      return res.status(404).json({ message: "Publisher not found" });
    res.json(publisher);
  } catch (err) {
    console.error("Get publisher error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Tạo mới NXB
exports.create = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    const newPublisher = await withDb(async (db) => {
      const publisherData = {
        TENNXB: req.body.TENNXB,
        DIACHI: req.body.DIACHI || null,
      };

      if (!publisherData.TENNXB || publisherData.TENNXB.trim() === "") {
        throw { status: 400, message: "Thiếu trường TENNXB" };
      }

      const existsByName = await db
        .collection("NHAXUATBAN")
        .findOne({ TENNXB: publisherData.TENNXB });
      if (existsByName) throw { status: 400, message: "Tên NXB đã tồn tại" };

      const newCode = await getNextCode("NHAXUATBAN", "NXB", 3);
      console.log("Generated MANXB:", newCode);
      publisherData.MANXB = newCode;

      const result = await db.collection("NHAXUATBAN").insertOne(publisherData);
      return await db
        .collection("NHAXUATBAN")
        .findOne({ _id: result.insertedId });
    });

    console.log("Created publisher:", newPublisher);
    res.status(201).json(newPublisher);
  } catch (err) {
    console.error("Publisher create error:", err);
    if (err && err.status)
      return res.status(err.status).json({ message: err.message });
    res
      .status(500)
      .json({ message: "Lỗi server khi tạo NXB: " + (err.message || err) });
  }
};

// Cập nhật NXB
exports.update = async (req, res) => {
  try {
    const updated = await withDb(async (db) => {
      // 🌟 KHẮC PHỤC LỖI: Lấy dữ liệu từ req.body và loại bỏ _id
      const updateData = { ...req.body };
      if (updateData._id) delete updateData._id;

      const fieldsToUpdate = {};
      if (updateData.TENNXB !== undefined)
        fieldsToUpdate.TENNXB = updateData.TENNXB;
      if (updateData.DIACHI !== undefined)
        fieldsToUpdate.DIACHI = updateData.DIACHI;
      if (Object.keys(fieldsToUpdate).length === 0) {
        throw { status: 400, message: "Không có dữ liệu hợp lệ để cập nhật." };
      }

      const result = await db
        .collection("NHAXUATBAN")
        .updateOne({ MANXB: req.params.id }, { $set: fieldsToUpdate }); // ✅ Dùng fieldsToUpdate

      if (result.matchedCount === 0)
        throw { status: 404, message: "Publisher not found" };

      return await db
        .collection("NHAXUATBAN")
        .findOne({ MANXB: req.params.id });
    });
    res.json(updated);
  } catch (err) {
    if (err && err.status)
      return res.status(err.status).json({ message: err.message });
    console.error("Publisher update error:", err);
    res.status(400).json({ message: err.message });
  }
};

// Xóa NXB
exports.delete = async (req, res) => {
  try {
    await withDb(async (db) => {
      const result = await db
        .collection("NHAXUATBAN")
        .deleteOne({ MANXB: req.params.id });
      if (result.deletedCount === 0)
        throw { status: 404, message: "Publisher not found" };
    });
    res.json({ message: "Deleted" });
  } catch (err) {
    if (err && err.status)
      return res.status(err.status).json({ message: err.message });
    console.error("Publisher delete error:", err);
    res.status(500).json({ message: err.message });
  }
};
