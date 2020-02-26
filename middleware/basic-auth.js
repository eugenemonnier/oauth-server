const base64 = require('base-64')
const users = require('../models/users')

function basicAuth (req, res, next) {
  // When you do basic auth, an HTTP header gets set in your request
  // req.headers.authorization will look like "Basic hjoweubnvowsnv"

  // If we don't have an authorization header:
  if (!req.headers.authorization) {
    next('Invalid Login')
    return
  }

  // Pull out the encoded part (the gibberish) by splitting the header
  // into an array and popping off the second element
  const basic = req.headers.authorization.split(' ').pop()
  // "basic" will decode to "username:password"
  const decoded = base64.decode(basic)
  // get username and password by splitting on the ":" character
  const [username, password] = decoded.split(':')

  // now that we know the username and password, ask if the user is ok
  users.authenticateBasic(username, password)
    .then(() => {
      next()
    })
    .catch(err => {
      next(err.message)
    })
}

module.exports = basicAuth
