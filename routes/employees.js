var express = require('express');
var employees = express.Router();
var log = require('../lib/log');
var moment = require('moment');

var debug = require('debug')('org:employees');
var jsondiffpatch = require('jsondiffpatch');

var EmployeeObject = require('../models/employee-object').EmployeeObject;
var EmployeeList = require('../models/employee-list').EmployeeList;
var getEmployeeList = require('../lib/active-employee-list').getEmployeeList;

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
  if (['list','object'].indexOf(req.params.type) === -1) {
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
  var right = moment({year: Number(req.params.y), month: Number(req.params.m) - 1, day: Number(req.params.d)});
  var left = right.subtract(1, 'days');
  // render the view
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

  var lMoment = moment(left);
  var rMoment = moment(right);
  if (lMoment.isSame(rMoment, 'day')) {
    res.status(200).send('no different for the same day');
  }

  var le;
  var re;
  // check availability of left and right
  EmployeeObject.findOne(left).lean().exex(function (err, l) {
    if (err) {
      log.error(err);
      return res.status(500).send(err.message);
    }
    if(l) {
      le = l.employees;
    }
  });

  EmployeeObject.findOne(right).lean().exex(function (err, r) {
    if (err) {
      log.error(err);
      return res.status(500).send(err.message);
    }
    if(r) {
      re = r.employees;
    }
  });

  if (!le || !re) {
    return res.status(400).send('cannot find records for the days');
  }

  if (lMoment.isBefore(rMoment)) {
    res.send(jsondiffpatch.diff(le, re));
  } else {
    res.send(jsondiffpatch.diff(re, le));
  }
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
