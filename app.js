const express = require("express");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");

const authRoute = require("./routes/auth.route");
const ticketRoute = require("./routes/ticket.route");
const baseRoute = require("./routes/base.route");
const adminRoute = require("./routes/admin.route");
const agentRoute = require("./routes/agent.route");
const sessionStoreConfig = require("./config/session");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true })); // Parse incoming request bodies
app.use(express.static("public")); // Serve static files (e.g. CSS files)

const sessionConfig = sessionStoreConfig();

app.use(session(sessionConfig));
app.use(flash());

app.use((req, res, next) => {
  res.locals.user = req.session.user;
  res.locals.formData = req.session.formData;
  next();
});

app.use("/images", express.static(path.join(__dirname, "public/Images")));
app.use(baseRoute);
app.use(authRoute);
app.use(ticketRoute);
app.use(adminRoute);
app.use(agentRoute);

app.use(function (error, req, res, next) {
  // Default error handling function
  // Will become active whenever any route / middleware crashes
  console.log(error);
  res.status(500).render("500");
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
