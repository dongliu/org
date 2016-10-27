/************
 * run the following script to start a mongo instance on port 27018 at /tmp/db
 * mongod --port 27018 --dbpath /tmp/db
 ***********/
var series = require('async').series;
require('should');
var debug = require('debug')('org:test');
var mongoose = require('mongoose');
var assert = require('power-assert');
mongoose.connection.close();
mongoose.Promise = global.Promise;
var _ = require('lodash');

var mongoOptions = {
  db: {
    native_parser: true
  },
  server: {
    poolSize: 5,
    socketOptions: {
      connectTimeoutMS: 30000,
      keepAlive: 1
    }
  }
};

var mongoURL = 'mongodb://localhost:27018/org_test';

var EmployeeObject = require('../models/employee-object').EmployeeObject;
var getEmployeeDiff = require('../lib/employee-list-diff').getEmployeeDiff;
var deltaGroup = require('../lib/employee-list-diff').deltaGroup;
var day1 = {
  year: 2016,
  month: 10,
  day: 1,
  hours: 4,
  employees: {
    '1': {
      'person_id': 'test1',
      'lname': 'test',
      'fname': '1',
      'emp_no': '1',
      'employee_name': 'test 1',
      'sup_emp_no': '2',
      'org_code': '111I200',
      'emp_cat_name': 'CA',
      'employee_status': 'Current'
    },
    '2': {
      'person_id': 'test2',
      'lname': 'test',
      'fname': '2',
      'emp_no': '2',
      'employee_name': 'test 2',
      'sup_emp_no': '3',
      'org_code': '111I200',
      'emp_cat_name': 'CA',
      'employee_status': 'Current'
    },
    '3': {
      'person_id': 'test3',
      'lname': 'test',
      'fname': '3',
      'emp_no': '1',
      'employee_name': 'test 3',
      'sup_emp_no': null,
      'org_code': '111I200',
      'emp_cat_name': 'CA',
      'employee_status': 'Current'
    }
  }
};

var day2 = {
  year: 2016,
  month: 9,
  day: 30,
  hours: 4,
  employees: {
    '1': {
      'person_id': 'test1',
      'lname': 'test',
      'fname': '1',
      'emp_no': '1',
      'employee_name': 'test 1',
      'sup_emp_no': '3',
      'org_code': '111I200',
      'emp_cat_name': 'CA',
      'employee_status': 'Current'
    },
    '4': {
      'person_id': 'test4',
      'lname': 'test',
      'fname': '4',
      'emp_no': '4',
      'employee_name': 'test 4',
      'sup_emp_no': '1',
      'org_code': '111I200',
      'emp_cat_name': 'CA',
      'employee_status': 'Current'
    },
    '3': {
      'person_id': 'test3',
      'lname': 'test',
      'fname': '3',
      'emp_no': '1',
      'employee_name': 'test 3',
      'sup_emp_no': null,
      'org_code': '111I200',
      'emp_cat_name': 'CA',
      'employee_status': 'Current'
    }
  }
};

describe('lib/employee-list-diff', function () {
  this.timeout(60 * 1000);
  before(function (done) {
    mongoose.connect(mongoURL, mongoOptions, function (err) {
      if (err) {
        return done(err);
      }
      debug('conn ready:  ' + mongoose.connection.readyState);
      EmployeeObject.remove({}, function (oErr) {
        if (oErr) {
          return done(oErr);
        }
        done();
      });
    });
  });

  after(function (done) {
    mongoose.disconnect(done);
  });

  describe('#series()', function () {
    it('add two test entries in mongodb', function (done) {
      // add two employee object to the db
      series([function (cb) {
        var l1 = new EmployeeObject(day1);
        l1.save(function (err, l) {
          cb(err, l);
        });
      }, function (cb) {
        var l2 = new EmployeeObject(day2);
        l2.save(function (err, l) {
          cb(err, l);
        });
      }], function (sErr, results) {
        assert.ifError(sErr);
        if (sErr) {
          return done(sErr);
        }
        debug(results);
        done();
      });
    });
  });

  var delta;
  describe('#getEmployeeDiff()', function () {
    it('empty diff for the same day', function (done) {
      var left = {
        year: 2016,
        month: 10,
        day: 1
      };
      getEmployeeDiff(left, left, function (err, diff) {
        assert.ifError(err);
        if (err) {
          done(err);
        }
        assert(_.isEmpty(diff));
        done();
      });

    });

    it('callback error because cannot found the day', function (done) {
      var left = {
        year: 2016,
        month: 9,
        day: 29
      };
      var right = {
        year: 2016,
        month: 9,
        day: 30
      };
      getEmployeeDiff(left, right, function (err, diff) {
        debug(err.message);
        if (!err) {
          assert.fail(err.message, 'cannot find records for ...', null, 'is like');
        }
        assert.equal(typeof diff, 'undefined');
        done();
      });
    });

    it('call back with the diff', function (done) {
      var left = {
        year: 2016,
        month: 9,
        day: 30
      };
      var right = {
        year: 2016,
        month: 10,
        day: 1
      };
      getEmployeeDiff(left, right, function (err, diff) {
        assert.ifError(err);
        if (err) {
          done(err);
        }
        assert(!_.isEmpty(diff));
        delta = diff;
        debug(diff);
        done();
      });
    });
  });

  describe('#deltaGroup()', function () {
    it('group the deltas', function () {
      var group = deltaGroup(delta, {news: true, changes: true, leaves: true});
      debug(group);
      assert.ok(_.keys(group.news).length === 1);
      assert.ok(_.keys(group.changes).length === 1);
      assert.ok(_.keys(group.leaves).length === 1);
    });
  });
});
