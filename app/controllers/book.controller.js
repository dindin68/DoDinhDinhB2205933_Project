const MongoDB = require("../utils/mongodb.util");
const { getNextCode } = require("../utils/code.util");
const { ObjectId } = require("mongodb");

// Hàm trợ giúp để lấy mã logic NXB từ ID (ObjectId)
const getMaNXBFromId = async (db, publisherId) => {
  // Kiểm tra xem ID có hợp lệ không (tránh lỗi khi tạo NXB mới chưa có ID)
  if (!publisherId) return null;

  // Chuyển string ID thành ObjectId
  let objectId;
  try {
    objectId = new ObjectId(publisherId);
  } catch (e) {
    console.error("ID NXB không hợp lệ:", publisherId);
    return null;
  }

  //Tìm NXB theo ID
  const publisher = await db.collection("NHAXUATBAN").findOne({
    _id: objectId,
  });

  // Trả về Mã logic NXB
  return publisher ? publisher.MANXB : null;
};

exports.create = async (req, res) => {
  let client;
  try {
    client = await MongoDB.connect(process.env.MONGO_URI);
    const db = client.db("library_db");

    const bookData = { ...req.body };

    if (bookData.MANXB) {
      const maNXBLogic = await getMaNXBFromId(db, bookData.MANXB);

      if (bookData.DONGIA) bookData.DONGIA = Number(bookData.DONGIA);
      if (bookData.SOQUYEN) bookData.SOQUYEN = Number(bookData.SOQUYEN);
      if (bookData.NamXuatBan)
        bookData.NamXuatBan = Number(bookData.NamXuatBan);
      if (maNXBLogic) {
        bookData.MANXB = maNXBLogic; // Lưu Mã logic (ví dụ: NXB001)
      } else {
        return res
          .status(400)
          .json({ message: "Nhà Xuất Bản không tồn tại hoặc không hợp lệ." });
      }
    }
    // Nếu có file ảnh thì thêm trường ImageUrl
    if (req.file) {
      bookData.ImageUrl = `/uploads/${req.file.filename}`;
    }

    if (!bookData.MaSach) {
      bookData.MaSach = await getNextCode("SACH", "S", 3);
    }

    const result = await db.collection("SACH").insertOne(bookData);
    const newBook = await db
      .collection("SACH")
      .findOne({ _id: result.insertedId });

    res.status(201).json(newBook);
  } catch (err) {
    console.error("Create book error:", err);
    res.status(400).json({ message: err.message });
  } finally {
    if (client) await client.close();
  }
};

// HÀM CẬP NHẬT SÁCH

exports.update = async (req, res) => {
  let client;
  try {
    client = await MongoDB.connect(process.env.MONGO_URI);
    const db = client.db("library_db");

    const updateData = { ...req.body };
    if (updateData._id) delete updateData._id;
    if (updateData.DONGIA) updateData.DONGIA = Number(updateData.DONGIA);
    if (updateData.SOQUYEN) updateData.SOQUYEN = Number(updateData.SOQUYEN);
    if (updateData.NamXuatBan)
      updateData.NamXuatBan = Number(updateData.NamXuatBan);

    if (updateData.MANXB) {
      const maNXBLogic = await getMaNXBFromId(db, updateData.MANXB);

      if (maNXBLogic) {
        updateData.MANXB = maNXBLogic; // Lưu Mã logic
      } else {
        return res
          .status(400)
          .json({ message: "Nhà Xuất Bản không tồn tại hoặc không hợp lệ." });
      }
    }

    // nếu người dùng upload ảnh mới
    if (req.file) {
      updateData.ImageUrl = `/uploads/${req.file.filename}`;
    }

    const result = await db
      .collection("SACH")
      .updateOne({ MaSach: req.params.id }, { $set: updateData });

    if (result.matchedCount === 0)
      return res.status(404).json({ message: "Book not found" });

    const updatedBook = await db
      .collection("SACH")
      .findOne({ MaSach: req.params.id });

    res.json(updatedBook);
  } catch (err) {
    console.error("Update book error:", err);
    res.status(400).json({ message: err.message });
  } finally {
    if (client) await client.close();
  }
};

exports.getAll = async (req, res) => {
  let client;
  try {
    client = await MongoDB.connect(process.env.MONGO_URI);
    const db = client.db("library_db");

    const keyword = req.query.q || "";
    const regex = new RegExp(keyword, "i");

    const books = await db
      .collection("SACH")
      .aggregate([
        {
          $lookup: {
            from: "NHAXUATBAN",
            localField: "MANXB",
            foreignField: "MANXB",
            as: "NXBInfo",
          },
        },
        { $unwind: { path: "$NXBInfo", preserveNullAndEmptyArrays: true } }, // JOIN TÁC GIẢ
        {
          $lookup: {
            from: "THEODOIMUONSACH", // Tên collection mượn sách
            localField: "MaSach", // Trường liên kết ở bảng SACH
            foreignField: "MaSach", // Trường liên kết ở bảng THEODOIMUONSACH
            as: "ThongTinMuon",
          },
        },
        {
          $lookup: {
            from: "TACGIA",
            localField: "MaTacGia",
            foreignField: "MaTacGia",
            as: "TacGiaInfo",
          },
        },
        { $unwind: { path: "$TacGiaInfo", preserveNullAndEmptyArrays: true } }, // TẠO FIELD PHẲNG (ĐÃ SỬA TENNXB => TenNXB)

        {
          $addFields: {
            SoLuongDaMuon: {
              $size: {
                $filter: {
                  input: "$ThongTinMuon",
                  as: "item",
                  cond: {
                    // Lọc các trạng thái được coi là "Đang giữ sách"
                    // BẠN CẦN SỬA LẠI GIÁ TRỊ NÀY CHO KHỚP VỚI DB CỦA BẠN
                    $in: [
                      "$$item.TrangThai",
                      ["Đã duyệt", "Đang mượn", "Chờ lấy"],
                    ],
                  },
                },
              },
            },
            TENNXB: "$NXBInfo.TENNXB", // Sửa: Giả định trường NXB là TenNXB
            TenTacGia: "$TacGiaInfo.TenTacGia",
          },
        }, // SEARCH SAU KHI ĐÃ CÓ ĐẦY ĐỦ FIELD

        {
          $match: keyword
            ? {
                $or: [
                  { TenSach: { $regex: regex } },
                  { TenTacGia: { $regex: regex } },
                  { TENNXB: { $regex: regex } },
                ],
              }
            : {},
        }, // ẨN OBJECT THỪA

        {
          $project: {
            NXBInfo: 0,
            TacGiaInfo: 0,
            ThongTinMuon: 0,
          },
        },
      ])
      .toArray();

    res.json(books);
  } catch (err) {
    console.error("Get books error:", err);
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

    const books = await db
      .collection("SACH")
      .aggregate([
        { $match: { MaSach: req.params.id } },
        {
          $lookup: {
            from: "NHAXUATBAN",
            localField: "MANXB",
            foreignField: "MANXB",
            as: "NXBInfo",
          },
        },
        {
          $unwind: {
            path: "$NXBInfo",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            TENNXB: "$NXBInfo.TENNXB", // Sửa: Giả định trường NXB là TenNXB
          },
        },
        {
          $project: { NXBInfo: 0 },
        },
      ])
      .toArray();

    if (!books[0]) return res.status(404).json({ message: "Book not found" });

    res.json(books[0]);
  } catch (err) {
    console.error("Get book error:", err);
    res.status(500).json({ message: "Lỗi server: " + err.message });
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
      .collection("SACH")
      .deleteOne({ MaSach: req.params.id });
    if (result.deletedCount === 0)
      return res.status(404).json({ message: "Book not found" });

    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("Delete book error:", err);
    res.status(500).json({ message: err.message });
  } finally {
    if (client) await client.close();
  }
};
