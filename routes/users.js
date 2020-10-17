var models  = require('../models');
var express = require('express');
var router  = express.Router();

router.get('/', function(req, res) {
  models.User.findAll({
    include: [ models.Task ]
  }).then(function(users) {
    res.render('users', {
      title: 'Express',
      users: users
    });
  });
});

router.post('/create', function(req, res) {
  models.User.create({
    name: req.body.username
  }).then(function() {
      res.redirect('back');
  });
});

router.get('/:user_id/destroy', function(req, res) {
  models.User.destroy({
    include: [ models.Task ],
    where: {
      id: req.params.user_id
    },
  }).then(function() {
    res.redirect('back');
  });
});

router.post('/:user_id/tasks/create', function(req, res) {
  models.Task.create({
    title: req.body.title,
    UserId: req.params.user_id
  }).then(function() {
    res.redirect('back');
  });
});

router.get('/:user_id/tasks/:task_id/destroy', function(req, res) {
  models.Task.destroy({
    where: {
      id: req.params.task_id,
    }
  }).then(function() {
    res.redirect('back');
  });
});

module.exports = router;