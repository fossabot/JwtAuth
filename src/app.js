const createError = require('http-errors');
const express = require('express');
const path = require('path');
const passport = require('passport')
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const mongoose = require('mongoose')
const bodyParser = require('body-parser')

const keys = require('./helpers/rsaKeys')
if (! keys) process.exit(1)

process.on('exit', (code) => {
  console.log(`Program exit with code ${code}`)
})
const MONGO_DB_HOST = process.env.MONGO_DB_HOST || '127.0.0.1'

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
app.use('/', routes);

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
