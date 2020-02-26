const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const UsersSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, require: true },
  email: { type: String },
  role: { type: String, required: true, default: 'user', enum: ['admin', 'user'] }
})

UsersSchema.methods.generateToken = () => {
  return jwt.sign({ username: this.username, email: this.email }, process.env.SECRET)
}

UsersSchema.statics.authenticateBasic = (username, password) => {
  // do some kind of findOne query with mongoose to get the right user

}

module.exports = mongoose.model('User', UsersSchema)

/*
class Users {
  constructor () {
    // Our db array will look like
    // [
    //   {
    //     username: "emily",
    //     password: <gibberish>,
    //     email: "emily@codefellows.com"
    //   }
    // ]
    this.db = []
    this.SECRET = 'my super secret key'
  }

  // method to list all users in the db
  list () {
    return this.db
  }

  generateToken (user) {
    return jwt.sign(
      { username: user.username, email: user.email },
      this.SECRET
    )
  }

  // Use async for save because we're using bcrypt asynchronously
  // This means that this function must return a value or a promise rejection
  async save (record) {
    // assume that the record passed to this function has all the right pieces
    const { username, email, password } = record
    // if the username is already taken, reject the promise
    if (this.db.find(u => u.username === username)) {
      return Promise.reject(new Error(`username already taken: ${username}`))
    } else {
      const cryptedPassword = await bcrypt.hash(password, 5)
      this.db.push({ username, email, password: cryptedPassword })
      return record
    }
  }

  async authenticateBasic (username, password) {
    const user = (this.db.find(u => u.username === username))
    if (!user) {
      return Promise.reject(new Error('user does not exist'))
    } else {
      const valid = await bcrypt.compare(password, user.password)
      if (valid) {
        return user
      } else {
        return Promise.reject(new Error('wrong password'))
      }
    }
  }
}

module.exports = new Users()
*/
