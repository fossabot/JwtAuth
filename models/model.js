const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const Schema = mongoose.Schema

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true
  }
})

UserSchema.pre('save', async function(next) {
  const user = this
  console.log('before bcrypt', {user})
  const hash = await bcrypt.hash(user.password, 10)
  user.password = hash
  console.log('after bcrypt', {user})
  next()
})

UserSchema.methods.isValidPassword = async function(password) {
  const user = this
  const compare = await bcrypt.compare(password, user.password)
  console.log('methods.isValidPassword', compare)
  return compare
}

const UserModel = mongoose.model('user', UserSchema)
module.exports = UserModel