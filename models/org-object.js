var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var _ = require('lodash');
var log = require('../lib/log');

var orgObject = new Schema({
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
  units: Schema.Types.Mixed
});

/**
 * create an object representation of the org list
 * @param  {OrgList}   list the available OrgList object or json
 * @param  {Function} cb   callback when saved
 */
orgObject.methods.fromList = function (list, cb) {
  this.year = list.year;
  this.month = list.month;
  this.day = list.day;
  this.hours = list.hours;
  this.units = {};
  list.units.forEach(function (e) {
    this.units[e.org_code] = e;
  });
  this.save(function (err, orgObject) {
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

orgObject.index({
  year: 1,
  month: 1,
  day: 1,
  hours: 1
});


var OrgObject = mongoose.model('OrgObject', orgObject);

module.exports = {
  OrgObject: OrgObject
};
