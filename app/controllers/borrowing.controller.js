const ApiError = require("../api-error");
const MongoDB = require("../utils/mongodb.util");
const { getNextCode } = require("../utils/code.util");

exports.getAll = async (req, res) => {
  try {
    const client = await MongoDB.connect(process.env.MONGO_URI);
    const db = client.db("library_db");
    const borrowings = await db.collection("THEODOIMUONSACH").find().toArray();
    res.json(borrowings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const client = await MongoDB.connect(process.env.MONGO_URI);
    const db = client.db("library_db");
    const borrowing = await db
      .collection("THEODOIMUONSACH")
      .findOne({ MaMuon: req.params.id });
    if (!borrowing)
      return res.status(404).json({ message: "Borrowing not found" });
    res.json(borrowing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  let client;
  try {
    // Verify Authorization header (Bearer token) to ensure reader is logged in
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

    // build borrowing data and attach reader id from token if role=reader
    const borrowingData = {
      ...req.body,
      TrangThai: "ChoDuyet",
      NgayTao: new Date(),
    };

    // If token belongs to a reader, attach their MaDocGia automatically
    if (payload && payload.role === "reader") {
      borrowingData.MaDocGia = payload.id;
    } else if (payload && payload.msnv) {
      // admin logged in — require client to pass MaDocGia in body
      if (!borrowingData.MaDocGia) {
        return res
          .status(400)
          .json({
            message: "MaDocGia required when creating on behalf of reader",
          });
      }
    } else {
      return res.status(403).json({ message: "Forbidden: insufficient role" });
    }

    if (!borrowingData.MaMuon) {
      borrowingData.MaMuon = await getNextCode("borrowings", "MM", 3);
    }

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
    if (client) {
      try {
        await client.close();
      } catch (e) {}
    }
  }
};

exports.update = async (req, res) => {
  try {
    const client = await MongoDB.connect(process.env.MONGO_URI);
    const db = client.db("library_db");
    const updateData = { ...req.body };
    if (updateData._id) delete updateData._id;
    const result = await db
      .collection("THEODOIMUONSACH")
      .updateOne({ MaMuon: req.params.id }, { $set: updateData });
    if (result.matchedCount === 0)
      return res.status(404).json({ message: "Borrowing not found" });
    const updatedBorrowing = await db
      .collection("THEODOIMUONSACH")
      .findOne({ MaMuon: req.params.id });
    res.json(updatedBorrowing);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const client = await MongoDB.connect(process.env.MONGO_URI);
    const db = client.db("library_db");
    const result = await db
      .collection("THEODOIMUONSACH")
      .deleteOne({ MaMuon: req.params.id });
    if (result.deletedCount === 0)
      return res.status(404).json({ message: "Borrowing not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//Cập nhật trạng thái mượn sách theo quy trình
exports.updateStatus = async (req, res) => {
  try {
    const client = await MongoDB.connect(process.env.MONGO_URI);
    const db = client.db("library_db");
    const MaMuon = req.params.maMuon;
    const { TrangThai } = req.body; // Nhận trạng thái mới từ client

    // Kiểm tra trạng thái hợp lệ
    const validStatuses = ["ChoDuyet", "DaDuyet", "DaMuon", "DaTra", "QuaHan"];
    if (!validStatuses.includes(TrangThai)) {
      return res.status(400).json({
        message:
          "Invalid status. Use ChoDuyet, DaDuyet, DaMuon, DaTra, or QuaHan.",
      });
    }

    // Gỡ lỗi: Kiểm tra giá trị MaMuon
    console.log("Searching for MaMuon:", MaMuon);
    console.log(
      "All MaMuon values:",
      await db.collection("THEODOIMUONSACH").distinct("MaMuon")
    );

    const borrowing = await db
      .collection("THEODOIMUONSACH")
      .findOne({ MaMuon });
    if (!borrowing) {
      console.log("No borrowing found with MaMuon:", MaMuon);
      return res.status(404).json({ message: "Borrowing not found" });
    }
    console.log("Found borrowing:", borrowing);

    // Logic chuyển trạng thái
    switch (borrowing.TrangThai) {
      case "ChoDuyet":
        if (TrangThai === "DaDuyet") {
          await db
            .collection("THEODOIMUONSACH")
            .updateOne({ MaMuon }, { $set: { TrangThai } });
        } else {
          return res
            .status(400)
            .json({ message: "Can only update from ChoDuyet to DaDuyet." });
        }
        break;
      case "DaDuyet":
        if (TrangThai === "DaMuon") {
          await db
            .collection("THEODOIMUONSACH")
            .updateOne({ MaMuon }, { $set: { TrangThai } });
        } else {
          return res
            .status(400)
            .json({ message: "Can only update from DaDuyet to DaMuon." });
        }
        break;
      case "DaMuon":
        if (TrangThai === "DaTra") {
          await db
            .collection("THEODOIMUONSACH")
            .updateOne({ MaMuon }, { $set: { TrangThai } });
        } else {
          return res
            .status(400)
            .json({ message: "Can only update from DaMuon to DaTra." });
        }
        break;
      default:
        return res
          .status(400)
          .json({ message: "Cannot update status from current state." });
    }

    const updatedBorrowing = await db
      .collection("THEODOIMUONSACH")
      .findOne({ MaMuon });
    res.json(updatedBorrowing);
  } catch (err) {
    console.error("Error in updateStatus:", err.message);
    res.status(400).json({ message: err.message });
  }
};

// Hàm kiểm tra và cập nhật trạng thái tự động
exports.checkOverdueStatus = async (req, res) => {
  try {
    const client = await MongoDB.connect(process.env.MONGO_URI);
    const db = client.db("library_db");
    const currentDate = new Date(); // Đặt cố định ngày hiện tại

    const borrowings = await db
      .collection("THEODOIMUONSACH")
      .find({ TrangThai: "DaMuon" })
      .toArray();
    if (!borrowings.length) {
      return res.json({ message: "No borrowings with status DaMuon found." });
    }
    for (const borrowing of borrowings) {
      const ngayTra = new Date(borrowing.NgayTra);
      if (ngayTra < currentDate) {
        await db
          .collection("THEODOIMUONSACH")
          .updateOne(
            { MaMuon: borrowing.MaMuon },
            { $set: { TrangThai: "QuaHan" } }
          );
      }
    }
    const updatedBorrowings = await db
      .collection("THEODOIMUONSACH")
      .find()
      .toArray();
    res.json(updatedBorrowings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
