/************
 * run the following script to start a mongo instance on port 27018 at /tmp/db
 * mongod --port 27018 --dbpath /tmp/db
 ***********/

require('should');
var debug = require('debug')('org:test');
var mongoose = require('mongoose');
var assert = require('power-assert');
mongoose.connection.close();
var employeeListJob = require('../lib/task-schedule').employeeListJob;

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

describe('lib/task-schedule', function () {
  this.timeout(300 * 1000);
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

  describe('#employeeListJob()', function () {
    it('create the job, and run 2 times, then cancel it', function (done) {
      var time = 0;
      // run every 2 minutes
      var job = employeeListJob('*/2 * * * *', function (err) {
        assert.ifError(err);
        if (err) {
          done(err);
        }
        time += 1;
        if (time === 2) {
          job.cancel();
        }
      });
      job.on('scheduled', function () {
        debug('job scheduled');
      });
      job.on('run', function () {
        debug('job run');
      });
      job.on('canceled', function () {
        debug('job canceled');
        assert.equal(time, 2);
        done();
      });
    });
  });
});
