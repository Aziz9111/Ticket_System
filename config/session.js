const sessionConfig = require("express-session");
const MysqlStore = require("express-mysql2-session");
const dotenv = require("dotenv");
dotenv.config();

sessionConfig({
  secret: process.env.MY_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 12,
  },
});

module.exports = {
  sessionConfig: sessionConfig,
};
