'use strict';

var fs        = require('fs');
var path      = require('path');
var debug     = require('debug')('kamaweb:db');
var basename  = path.basename(module.filename);
var env       = process.env.NODE_ENV || 'development';
var config    = require(__dirname + '/../config/config.json')[env];
var Sequelize = require('sequelize');
var db        = {};

debug(`set up connection to ${config.username}@${config.database} on ${config.options.host}`);
var sequelize = new Sequelize(config.database, config.username, config.password, config.options);

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== basename);
  })
  .forEach(function(file) {
    if (file.slice(-3) !== '.js') return;
    var model = sequelize['import'](path.join(__dirname, file));
    debug(`new ${model.name} model`);
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if (db[modelName].associate) {
    debug(`associate ${modelName}`);
    db[modelName].associate(db);
  }
});


debug(`sync db`);
sequelize.sync({force: false});


db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
