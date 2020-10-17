"use strict";

module.exports = function(sequelize, DataTypes) {
  var Mail = sequelize.define("Mail", {
    from: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true
      }
    },
    to: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true
      }
    },
    subject: DataTypes.STRING,
    text: DataTypes.TEXT,
    failed: DataTypes.BOOLEAN,
    info: DataTypes.JSON
  });
  return Mail;
};