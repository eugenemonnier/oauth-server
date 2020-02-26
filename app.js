// Third-party resources
require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

// Prepare the Express app
const app = express()

// App-level middleware
app.use(express.json())
const basicAuth = require('./middleware/basic-auth')

// models
const User = require('./models/users')

// POST to /signup to sign up a user.
// Payload looks like
// username:String, email:String, password:String, role:String ("user" or "admin")
app.post('/signup', async (req, res) => {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: await bcrypt.hash(req.body.password, 5)
  })
  newUser.save()
    .then(user => {
      const token = newUser.generateToken()
      res.status(200).json({ token })
    })
    .catch(err => res.status(403).json({ error: err.message }))
})

// POST to /signin to verify that a user can sign in
// create a middleware called basicAuth that handles the user validation
app.post('/signin', basicAuth, (req, res) => {
  res.json({ message: 'success' })
})

// Start the app
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}, () => console.log('connected to mongodb'))
app.listen(process.env.PORT || 3000, () => console.log('server up on 3000'))
