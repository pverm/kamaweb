"use strict";

module.exports = function(sequelize, DataTypes) {
  var Message = sequelize.define("Message", {
    prefix: DataTypes.STRING,
    nick: DataTypes.STRING,
    host: DataTypes.STRING,
    command: DataTypes.STRING,
    postedAt: DataTypes.DATE,
    postedAtDate: DataTypes.DATEONLY,
    text: DataTypes.TEXT
  }, {
    classMethods: {
      associate: function(models) {
        Message.belongsTo(models.Channel, {
          foreignKey: {
            name: 'channel_id',
            allowNull: false
          }
        });
      },

      getSearchVector: function() {
        return 'text';
      },

      /**
       * not in use
       */
      addFullTextIndex: function() {
        if(sequelize.options.dialect !== 'postgres') {
          console.log('Not creating search index, must be using POSTGRES to do this');
          return;
        }

        var searchFields = ['title', 'content'];
        var Post = this;

        var vectorName = Post.getSearchVector();
        sequelize
          .query('ALTER TABLE "' + Post.tableName + '" ADD COLUMN "' + vectorName + '" TSVECTOR')
          .success(function() {
            return sequelize
                     .query('UPDATE "' + Post.tableName + '" SET "' + vectorName + '" = to_tsvector(\'english\', ' + searchFields.join(' || \' \' || ') + ')')
                     .error(console.log);
          }).success(function() {
            return sequelize
                     .query('CREATE INDEX post_search_idx ON "' + Post.tableName + '" USING gin("' + vectorName + '");')
                     .error(console.log);
          }).success(function() {
            return sequelize
                     .query('CREATE TRIGGER post_vector_update BEFORE INSERT OR UPDATE ON "' + Post.tableName + '" FOR EACH ROW EXECUTE PROCEDURE tsvector_update_trigger("' + vectorName + '", \'pg_catalog.english\', ' + searchFields.join(', ') + ')')
                     .error(console.log);
          }).error(console.log);

        },

        search: function(query) {
          if(sequelize.options.dialect !== 'postgres') {
            console.log('Search is only implemented on POSTGRES database');
            return;
          }

          var Post = this;
          query.searchText = sequelize.getQueryInterface().escape(query.searchText);
          var queryString = 'SELECT * FROM "' + Post.tableName + '" WHERE "' + Post.getSearchVector() + '" @@ plainto_tsquery(' + query.searchText + ')'

          queryString += ' AND "channel_id" = ' + query.searchChannel;

          if (query.searchNick) {
            query.searchNick = sequelize.getQueryInterface().escape(query.searchNick);
            queryString += ' AND lower("nick") = ' + query.searchNick + '';
          }

          if (query.searchStart && query.searchEnd) {
            query.searchStart = sequelize.getQueryInterface().escape(query.searchStart);
            query.searchEnd = sequelize.getQueryInterface().escape(query.searchEnd);
            queryString += ' AND "postedAtDate" >= ' + query.searchStart + ' AND "postedAtDate" <= ' + query.searchEnd;
          }

          return sequelize.query(queryString, Post);
        }
      }
  });

  return Message;
};
