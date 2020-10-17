'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    return queryInterface.removeColumn('Users', 'gender')
      .then(function() {
        return queryInterface.addColumn('Users', 'lastLogin', { type: Sequelize.STRING });
      });
  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    return queryInterface.addColumn(
      'Users',
      'gender',
      {
        type: Sequelize.STRING,
        defaultValue: 'genderless'
      }
    ).then(function() {
      queryInterface.removeColumn('Users', 'lastLogin')
    });
  }
};
