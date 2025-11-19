const ApiError = require("../api-error");
const ContactService = require("../services/contact.service");
const MongoDB = require("../utils/mongodb.util");

exports.getAll = async (req, res) => {
  try {
    const client = await MongoDB.connect(process.env.MONGO_URI);
    const db = client.db("library_db");
    const publishers = await db.collection("publishers").find().toArray();
    res.json(publishers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const client = await MongoDB.connect(process.env.MONGO_URI);
    const db = client.db("library_db");
    const publisher = await db
      .collection("NHASANXUAT")
      .findOne({ MaNXB: req.params.id });
    if (!publisher)
      return res.status(404).json({ message: "Publisher not found" });
    res.json(publisher);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const client = await MongoDB.connect(process.env.MONGO_URI);
    const db = client.db("library_db");
    const result = await db.collection("NHASANXUAT").insertOne(req.body);
    const newPublisher = await db
      .collection("NHASANXUAT")
      .findOne({ _id: result.insertedId });
    res.status(201).json(newPublisher);
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
      .collection("NHASANXUAT")
      .updateOne({ MaNXB: req.params.id }, { $set: updateData });
    if (result.matchedCount === 0)
      return res.status(404).json({ message: "Publisher not found" });
    const updatedPublisher = await db
      .collection("NHASANXUAT")
      .findOne({ MaNXB: req.params.id });
    res.json(updatedPublisher);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const client = await MongoDB.connect(process.env.MONGO_URI);
    const db = client.db("library_db");
    const result = await db
      .collection("NHASANXUAT")
      .deleteOne({ MaNXB: req.params.id });
    if (result.deletedCount === 0)
      return res.status(404).json({ message: "Publisher not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
