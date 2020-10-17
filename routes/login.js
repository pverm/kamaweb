"use strict";

/**
 * route responsible for user login
 */
var express = require('express')
  , models = require('../models')
  , router = express.Router()
  , bcrypt = require('bcryptjs')
  , passport = require('passport');


router.get('/', function(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  next();
})

router.get('/', function(req, res) {
  res.render('login', {
    title: `${req.hostname} - Login`,
    hostname: req.hostname,
    messages: {
      error: req.flash('error'),
      success: req.flash('success')
    }
  });
});

router.post('/', function(req, res, next) {
  passport.authenticate('local', {
    successRedirect: req.session.preloginUrl || '/account',
    failureRedirect: '/login',
    failureFlash: true,
  })(req, res, next);
});


module.exports = router;
