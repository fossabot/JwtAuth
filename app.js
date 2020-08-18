const createError = require('http-errors');
const express = require('express');
const path = require('path');
const passport = require('passport')
// const cookieParser = require('cookie-parser');
const logger = require('morgan');

const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const UserModel = require('./models/model')

mongoose
  .connect('mongodb+srv://dmitry:KcMPJCKIE6fnm0Tg@cluster0-524bz.mongodb.net/jwtAuth?retryWrites=true&w=majority', {useNewUrlParser: true})
  .then(result => {
    console.log('DB connected')
  })
  .catch((error) => console.log('DB connection FAILED', error));

require('./auth/auth')

const app = express();

app.use(bodyParser.urlencoded({extended: false}))

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const routes = require('./routes/routes')
const secureRoutes = require('./routes/secure-routes')


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
app.use('/', routes);
// app.use('/users', usersRouter);
//We plugin our jwt strategy as a middleware so only verified users can access this route
app.use('/users', passport.authenticate('jwt', {session: false}), secureRoutes);

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
