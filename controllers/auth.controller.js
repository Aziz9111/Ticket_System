const User = require("../models/user.model");
const validation = require("../util/validation");
const axios = require("axios");

function getLogin(req, res) {
  res.render("auth/login", { messages: req.flash() });
}

function getSignup(req, res) {
  res.render("auth/signup", { messages: req.flash() });
}

async function signup(req, res, next) {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const confirmedPassword = req.body.confirmedPassword;
  req.session.formData = { username, email, password, confirmedPassword };
  const recaptchaResponse = req.body["g-recaptcha-response"]; // Token from client
  const secretKey = "6LfaiJsqAAAAACfyK8S8XF__mGdj2zXkzhaPGXyK"; // Replace with your secret key
  // Validate reCAPTCHA
  if (!recaptchaResponse) {
    req.flash("error", "فشل التحقق الرجاء اعادة المحاولة");
    return res.redirect("/signup");
  }
  // Verify reCAPTCHA with Google
  const response = await axios.post(
    "https://www.google.com/recaptcha/api/siteverify",
    null,
    {
      params: {
        secret: secretKey,
        response: recaptchaResponse,
      },
    }
  );

  const { success } = response.data;

  if (!success) {
    req.flash("error", "فشل التحقق الرجاء اعادة المحاولة");
    return res.redirect("/signup");
  }

  if (!validation.validUserData(username, email, password)) {
    req.flash("error", "الرجاء ادخال معلومات صحيحة");
    return res.redirect("/signup");
  }

  if (!validation.passwordConfirmed(password, confirmedPassword)) {
    req.flash("error", "كلمة المرور لا تتطابق");
    return res.redirect("/signup");
  }

  const user = new User(username, email, password);
  try {
    const userExist = await user.getUserEmail(email);

    if (userExist) {
      req.flash("error", "يوجد حساب لهذا الستخدم");
      return res.redirect("/signup");
    }
    await user.createUser();
    req.flash("success", "تم إنشاء الحساب بنجاح");
    delete req.session.formData;
    return res.redirect("/");
  } catch (error) {
    next(error);
    return;
  }
}

async function login(req, res, next) {
  const { email, password } = req.body;
  req.session.formData = { email, password };
  const user = new User(null, email, password);
  let existingUser;

  try {
    existingUser = await user.getUserEmail(email);
  } catch (error) {
    next(error);
    return;
  }

  if (!existingUser) {
    req.flash("error", "كلمة المرور او الايميل غير صحيح");
    return res.redirect("/login");
  }
  const isPasswordValid = await user.comparePassword(existingUser.password);

  if (!isPasswordValid) {
    req.flash("error", "كلمة المرور او الايميل غير صحيح");
    return res.redirect("/login");
  }

  // Setting user data in session
  req.session.user = {
    id: existingUser.id,
    email: existingUser.email,
    role: existingUser.role,
  };

  delete req.session.formData;

  res.redirect("/");
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
