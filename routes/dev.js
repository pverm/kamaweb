var express = require('express');
var router  = express.Router();

router.get('/', function(req, res) {
  res.send('<html><a href="/dev/set">/set</a><br><a href="/dev/test">/test</a></html>');
});

router.get('/set', function(req, res) {
  req.session.test = 'test abcdefg';
  res.send('<html><p>set.</p><br><a href="/dev/test">/test</a></html>');
});

router.get('/test', function(req, res) {
  if (req.session.test) {
    res.send(req.session.test);
  } else {
    res.redirect('/dev');
  }
});

module.exports = router;
