var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var employeeIFS = {
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
};

var employee = new Schema(employeeIFS);

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

activeEmployeeList.methods.setDate2Now = function () {
  var date = new Date();
  this.year = date.getUTCFullYear();
  this.month = date.getUTCMonth() + 1;
  this.day = date.getUTCDate();
  this.hours = date.getUTCHours();
}

// a compound index for date
activeEmployeeList.index({
  year: 1,
  month: 1,
  day: 1,
  hours: 1
});

var EmployeeList = mongoose.model('EmployeeList', activeEmployeeList);
var Employee = mongoose.model('Employee', employee);

module.exports = {
  EmployeeList: EmployeeList,
  Employee : Employee
};
