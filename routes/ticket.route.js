const express = require("express");
const ticketController = require("../controllers/ticket.controller");
const imageUploadMiddleware = require("../middleware/image-upload")

const router = express.Router();

router.get("/create_ticket", ticketController.getTicket);

router.post("/create_ticket", imageUploadMiddleware, ticketController.postTicket);

router.get("/tickets", ticketController.getAllTickets);


module.exports = router;