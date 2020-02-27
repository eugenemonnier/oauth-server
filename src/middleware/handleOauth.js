const superagent = require('superagent')
const { google } = require('googleapis')
const User = require('../models/users')
const jwt = require('jsonwebtoken')

const SECRET = process.env.SECRET || 'changeme'

const TOKEN_SERVER_URL = 'https://oauth2.googleapis.com/token'
const CLIENT_ID = '658078245679-9challjqn1drnapsmb4q2n27amg1u5sm.apps.googleusercontent.com'
const CLIENT_SECRET = process.env.GOOGLE_APP_CLIENT_SECRET
const API_SERVER = 'http://localhost:3000/oauth'

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  API_SERVER
)

const scopes = [
  'profile',
  'email',
  'openid'
]

const url = oauth2Client.generateAuthUrl({
  access_type: 'online',
  scope: scopes
})

async function exchangeCodeForToken (code) {
  const response = await superagent
    .post(TOKEN_SERVER_URL)
    .send({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: API_SERVER
    })
  // console.log(response.body)
  return response.body
}

// async function getRemoteUserName (token) {
//   const response = await superagent
//     .get(REMOTE_API_ENDPOINT)
//     .set('Authorization', `token ${token}`)
//     .set('user-agent', 'express-app')
//   // console.log(response)
//   return response.body
// }

async function getUser (username) {
  // do we already have the user created?
  const potentialUser = await User.findOne({ username })
  let user
  if (!potentialUser) {
    // create the user
    const newUser = new User({ username })
    user = await newUser.save()
  } else {
    user = potentialUser
  }
  const token = user.generateToken()
  return [user, token]
}

async function handleOauth (req, res, next) {
  // console.log(req.query)
  try {
    const { code } = req.query
    console.log('(1) CODE:', code)
    const remoteToken = await exchangeCodeForToken(req.query.code)
    const userInfo = jwt.decode(remoteToken.id_token, { complete: true })
    console.log('the user is ', userInfo)
    console.log('(2) ACCESS TOKEN:', remoteToken.access_token)
    const remoteUsername = userInfo.payload.email
    console.log('(3) GOOGLE USER:', remoteUsername)
    const [user, token] = await getUser(remoteUsername)
    req.user = user
    req.token = token
    console.log('(4a) LOCAL USER:', user)
    console.log('(4b) USERS TOKEN:', token)
    next()
  } catch (err) {
    next(`ERROR: ${err.message}`)
  }
}

module.exports = handleOauth
