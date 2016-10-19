var express = require('express');
var employees = express.Router();
var log = require('../lib/log');

var EmployeeObject = require('../models/employee-object').EmployeeObject;
var getEmployeeList = require('../lib/active-employee-list').getEmployeeList;

employees.get('/', function (req, res) {
  res.send('need a resource view');
});

employees.get('/today', function (req, res) {
  var today = new Date();
  var y = today.getUTCFullYear();
  var m = today.getUTCMonth() + 1;
  var d = today.getUTCDate();
  res.redirect('year' + y + '/month' + m + '/day' + d);
});

employees.get('/year/:y/month/:m/day/:d', function (req, res) {
  res.send('need a view here');
});

employees.get('/year/:y/month/:m/day/:d/json', function (req, res) {
  EmployeeObject.findOne({
    year: Number(req.params.y),
    month: Number(req.params.m),
    day: Number(req.params.d)
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
  getEmployeeList(true, function (err, list) {
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
