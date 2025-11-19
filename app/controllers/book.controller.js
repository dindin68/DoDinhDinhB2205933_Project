const ApiError = require("../api-error");
const ContactService = require("../services/contact.service");
const MongoDB = require("../utils/mongodb.util");
const { getNextCode } = require("../utils/code.util");

exports.getAll = async (req, res) => {
  try {
    const client = await MongoDB.connect(process.env.MONGO_URI);
    const db = client.db("library_db");
    const books = await db.collection("SACH").find().toArray();
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const client = await MongoDB.connect(process.env.MONGO_URI);
    const db = client.db("library_db");
    const book = await db.collection("SACH").findOne({ MaSach: req.params.id });
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const client = await MongoDB.connect(process.env.MONGO_URI);
    const db = client.db("library_db");
    const bookData = { ...req.body };
    if (!bookData.MaSach) {
      bookData.MaSach = await getNextCode("books", "S", 3);
    }
    const result = await db.collection("SACH").insertOne(bookData);
    const newBook = await db
      .collection("SACH")
      .findOne({ _id: result.insertedId });
    res.status(201).json(newBook);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const client = await MongoDB.connect(process.env.MONGO_URI);
    const db = client.db("library_db");
    const updateData = { ...req.body };
    if (updateData._id) delete updateData._id;
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
    res.status(400).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const client = await MongoDB.connect(process.env.MONGO_URI);
    const db = client.db("library_db");
    const result = await db
      .collection("SACH")
      .deleteOne({ MaSach: req.params.id });
    if (result.deletedCount === 0)
      return res.status(404).json({ message: "Book not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
