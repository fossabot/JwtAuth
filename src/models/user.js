const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const Schema = mongoose.Schema
const jwt = require('jsonwebtoken')
const keys = require('../helpers/rsaKeys')

const schema = new Schema({
  firstName: {type: String, required: false, default: ''},
  lastName: {type: String, required: false, default: ''},
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  permissions: {
    read: {type: Boolean, default: true},
    create: {type: Boolean, default: false},
    edit: {type: Boolean, default: false},
    delete: {type: Boolean, default: false},
    manageUsers: {type: Boolean, default: false},
  }
})

schema.set('toJSON', {versionKey: false, transform: (doc, ret) => {
  delete ret.password
    delete ret._id
  }})

schema.pre('save', async function(next) {
  const user = this
  user.password = await bcrypt.hash(user.password, 10)
})

schema.methods.isValidPassword = async function(password) {
  const user = this
  return await bcrypt.compare(password, user.password)
}

schema.methods.generateJwtToken = function() {
  return  jwt.sign({iss: 'netcmdb.rs.ru', sub: this.id, permissions: this.permissions}, keys.id_rsa, { algorithm: 'RS256', expiresIn: '15m' })
}

module.exports = mongoose.model('User', schema)
