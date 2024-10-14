const express = require("express");
const agentController = require("../controllers/agent.controller");

const router = express.Router();

router.get("/agent/tickets", agentController.getAllTickets);

router.get("/agent/ticket/:id", agentController.viewTicket);


module.exports = router;