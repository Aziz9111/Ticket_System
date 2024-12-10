const multer = require("multer");
const uuid = require("uuid").v4;
const path = require("path");

const maxSize = 1000 * 1000 * 2;

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, "public", "Images")); // Save outside project root
    },
    filename: (req, file, cb) => {
      cb(null, uuid() + "-" + file.originalname);
    },
  }),
  limits: { fileSize: maxSize /* bytes */ },
});

const configuredMulterMiddleware = upload.single("image");

module.exports = configuredMulterMiddleware;
