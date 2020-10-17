"use strict";

/**
 * route responsible for account creation
 */
var express = require('express')
  , models = require('../models')
  , router = express.Router()
  , fs = require('fs')
  , bcrypt = require('bcryptjs')
  , request = require('request')
  , qs = require('querystring')
  , transporter = require('../setup/mail')
  , greAPI = 'https://www.google.com/recaptcha/api/siteverify'
  , env = process.env.NODE_ENV || 'development'
  , config = require(__dirname + '/../config/config.json')[env]
  , recaptchaPrivKey = config.recaptcha;


router.get('/', function(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  next();
})

router.get('/', function(req, res) {
  res.render('signup', {
    title: `${req.hostname} - Sign Up`,
    hostname: req.hostname,
    messages: req.flash('error')
  });
});

router.post('/', function(req, res, next) {
  if (!req.body['g-recaptcha-response']) {
    req.flash('error', "Please solve the captcha.")
    return res.redirect('/signup');
  }
  var recaptchaQuery = qs.stringify({
    secret: recaptchaPrivKey,
    response: req.body['g-recaptcha-response'],
    remoteip: req.connection.remoteAddress
  })
  request(`${greAPI}?${recaptchaQuery}`, function(err, gre_response, gre_body) {
    gre_body = JSON.parse(gre_body);
    if (!gre_body.success) {
      req.flash('error', "Failed captcha verification.")
      return res.redirect('/signup');
    } else {
      next();
    }
  });
});

router.post('/', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password2;
  var email = req.body.email || null;

  // some input validation
  if (!username || !password || !password2) {
    req.flash('error', "Please fill in all the required fields.");
    return res.redirect('/signup');
  }
  if (username.length < 3 || username.length > 20) {
    req.flash('error', "Your username must be between 3 and 20 characters long.");
    return res.redirect('/signup');
  }
  if (password !== password2) {
    req.flash('error', "Passwords don't match.")
    return res.redirect('/signup');
  }
  if (password.length < 8 || password.length > 48) {
    req.flash('error', "Your password must be between 8 and 48 characters long.");
    return res.redirect('/signup');
  }

  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(password, salt, function(err, hash) {
      models.User.create({
        name: username,
        email: email,
        password: hash,
        salt: salt
      }).then(function() {

        // send email to admin
        fs.readFile('mail_templates/registration_admin.txt', 'utf8', function (err, data) {
          if (err) console.log(err);
          const mail = {
            from: config.smtp.user,
            to: config.admin.email,
            subject: 'New kamaweb registration',
            text: data.replace('$PLACEHOLDER$', username),
          }
          transporter.sendMail(mail, function(err, info) {
            mailToDB(mail, err, info);
          });
        });

        // send email to user
        if (email) {
          fs.readFile('mail_templates/registration.txt', 'utf8', function (err, data) {
            if (err) console.log(err);
            const mail = {
              from: config.smtp.user,
              to: email,
              subject: 'kamaweb registration',
              text: data.replace('$PLACEHOLDER$', email),
            }
            transporter.sendMail(mail, function(err, info) {
              mailToDB(mail, err, info);
            });
          });
        }

        req.flash('success', "Thanks for signing up. Please wait for the administrator to activate your account. If you entered an email address during registration you will be notified once activation is complete.");
        return res.redirect('/login');
      }).catch(function(err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
          if (err.parent.constraint === 'Users_name_key') {
            req.flash('error', "Name already taken. Please choose a different one.");
          } else {
            req.flash('error', "Email address already in use. Please choose a different one.");
          }
        } else if (err.name === 'SequelizeValidationError') {
          if (err.errors[0].path === 'email') {
            req.flash('error', "Please enter a valid email address.");
          }
        } else {
          req.flash('error', "An unexpected error occured.");
        }
        res.redirect('/signup');
      });
    });
  });
});

function mailToDB(mail, err, info) {
  models.Mail.create({
    from: mail.from,
    to: mail.to,
    subject: mail.subject,
    text: mail.text,
    failed: (err) ? true : false,
    info: info
  })
}

module.exports = router;
