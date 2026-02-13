const multer = require("multer");

const storage = multer.memoryStorage();

const uploadSingleCover = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single("cover");

module.exports = {
  uploadSingleCover,
};
