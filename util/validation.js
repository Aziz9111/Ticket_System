function isEmpty(value) {
  return !value || value.trim() === "";
}

function userValidCredentials(email, password) {
  return (
    email && email.includes("@") && password && password.trim().length >= 6
  );
}

function validUserData(name, email, password) {
  return(
  userValidCredentials(email, password) &&
  !isEmpty(name)
  );
}

function passwordConfirmed(password, confirmedPassword) {
  return password === confirmedPassword;
}

function emailConfirmed(email, confirmedEmail) {
  return email === confirmedEmail;
}

module.exports = {
  validUserData: validUserData,
  passwordConfirmed: passwordConfirmed, 
  emailConfirmed: emailConfirmed
}