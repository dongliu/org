var bunyan = require('bunyan');
var log = bunyan.createLogger({
  name: 'org'
});

module.exports = log;
