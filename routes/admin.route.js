const express = require("express");
const adminController = require("../controllers/admin.controller");

const router = express.Router();

router.get("/admin/tickets", adminController.getAllTickets);

router.get("/admin/ticket/:id", adminController.viewTicket);

router.get("/admin/ticket-type", adminController.getTicketType);

router.get("/admin/ticket-project", adminController.getTicketProject);

router.post("/admin/ticket-type", adminController.postTicketType);

router.post("/admin/ticket-project", adminController.postTicketProject);

router.post("/admin/ticket/:id", adminController.updateTicket);


module.exports = router;