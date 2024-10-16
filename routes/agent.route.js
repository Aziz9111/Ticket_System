const express = require("express");
const agentController = require("../controllers/agent.controller");

const router = express.Router();

router.get("/agent/tickets", agentController.getAllTickets);

router.get("/agent/ticket/:id", agentController.viewTicket);

router.post("/agent/ticket/:id", agentController.updateTicket);

router.get("/agent/send-ticket/:id", agentController.getSendTicket);

router.post("/agent/send-ticket/:id", agentController.postSendTicket);


module.exports = router;