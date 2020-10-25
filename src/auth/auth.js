const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const UserModel = require('../models/user')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJWT = require('passport-jwt').ExtractJwt
const keys = require('../helpers/rsaKeys')
const tokenTools = require('../helpers/token')

const COOKIES  =require('../constants/cookies')

const ActiveDirectory = require('ad-promise')
const DEFAULT_DOMAIN = 'rs.ru'

//Handle user registration
passport.use('signup', new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
  passReqToCallback: true,
}, async (req, username, password, done) => {
  try {
    // save the information provided by the user to DB
    const {firstName, lastName} = req
    const user = await UserModel.countDocuments({username})
    if (user) {
      return done(null, false, {message: 'Already registered'})
    }
    const newUser = new UserModel({username, password, firstName, lastName})
    //send user info to the next middleware
    return done(null, newUser)
  } catch (error) {
    done(error)
  }
}))

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
  url: 'ldap://rs.ru',
  baseDN: 'dc=rs,dc=ru',
}

passport.use('ad_auth', new LocalStrategy({}, async (username, password, done) => {
  try {
    username = username.split('@').length === 1 ? [username, DEFAULT_DOMAIN].join('@') : username
    const ad = new ActiveDirectory({...config, username, password})
    const res = await ad.authenticate(username, password)
    if (!res) return done(null, false, {message: 'Authentication failed'})

    const profile = await ad.findUser(username)
    if (!profile) return done(null, false, {message: "Can't find user profile in AD"})
    const {userPrincipalName, sAMAccountName, mail, employeeID, sn, givenName, cn, displayName, description} = profile

    const user = await UserModel.findOne({username})
    if (!user) return done(null, false, {message: 'Access denied'})
    user.profile = {userPrincipalName, sAMAccountName, mail, employeeID, sn, givenName, cn, displayName, description}
    return done(null, user, {message: 'Authorization successful!'})

  } catch (error) {
    done(null, false, {message: 'Authentication failed'})
  }
}))