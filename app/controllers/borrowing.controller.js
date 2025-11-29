const ApiError = require("../api-error");
const MongoDB = require("../utils/mongodb.util");
const { getNextCode } = require("../utils/code.util");
const { ObjectId } = require("mongodb");

// Lấy tất cả borrowings
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

// Lấy 1 borrowing theo _id
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

// Tạo borrowing mới
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

// Update borrowing theo _id
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

// Xóa borrowing theo _id
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

// Cập nhật trạng thái theo quy trình (dựa trên _id)
exports.updateStatus = async (req, res) => {
  let client;
  try {
    client = await MongoDB.connect(process.env.MONGO_URI);
    const db = client.db("library_db");
    const id = req.params.id;
    const { TrangThai } = req.body;

    const validStatuses = ["ChoDuyet", "DaDuyet", "DaMuon", "DaTra", "QuaHan"];
    if (!validStatuses.includes(TrangThai)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const borrowing = await db
      .collection("THEODOIMUONSACH")
      .findOne({ _id: new ObjectId(id) });

    if (!borrowing)
      return res.status(404).json({ message: "Borrowing not found" });

    // Quy trình trạng thái
    switch (borrowing.TrangThai) {
      case "ChoDuyet":
        if (TrangThai !== "DaDuyet")
          return res
            .status(400)
            .json({ message: "Can only update from ChoDuyet to DaDuyet." });
        break;
      case "DaDuyet":
        if (TrangThai !== "DaMuon")
          return res
            .status(400)
            .json({ message: "Can only update from DaDuyet to DaMuon." });
        break;
      case "DaMuon":
        if (TrangThai !== "DaTra")
          return res
            .status(400)
            .json({ message: "Can only update from DaMuon to DaTra." });
        break;
      default:
        return res
          .status(400)
          .json({ message: "Cannot update status from current state." });
    }

    await db
      .collection("THEODOIMUONSACH")
      .updateOne({ _id: new ObjectId(id) }, { $set: { TrangThai } });

    const updatedBorrowing = await db
      .collection("THEODOIMUONSACH")
      .findOne({ _id: new ObjectId(id) });
    res.json(updatedBorrowing);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  } finally {
    if (client) await client.close();
  }
};

// Cập nhật trạng thái quá hạn
exports.checkOverdueStatus = async (req, res) => {
  let client;
  try {
    client = await MongoDB.connect(process.env.MONGO_URI);
    const db = client.db("library_db");

    const currentDate = new Date();
    const borrowings = await db
      .collection("THEODOIMUONSACH")
      .find({ TrangThai: "DaMuon" })
      .toArray();

    const updates = borrowings
      .filter((b) => b.NgayTra && new Date(b.NgayTra) < currentDate)
      .map((b) =>
        db
          .collection("THEODOIMUONSACH")
          .updateOne(
            { _id: new ObjectId(b._id) },
            { $set: { TrangThai: "QuaHan" } }
          )
      );

    await Promise.all(updates);

    const updatedBorrowings = await db
      .collection("THEODOIMUONSACH")
      .find()
      .toArray();
    res.json(updatedBorrowings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  } finally {
    if (client) await client.close();
  }
};
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
      .find({ MaDocGia: payload.id }) // chỉ lấy phiếu của reader
      .toArray();

    res.json(borrowings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  } finally {
    if (client) await client.close();
  }
};
