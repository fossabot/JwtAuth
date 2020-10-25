const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const Schema = mongoose.Schema
const jwt = require('jsonwebtoken')
const keys = require('../helpers/rsaKeys')
const COOKIES = require('../constants/cookies')

const schema = new Schema({
  username: {type: String, required: true, unique: true},
  password: {type: String, default: ''},
  permissions: {
    read: {type: Boolean, default: true},
    create: {type: Boolean, default: false},
    edit: {type: Boolean, default: false},
    remove: {type: Boolean, default: false},
    manageUsers: {type: Boolean, default: false},
  }
})

schema.set('toJSON', {versionKey: false, virtuals: true, transform: (doc, ret) => {
    delete ret.password
    delete ret._id
    delete ret.id
    return ret
  }})

schema.set('toObject', {versionKey: false, virtuals: true, transform: (doc, ret) => {
    delete ret.password
    delete ret._id
    delete ret.id
    return ret
  }})

schema.pre('save', async function(next) {
  const user = this
  if (user.password) user.password = await bcrypt.hash(user.password, 10)
})

schema.methods.isValidPassword = async function(password) {
  const user = this
  return await bcrypt.compare(password, user.password)
}

schema.virtual('profile')
  .get(function () {return this._profile})
  .set(function (profile) {this._profile = profile})

schema.methods.generateJwtToken = function() {
  return  jwt.sign({iss: 'netcmdb.rs.ru', sub: this.id, permissions: this.permissions, profile: this.profile}, keys.id_rsa, { algorithm: 'RS256', expiresIn: COOKIES.ACCESS_TOKEN_LIVE_TIME_MINUTES * 60 })
}

module.exports = mongoose.model('User', schema)
