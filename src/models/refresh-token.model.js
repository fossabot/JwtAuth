const mongoose = require('mongoose')
const Schema = mongoose.Schema
const randomTokenString = require('../helpers/randomString')
const COOKIES = require('../constants/cookies')

const schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  token: String,
  expires: Date,
  created: { type: Date, default: Date.now },
  createdByIp: String,
  revoked: Date,
  revokedByIp: String,
  previousToken: {type: String, default: ''}
})

schema.virtual('isExpired').get(function () {
  return Date.now() >= this.expires
})

schema.virtual('isActive').get(function () {
  return !this.isExpired && !this.revoked
})

schema.statics.generateRefreshToken = function (user, ipAddress) {
  return new this({
    user: user.id,
    token: randomTokenString(),
    expires: new Date(Date.now() + COOKIES.REFRESH_TOKEN_LIVE_TIME_DAYS*24*60*60*1000),
    createdByIp: ipAddress
  })
}
schema.methods.refresh = function (ipAddress) {
  this.previousToken = this.token
  this.token = randomTokenString()
  this.expires = new Date(Date.now() + COOKIES.REFRESH_TOKEN_LIVE_TIME_DAYS*24*60*60*1000)
  this.createdByIp = ipAddress
  this.revoked = undefined
  this.revokedByIp = undefined
  return this
}
schema.methods.revoke = function (ipAddress) {
  this.revoked = Date.now()
  this.revokedByIp = ipAddress
  return this
}

schema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    // remove these props when object is serialized
    delete ret._id
    delete ret.id
    delete ret.user;
  }
})

module.exports = mongoose.model('RefreshToken', schema)
