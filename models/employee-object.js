var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var _ = require('lodash');
var log = require('../lib/log');

var activeEmployeeObject = new Schema({
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
  employees: Schema.Types.Mixed
});

/**
 * create an object representation of the employee list
 * @param  {EmployeeList}   list the available EmployeeList object or json
 * @param  {Function} cb   callback when saved
 */
activeEmployeeObject.methods.fromList = function (list, cb) {
  this.year = list.year;
  this.month = list.month;
  this.day = list.day;
  this.hours = list.hours;
  this.employees = {};
  list.employees.forEach(function (e) {
    this.employees[e._id] = e;
  });
  this.save(function (err, employees) {
    if (_.isFunction(cb)) {
      return cb(err, employees);
    }
    if (err) {
      log.error(err);
    } else {
      log.info('employee object saved on ' + employees.year + ' ' + employees.month + ' ' + employees.day + ' ' + employees.hours + '.');
    }
  });
};

activeEmployeeObject.index({
  year: 1,
  month: 1,
  day: 1,
  hours: 1
});


var EmployeeObject = mongoose.model('EmployeeObject', activeEmployeeObject);

module.exports = {
  EmployeeObject: EmployeeObject
};
