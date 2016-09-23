var express = require('express');
var employees = express.Router();
var log = require('../lib/log');

var EmployeeList = require('../models/employee').EmployeeList;
var getEmployeeList = require('../lib/active-employee-list').getEmployeeList;

employees.get('/', function (req, res) {
  res.send('need a resource view');
});

employees.get('/today', function (req, res) {
  var today = new Date();
  var y = today.getUTCFullYear();
  var m = today.getUTCMonth();
  var d = today.getUTCDay();
  res.redirect('year' + y + '/month' + m + '/day' + d);
});

employees.get('/year/:y/month/:m/day/:d', function (req, res) {
  res.send('need a view here');
});

employees.get('/year/:y/month/:m/day/:d/json', function (req, res) {
  EmployeeList.findOne({
    year: req.params.y,
    month: req.params.m,
    day: req.params.d
  }, function (err, list) {
    if (err) {
      log.error(err);
      return res.status(500).send(err.message);
    }
    if (list) {
      return res.json(list);
    }
    // check if today
    return res.status(404).send('cannot find the list for ' + req.params.y + '-' + req.params.m + '-' + req.params.d + '.');
  });
});

employees.post('/now', function (req, res) {
  getEmployeeList(true, function (err, response, list) {
    if (err) {
      log.error(err);
    }
    if (list) {
      return res.json(list);
    }
    res.status(500).send(err.message);
  });
});

module.exports = employees;
