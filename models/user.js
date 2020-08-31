const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const Schema = mongoose.Schema

const schema = new Schema({
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true},
})

schema.pre('save', async function(next) {
  const user = this
  user.password = await bcrypt.hash(user.password, 10)
})

schema.methods.isValidPassword = async function(password) {
  const user = this
  return await bcrypt.compare(password, user.password)
}

module.exports = mongoose.model('User', schema)
