var EmployeeObject = require('../models/employee-object').EmployeeObject;
var debug = require('debug')('org:lib');
var assert = require('power-assert');
var _ = require('lodash');

var moment = require('moment');
var series = require('async').series;
var jsondiffpatch = require('jsondiffpatch');

/**
 * get the employee lists for left and right dates, and get the diff json
 * @param  {Object}   left     left date
 * @param  {Object}   right    right date
 * @param  {Function} callback
 */
function getEmployeeDiff(left, right, callback) {
  var lMoment = moment(left);
  var rMoment = moment(right);
  if (lMoment.isSame(rMoment, 'day')) {
    return callback(null, {});
  }

  series([
    function getLe(cb) {
      EmployeeObject.findOne(left).lean().exec(function (err, l) {
        cb(err, l);
      });
    },
    function getRe(cb) {
      EmployeeObject.findOne(right).lean().exec(function (err, r) {
        cb(err, r);
      });
    }
  ],
    function (err, results) {
      if (err) {
        return callback(err);
      }

      if (results.length !== 2) {
        return callback(new Error('cannot find records for the days'));
      }
      if (!results[0]) {
        return callback(new Error('cannot find records for the day of ' + left.year + '-' + left.month + '-' + left.day));
      }
      if (!results[1]) {
        return callback(new Error('cannot find records for the day of ' + right.year + '-' + right.month + '-' + right.day));
      }
      var diff = jsondiffpatch.diff(results[0].employees, results[1].employees);
      return callback(null, {left: left, right: right, diff: diff});
    });
}
/**
 * get the employee lists for left and right dates, and get the diff html
 * @param  {Object}   left     left date
 * @param  {Object}   right    right date
 * @param  {Function} callback
 */
function employeeDiffHtml(left, right, callback) {
  getEmployeeDiff(left, right, function (err, result) {
    if (err) {
      return callback(err);
    }
    return callback(null, {diffHtml: jsondiffpatch.formatters.html.format(result.diff, result.left)});
  });
}


/**
 * filter and group the diff object into leaves/news/changes lists
 * @param  {Object} diff the diff object from jsondiffpatch
 * @param  {Object} {leaves: Boolean, news: Boolean, changes: boolean}
 * @return {Object}      grouped deltas
 */
function deltaGroup(diff) {
  var news = {};
  var changes = {};
  var leaves = {};
  _.forOwn(diff, function (v, k) {
    if (_.isArray(v)) {
      var l = v.length;
      switch(l) {
      case 1:
        news[k] = v[0];
        break;
      case 2:
        changes[k] = v[1];
        break;
      case 3:
        leaves[k] = v[0];
        break;
      default:
        break;
      }
    } else {
      changes[k] = v;
    }
  });
  return {news: news, changes: changes, leaves: leaves};
}

module.exports = {
  getEmployeeDiff: getEmployeeDiff,
  employeeDiffHtml: employeeDiffHtml,
  deltaGroup: deltaGroup
};
