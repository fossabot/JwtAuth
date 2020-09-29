const crypto = require('crypto')

module.exports = function() {
  return crypto.randomBytes(40).toString('hex')
}