const express = require("express");
const ticketController = require("../controllers/ticket.controller");
const imageUploadMiddleware = require("../middleware/image-upload");
const authoriz = require("../middleware/authorized");

const router = express.Router();

router.get("/create_ticket", ticketController.getTicket);

router.post(
  "/create_ticket",
  imageUploadMiddleware,
  ticketController.postTicket
);

router.get("/tickets", authoriz("customer"), ticketController.getAllTickets);

router.get("/ticket/inquiry", ticketController.getOneTicket);

router.get("/ticket-inquiry/:id", ticketController.viewTicketInquiry);

router.post("/ticket/inquiry", ticketController.postOneTicket);

router.get("/ticket/:id", authoriz("customer"), ticketController.viewTicket);

module.exports = router;
