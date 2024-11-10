const express = require("express");
const adminController = require("../controllers/admin.controller");
const imageUploadMiddleware = require("../middleware/image-upload");
const authoriz = require("../middleware/authorized");

const router = express.Router();

router.get("/admin/tickets", authoriz("admin"), adminController.getAllTickets);

router.get("/admin/ticket/:id", authoriz("admin"), adminController.viewTicket);

router.get(
  "/admin/ticket-type",
  authoriz("admin"),
  adminController.getTicketType
);

router.get(
  "/admin/ticket-project",
  authoriz("admin"),
  adminController.getTicketProject
);

router.post(
  "/admin/ticket-type",
  authoriz("admin"),
  adminController.postTicketType
);

router.get(
  "/admin/ticket-status",
  authoriz("admin"),
  adminController.getTicketStatus
);

router.post(
  "/admin/ticket-status",
  authoriz("admin"),
  adminController.postTicketStatus
);

router.post(
  "/admin/ticket-project",
  authoriz("admin"),
  adminController.postTicketProject
);

router.post(
  "/admin/ticket/:id",
  authoriz("admin"),
  adminController.updateTicket
);

router.get(
  "/admin/assign-ticket/:id",
  authoriz("admin"),
  adminController.getAssignTicket
);

router.post(
  "/admin/assign-ticket/:id",
  authoriz("admin"),
  imageUploadMiddleware,
  adminController.postAssignTicket
);

module.exports = router;
