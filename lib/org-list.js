var request = require('request');
var log = require('./log');
var OrgList = require('../models/org-list').OrgList;
var _ = require('lodash');
var debug = require('debug')('org:lib');

var config = require('config');

var orgFormData = {
  api_application: config.get('service.hr.api_application'),
  api_key: config.get('service.hr.api_key'),
  recursive: 'true'
}

/**
 * fill the list with nodes in the structured chart
 * @param  {Object} root The org chart root object from HR API
 * @param  {OrgList} list The org list to fill
 */
function flatChart(root, list) {
  list.units.push({
    company_id: root.company_id,
    org_code: root.org_code,
    org_name: root.org_name,
    org_entity: root.org_entity,
    leader: root.leader,
    sup_emp_no: root.sup_emp_no,
    org_term_type: root.org_term_type,
    org_level: root.org_level,
    sup_org_code: root.sup_org_code,
    dept_name: root.dept_name,
    unit_org_code: root.unit_org_code,
    unit_name: root.unit_name
  });
  if (root.children && root.children.length) {
    root.children.forEach(function (c) {
      flatChart(c, list);
    })
  }
  return list;
}

/**
 * retrieve the org list
 * @param  {Boolean}   save save in the db or not
 * @param  {Function} cb   the callback function
 */
function getOrgList(save, cb) {
  request({
    url: config.get('service.hr.urls.orgchart'),
    method: 'POST',
    formData: orgFormData,
    json: true,
    timeout: 30 * 1000
  }, function (error, response, body) {
    if (error) {
      debug(error);
      if (_.isFunction(cb)) {
        return cb(error);
      } else {
        log.error(error);
        return;
      }
    }
    if (response.statusCode >= 400) {
      debug(response.statusCode);
      debug(response.headers);
      return cb(new Error('' + response.statusCode));
    }
    // set employees, convert _id
    var list = new OrgList();
    list.setDate2Now();
    body.forEach(function(r) {
      flatChart(r, list);
    })

    // debug(list.toJSON());
    if (!save) {
      return cb(null, list.toJSON());
    }

    list.save(function (err, newList) {
      if (err) {
        if (_.isFunction(cb)) {
          return cb(err);
        } else {
          log.error(err);
        }
      } else {
        if (newList) {
          if (_.isFunction(cb)) {
            cb(null, newList.toJSON());
          }
          newList.saveObject(function (oErr, eObject) {
            if (oErr) {
              log.error(oErr);
            } else {
              if (eObject) {
                if (_.isFunction(cb)) {
                  return cb(null, eObject.toJSON());
                } else {
                  log.info('employee list and object saved on ' + newList.year + ' ' + newList.month + ' ' + newList.day + ' ' + newList.hours + '.');
                }
              } else {
                log.warn('no save error, and employee object not saved!');
              }
            }
          });
        } else {
          log.warn('no save error, and employee list not saved!');
        }
      }
    });
  })
}

module.exports = {
  flatChart: flatChart,
  getOrgList: getOrgList
};
