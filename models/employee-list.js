var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var _ = require('lodash');
var log = require('../lib/log');

var employee = require('./employee-schema').employeeSchema;

var EmployeeObject = require('./employee-object').EmployeeObject;

var activeEmployeeList = new Schema({
  year: {
    type: Number,
    required: true
  },
  month: {
    type: Number,
    required: true
  },
  day: {
    type: Number,
    required: true
  },
  hours: {
    type: Number
  },
  employees: [employee]
});

/**
 * set the year/month/day/hours to now
 */
activeEmployeeList.methods.setDate2Now = function () {
  var date = new Date();
  this.year = date.getUTCFullYear();
  this.month = date.getUTCMonth() + 1;
  this.day = date.getUTCDate();
  this.hours = date.getUTCHours();
};



/**
 * create an object representation of the employee list
 * @param  {Function} cb   callback when saved
 */
activeEmployeeList.methods.saveObject = function (cb) {
  var employeeObject = new EmployeeObject();
  employeeObject.year = this.year;
  employeeObject.month = this.month;
  employeeObject.day = this.day;
  employeeObject.hours = this.hours;
  employeeObject.employees = {};
  this.employees.forEach(function (e) {
    employeeObject.employees[e.emp_no] = e;
  });
  employeeObject.save(function (err, eObject) {
    if (_.isFunction(cb)) {
      return cb(err, eObject);
    }
    if (err) {
      log.error(err);
    } else {
      log.info('employee object saved on ' + eObject.year + ' ' + eObject.month + ' ' + eObject.day + ' ' + eObject.hours + '.');
    }
  });
};

// a compound index for date
activeEmployeeList.index({
  year: 1,
  month: 1,
  day: 1,
  hours: 1
});

var EmployeeList = mongoose.model('EmployeeList', activeEmployeeList);

module.exports = {
  EmployeeList: EmployeeList
};
