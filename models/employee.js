var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var employee = new Schema({
  _id: {
    type: String,
    lowercase: true,
    trim: true
  },
  lname: {
    type: String,
    trim: true
  },
  fname: {
    type: String,
    trim: true
  },
  emp_no: {
    type: String,
    trim: true
  },
  employee_name: {
    type: String,
    trim: true
  },
  sup_emp_no: {
    type: String,
    trim: true
  },
  org_code: {
    type: String,
    trim: true
  },
  emp_cat_name: {
    type: String,
    trim: true
  },
  employee_status: {
    type: String,
    trim: true
  }
});


var activeEmployeeList = new Schema({
  year: {
    type: Number,
    required: true,
    default: function () {
      return new Date().getUTCFullYear();
    }
  },
  month: {
    type: Number,
    required: true,
    default: function () {
      return new Date().getUTCMonth() + 1
    }
  },
  day: {
    type: Number,
    required: true,
    default: function () {
      return new Date().getUTCDate();
    }
  },
  hours: {
    type: Number,
    default: function () {
      return new Date().getUTCHours();
    }
  },
  employees: [employee]
});

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
