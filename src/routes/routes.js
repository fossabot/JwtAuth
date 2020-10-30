const express = require('express');
const passport = require('passport')
const jwt = require('jsonwebtoken')
const router = express.Router();
const {setRefreshTokenCookie, getRefreshTokenCookie, refreshTokenName, setAccessTokenCookie} = require('../helpers/tokenCookiesGetterSetter')
const COOKIES = require('../constants/cookies')
const RefreshTokeModel = require('../models/refresh-token.model')
const UserModel = require('../models/user')

/* POST /sign up */
router.post('/signup', (req, res, next) => {
  passport.authenticate('jwt', {session: false}, async (err, user, info) => {
    //if users DB is empty - inject virtual user to allow first user creation
    const counter = await UserModel.countDocuments()
    if (counter === 0) return next()

    if (err) {
      const error = new Error('An Error occurred')
      return next(error)
    }
    if (!user) {
      return res.status(401).json({message: info.message})
    }
    // return res.json({user})
    req.login(user, {session: false})
    next()
  })(req, res, next)
},
  async (req, res, next) => {
    const {permissions} = req.user
    if (!permissions.manageUsers) {
      return res.status(403).json({message: "Denied access to manage users"})
    }
    try {
      const {username, read, create, edit, remove, manageUsers} = req.body
      const userExists = await UserModel.exists({username})
      if (userExists) {
        return res.status(409).json({message: `User ${username} already exists`})
      }
      const newUser = new UserModel({username, permissions: {read, create, edit, remove, manageUsers}})
      await newUser.save()
      res.json(newUser)
    } catch (error) {
      next(error)
    }
  }
)

/* POST login with AD auth */
router.post('/login', (req, res, next) => {
  passport.authenticate('ad_auth', {session: false},async (err, user, info) => {
    try {
      if (err) throw err
      if (!user) {
        return res.status(401).json({message: info.message})
      }
      req.login(user, {session: false}, async (error) => {
        if (error) return next(error)
        //generate access token
        const accessToken = user.generateJwtToken()
        //working with refresh token
        let refreshToken = getRefreshTokenCookie(req)
        console.log('Route: POST:/login, refreshCookie: ', refreshToken)
        if (refreshToken) {
          refreshToken = await RefreshTokeModel.findOne({token: refreshToken})
          // console.log('find by ref token', {refreshToken})
        }
        if (!refreshToken) {
          refreshToken = await RefreshTokeModel.findOne({user: user.id})
          // console.log('find by user.id', {userId: user.id, refreshToken})
        }
        // there is no matter if valid token or not (because user already supply valid username and password)
        // all we need to know - update or generate new token!
        refreshToken = refreshToken ? refreshToken.refresh(req.clientIp) : RefreshTokeModel.generateRefreshToken(user, req.clientIp)
        await refreshToken.save()
        setRefreshTokenCookie(res, refreshToken.token)
        setAccessTokenCookie(res, accessToken)
        return process.env.REFRESH_TOKEN_IN_BODY ? res.json({accessToken, refreshToken: refreshToken.token}) : res.json({accessToken})
      })
    } catch(error) {
      res.status(500).json({message: error})
    }
  })(req, res, next)
})

/* POST refreshTokens (update Refresh Token and generate new AccessToken) */
router.get('/refreshToken', async (req, res, next) => {
  console.log('Route: POST:/refreshToken, IP: ', req.clientIp)
  const refreshCookie = getRefreshTokenCookie(req)
  if (!refreshCookie) {
    console.log(`Route: POST:/refreshToken, IP: ${req.clientIp}. Refresh cookie isn't supplied`)
    return res.status(401).json({message: 'Unauthorized'})
  }
  try {
    const refreshToken = await RefreshTokeModel.findOne({token: refreshCookie})
    if (!refreshToken || !refreshToken.isActive) {
      res.clearCookie(COOKIES.REFRESH_TOKEN_COOKIE_NAME)
      res.clearCookie(COOKIES.ACCESS_TOKEN_COOKIE_NAME)
      console.log(`Route: POST:/refreshToken, IP: ${req.clientIp}. Refresh cookie ${refreshCookie} was not found in DB`)
      return res.status(401).json({message: 'Unauthorized'})
    }
    await refreshToken.refresh(req.clientIp).save()
    await refreshToken.populate('user').execPopulate()
    const accessToken = refreshToken.user.generateJwtToken()

    setRefreshTokenCookie(res, refreshToken.token)
    setAccessTokenCookie(res, accessToken)
    console.log(`Route: POST:/refreshToken, IP: ${req.clientIp}. Successful`)
    return process.env.REFRESH_TOKEN_IN_BODY ? res.json({accessToken, refreshToken: refreshToken.token}) : res.json({accessToken})
  } catch (err) {
    console.log(`Route: POST:/refreshToken, IP: ${req.clientIp}. Unexpected error. ${err.message}`)
    res.status(500).json({message: 'Unexpected error'})
  }
})

/* GET logout  */
router.get('/logout', async (req, res, next) => {
  if (!getRefreshTokenCookie(req)) return res.status(401).json({message: 'Unauthorized'})

  const refreshToken = await RefreshTokeModel.findOne({token: getRefreshTokenCookie(req)})
  if (!refreshToken || !refreshToken.isActive) {
    res.clearCookie(COOKIES.REFRESH_TOKEN_COOKIE_NAME)
    res.clearCookie(COOKIES.ACCESS_TOKEN_COOKIE_NAME)
    return res.status(401).json({message: 'Unauthorized'})
  }
  await refreshToken.revoke(req.clientIp).save()
  res.clearCookie(COOKIES.REFRESH_TOKEN_COOKIE_NAME)
  res.clearCookie(COOKIES.ACCESS_TOKEN_COOKIE_NAME)
  console.log(`Route: GET:/logout, IP: ${req.clientIp}. Successful`)
  res.json({message: 'Logged out'})
})

//=======Examples=============
/* GET /sign up. It's only examples! These routes are not used in service! */
router.get('/signup_example_1', (req, res,next) => {
    passport.authenticate('jwt', {session: false}, (err, user, info) => {
      if (err) {
        const error = new Error('An Error occurred')
        return next(error)
      }
      if (!user) {
        return res.status(401).json({message: info.message})
      }
      // return res.json({user})
      req.login(user, {session: false})
      next()
    })(req, res, next)
  },
  (req, res, next) => {
    res.send(req.user)
  }
)
router.get('/signup_example_2', passport.authenticate('jwt', {session: false}),
  (req, res, next) => {
    res.json({result: req.user})
  }
)
//===== end of examples====


/* POST login with local authentication */
// router.post('/login', (req, res, next) => {
//   passport.authenticate('login_local', {session: false},async (err, user, info) => {
//     try {
//       if (err) throw err
//       if (!user) return res.status(401).json({message: info.message})
//       req.login(user, {session: false}, async (error) => {
//         if (error) return next(error)
//         //generate access token
//         const accessToken = user.generateJwtToken()
//         //working with refresh token
//         let refreshToken = getRefreshTokenCookie(req)
//         if (refreshToken) {
//           refreshToken = await RefreshTokeModel.findOne({token: refreshToken})
//         } else {
//           refreshToken = await RefreshTokeModel.findOne({user: user.id})
//         }
//         refreshToken = refreshToken ? refreshToken.refresh(req.clientIp) : RefreshTokeModel.generateRefreshToken(user, req.clientIp)
//         await refreshToken.save()
//         setRefreshTokenCookie(res, refreshToken.token)
//         return res.json({accessToken})
//       })
//     } catch(error) {
//       res.status(500).json({message: error})
//     }
//   })(req, res, next)
// })

module.exports = router;

