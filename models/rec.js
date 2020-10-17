"use strict";

module.exports = function(sequelize, DataTypes) {
  var Rec = sequelize.define("Rec", {
    title: DataTypes.STRING,
    done: DataTypes.BOOLEAN,
    genre: DataTypes.ARRAY(DataTypes.STRING),
    description: DataTypes.TEXT
  });
  return Rec;
};
