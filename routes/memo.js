var models     = require('../models');
var express    = require('express');
var router     = express.Router();

/**
 * set active navbar element
 */
router.use((req, res, next) => {
  res.locals.navActive = 'memo';
  next();
});

/**
 * main
 */
router.get('/', function(req, res) {
  res.render('maintenance', {
    title: 'kamaweb – Memos',
    user: req.user
  })
});

/**
 * display all memos from nick
 */
router.get('/:nick', function(req, res) {
  models.Memo.findAll({
    where: { nick: req.params.nick }
  }).then(function(memos) {
    res.render('memo/memo', {
      title: 'memo - ' + req.params.nick,
      nick: req.params.nick,
      uncleared: memos.filter(function(memo) { return !memo.cleared }),
      cleared: memos.filter(function(memo) { return memo.cleared }),
    });
  })
});



module.exports = router;
