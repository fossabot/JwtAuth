const express = require('express');
const passport = require('passport')
const jwt = require('jsonwebtoken')
const router = express.Router();
const {setRefreshTokenCookie, getRefreshTokenCookie, refreshTokenName} = require('../helpers/tokenCookiesGetterSetter')
const RefreshTokeModel = require('../models/refresh-token.model')

/* POST sign up */
router.post('/signup', (req, res, next) => {
  passport.authenticate('signup', {session: false}, async (err, user, info) => {
    try {
      if (err) {
        const error = new Error('An Error occurred')
        return next(error)
      }
      if (!user) {
        return res.json({message: info.message})
      }
      req.login(user, {session: false}, async error => {
        if (error) return next(error)
        await user.save()
        return res.json({user})
      })
    } catch (error) {
      return next(error)
    }
  })(req, res, next)
})

/* POST login with local authentication */
// router.post('/login', (req, res, next) => {
//   passport.authenticate('login', {session: false},async (err, user, info) => {
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
//         refreshToken = refreshToken ? refreshToken.refresh(req.ip) : RefreshTokeModel.generateRefreshToken(user, req.ip)
//         await refreshToken.save()
//         setRefreshTokenCookie(res, refreshToken.token)
//         return res.json({accessToken})
//       })
//     } catch(error) {
//       res.status(500).json({message: error})
//     }
//   })(req, res, next)
// })

/* POST login with AD auth */
router.post('/login', (req, res, next) => {
  passport.authenticate('ad_auth', {session: false},async (err, user, info) => {
    try {
      if (err) throw err
      if (!user) return res.status(401).json({message: info.message})
      req.login(user, {session: false}, async (error) => {
        if (error) return next(error)
        //generate access token
        const accessToken = user.generateJwtToken()
        //working with refresh token
        let refreshToken = getRefreshTokenCookie(req)
        if (refreshToken) {
          refreshToken = await RefreshTokeModel.findOne({token: refreshToken})
        } else {
          refreshToken = await RefreshTokeModel.findOne({user: user.id})
        }
        refreshToken = refreshToken ? refreshToken.refresh(req.ip) : RefreshTokeModel.generateRefreshToken(user, req.ip)
        await refreshToken.save()
        setRefreshTokenCookie(res, refreshToken.token)
        return res.json({accessToken})
      })
    } catch(error) {
      res.status(500).json({message: error})
    }
  })(req, res, next)
})

/* POST refreshTokens (update Refresh Token and generate new AccessToken) */
router.get('/refreshToken', async (req, res, next) => {
  if (!getRefreshTokenCookie(req)) return res.status(401).json({message: 'Unauthorized'})
  try {
    const refreshToken = await RefreshTokeModel.findOne({token: getRefreshTokenCookie(req)})
    if (!refreshToken || !refreshToken.isActive) return res.status(401).json({message: 'Unauthorized'})

    await refreshToken.refresh(req.ip).save()

    await refreshToken.populate('user').execPopulate()
    const accessToken = refreshToken.user.generateJwtToken()

    setRefreshTokenCookie(res, refreshToken.token)
    return res.json({accessToken})
  } catch (err) {
    res.status(500).json({message: err})
  }
})

/* GET logout  */
router.get('/logout', async (req, res, next) => {
  if (!getRefreshTokenCookie(req)) return res.status(401).json({message: 'Unauthorized'})

  const refreshToken = await RefreshTokeModel.findOne({token: getRefreshTokenCookie(req)})
  if (!refreshToken || !refreshToken.isActive) return res.status(401).json({message: 'Unauthorized'})
  await refreshToken.revoke(req.ip).save()
  res.clearCookie(refreshTokenName)
  res.json({message: 'Logged out'})
})

module.exports = router;

