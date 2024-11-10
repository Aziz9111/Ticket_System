const express = require("express");
const agentController = require("../controllers/agent.controller");
const authoriz = require("../middleware/authorized");

const router = express.Router();

router.get("/agent/tickets", authoriz("agent"), agentController.getAllTickets);

router.get("/agent/ticket/:id", authoriz("agent"), agentController.viewTicket);

router.post("/agent/ticket/:id", authoriz("agent"), agentController.updateTicket);

router.get("/agent/send-ticket/:id", authoriz("agent"), agentController.getSendTicket);

router.post("/agent/send-ticket/:id", authoriz("agent"), agentController.postSendTicket);


module.exports = router;