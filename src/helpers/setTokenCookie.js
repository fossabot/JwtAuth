function setTokenCookie(res, token)
{
  // create http only cookie with refresh token that expires in 7 days
  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + 7*24*60*60*1000),
  };
  res.cookie('refreshToken', token, cookieOptions);
}

module.exports = setTokenCookie