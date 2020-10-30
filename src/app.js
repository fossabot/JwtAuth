const createError = require('http-errors');
const express = require('express');
const path = require('path');
const passport = require('passport')
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors')
const requestIp = require('request-ip');


const mongoose = require('mongoose')
const bodyParser = require('body-parser')

const keys = require('./helpers/rsaKeys')
if (! keys) process.exit(1)

if (process.env.NODE_ENV !== 'production') {
  const dotenv = require('dotenv')
  dotenv.config()
  const {
    MONGO_DB_HOST,
    NODE_ENV,
    DC_URL,
    BASE_DN,
    REFRESH_TOKEN_COOKIE_HTTPONLY,
    REFRESH_TOKEN_IN_BODY,
    ACCESS_TOKEN_SET_COOKIE,
    ACCESS_TOKEN_LIVE_TIME_MINUTES,
    ACCESS_TOKEN_COOKIE_NAME,
    REFRESH_TOKEN_LIVE_TIME_DAYS,
    REFRESH_TOKEN_COOKIE_NAME,
    DISABLE_AD_AUTH
  } = process.env
  console.log('Non production mode. Env variables: ', {
    MONGO_DB_HOST,
    NODE_ENV,
    DC_URL,
    BASE_DN,
    REFRESH_TOKEN_COOKIE_HTTPONLY,
    REFRESH_TOKEN_IN_BODY,
    ACCESS_TOKEN_SET_COOKIE,
    ACCESS_TOKEN_LIVE_TIME_MINUTES,
    ACCESS_TOKEN_COOKIE_NAME,
    REFRESH_TOKEN_LIVE_TIME_DAYS,
    REFRESH_TOKEN_COOKIE_NAME,
    DISABLE_AD_AUTH
  })
}

process.on('exit', (code) => {
  console.log(`Program exit with code ${code}`)
})
const MONGO_DB_HOST =  process.env.MONGO_DB_HOST || 'mongo'

const mongo_uri = `mongodb://root:example@${MONGO_DB_HOST}:27017/jwtAuth?authSource=admin`
mongoose.connect(mongo_uri, {useNewUrlParser: true})
const db = mongoose.connection
db.on('error', error => {
  console.log(`Connection Error: ${error}`)
  setTimeout(() => mongoose.connect(mongo_uri, {useNewUrlParser: true}), 1000)
})
db.once('open', function() {
  console.log('DB connected')
  // iniDb().then(console.log('DB Created!!!!!'))
})

require('./auth/auth')

const app = express();

app.use(bodyParser.urlencoded({extended: false}))
// app.use(passport.initialize())
app.use(cors({origin: true, credentials: true}))
app.use(requestIp.mw())


const routes = require('./routes/routes')

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
app.use('/auth', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
