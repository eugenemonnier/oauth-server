const base64 = require('base-64')
const User = require('../models/users')

function basicAuth (req, res, next) {
  // When you do basic auth, an HTTP header gets set in your request
  // req.headers.authorization will look like "Basic hjoweubnvowsnv"

  // If we don't have an authorization header:
  if (!req.headers.authorization) {
    next(new Error('Invalid login'))
  }

  // Pull out the encoded part (the gibberish) by splitting the header
  // into an array and popping off the second element
  const basic = req.headers.authorization.split(' ').pop()
  // "basic" will decode to "username:password"
  const decoded = base64.decode(basic)
  // get username and password by splitting on the ":" character
  const [username, password] = decoded.split(':')

  return User.authenticateBasic(username, password)
    .then(_validate)

  function _validate (user) {
    if (user) {
      req.user = user
      req.token = user.generateToken()
      next()
    } else {
      next(new Error('you screwed it up'))
    }
  }
}

module.exports = basicAuth
