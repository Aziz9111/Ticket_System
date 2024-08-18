const express = require("express");
const authController = require("../controllers/auth.controller");

const router = express.Router();

router.get("/login", authController.getLogin);

router.get("/signup", authController.getSignup);

router.post("/signup", authController.signup);

module.exports = router;
