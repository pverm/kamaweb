"use strict";

/**
 * route responsible for account management tasks
 */
const express = require('express')
const models = require('../models')
const router = express.Router()
const access = require('../lib/access');
const moment = require('moment');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const maxSize = 1 * 1000 * 1000; // 1 MB
const storage = multer.diskStorage({
  destination: 'uploads/avatar',
  filename: function(req, file, cb) {
    cb(null, `${req.user.name}-${Date.now()}.png`)
  }
});
const upload = multer({
  storage: storage,
  limits: { fileSize: maxSize },
});

/**
 * set active navbar element
 */
router.use((req, res, next) => {
  res.locals.navActive = 'account';
  next();
});

/**
 * attach link info if account is linked
 */
router.use((req, res, next) => {
  if (req.user.linked && !req.user.linkedServerName) {
    models.Server.find(
      { where: { id: req.user.linkedServerId }
    }).then(server => {
      req.user.linkedServerName = server.name;
      next();
    });
  } else {
    next();
  }
});

/**
 * PROFILE PAGE
 */
router.get('/', function(req, res) {
  if (!req.user) {
    return res.redirect('/login')
  }
  res.locals.accountActive = 'profile';
  res.render('account/profile', {
    title: 'Your account',
    connectionInfo: {
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      host: req.hostname,
      cookies: req.cookies
    },
    user: req.user,
    className: access.getClassName(req.user.class),
  });
});


/**
 * SETTINGS PAGE
 */
router.get('/settings', function(req, res) {
  if (!req.user) {
    return res.redirect('/login')
  }
  res.locals.accountActive = 'settings';
  res.render('account/settings', {
    title: 'Your account settings',
    user: req.user,
    className: access.getClassName(req.user.class),
    messages: {
      link: {
        error: req.flash('linkerror'),
        success: req.flash('linksuccess')
      },
      avatar: {
        error: req.flash('avatarerror'),
        success: req.flash('avatarsuccess')
      },
      account: {
        error: req.flash('accounterror'),
        success: req.flash('accountsuccess')
      }
    }
  });
});

/**
 * ACCOUNT LINKING
 */
function rndDigit() {
  return Math.floor(Math.random() * 10)
}

function rndNumString(len) {
  let str = "";
  for (let i=0; i<len; i++) {
    str += String(rndDigit());
  }
  return str;
}

function genPassword() {
  let password = rndNumString(6);
  password += String(Math.floor(new Date()))
  password += rndNumString(5);
  return password;
}

router.get('/settings/link', (req, res) => {
  if (req.user.linked) {
    req.flash('linkerror', 'Account already linked.')
    return res.redirect('back');
  }
  const linkPass = genPassword();
  models.User.update({
    linkPass: linkPass,
    linkPassValidUntil: moment().add(1, 'hour'),
  },{
    where: { id: req.user.id }
  }).then(result => {
    req.flash('linksuccess', 'Generated new password that is valid for 1 hour.');
    return res.redirect('back')
  }).catch(err => {
    console.log(err);
    req.flash('linkerror', 'Could not generate password.');
    res.redirect('back');
  });
});

router.get('/settings/unlink', (req, res) => {
  if (!req.user.linked) {
    req.flash('linkerror', 'Account is not linked.');
    return res.redirect('back');
  }
  models.User.update({
    linkedNick: null,
    linkedServerId: null,
    linked: false,
    linkPass: null,
    linkPassValidUntil: null
  },{
    where: { id: req.user.id }
  }).then(result => {
    req.flash('linksuccess', 'Link has been removed.');
    return res.redirect('back');
  }).catch(err => {
    console.log(err);
    req.flash('linkerror', 'An unexpected error occured.');
    res.redirect('back');
  });
});

/**
 * UPDATE ACCOUNT SETTINGS
 */

/**
 * check for valid input and populate response locals with update values
 */
router.post('/settings/update', (req, res, next) => {
  console.log('validate check');
  console.log(req.body);
  const email = req.body.email || null;
  const password = req.body.password || null;
  const passwordConfirm = req.body.passwordConfirm || null;
  res.locals.accountUpdateValues = {};

  if (!email && !password) {
    return res.redirect('back');
  }
  if (email)
    res.locals.accountUpdateValues.email = email;

  if (!password) {
    next();
  } else {
    if (password !== passwordConfirm) {
      req.flash('accounterror', "Passwords don't match.")
      return res.redirect('back');
    }
    if (password.length < 8 || password.length > 48) {
      req.flash('accounterror', "Your password must be between 8 and 48 characters long.");
      return res.redirect('back');
    }
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, (err, hash) => {
        res.locals.accountUpdateValues.password = hash;
        res.locals.accountUpdateValues.salt = salt;
        next();
      });
    });
  }
});

/**
 * update account information
 */
router.post('/settings/update', (req, res) => {
  models.User.update(res.locals.accountUpdateValues,
    { where: { id: req.user.id }
  }).then(result => {
    req.flash('accountsuccess', "Your account information has been updated.");
    return res.redirect('back');
  }).catch((err) => {
    if (err.name === 'SequelizeUniqueConstraintError') {
      req.flash('accounterror', "Email address already in use. Please choose a different one.");
    } else if (err.name === 'SequelizeValidationError') {
      if (err.errors[0].path === 'email')
        req.flash('accounterror', "Please enter a valid email address.");
    } else {
      req.flash('accounterror', "An unexpected error occured.");
    }
    res.redirect('back');
  });
});

/**
 * AVATAR PICTURE UPLOAD
 */
function uploadAvatar(req, res, next) {
  upload.single('avatar')(req, res, function(err) {
    if (err) {
      req.uploadErr = err;
    }
    next();
  });
}

router.post('/avatar', uploadAvatar, function (req, res, next) {
  if (req.uploadErr) {
    if (req.uploadErr.code === 'LIMIT_FILE_SIZE') {
      res.send({
        success: false,
        error: {
          code: 'LIMIT_FILE_SIZE',
          message: `Upload failed (exceeded file size limit of ${maxSize} Byte)`
        }
      });
    } else {
      res.send({
        success: false,
        error: {
          code: req.uploadErr.code,
          message: 'Upload failed'
        }
      });
    }
  } else {
    models.User.update(
      { avatar: req.file.filename },
      { where: { id: req.user.id }}
    ).then(result => {
      res.send({
        success: true,
        error: null
      });
    }).catch(err => {
      console.log(err);
      res.send({
        succes: false,
        error: {
          code: 'DB_ERROR',
          message: 'Upload failed'
        }
      });
    });
  }
});

module.exports = router;
