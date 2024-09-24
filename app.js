const express = require("express");
const path = require("path");
const session = require("express-session");

const authRoute = require("./routes/auth.route");
const ticketRoute = require("./routes/ticket.route")
const sessionStoreConfig = require("./config/session")

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true })); // Parse incoming request bodies
app.use(express.static("public")); // Serve static files (e.g. CSS files)

const sessionConfig = sessionStoreConfig();

app.use(session(sessionConfig))

app.use(authRoute);
app.use(ticketRoute);

app.use(function (error, req, res, next) {
  // Default error handling function
  // Will become active whenever any route / middleware crashes
  console.log(error);
  res.status(500).render("500");
});

app.listen(3000);
