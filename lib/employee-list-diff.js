var EmployeeObject = require('../models/employee-object').EmployeeObject;
var debug = require('debug')('org:lib');

var moment = require('moment');
var series = require('async').series;
var jsondiffpatch = require('jsondiffpatch');


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
    }],
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

      if (lMoment.isBefore(rMoment)) {
        return callback(null, jsondiffpatch.diff(results[0].employees, results[1].employees));
      } else {
        return callback(null, jsondiffpatch.diff(results[1].employees, results[0].employees));
      }
    });
}

module.exports = {
  getEmployeeDiff: getEmployeeDiff
};
