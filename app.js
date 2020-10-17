"use strict";
const express      = require('express');
const path         = require('path');
const favicon      = require('serve-favicon');
const logger       = require('morgan');
const cookieParser = require('cookie-parser');
const session      = require('express-session');
const RedisStore   = require('connect-redis')(session);
const bodyParser   = require('body-parser');
const flash        = require('connect-flash');
const env          = process.env.NODE_ENV || 'development';
const config       = require(__dirname + '/config/config.json')[env];
const models       = require('./models');
const helpers      = require('./lib/helpers');
const passport     = require('./setup/authentication')
const app          = express();

/**
 * view engine setup
 */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
if (app.get('env') === 'development') {
  app.locals.pretty = true;
}

/**
 * basic app setup
 */
app.use((req,res,next) => {
  req.connection.setNoDelay(true);
  next();
});
app.use(favicon(__dirname + '/public/favicon.ico'));
if (!app.get('env') == 'test') {
  app.use(logger('dev'));
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  store: new RedisStore({
    host: config.redis.host,
    port: config.redis.port,
    db: config.redis.index
  }),
  secret: config.secret,
  resave: false,
  saveUninitialized: false
}));
app.use(flash())
app.use(passport.initialize());
app.use(passport.session());
app.locals.helpers = helpers;


/**
 * route setup
 */
app.use('/login', require('./routes/login'));
app.use('/signup', require('./routes/signup'));
app.use('/logout', require('./routes/logout'));
// only grant authenticated users access to site
app.use('/', (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.preloginUrl = req.originalUrl;
    return res.redirect('/login')
  } else {
    next();
  }
});
app.use(express.static('public'));
app.use('/', require('./routes/home'));
app.use('/account', require('./routes/account'));
app.use('/avatar', express.static('uploads/avatar'));
app.use('/user', require('./routes/user'));
app.use('/log', require('./routes/log'));
app.use('/memo', require('./routes/memo'));
app.use('/recs', require('./routes/recs'));
app.use('/rnd', require('./routes/rnd'));
app.use('/donate', require('./routes/donate'));
app.use('/billing', require('./routes/billing'));

// catch 404 and forward to error handler
app.use((req, res, next) => {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/**
 * error handlers
 */

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', {
      title: 'Error',
      message: err.message,
      error: err,
      user: req.user
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', {
    title: 'Error',
    message: err.message,
    error: {},
    user: req.user
  });
});


module.exports = app;
