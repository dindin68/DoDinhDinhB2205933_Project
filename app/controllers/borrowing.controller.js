const ApiError = require("../api-error");
const MongoDB = require("../utils/mongodb.util");
const { getNextCode } = require("../utils/code.util");
const { ObjectId } = require("mongodb");

// 1. Lấy tất cả borrowings
exports.getAll = async (req, res) => {
  let client;
  try {
    client = await MongoDB.connect(process.env.MONGO_URI);
    const db = client.db("library_db");
    const borrowings = await db.collection("THEODOIMUONSACH").find().toArray();
    res.json(borrowings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  } finally {
    if (client) await client.close();
  }
};

// 2. Lấy 1 borrowing theo _id
exports.getOne = async (req, res) => {
  let client;
  try {
    client = await MongoDB.connect(process.env.MONGO_URI);
    const db = client.db("library_db");
    const borrowing = await db
      .collection("THEODOIMUONSACH")
      .findOne({ _id: new ObjectId(req.params.id) });
    if (!borrowing)
      return res.status(404).json({ message: "Borrowing not found" });
    res.json(borrowing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  } finally {
    if (client) await client.close();
  }
};

// 3. Tạo borrowing mới
exports.create = async (req, res) => {
  let client;
  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: token missing" });
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

    const borrowingData = {
      ...req.body,
      TrangThai: "ChoDuyet",
      NgayTao: new Date(),
    };

    if (payload && payload.role === "reader") {
      borrowingData.MaDocGia = payload.id;
    } else if (payload && payload.msnv) {
      if (!borrowingData.MaDocGia) {
        return res.status(400).json({
          message: "MaDocGia required when creating on behalf of reader",
        });
      }
    } else {
      return res.status(403).json({ message: "Forbidden: insufficient role" });
    }

    // Sinh MaMuon duy nhất dựa trên timestamp
    borrowingData.MaMuon = "MM" + new Date().getTime();

    const result = await db
      .collection("THEODOIMUONSACH")
      .insertOne(borrowingData);
    const newBorrowing = await db
      .collection("THEODOIMUONSACH")
      .findOne({ _id: result.insertedId });
    res.status(201).json(newBorrowing);
  } catch (err) {
    res.status(400).json({ message: err.message });
  } finally {
    if (client) await client.close();
  }
};

// 4. Update borrowing theo _id (Cập nhật thông tin chung)
exports.update = async (req, res) => {
  let client;
  try {
    client = await MongoDB.connect(process.env.MONGO_URI);
    const db = client.db("library_db");
    const updateData = { ...req.body };
    if (updateData._id) delete updateData._id;

    const result = await db
      .collection("THEODOIMUONSACH")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: updateData });

    if (result.matchedCount === 0)
      return res.status(404).json({ message: "Borrowing not found" });

    const updatedBorrowing = await db
      .collection("THEODOIMUONSACH")
      .findOne({ _id: new ObjectId(req.params.id) });
    res.json(updatedBorrowing);
  } catch (err) {
    res.status(400).json({ message: err.message });
  } finally {
    if (client) await client.close();
  }
};

// 5. Xóa borrowing theo _id
exports.delete = async (req, res) => {
  let client;
  try {
    client = await MongoDB.connect(process.env.MONGO_URI);
    const db = client.db("library_db");
    const result = await db
      .collection("THEODOIMUONSACH")
      .deleteOne({ _id: new ObjectId(req.params.id) });

    if (result.deletedCount === 0)
      return res.status(404).json({ message: "Borrowing not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  } finally {
    if (client) await client.close();
  }
};

// 6. Cập nhật trạng thái (Duyệt, Mượn, Trả) - Đã Đơn Giản Hóa
exports.updateStatus = async (req, res) => {
  let client;
  try {
    client = await MongoDB.connect(process.env.MONGO_URI);
    const db = client.db("library_db");
    const id = req.params.id;
    const { TrangThai } = req.body;

    const borrowing = await db
      .collection("THEODOIMUONSACH")
      .findOne({ _id: new ObjectId(id) });

    if (!borrowing) return res.status(404).json({ message: "Not found" });

    // Đối tượng cập nhật cơ bản
    const updateFields = { TrangThai: TrangThai, NgayCapNhat: new Date() };

    let isValid = false;

    switch (borrowing.TrangThai) {
      case "ChoDuyet":
        if (TrangThai === "DaDuyet") isValid = true;
        break;

      case "DaDuyet":
        if (TrangThai === "DaMuon") isValid = true;
        break;

      // ✅ ĐƠN GIẢN HÓA: Dù là Đang Mượn hay Quá Hạn, chỉ cần bấm TRẢ là cho phép
      case "DaMuon":
      case "QuaHan":
        if (TrangThai === "DaTra") {
          isValid = true;
          updateFields.NgayTraThucTe = new Date(); // Ghi nhận ngày trả
        }
        break;

      case "DaTra":
        isValid = false;
        break;

      default:
        isValid = false;
        break;
    }

    if (!isValid) {
      return res
        .status(400)
        .json({ message: "Trạng thái chuyển đổi không hợp lệ." });
    }

    await db
      .collection("THEODOIMUONSACH")
      .updateOne({ _id: new ObjectId(id) }, { $set: updateFields });
    const updated = await db
      .collection("THEODOIMUONSACH")
      .findOne({ _id: new ObjectId(id) });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  } finally {
    if (client) await client.close();
  }
};

// 7. Cập nhật trạng thái quá hạn (DUMMY - Để tránh lỗi Route)
// Hàm này chỉ trả về danh sách, không còn tự động cập nhật sang 'QuaHan' nữa
exports.checkOverdueStatus = async (req, res) => {
  let client;
  try {
    client = await MongoDB.connect(process.env.MONGO_URI);
    const db = client.db("library_db");

    // Chỉ trả về danh sách hiện tại, không làm gì cả
    const borrowings = await db.collection("THEODOIMUONSACH").find().toArray();

    res.json(borrowings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  } finally {
    if (client) await client.close();
  }
};

// 8. Lấy danh sách mượn của tôi (Cho Reader)
exports.getMyBorrowings = async (req, res) => {
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

    const borrowings = await db
      .collection("THEODOIMUONSACH")
      .find({ MaDocGia: payload.id })
      .toArray();

    res.json(borrowings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  } finally {
    if (client) await client.close();
  }
};
