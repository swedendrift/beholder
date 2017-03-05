var db = require('./db')

module.exports.handleSignup = (email, password) => {
  // check if email exists
  db.saveUser({
    email: email,
    password: password
  })
  // send welcome email

}
