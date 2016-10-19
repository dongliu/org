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
var Employee = mongoose.model('Employee', employee);

module.exports = {
  employeeSchema: employee,
  Employee: Employee
};
