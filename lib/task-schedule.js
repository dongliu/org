var schedule = require('node-schedule');
var getEmployeeList = require('./active-employee-list').getEmployeeList;
var getOrgList = require('./org-list').getOrgList;

/**
 * Create the retrieving employee list job
 * @param  {String} s the cron-style rule
 * @param  {Function} gcb the callback function executed when the the list
 *                        is saved
 * @param  {Function} jcb the callback function executed when the job run
 * @return {Job}   the created job
 */
function employeeListJob(s, gcb, jcb) {
  var job = schedule.scheduleJob('get-employee-list', s, getEmployeeList.bind(null, true, gcb), jcb);
  return job;
}

/**
 * Create the retrieving org list job
 * @param  {String} s the cron-style rule
 * @param  {Function} gcb the callback function executed when the the list
 *                        is saved
 * @param  {Function} jcb the callback function executed when the job run
 * @return {Job}   the created job
 */
function orgListJob(s, gcb, jcb) {
  var job = schedule.scheduleJob('get-org-list', s, getOrgList.bind(null, true, gcb), jcb);
  return job;
}

module.exports = {
  employeeListJob: employeeListJob,
  orgListJob: orgListJob
};
