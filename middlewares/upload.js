// middlewares/upload.js
const multer = require("multer");

const storage = multer.memoryStorage(); // <-- stores file in RAM
const upload = multer({ storage });

module.exports = upload;
