const MongoDB = require("../utils/mongodb.util");
const { getNextCode } = require("../utils/code.util");

exports.getAll = async (req, res) => {
  let client;
  try {
    client = await MongoDB.connect(process.env.MONGO_URI);
    const db = client.db("library_db");

    const books = await db
      .collection("SACH")
      .aggregate([
        {
          $lookup: {
            from: "NXB", // tên collection NXB
            localField: "MaNXB", // khóa trong SACH
            foreignField: "MaNXB", // khóa bên NXB
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
            TenNXB: "$NXBInfo.TenNXB",
          },
        },
        {
          $project: {
            NXBInfo: 0, // ẩn object NXB
          },
        },
      ])
      .toArray();

    res.json(books);
  } catch (err) {
    console.error("Get books error:", err);
    res.status(500).json({ message: "Lỗi server: " + err.message });
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
            from: "NXB",
            localField: "MaNXB",
            foreignField: "MaNXB",
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
            TenNXB: "$NXBInfo.TenNXB",
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

exports.create = async (req, res) => {
  let client;
  try {
    client = await MongoDB.connect(process.env.MONGO_URI);
    const db = client.db("library_db");

    const bookData = { ...req.body };

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

exports.update = async (req, res) => {
  let client;
  try {
    client = await MongoDB.connect(process.env.MONGO_URI);
    const db = client.db("library_db");

    const updateData = { ...req.body };
    if (updateData._id) delete updateData._id;

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
