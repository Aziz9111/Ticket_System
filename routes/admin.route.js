const express = require("express");
const adminController = require("../controllers/admin.controller");

const router = express.Router();

router.get("/admin/tickets", adminController.getAllTickets);

router.get("/admin/ticket/:id", adminController.viewTicket);

router.post("/admin/ticket/:id", adminController.updateTicket);


module.exports = router;