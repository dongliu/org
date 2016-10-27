/************
 * run the following script to start a mongo instance on port 27018 at /tmp/db
 * mongod --port 27018 --dbpath /tmp/db
 ***********/

require('should');
var debug = require('debug')('org:test');
var mongoose = require('mongoose');
var assert = require('power-assert');
mongoose.connection.close();
var getEmployeeList = require('../lib/active-employee-list').getEmployeeList;

mongoose.Promise = global.Promise;

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

var EmployeeList = require('../models/employee-list').EmployeeList;
var EmployeeObject = require('../models/employee-object').EmployeeObject;

describe('lib/active-employee-list', function () {
  this.timeout(60 * 1000);
  before(function (done) {
    mongoose.connect(mongoURL, mongoOptions, function (err) {
      if (err) {
        return done(err);
      }
      debug('conn ready:  ' + mongoose.connection.readyState);
      EmployeeList.remove({}, function (lErr) {
        if (lErr) {
          return done(lErr);
        }
        EmployeeObject.remove({}, function (oErr) {
          if (oErr) {
            return done(oErr);
          }
          done();
        });
      });
    });
  });

  after(function (done) {
    mongoose.disconnect(done);
  });

  var year;
  var month;
  var day;
  var eList;

  describe('#getEmployeeList()', function () {
    it('get the current employee list, and not save', function (done) {
      getEmployeeList(false, function (err, list) {
        assert.ifError(err);
        if (err) {
          return done(err);
        }
        var date = new Date();
        if (list) {
          assert.equal(list.year, date.getFullYear());
          year = list.year;
          assert.equal(list.month, date.getMonth() + 1);
          month = list.month;
          assert.equal(list.day, date.getDate());
          day = list.day;
          assert.equal(list.hours, date.getHours());
          // lower case
          list.employees.forEach(function (e) {
            assert.equal(e.person_id, e.person_id.toLowerCase());
          });
          done();
        } else {
          done(new Error('cannot get the list'));
        }
      });
    });

    it('get the current employee list, and save', function (done) {
      getEmployeeList(true, function (err, list) {
        assert.ifError(err);
        if (err) {
          return done(err);
        }
        var date = new Date();
        if (list) {
          debug('employee list and object saved');
          assert.equal(list.year, date.getFullYear());
          year = list.year;
          assert.equal(list.month, date.getMonth() + 1);
          month = list.month;
          assert.equal(list.day, date.getDate());
          day = list.day;
          assert.equal(list.hours, date.getHours());
          assert.equal(typeof list.employees, 'object');
          // debug(list);
          done();
        } else {
          done(new Error('cannot get the list'));
        }
      });
    });

    it('saved the employee list in db, and get the list', function (done) {
      var q = {
        year: year,
        month: month,
        day: day
      };
      debug(q);
      EmployeeList.findOne(q).lean().exec(function (err, list) {
        assert.ifError(err);
        if (err) {
          return done(err);
        }
        if (list) {
          eList = list;
          // debug(list);
          done();
        } else {
          done(new Error('cannot find the list'));
        }
      });
    });

    it('saved the employee object in db, and get the object', function (done) {
      var q = {
        year: year,
        month: month,
        day: day
      };
      debug(q);
      EmployeeObject.findOne(q).lean().exec(function (err, o) {
        assert.ifError(err);
        if (err) {
          return done(err);
        }
        if (o) {
          debug(Object.keys(o.employees).length);
          assert.equal(Object.keys(o.employees).length, eList.employees.length);
          Object.keys(o.employees).forEach(function (n) {
            assert.equal(n, o.employees[n].emp_no);
          });
          debug(o);
          done();
        } else {
          done(new Error('cannot find the object'));
        }
      });
    });
  });
});
