var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var employee = new Schema({
  valid_since: {
    type: Date,
    required: true,
    default: Date.now()
  },
  active: {
    type: Boolean,
    required: true,
    default: true
  },
  valid_until: {
    type: Date,
    default: null
  },
  person_id: {
    type: String,
    lowercase: true,
    trim: true,
    index: true
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
    trim: true,
    index: true
  },
  employee_name: {
    type: String,
    trim: true
  },
  sup_emp: {
    type: ObjectId,
    ref: 'Employee'
  },
  org: {
    type: ObjectId,
    ref: 'Org'
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

var Employee = mongoose.model('Employee', employee);

module.exports = {
  Employee: Employee
};
