const MongoDB = require("./mongodb.util");

async function getNextCode(seqName, prefix = "", digits = 4) {
  const client = await MongoDB.connect(process.env.MONGO_URI);
  const db = client.db("library_db");
  const result = await db
    .collection("counters")
    .findOneAndUpdate(
      { _id: seqName },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: "after" }
    );
  const n = result.value.seq;
  return prefix + String(n).padStart(digits, "0");
}

module.exports = { getNextCode };
