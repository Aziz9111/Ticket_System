const multer = require("multer");
const uuid = require("uuid").v4;
const path = require("path");

const maxSize = 1000 * 1000 * 2;

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, "../public/Images")); // Save outside project root
    },
    filename: (req, file, cb) => {
      cb(null, uuid() + "-" + file.originalname);
    },
  }),
  limits: { fileSize: maxSize /* bytes */ },
  fileFilter: function (req, file, cb) {
    // Check file type
    const fileTypes = /jpg|jpeg|png/; // Allowed extensions
    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    ); // Check extension
    const mimeType = fileTypes.test(file.mimetype); // Check MIME type

    if (extname && mimeType) {
      cb(null, true);
    } else {
      req.fileValidationError = "فقط .png, .jpg, و .jpeg  هي الصيغ المسومح بها";
      cb(null, false);
    }
  },
});

const configuredMulterMiddleware = upload.single("image");

module.exports = configuredMulterMiddleware;
