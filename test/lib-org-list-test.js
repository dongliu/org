/************
 * run the following script to start a mongo instance on port 27018 at /tmp/db
 * mongod --port 27018 --dbpath /tmp/db
 ***********/

require('should');
var debug = require('debug')('org:test');
var mongoose = require('mongoose');
var assert = require('power-assert');
mongoose.connection.close();
var getOrgList = require('../lib/org-list').getOrgList;
var flatChart = require('../lib/org-list').flatChart;

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

var OrgList = require('../models/org-list').OrgList;
var OrgObject = require('../models/org-object').OrgObject;

var chart = {
  'company_id': '1',
  'org_code': '1',
  'org_name': '',
  'org_entity': 'LAB',
  'leader': 'leader1',
  'sup_emp_no': '1',
  'org_term_type': 'Laboratory',
  'org_level': '1',
  'sup_org_code': '*',
  'dept_org_code': '1',
  'dept_name': 'Laboratory',
  'unit_org_code': '1',
  'unit_name': 'Laboratory',
  'children': [{
    'company_id': '1',
    'org_code': '2',
    'org_name': 'Director',
    'org_entity': 'LAB.X.X',
    'leader': 'leader2',
    'sup_emp_no': '2',
    'org_term_type': 'Department',
    'org_level': '4',
    'sup_org_code': '1',
    'dept_org_code': '2',
    'dept_name': 'Director',
    'unit_org_code': '1',
    'unit_name': 'Laboratory',
    'children': [{
      'company_id': '1',
      'org_code': '3',
      'org_name': 'Director Staff',
      'org_entity': 'LAB.X.X.X',
      'leader': 'leader3',
      'sup_emp_no': '3',
      'org_term_type': 'Group',
      'org_level': '5',
      'sup_org_code': '2',
      'dept_org_code': '2',
      'dept_name': 'Director',
      'unit_org_code': '1',
      'unit_name': 'Laboratory',
      'children': []
    }, {
      'company_id': '1',
      'org_code': '4',
      'org_name': 'Compliance Group',
      'org_entity': 'LAB.X.X.X',
      'leader': 'leader4',
      'sup_emp_no': '3',
      'org_term_type': 'Group',
      'org_level': '5',
      'sup_org_code': '2',
      'dept_org_code': '2',
      'dept_name': 'Director',
      'unit_org_code': '1',
      'unit_name': 'Laboratory',
      'children': []
    }]
  }, {
    'company_id': '1',
    'org_code': '5',
    'org_name': 'Systems',
    'org_entity': 'LAB.X.X',
    'leader': 'leader5',
    'sup_emp_no': '5',
    'org_term_type': 'Division',
    'org_level': '3',
    'sup_org_code': '1',
    'dept_org_code': '5',
    'dept_name': 'Systems',
    'unit_org_code': '1',
    'unit_name': 'Laboratory',
    'children': [{
      'company_id': '1',
      'org_code': '6',
      'org_name': 'Integration',
      'org_entity': 'LAB.X.X.X',
      'leader': 'leader6',
      'sup_emp_no': '6',
      'org_term_type': 'Department',
      'org_level': '4',
      'sup_org_code': '5',
      'dept_org_code': '6',
      'dept_name': 'Integration',
      'unit_org_code': '1',
      'unit_name': 'Laboratory',
      'children': [{
        'company_id': '1',
        'org_code': '7',
        'org_name': 'Transport',
        'org_entity': 'LAB.X.X.X.X',
        'leader': 'leader7',
        'sup_emp_no': '7',
        'org_term_type': 'Group',
        'org_level': '5',
        'sup_org_code': '6',
        'dept_org_code': '6',
        'dept_name': 'Integration',
        'unit_org_code': '1',
        'unit_name': 'Laboratory',
        'children': []
      }]
    }]
  }]
};

describe('lib/org-list', function () {
  this.timeout(60 * 1000);
  before(function (done) {
    mongoose.connect(mongoURL, mongoOptions, function (err) {
      if (err) {
        return done(err);
      }
      debug('conn ready:  ' + mongoose.connection.readyState);
      OrgList.remove({}, function (lErr) {
        if (lErr) {
          return done(lErr);
        }
        OrgObject.remove({}, function (oErr) {
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

  describe('#flatChart()', function () {
    it('flat the org chart', function () {
      var list = new OrgList();
      flatChart(chart, list);
      assert.equal(7, list.units.length);
    });
  });

  var year;
  var month;
  var day;
  var oList;

  describe('#getOrgList()', function () {
    it('get the org chart', function (done) {
      getOrgList(true, function (err, list) {
        assert.ifError(err);
        if (err) {
          debug(err);
          return done(err);
        }
        var date = new Date();
        if (list) {
          debug('org list and object saved');
          assert.equal(list.year, date.getFullYear());
          year = list.year;
          assert.equal(list.month, date.getMonth() + 1);
          month = list.month;
          assert.equal(list.day, date.getDate());
          day = list.day;
          assert.equal(list.hours, date.getHours());
          // debug(list);
          assert(Array.isArray(list.units));
          done();
        } else {
          done(new Error('cannot get the list'));
        }
      });
    });

    it('saved the org list in db, and get the list', function (done) {
      var q = {
        year: year,
        month: month,
        day: day
      };
      debug(q);
      OrgList.findOne(q).lean().exec(function (err, list) {
        assert.ifError(err);
        if (err) {
          return done(err);
        }
        if (list) {
          oList = list;
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
      OrgObject.findOne(q).lean().exec(function (err, o) {
        assert.ifError(err);
        if (err) {
          return done(err);
        }
        if (o) {
          debug(Object.keys(o.units).length);
          assert.equal(Object.keys(o.units).length, oList.units.length);
          // debug(o);
          done();
        } else {
          done(new Error('cannot find the object'));
        }
      });
    });
  });
});
