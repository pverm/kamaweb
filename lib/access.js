'use strict';

var access = {
  classes: {
    '0': 'inactive',
    '1': 'reserved',
    '2': 'member',
    '3': 'mod',
    '4': 'admin',
    '5': 'owner',
  },
  availableClasses: ['inactive', 'reserved', 'member', 'mod', 'admin', 'owner'],
  user: {}
};

/**
 * Returns name of user class
 * @param {int} classNum - user class number
 */
access.getClassName = function(classNum) {
  if (classNum < 0 || classNum > 5)
    new Error('Class number out of range');
  else
    return access.classes[classNum];
}

/**
 * Returns number of user class
 * @param {string} className - user class name
 */
access.getClassNum = function(className) {
  var classNum = access.availableClasses.indexOf(className);
  if (classNum < 0) {
    new Error('Class not defined');
  } else {
    return classNum;
  }
}

/**
 * Returns express middleware that checks if current user is authorized
 * @param {string} userClass - required user class to access
 * @param {strict} [strict=false] - check in strict mode (only specified class is granted access and not those above)
 */
access.user.is = function (userClass, strict) {
  var strict = strict || false;

  return function (req, res, next) {
    if (!req.user) {
      return next(new Error('No user object attached to request'));
    }
    var classNum = access.getClassNum(userClass);
    if (req.user.class == classNum || (req.user.class >= classNum && !strict)) {
      return next();
    } else {
      res.status(403);
      res.send('denied');
    }
  };
};


module.exports = access;