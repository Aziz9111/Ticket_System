const User = require("../models/user.model");

function getLogin(req, res) {
  res.render("auth/login");
}

function getSignup(req, res) {
  res.render("auth/signup");
}

async function signup(req, res, next) {
  const enterdData = {
    name: req.body.username,
    email: req.body.email,
    password: req.body.password,
  };

  const user = new User(req.body.username, req.body.email, req.body.password);
  try {
    await user.createUser();
  } catch (error) {
    next(error);
    return;
  }
  res.redirect("/login");
}

async function login(req, res, next) {
  const user = new User(null, req.body.email, req.body.password);
  try {
    await user.createUser();
  } catch (error) {
    next(error);
    return;
  }
  res.redirect("/");
}

module.exports = {
  getLogin: getLogin,
  getSignup: getSignup,
  signup: signup,
  login: login,
};
