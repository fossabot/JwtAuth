const COOKIES = require('../constants/cookies')

function setRefreshTokenCookie(res, token)
{
  // create http only cookie with refresh token that expires in 7 days
  const cookieOptions = {
    httpOnly: !!COOKIES.REFRESH_TOKEN_COOKIE_HTTPONLY,
    expires: new Date(Date.now() + COOKIES.REFRESH_TOKEN_LIVE_TIME_DAYS*24*60*60*1000),
  };
  res.cookie(COOKIES.REFRESH_TOKEN_COOKIE_NAME, token, cookieOptions);
}
function getRefreshTokenCookie(req) {
  return req.cookies[COOKIES.REFRESH_TOKEN_COOKIE_NAME]
}

function setAccessTokenCookie(res, token)
{
  if (!COOKIES.ACCESS_TOKEN_SET_COOKIE) return
  // create http only cookie with refresh token that expires in 7 days
  const cookieOptions = {
    httpOnly: false,
    expires: new Date(Date.now() + COOKIES.ACCESS_TOKEN_LIVE_TIME_MINUTES*60*1000),
  };
  res.cookie(COOKIES.ACCESS_TOKEN_COOKIE_NAME, token, cookieOptions);
}

exports.setRefreshTokenCookie = setRefreshTokenCookie
exports.getRefreshTokenCookie = getRefreshTokenCookie
exports.refreshTokenName = COOKIES.REFRESH_TOKEN_COOKIE_NAME
exports.setAccessTokenCookie = setAccessTokenCookie