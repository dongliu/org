var request = require('request');
var log = require('./log');
var EmployeeList = require('../models/employee-list').EmployeeList;
var _ = require('lodash');
var debug = require('debug')('org:lib');

var config = require('config');

var activeEmployeeFormData = {
  api_application: config.get('service.hr.api_application'),
  api_key: config.get('service.hr.api_key'),
  extended: 'true'
}


/**
 * retrieve the active employee list
 * @param  {Boolean}   save save in the db or not
 * @param  {Function} cb   the callback function
 */
function getEmployeeList(save, cb) {
  request({
    url: config.get('service.hr.urls.activeusers'),
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
      return cb(new Error('' + response.statusCode));
    }
    // set employees, convert _id
    var list = new EmployeeList();
    list.setDate2Now();
    _.forOwn(body, function (e) {
      list.employees.push(e);
    });

    // debug(list.toJSON());
    if (!save) {
      return cb(null, list.toJSON());
    }

    list.save(function (err, newList) {
      if (err) {
        if (_.isFunction(cb)) {
          return cb(err);
        } else {
          log.error(err);
        }
      } else {
        if (newList) {
          newList.saveObject(function (oErr, eObject) {
            if (oErr) {
              if (_.isFunction(cb)) {
                return cb(oErr);
              } else {
                log.error(oErr);
              }
            } else {
              if (eObject) {
                if (_.isFunction(cb)) {
                  return cb(null, eObject.toJSON());
                } else {
                  log.info('employee list and object saved on ' + newList.year + ' ' + newList.month + ' ' + newList.day + ' ' + newList.hours + '.');
                }
              } else {
                log.warn('no save error, and employee object not saved!');
              }
            }
          });
        } else {
          log.warn('no save error, and employee list not saved!');
        }
      }
    });
  })
}

module.exports = {
  getEmployeeList: getEmployeeList
};
