const MongoDB = require("./mongodb.util");

async function getNextCode(collectionName, prefix, digits = 3) {
  const client = await MongoDB.connect(process.env.MONGO_URI);
  try {
    const db = client.db("library_db");
    const lastItem = await db
      .collection(collectionName)
      .find({ MANXB: { $regex: `^${prefix}` } })
      .sort({ MANXB: -1 })
      .limit(1)
      .toArray();

    let nextNumber = 1;
    if (lastItem.length > 0) {
      const lastCode = lastItem[0].MANXB;
      const numberPart = parseInt(lastCode.slice(prefix.length)) || 0;
      nextNumber = numberPart + 1;
    }

    return prefix + String(nextNumber).padStart(digits, "0");
  } finally {
    await client.close();
  }
}

module.exports = { getNextCode };
