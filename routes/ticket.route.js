const express = require("express");
const ticketController = require("../controllers/ticket.controller");
const imageUploadMiddleware = require("../middleware/image-upload")

const router = express.Router();

router.get("/create_ticket", ticketController.getTicket);

router.post("/create_ticket", imageUploadMiddleware, ticketController.postTicket);

router.get("/tickets", ticketController.getAllTickets);

router.get("/ticket/inquiry", ticketController.getOneTicket);

router.post("/ticket/inquiry", ticketController.postOneTicket);

router.get("/ticket/:id", ticketController.viewTicket);


module.exports = router;