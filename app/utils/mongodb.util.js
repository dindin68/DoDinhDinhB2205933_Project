const { MongoClient } = require("mongodb");

module.exports = {
  connect: async (uri) => {
    console.log("Connecting to MongoDB:", uri);
    const client = new MongoClient(uri); // driver 4.x không cần useNewUrlParser/useUnifiedTopology
    await client.connect();
    console.log("MongoDB connected");
    return client;
  },
};
