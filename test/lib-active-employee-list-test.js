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

var EmployeeList = require('../models/employee').EmployeeList;

describe('lib/active-employee-list', function () {
  this.timeout(60 * 1000);
  before(function (done) {
    mongoose.connect(mongoURL, mongoOptions, function (err) {
      if (err) {
        return done(err);
      }
      debug('conn ready:  ' + mongoose.connection.readyState);
      EmployeeList.remove({}, function (userErr) {
        if (userErr) {
          return done(userErr);
        }
        done();
      })
    });
  });

  after(function (done) {
    mongoose.disconnect(done);
  });

  var _id;
  var year;
  var month;
  var day;

  describe('#getEmployeeList()', function () {
    it('get the current employee list', function (done) {
      getEmployeeList(function (err, response, list) {
        assert.ifError(err);
        if (err) {
          return done(err);
        }
        var date = new Date();
        var temp = 'a';
        if (list) {
          _id = list._id;
          assert.equal(list.year, date.getUTCFullYear());
          year = list.year;
          assert.equal(list.month, date.getUTCMonth());
          month = list.month;
          assert.equal(list.day, date.getUTCDay());
          day = list.day;
          assert.equal(list.hours, date.getUTCHours());
          // lower case and sorted
          list.employees.forEach(function (e) {
            assert.equal(e._id, e._id.toLowerCase());
            assert.ok(e._id > temp);
            temp = e._id;
          });
        }
        done();
      });
    });
  });

  describe('#getEmployeeList()-save', function () {
    it('saved the employee list in db', function (done) {
      var q = {
        year: year,
        month: month,
        day: day
      };
      debug(q);
      debug(_id);
      EmployeeList.findOne(q, '_id', function (err, list) {
        // debug(list);
        assert.ifError(err);
        if (err) {
          return done(err);
        }
        if (list) {
          assert.equal(list._id.toString(), _id.toString());
        }
        done();
      });
    });
  });
});
