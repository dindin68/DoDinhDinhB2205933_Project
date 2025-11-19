const ApiError = require("../api-error");
const ContactService = require("../services/contact.service");
const MongoDB = require("../utils/mongodb.util");
const { getNextCode } = require("../utils/code.util");

exports.getAll = async (req, res) => {
  try {
    const client = await MongoDB.connect(process.env.MONGO_URI);
    const db = client.db("library_db");
    const readers = await db.collection("DOCGIA").find().toArray();
    res.json(readers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const client = await MongoDB.connect(process.env.MONGO_URI);
    const db = client.db("library_db");
    const reader = await db
      .collection("DOCGIA")
      .findOne({ MaDocGia: req.params.id });
    if (!reader) return res.status(404).json({ message: "Reader not found" });
    res.json(reader);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const client = await MongoDB.connect(process.env.MONGO_URI);
    const db = client.db("library_db");
    const readerData = { ...req.body };
    if (!readerData.MaDocGia) {
      readerData.MaDocGia = await getNextCode("DOCGIA", "DG", 3);
    }
    const result = await db.collection("DOCGIA").insertOne(readerData);
    const newReader = await db
      .collection("DOCGIA")
      .findOne({ _id: result.insertedId });
    res.status(201).json(newReader);
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
      .collection("DOCGIA")
      .updateOne({ MaDocGia: req.params.id }, { $set: updateData });
    if (result.matchedCount === 0)
      return res.status(404).json({ message: "Reader not found" });
    const updatedReader = await db
      .collection("DOCGIA")
      .findOne({ MaDocGia: req.params.id });
    res.json(updatedReader);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const client = await MongoDB.connect(process.env.MONGO_URI);
    const db = client.db("library_db");
    const result = await db
      .collection("DOCGIA")
      .deleteOne({ MaDocGia: req.params.id });
    if (result.deletedCount === 0)
      return res.status(404).json({ message: "Reader not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const client = await MongoDB.connect(process.env.MONGO_URI);
    const db = client.db("library_db");
    const result = await db
      .collection("DOCGIA")
      .deleteOne({ MaDocGia: req.params.id });
    if (result.deletedCount === 0)
      return res.status(404).json({ message: "Reader not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
