var EmployeeObject = require('../models/employee-object').EmployeeObject;
// var debug = require('debug')('org:lib');
var _ = require('lodash');
var series = require('async').series;
var jsondiffpatch = require('jsondiffpatch');

/**
 * get the employee lists for left and right dates, and get the diff json
 * @param  {Object}   left     left date
 * @param  {Object}   right    right date
 * @param  {Model}   model    the model to diff
 * @param  {Function} callback
 */
function getDiff(left, right, model, callback) {
  series([
    function getLe(cb) {
      model.findOne(left).lean().exec(function (err, l) {
        cb(err, l);
      });
    },
    function getRe(cb) {
      model.findOne(right).lean().exec(function (err, r) {
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
      return callback(null, {left: left, right: right, diff: diff}, results);
    });
}


/**
 * get the lists for left and right dates from model, and get the diff html
 * @param  {Object}   left     left date
 * @param  {Object}   right    right date
 * @param  {Model}   model    the model to diff
 * @param  {Function} callback
 */
function diffHtml(left, right, model, callback) {
  getDiff(left, right, model, function (err, result) {
    if (err) {
      return callback(err);
    }
    if (model.modelName === 'EmployeeObject') {
      return callback(null, {left: left, right: right, diffHtml: jsondiffpatch.formatters.html.format(result.diff, result.left.employees)});
    }
    if (model.modelName === 'OrgObject') {
      return callback(null, {left: left, right: right, diffHtml: jsondiffpatch.formatters.html.format(result.diff, result.left.units)});
    }
    return callback(new Error('unknown model type'));
  });
}

/**
 * find the given employee object's supervisor information as the day before
 * @param  {Employee} o the employee
 * @param  {Object}   employees employees object
 * @return {Employee}   the supervisor from yesterday's record
 */
function findSup(o, employees){
  if (o && o.sup_emp_no && _.isString(o.sup_emp_no)) {
    return _.find(employees, {
      'emp_no': o.sup_emp_no
    });
  }
  return undefined;
}


/**
 * add the supervisor info into the report object
 * @param {[type]} report [description]
 * @param {[type]} d      [description]
 */
function addSup(report, result) {
  _.forOwn(report.leaves, function(v, k) {
    report.leaves[k].supervisor = findSup(v, result.employees);
  });
  return report;
}

/**
 * filter and group the diff object into leaves/news/changes lists
 * @param  {Object} diff the diff object from jsondiffpatch
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

/**
 * get the diff report of EmployeeObject from left and right dates
 * @param  {Object}   left     left date
 * @param  {Object}   right    right date
 * @param  {Function} callback callback(err, result)
 */
function getReport(left, right, callback) {
  getDiff(left, right, EmployeeObject, function (err, d, results) {
    if (err) {
      return callback(err);
    }
    return callback(null, {
      left: d.left,
      right: d.right,
      report: addSup(deltaGroup(d.diff), results[0])
    });

  });
}

module.exports = {
  getDiff: getDiff,
  diffHtml: diffHtml,
  deltaGroup: deltaGroup,
  findSup: findSup,
  getReport: getReport
};
