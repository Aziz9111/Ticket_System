const MysqlStore = require("express-mysql-session");
const dotenv = require("dotenv");
const session = require("express-session");
dotenv.config();

function sessionStore() {
  const MySQLStore = new MysqlStore(session);
  const store = new MySQLStore({
    host: process.env.MYSQL_HOST,
    database: process.env.MYSQL_DB,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    schema: {
      tableName: "session",
      columnNames: {
        session_id: "session_id",
        expires: "expires",
        data: "data",
      },
    },
  });
  return store;
}

function sessionConfig() {
  return {
    secret: process.env.MY_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore(),
    cookie: {
      maxAge: 1000 * 60 * 60 * 3,
    },
  };
}

module.exports = sessionConfig;
