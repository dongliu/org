var request = require('request');
var log = require('./log');
var hr = require('../config/config').service.hr;
// var mongoose = require('mongoose');
var EmployeeList = require('../models/employee').EmployeeList;
var _ = require('lodash');
var debug = require('debug')('org:lib');

var activeEmployeeFormData = {
  api_application: hr.api_application,
  api_key: hr.api_key,
  extended: 'true'
}

function getEmployeeList(cb) {
  request({
    url: hr.urls.activeusers,
    method: 'POST',
    formData: activeEmployeeFormData,
    json: true,
    timeout: 30 * 1000
  }, function (error, response, body) {
    if (error) {
      debug(error);
      if (_.isFunction(cb)) {
        return cb(error);
      } else {
        log.error(error);
        return;
      }
    }
    if (response.statusCode >= 400) {
      debug(response.statusCode);
      debug(response.headers);
      return cb(null, response);
    }
    // set employees, convert _id
    var list = new EmployeeList();
    // debug(response.headers);
    // debug(body);
    var employees = [];
    _.forOwn(body, function (e) {
      employees.push(_.assign(e, {
        _id: e.person_id.toLowerCase()
      }))
    });
    _.sortBy(employees, '_id').forEach(function (e) {
      list.employees.push(e);
    });

    // debug(list.toJSON());
    if (_.isFunction(cb)) {
      cb(null, response, list.toJSON());
    }
    list.save(function (err, newList) {
      if (err) {
        log.error(err);
      } else {
        if (newList) {
          log.info('employee list saved on ' + newList.year + ' ' + newList.month + ' ' + newList.day + ' ' + newList.hours + '.');
        } else {
          log.warn('no save error, and no employee list!');
        }
      }
    })
  })
}

module.exports = {
  getEmployeeList: getEmployeeList
};
