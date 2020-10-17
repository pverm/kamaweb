const passport      = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt        = require('bcryptjs');
const models        = require('../models');

/**
 * passport authentication setup
 */
passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
  },
  function(username, password, done) {
    models.User.findOne({
      where: { name: username }
    }).then(function(user) {
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      bcrypt.hash(password, user.salt, function(err, hash) {
        if (err) { return done(err); }
        if (user.password === hash) {
          if (user.class >= 2) {
            models.User.update(
              { lastLogin: new Date() },
              { where: { id: user.id }}
            ).then(function(res) {
              return done(null, user);
            }).catch(function(err) {
              console.log(err);
              return done(null, false, { message: 'Login failed.' });
            });
          } else {
            return done(null, false, { message: 'Account not activated.' });
          }
        } else {
          return done(null, false, { message: 'Incorrect password.' });
        }
      });
    });
  }
));
passport.serializeUser(function(user, done) {
  return done(null, user.id);
})
passport.deserializeUser(function(id, done) {
  models.User.findById(id).then(function(user) {
    if (!user) {
      return done(new Error('Wrong user id.'))
    };
    return done(null, user);
  })
});

module.exports = passport
