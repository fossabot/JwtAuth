function isExpired(jwt_payload) {
  return jwt_payload && jwt_payload.exp && jwt_payload.exp * 1000 - (new Date()).getTime() < 0
}

exports.isExpired = isExpired