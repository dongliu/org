var express = require('express');
var org = express.Router();
var log = require('../lib/log');
var moment = require('moment');

var debug = require('debug')('org:org');

var OrgObject = require('../models/org-object').OrgObject;
var OrgList = require('../models/org-list').OrgList;
var getOrgList = require('../lib/org-list').getOrgList;
var listDiff = require('../lib/list-diff');

var validateDate = require('../lib/req-utils').validateDate;

org.get('/', function (req, res) {
  res.render('org');
});

/**
 * GET today's org list of type
 */
org.get('/today/:type/json', function (req, res) {
  var today = new Date();
  var y = today.getFullYear();
  var m = today.getMonth() + 1;
  var d = today.getDate();
  res.redirect(req.baseUrl + '/year/' + y + '/month/' + m + '/day/' + d + '/' + req.params.type + '/json');
});

/**
 * GET the diff between today and yesterday
 */
org.get('/diff/today', function (req, res) {
  var today = new Date();
  var y = today.getFullYear();
  var m = today.getMonth() + 1;
  var d = today.getDate();
  res.redirect(req.baseUrl + '/diff/year/' + y + '/month/' + m + '/day/' + d);
});

org.get('/year/:y/month/:m/day/:d', function (req, res) {
  res.send('need a view here');
});


/**
 * GET the org list of type on year month day
 */
org.get('/year/:y/month/:m/day/:d/:type/json', function (req, res) {
  if (['list', 'object'].indexOf(req.params.type) === -1) {
    return res.status(404).send('do not know the type');
  }
  var collection;
  if (req.params.type === 'list') {
    collection = OrgList;
  } else {
    collection = OrgObject;
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

/**
 * GET the diff between year month day and the day before it
 */
org.get('/diff/year/:y/month/:m/day/:d', function (req, res) {
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

/**
 * GET the diff view between the left day and the right day
 */
org.get('/year/:ly/month/:lm/day/:ld/diff/year/:ry/month/:rm/day/:rd', validateDate, function (req, res) {
  listDiff.diffHtml(req.left, req.right, OrgObject, function (err, result) {
    if (err) {
      log.error(err);
      return res.status(500).send(err.message);
    }
    return res.render('org-diff', result);
  });
});

/**
 * GET the diff json between the left day and the right day
 */
org.get('/year/:ly/month/:lm/day/:ld/diff/year/:ry/month/:rm/day/:rd/json', validateDate, function (req, res) {
  listDiff.getDiff(req.left, req.right, OrgObject, function (err, diff) {
    if (err) {
      log.error(err);
      return res.status(500).send(err.message);
    }
    res.json(diff);
  });
});

/**
 * GET the diff report json between the left day and the right day
 */
org.get('/year/:ly/month/:lm/day/:ld/diff/year/:ry/month/:rm/day/:rd/report/json', validateDate, function (req, res) {
  listDiff.getDiff(req.left, req.right, OrgObject, function (err, d) {
    if (err) {
      log.error(err);
      return res.status(500).send(err.message);
    }
    res.json({left: d.left, right: d.right, report: listDiff.deltaGroup(d.diff)});
  });
});

/**
 * Create a new snapshot for current date and time
 */
org.post('/now', function (req, res) {
  getOrgList(true, function (err, list) {
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

module.exports = org;
