const User = require("../models/user.model");
const validation = require("../util/validation");

function getLogin(req, res) {
  res.render("auth/login", {messages: req.flash()});
}

function getSignup(req, res) {
  
  res.render("auth/signup", {messages: req.flash()});
}

async function signup(req, res, next) {
  if (!validation.validUserData(
      req.body.username,
      req.body.email,
      req.body.password,
    )) {
    req.flash("error", "Please Enter Valid Data");
    return res.redirect("/signup"); 
  }

  if (!validation.passwordConfirmed(req.body.password, req.body.confirmedPassword)) {
    req.flash("error", "Password Doesn't Match");
    return res.redirect("/signup"); 
  }

  const user = new User(req.body.username, req.body.email, req.body.password);
  try {
    const userExist = await user.getUserEmail(req.body.email);

    if (userExist) {
      req.flash("error", "User Exists");
      return res.redirect("/signup"); 
    }
    await user.createUser();
    req.flash("success", "Account Created Successfully");

    return res.redirect("/");

  } catch (error) {
    next(error);
    return;
  }
}

async function login(req, res, next) {
  const { email, password } = req.body;
  const user = new User(null, email, password);
  let existingUser;

  try {
    existingUser = await user.getUserEmail(email);
  } catch (error) {
    next(error);
    return;
  }

  if (!existingUser) {
    req.flash("error", "Invalid Email or Password");
    return res.redirect("/login");
  }
  const isPasswordValid = await user.comparePassword(existingUser.password);
  
  if (!isPasswordValid) {
    req.flash("error", "Invalid Email or Password")
    return res.redirect("/login")
  }

    // Setting user data in session
    req.session.user = {
      id: existingUser.id,
      email: existingUser.email,
      role: existingUser.role, 
    };

  res.redirect("/")
}

function logout(req, res) {
  req.session.user = null;
  res.redirect("/login");
}

module.exports = {
  getLogin: getLogin,
  getSignup: getSignup,
  signup: signup,
  login: login,
  logout: logout,
};
