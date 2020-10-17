const fs      = require('fs');
const express = require('express');
const router  = express.Router();
const models  = require('../models');

/**
 * set active navbar element
 */
router.use((req, res, next) => {
  res.locals.navActive = 'home';
  next();
});

const welcomeMessages = [
  "it's hip to be square",
  "where dreams come true",
  "enjoy your stay"
]

router.get('/', function(req, res) {
  models.Quote.findOne({
    order: [
      models.Sequelize.fn('RANDOM')
    ]
  }).then((quote) => {
    if (!quote) {
      quote = {
        quote: welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)],
        nick: 'kamaweb'
      }
    }
    res.render('home', {
      title: req.hostname,
      quote: quote,
      user: req.user
    });
  })
});

module.exports = router;
