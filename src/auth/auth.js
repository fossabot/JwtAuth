const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const UserModel = require('../models/user')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJWT = require('passport-jwt').ExtractJwt
const keys = require('../helpers/rsaKeys')

//Handle user registration
passport.use('signup', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true,
}, async (req, email, password, done) => {
  try {
    // save the information provided by the user to DB
    const {firstName, lastName} = req
    const user = await UserModel.countDocuments({email})
    if (user) {
      return done(null, false, {message: 'Already registered'})
    }
    const newUser = new UserModel({email, password, firstName, lastName})
    //send user info to the next middleware
    return done(null, newUser)
  } catch (error) {
    done(error)
  }
}))

// Middleware to handle User login
passport.use('login', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
}, async (email, password, done) => {
  try {
    const user = await UserModel.findOne({email})
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
//TODO check existing refreshToken

//Verifying token from user
passport.use(new JwtStrategy({
  //secret we used to sign token
  secretOrKey: 'top_secret',
  //we expect the user to send the token as a query parameter with the name 'secret_token'
  jwtFromRequest: ExtractJWT.fromUrlQueryParameter('secret_token')
}, async (token, done) => {
  try {
    //Pass the user details to next middleware
    return done(null, token.user)
  } catch(error) {
    done(error)
  }
}))
