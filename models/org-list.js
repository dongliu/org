var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var _ = require('lodash');
var log = require('../lib/log');

var org = require('./org-schema').orgSchema;

var OrgObject = require('./org-object').OrgObject;

var orgList = new Schema({
  year: {
    type: Number,
    required: true
  },
  month: {
    type: Number,
    required: true
  },
  day: {
    type: Number,
    required: true
  },
  hours: {
    type: Number
  },
  units: [org]
});

/**
 * set the year/month/day/hours to now
 */
orgList.methods.setDate2Now = function () {
  var date = new Date();
  this.year = date.getFullYear();
  this.month = date.getMonth() + 1;
  this.day = date.getDate();
  this.hours = date.getHours();
};



/**
 * create an object representation of the unit list
 * @param  {Function} cb   callback when saved
 */
orgList.methods.saveObject = function (cb) {
  var orgObject = new OrgObject();
  orgObject.year = this.year;
  orgObject.month = this.month;
  orgObject.day = this.day;
  orgObject.hours = this.hours;
  orgObject.units = {};
  this.units.forEach(function (o) {
    orgObject.units[o.org_code] = o;
  });
  orgObject.save(function (err, orgObject) {
    if (_.isFunction(cb)) {
      return cb(err, orgObject);
    }
    if (err) {
      log.error(err);
    } else {
      log.info('org object saved on ' + orgObject.year + ' ' + orgObject.month + ' ' + orgObject.day + ' ' + orgObject.hours + '.');
    }
  });
};

// a compound index for date
orgList.index({
  year: 1,
  month: 1,
  day: 1,
  hours: 1
});

var OrgList = mongoose.model('OrgList', orgList);

module.exports = {
  OrgList: OrgList
};
