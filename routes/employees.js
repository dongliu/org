var express = require('express');
var employees = express.Router();
var log = require('../lib/log');
var moment = require('moment');
var series = require('async').series;

var debug = require('debug')('org:employees');
var jsondiffpatch = require('jsondiffpatch');

var EmployeeObject = require('../models/employee-object').EmployeeObject;
var EmployeeList = require('../models/employee-list').EmployeeList;
var getEmployeeList = require('../lib/active-employee-list').getEmployeeList;
var employeeListDiff = require('../lib/employee-list-diff');

employees.get('/', function (req, res) {
  res.send('need a resource view');
});

employees.get('/today', function (req, res) {
  var today = new Date();
  var y = today.getFullYear();
  var m = today.getMonth() + 1;
  var d = today.getDate();
  res.redirect(req.baseUrl + '/year/' + y + '/month/' + m + '/day/' + d);
});

employees.get('/year/:y/month/:m/day/:d', function (req, res) {
  res.send('need a view here');
});

employees.get('/year/:y/month/:m/day/:d/:type/json', function (req, res) {
  if (['list', 'object'].indexOf(req.params.type) === -1) {
    return res.status(404).send('do not know the type');
  }
  var collection;
  if (req.params.type === 'list') {
    collection = EmployeeList;
  } else {
    collection = EmployeeObject;
  }
  collection.findOne({
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

employees.get('/diff/year/:y/month/:m/day/:d', function (req, res) {
  var right = moment({
    year: Number(req.params.y),
    month: Number(req.params.m) - 1,
    day: Number(req.params.d)
  });
  var left = right.subtract(1, 'days');
  // render the view
  res.send('need a view');
});

employees.get('/year/:ly/month/:lm/day/:ld/diff/year/:ry/month/:rm/day/:rd', function (req, res) {
  res.send('need a view');
});

employees.get('/year/:ly/month/:lm/day/:ld/diff/year/:ry/month/:rm/day/:rd/json', function (req, res) {
  var left = {
    year: Number(req.params.ly),
    month: Number(req.params.lm),
    day: Number(req.params.ld)
  }

  var right = {
    year: Number(req.params.ry),
    month: Number(req.params.rm),
    day: Number(req.params.rd)
  }

  employeeListDiff.getEmployeeDiff(left, right, function (err, diff) {
    if (err) {
      log.error(err);
      return res.status(500).send(err.message);
    }
    res.json(diff);
  });
});

employees.get('/year/:ly/month/:lm/day/:ld/diff/year/:ry/month/:rm/day/:rd/report/json', function (req, res) {
  var left = {
    year: Number(req.params.ly),
    month: Number(req.params.lm),
    day: Number(req.params.ld)
  }

  var right = {
    year: Number(req.params.ry),
    month: Number(req.params.rm),
    day: Number(req.params.rd)
  }

  employeeListDiff.getEmployeeDiff(left, right, function (err, d) {
    if (err) {
      log.error(err);
      return res.status(500).send(err.message);
    }
    res.json({left: d.left, right: d.right, report: employeeListDiff.deltaGroup(d.diff)});
  });
});

employees.post('/now', function (req, res) {
  getEmployeeList(true, function (err, list) {
    if (err) {
      log.error(err);
      return res.status(500).send(err.message);
    }
    if (list) {
      debug('get the list');
      return res.json(list);
    }
    return res.status(500).send('something is wrong');
  });
});

module.exports = employees;
