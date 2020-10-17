'use strict';

/**
 * provides helper functions
 */
var dateFormat = require('dateformat');

exports = {};

exports.dateFormat = dateFormat;

exports.formatTime = function(d) {
  return dateFormat(d, 'HH:MM:ss');
}

exports.formatDate = function(d) {
  return dateFormat(d, 'yyyy-mm-dd');
}

exports.formatDatetime = function(d) {
  return exports.formatDate(d) + ' ' + exports.formatTime(d);
}

exports.getRows = function(items, rowLen) {
  return items.reduce(function (prev, item, i) {
    if(i % rowLen === 0)
      prev.push([item]);
    else
      prev[prev.length - 1].push(item);
    return prev;
  }, []);
}

exports.recClassString = function(genre) {
  return genre.map(function(g) {
    return g + 'rec';
  }).join(" ");
}

exports.getNickColorClass = function(nick) {
  if (!nick || nick === '*')
    return 'nick-color-0';
  const rcolors = [
    'nick-color-1',
    'nick-color-2',
    'nick-color-3',
    'nick-color-4',
    'nick-color-5',
    'nick-color-6',
    'nick-color-7',
    'nick-color-8',
    'nick-color-9'
  ];
  let sum = 0;
  for (let c of nick) {
    sum += c.charCodeAt();
  }
  return rcolors[sum % rcolors.length]
}

module.exports = exports;
