/* function isEmpty(value) {
  return !value || value.trim() === "";
}
 */
function userValidCredentials(name, email, password) {
  return (
    name && !/[!@#<>~]/.test(name) && email && email.includes("@") && password && password.trim().length >= 6 
  );
}

function validUserData(name, email, password) {
  return(
  userValidCredentials(name, email, password) /* &&
  !isEmpty(name) */
  );
}

function passwordConfirmed(password, confirmedPassword) {
  return password === confirmedPassword;
}

module.exports = {
  validUserData: validUserData,
  passwordConfirmed: passwordConfirmed, 
}