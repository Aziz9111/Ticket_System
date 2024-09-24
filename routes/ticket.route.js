const express = require("express");
const ticketController = require("../controllers/ticket.controller");

const router = express.Router();

router.get("/create_ticket", ticketController.getTicket);

router.post("/create_ticket", ticketController.postTicket);

module.exports = router;