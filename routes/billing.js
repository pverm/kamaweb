var fs      = require('fs');
var path    = require('path');
var async   = require('async');
var express = require('express');
var url     = require('url');
var moment  = require('moment');
var router  = express.Router();
var billingDir  = 'public/files/billing'


/**
  * set active navbar element
  */
 router.use((req, res, next) => {
   res.locals.navActive = 'billing';
   next();
 });

/**
 * returns sorted array of billing files in dir asynchronously
 */
function getBillingFiles(dir, callback) {
  fs.readdir(dir, function(err, files) {
    var billingFiles = files.filter(function(file) {
      return (path.extname(file).toLowerCase().slice(1) === 'pdf')
    });
    callback(null, billingFiles.sort());
  });
}

/**
 * add year/month to sorted billing files
 */
function annotateBillingFiles(files) {
  var billingInfo = [];
  var month = moment("10-2017", "MM-YYYY");
  files.forEach(function(element) {
    billingInfo.push({
      fileName: element,
      month: month.format("MMMM YYYY")
    });
    month.add(1, 'months');
  });
  return billingInfo;
}

/**
 * overview of available folders
 */
router.get('/', function(req, res, next) {
  getBillingFiles(billingDir, function(err, files) {
    if (err) {
      console.log(err);
      return next();
    }

    if (!files) return next();

    var billingInfo = annotateBillingFiles(files);
    res.render('billing', {
      title: 'Billing Information',
      bills: billingInfo.reverse(),
      user: req.user
    });
  });
});

module.exports = router;
