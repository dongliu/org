var express = require('express');
var auth = express.Router();
var log = require('../lib/log');

var _ = require('lodash');

// var debug = require('debug')('org:auth');

var waterfall = require('async').waterfall;

var EmployeeList = require('../models/employee-list').EmployeeList;
var getEmployeeList = require('../lib/active-employee-list').getEmployeeList;

var OrgList = require('../models/org-list').OrgList;
var getOrgList = require('../lib/org-list').getOrgList;

var employeeListCache = null;
var orgListCache = null;



auth.get('/', function (req, res) {
  res.render('auth');
});


/**
 * GET an employee's auth description
 */
auth.get('/:id/json', function (req, res) {
  var today = new Date();
  var y = today.getFullYear();
  var m = today.getMonth() + 1;
  var d = today.getDate();
  var query = {
    year: Number(y),
    month: Number(m),
    day: Number(d)
  };
  var employeeIsFresh = false;
  var orgIsFresh = false;

  // check if the employee cache is fresh
  if (employeeListCache && (employeeListCache.year === query.year && employeeListCache.month === query.month && employeeListCache.day === query.day)) {
    employeeIsFresh = true;
  }

  // check the employee list for activeness
  waterfall([function getList(cb) {
    if (employeeIsFresh) {
      cb(null, employeeListCache);
    } else {
      EmployeeList.findOne(query).lean().exec(function (err, list) {
        cb(err, list)
      });
    }
  },
    function checkList(list, cb) {
      if (list) {
        cb(null, list);
      } else {
        getEmployeeList(true, function (err, list) {
          cb(err, list);
        })
      }
    },
    function findInList(list, cb) {
      if (!employeeIsFresh) {
        // set cache
        employeeListCache = list;
        employeeIsFresh = true;
      }
      var employee = _.find(list.employees, {
        'person_id': req.params.id
      });
      cb(null, employee);
    }
  ], function (err, employee) {
    if (err) {
      log.error(err);
      return res.status(500).send(err.message);
    }

    if (typeof employee === 'undefined') {
      // if not active, send response
      return res.status(200).send({});
    }
    // add supervisor information
    employee.supervisor = _.find(employeeListCache.employees, {
      'emp_no': employee.sup_emp_no
    });

    // check if the org list cache is fresh
    if (orgListCache && (orgListCache.year === query.year && orgListCache.month === query.month && orgListCache.day === query.day)) {
      orgIsFresh = true;
    }

    // add leader information
    waterfall([function getList(cb) {
      if (orgIsFresh) {
        cb(null, orgListCache);
      } else {
        OrgList.findOne(query).lean().exec(function (err, list) {
          cb(err, list)
        });
      }
    },
      function checkList(list, cb) {
        if (list) {
          cb(null, list);
        } else {
          getOrgList(true, function (err, list) {
            cb(err, list);
          });
        }
      },
      function findLeader(list, cb) {
        // set cache
        if (!orgIsFresh) {
          orgListCache = list;
          orgIsFresh = true;
        }
        var units = _.filter(list.units, {
          'leader': req.params.id
        }).map(function (u) {
          return _.pick(u, ['company_id', 'org_code', 'org_name', 'org_entity', 'leader', 'sup_emp_no', 'org_term_type']);
        });
        cb(null, units);
      }
    ], function (err, units) {
      if (err) {
        log.error(err);
        return res.status(200).send(employee);
      }
      employee.leaderOf = units;
      return res.status(200).send(employee);
    });
  });
});

module.exports = auth;
