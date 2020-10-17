var models     = require('../models');
var helpers    = require('../lib/helpers');
var dateFormat = require('dateformat');
var express    = require('express');
var qs         = require('querystring');
var fs         = require('fs');
var router     = express.Router();

/**
 * set active navbar element
 */
router.use((req, res, next) => {
  res.locals.navActive = 'log';
  next();
});

/**
 * server list
 */
router.get('/', function(req, res) {
  models.Server.findAll().then(function(servers) {
    res.render('log/servers', {
      title: 'kamaweb log – Servers',
      servers: servers,
      user: req.user
    });
  });
});


/**
 * Attach server details to request object
 */
router.param('server_id', function(req, res, next, server_id) {
  if (isNaN(server_id)) {
    var err = new Error('Server Not Found');
    err.status = 404;
    return next(err);
  }

  models.Server.findOne({
    where: { id: server_id }
  }).then(function(server) {
    if (server) {
      req.server = server;
      next();
    } else {
      var err = new Error('Server Not Found');
      err.status = 404;
      next(err);
    }
  });
});

/**
 * channel list for specific server
 */
router.get('/server/:server_id', function(req, res, next) {
  models.Channel.findAll({
    where: {
      server_id: req.server.id
    }
  }).then(function(channels) {
    res.render('log/channels', {
      title: 'kamaweb log – Channels',
      channels: channels,
      server_id: req.server.id,
      server: req.server,
      user: req.user
    });
  });
});

/**
 * Attach channel and server details to request object
 */
router.param('channel_id', function(req, res, next, channel_id) {
  if (isNaN(channel_id)) {
    var err = new Error('Channel Not Found');
    err.status = 404;
    return next(err);
  }

  models.Channel.findOne({
    where: { id: channel_id },
    include: [ models.Server ]
  }).then(function(channel) {
    if (channel) {
      req.channel = channel;
      req.server = channel.Server;
      next();
    } else {
      var err = new Error('Channel Not Found');
      err.status = 404;
      next(err);
    }
  });
});


/**
 * date list for specific channel
 */
router.get('/channel/:channel_id', function(req, res, next) {
  models.Message.findAll({
    attributes: ['postedAtDate'],
    where: {
      channel_id: req.channel.id
    },
    group: ['postedAtDate'],
    order: [['postedAtDate', 'DESC']]
  }).then(function(dates) {
    res.render('log/dates', {
      title: 'kamaweb log – Dates',
      channel: req.channel,
      server: req.server,
      dates: dates,
      user: req.user
    });
  });
});


/**
 * search page for channel
 */
router.get('/channel/:channel_id/search', function(req, res, next) {
  res.render('log/search', {
    title: 'kamaweb log – Search',
    user: req.user,
    channel: req.channel,
    server: req.server
  });
});

router.post('/channel/:channel_id/search', function(req, res) {
  models.Message.search({
    searchText: req.body.searchtext,
    searchNick: req.body.nick.toLowerCase(),
    searchStart: helpers.formatDate(req.body.start),
    searchEnd: helpers.formatDate(req.body.end),
    searchChannel: req.channel.id
  }).then(function(messages) {
    res.send({
      searchResult: messages[0]
    });
  });
});


/**
 * channel statistics
 */
function getQueryFile(chartDataIndex) {
  // get SQL query file from chartData index
  switch(Number(chartDataIndex)) {
    case 1:
      return 'msgByNick.sql';
    case 2:
      return 'msgByDay.sql';
    case 3:
      return 'msgByTimeOfDay.sql';
    case 4:
      return 'msgContainingSearchText.sql';
    case 5:
      return 'mostPostedSites.sql';
    case 6:
      return 'mostActiveDays.sql';
    case 7:
      return 'kicksByNick.sql';
    case 8:
      return 'emotesByNick.sql';
    case 9:
      return 'avgMsgLenByNick.sql';
    case 11:
      return 'leastActiveDays.sql';
    case 12:
      return 'mostDistinctPostDays.sql';
    default:
      return null;
  }
}

function loadQueryString(path, cb) {
  // get SQL querystring from file
  fs.readFile(path, {encoding: 'utf-8'}, function(err, query) {
    if (err)
      cb(err, null);
    else
      cb(null, query)
  });
}


router.get('/channel/:channel_id/stats', function(req, res, next) {
  if (req.query.chartData) {
    next()
  } else {
    res.render('log/stats', {
      title: 'kamaweb log – Statistics',
      channel: req.channel,
      server: req.server,
      user: req.user
    });
  }
});

router.get('/channel/:channel_id/stats', function(req, res, next) {
  // get data for charts from db
  var queryfile = getQueryFile(req.query.chartData)
  if (!queryfile) return next();
  loadQueryString(`routes/sql/${queryfile}`, function(err, query) {
    if (err) return console.log(err);
    query = query.replace(/%PH:CHANNEL_ID%/g, req.channel.id)
    if (req.query.chartData == 4) {
      if (!req.query.searchText) return res.json([]);
      var escaped = models.sequelize.escape(req.query.searchText)
      escaped = escaped.slice(0,1) + '\\y' + escaped.slice(1)
      escaped = escaped.slice(0,-1) + '\\y' + escaped.slice(-1)
      query = query.replace('%PH:SEARCHTEXT%', escaped)
    }
    query = query.replace('%PH:SEARCHTEXT%', models.sequelize.escape(req.query.searchText))
    models.sequelize.query(query, {type: models.sequelize.QueryTypes.SELECT})
    .then(function(rows) {
      res.json(rows);
    });
  });
});


/**
 * latest channel messages
 */
router.get('/channel/:channel_id/latest', function(req, res, next) {
  models.Message.findAll({
    where: {
      channel_id: req.channel.id,
    },
    include: [{ all: true, nested: true }],
    order: [[ 'postedAt', 'DESC' ]],
    limit: 500
  }).then(function(messages) {
    res.render('log/messages', {
      title: 'kamaweb log – Latest Messages in ' + req.channel.name,
      user: req.user,
      messages: messages.reverse(),
      channel: req.channel,
      server: req.server,
      date: null,
      jump: req.query.jump
    });
  });
});

/**
 * today's channel messages
 */
router.get('/channel/:channel_id/today', function(req, res) {
  var today = dateFormat(new Date(), 'yyyy-mm-dd');
  res.redirect('/log/channel/' + req.channel.id + '/date/' + today + '?' + qs.stringify(req.query));
});

/**
 * channel messages of specific date
 */
router.get('/channel/:channel_id/date/:date', function(req, res, next) {
  if (isNaN(new Date(req.params.date))) return next();
  models.Message.findAll({
    where: {
      channel_id: req.channel.id,
      postedAtDate: req.params.date
    },
    include: [{ all: true, nested: true }],
    order: [[ 'postedAt', 'ASC' ]]
  }).then(function(messages) {
    res.render('log/messages', {
      title: `kamaweb log – Messages in ${req.channel.name} (${req.params.date})`,
      user: req.user,
      messages: messages,
      channel: req.channel,
      server: req.server,
      date: req.params.date,
      jump: req.query.jump
    });
  });
});

module.exports = router;
