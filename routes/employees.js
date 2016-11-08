var express = require('express');
var employees = express.Router();
var log = require('../lib/log');
var moment = require('moment');

var debug = require('debug')('org:employees');

var EmployeeObject = require('../models/employee-object').EmployeeObject;
var EmployeeList = require('../models/employee-list').EmployeeList;
var getEmployeeList = require('../lib/active-employee-list').getEmployeeList;
var employeeListDiff = require('../lib/employee-list-diff');

function validateDate(req, res, next) {
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

  var lMoment = moment(left);
  var rMoment = moment(right);

  if (!lMoment.isValid()) {
    return res.status(400).send('left side date is not valid');
  }

  if (!rMoment.isValid()) {
    return res.status(400).send('right side date is not valid');
  }

  if (lMoment.isSame(rMoment, 'day')) {
    return res.status(200).send('left and right are the same');
  }

  if (lMoment.isAfter(rMoment)) {
    return res.status(400).send('right side date must be after left side date');
  }
  req.left = left;
  req.right = right;
  next();
}

employees.get('/', function (req, res) {
  res.render('employees');
});

employees.get('/diff/today', function (req, res) {
  var today = new Date();
  var y = today.getFullYear();
  var m = today.getMonth() + 1;
  var d = today.getDate();
  res.redirect(req.baseUrl + '/diff/year/' + y + '/month/' + m + '/day/' + d);
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
  if(!right.isValid()) {
    return res.status(400).send('invalid date');
  }
  var left = right.subtract(1, 'days');
  res.redirect(req.baseUrl + '/year/' + left.year() + '/month/' + (left.month() + 1) + '/day/' + left.date() + '/diff/year/' + req.params.y + '/month/' + req.params.m + '/day/' + req.params.d);
});

employees.get('/year/:ly/month/:lm/day/:ld/diff/year/:ry/month/:rm/day/:rd', validateDate, function (req, res) {
  employeeListDiff.employeeDiffHtml(req.left, req.right, function (err, result) {
    if (err) {
      log.error(err);
      return res.status(500).send(err.message);
    }
    return res.render('employee-diff', result);
  });
});

employees.get('/year/:ly/month/:lm/day/:ld/diff/year/:ry/month/:rm/day/:rd/json', validateDate, function (req, res) {
  employeeListDiff.getEmployeeDiff(req.left, req.right, function (err, diff) {
    if (err) {
      log.error(err);
      return res.status(500).send(err.message);
    }
    res.json(diff);
  });
});

employees.get('/year/:ly/month/:lm/day/:ld/diff/year/:ry/month/:rm/day/:rd/report/json', validateDate, function (req, res) {
  employeeListDiff.getEmployeeDiff(req.left, req.right, function (err, d) {
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
