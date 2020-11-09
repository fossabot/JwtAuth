const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const UserModel = require('../models/user')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJWT = require('passport-jwt').ExtractJwt
const keys = require('../helpers/rsaKeys')
const tokenTools = require('../helpers/token')
const check = require('check-types')

const COOKIES  =require('../constants/cookies')

const ActiveDirectory = require('ad-promise')
const DEFAULT_DOMAIN = 'rs.ru'

// Middleware to handle User login (local auth)
passport.use('login_local', new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
}, async (username, password, done) => {
  try {
    const user = await UserModel.findOne({username})
    if (!user) {
      return done(null, false, {message: 'User not found'})
    }
    const validate = await user.isValidPassword(password)
    if (!validate) {
      return done(null, false, {message: 'Wrong Password'})
    }
    return done(null, user, {message: 'Logged in Successfully'})
  } catch(error) {
    done(error)
  }
}))

//Verifying token from user
//extractor cookie with access token
function fromCookieExtractor(req) {
  let token = null
  if (req.cookies && req.cookies[COOKIES.ACCESS_TOKEN_COOKIE_NAME]) {
    token = req.cookies[COOKIES.ACCESS_TOKEN_COOKIE_NAME]
  }
  return token
}

passport.use('jwt', new JwtStrategy({
  //secret we used to sign token
  secretOrKey: keys.id_rsa_pub,
  //we expect the user to send the token as a query parameter with the name 'secret_token'
  jwtFromRequest: ExtractJWT.fromExtractors([ExtractJWT.fromAuthHeaderAsBearerToken(), fromCookieExtractor])
}, (jwt_payload, done) => {
  try {
    if (!jwt_payload) {
      done(new Error('Access denied'))
    }
    if (jwt_payload) {
      if (tokenTools.isExpired(jwt_payload)) {
        return done(null, false, {message: 'Authorization is expired'})
      }
      return done(null, jwt_payload);
    } else {
      return done(null, false);
    }
  } catch (error) {
    done(error)
  }
}))

//AD authorization strategy
const config = {
  url: process.env.DC_URL,
  baseDN: process.env.BASE_DN,
  username: process.env.AD_READER_USERNAME,
  password: process.env.AD_READER_PASSWORD
}

const ad = new ActiveDirectory({...config})
ad.authenticate(config.username, config.password).catch(reason => {
  console.log('ERROR: Invalid Reader Credentials!')
  process.exit(1)
})

async function fetchUserProfile(ad, username) {
  try {
    const res = await ad.findUser(username)
    if (check.object(res)) {
      const {userPrincipalName, sAMAccountName, mail, employeeID, sn, givenName, cn, displayName, description} = res
      return {userPrincipalName, sAMAccountName, mail, employeeID, sn, givenName, cn, displayName, description} || {}
    } else {
      return {}
    }
  } catch (e) {
    return {}
  }
}

passport.use('ad_auth', new LocalStrategy({}, async (username, password, done) => {
  try {
    username = username.split('@').length === 1 ? [username, DEFAULT_DOMAIN].join('@') : username

    //check user in local DB
    const user = await UserModel.findOne({username})
    if (!user) {
      console.log(`User ${username} not found in local DB`)
      return done(null, false, {message: 'Access denied'})
    }

    // if user exists, authorise one in AD
    console.log(`User ${username} is found in local DB`)
    // const ad = new ActiveDirectory({...config})
    const res = process.env.DISABLE_AD_AUTH
      ? true
      : await ad.authenticate(username, password)
    if (!res) {
      console.log(`User ${username}: AD authentication failed`)
      return done(null, false, {message: 'Authentication failed'})
    }

    const profile = process.env.DISABLE_AD_AUTH
      ? {}
      : await fetchUserProfile(ad, username)
    if (!profile) {
      console.log(`User ${username}: Can't find user profile in AD`)
      return done(null, false, {message: "Can't find user profile in AD"})
    }
    const {userPrincipalName, sAMAccountName, mail, employeeID, sn, givenName, cn, displayName, description} = profile


    user.profile = {userPrincipalName, sAMAccountName, mail, employeeID, sn, givenName, cn, displayName, description}
    console.log(`User ${username}: Authorization successful`)
    return done(null, user, {message: 'Authorization successful!'})

  } catch (error) {
    console.log(`User ${username}: Authorization failed`)
    done(null, false, {message: 'Authentication failed'})
  }
}))