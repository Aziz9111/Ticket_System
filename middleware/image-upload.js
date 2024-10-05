const multer = require("multer");
const uuid = require("uuid");

const upload = multer({
    storage: multer.diskStorage({
        destination:"ticket-data/images",
        filename: (req, file, cb) => {
            cb(null, uuid() + "-" + file.originalname);
        }
    })
});

const configuredMulterMiddleware = upload.single("image");

module.exports = configuredMulterMiddleware;