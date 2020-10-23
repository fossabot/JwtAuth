const REFRESH_TOKEN_COOKIE_NAME = '_rtk'

function setRefreshTokenCookie(res, token)
{
  // create http only cookie with refresh token that expires in 7 days
  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + 7*24*60*60*1000),
  };
  res.cookie(REFRESH_TOKEN_COOKIE_NAME, token, cookieOptions);
}
function getRefreshTokenCookie(req) {
  return req.cookies[REFRESH_TOKEN_COOKIE_NAME]
}

exports.setRefreshTokenCookie = setRefreshTokenCookie
exports.getRefreshTokenCookie = getRefreshTokenCookie
exports.refreshTokenName = REFRESH_TOKEN_COOKIE_NAME