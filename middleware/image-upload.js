const multer = require("multer");
const uuid = require("uuid");

const maxSize = 1000 * 1000 * 2;

const upload = multer({
    storage: multer.diskStorage({
        destination:"ticket-data/images",
        filename: (req, file, cb) => {
            cb(null, uuid() + "-" + file.originalname);
        }
    }), 
    limits: { fileSize: maxSize /* bytes */ }
});

const configuredMulterMiddleware = upload.single("image");

module.exports = configuredMulterMiddleware;