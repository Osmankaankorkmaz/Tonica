const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const db = () => {
  mongoose
    .connect(process.env.database, {
      serverSelectionTimeoutMS: 50000, // Timeout süresi 50 saniye
    })
    .then(() => {
      console.log("MongoDB bağlandı !!!!");
    })
    .catch((err) => {
      console.error("MongoDB bağlanamadı:", err);
    });
};

module.exports = db;
