"use strict";

/**
 * route responsible for user logout
 */
var express = require('express')
  , router = express.Router();

router.get('/', function(req, res) {
  req.logout();
  res.redirect('/login');
});

module.exports = router;