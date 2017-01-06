var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var rotator = require('file-stream-rotator');
var log = require('./lib/log');
var bodyParser = require('body-parser');
var debug = require('debug')('org:app');

var config = require('config');

var routes = require('./routes/index');
var employees = require('./routes/employees');
var org = require('./routes/org');
var auth = require('./routes/auth');

var app = express();

var employeeListJob = require('./lib/task-schedule').employeeListJob;
var orgListJob = require('./lib/task-schedule').orgListJob;

var dailyELJ;
var dailyOLJ;

// mongoDB starts
var mongoose = require('mongoose');
mongoose.connection.close();
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

var mongoURL = 'mongodb://' + (config.get('mongo.address') || 'localhost') + ':' + (config.get('mongo.port') || '27017') + '/' + (config.get('mongo.db') || 'org');

if (config.has('mongo.user') && config.has('mongo.pass')) {
  mongoOptions.user = config.get('mongo.user');
  mongoOptions.pass = config.get('mongo.pass');
}

if (config.has('mongo.auth')) {
  mongoOptions.auth = config.get('mongo.auth');
}

mongoose.connection.once('connected', function () {
  log.info('Mongoose default connection opened.');
  // start the daily jobs
  dailyELJ = employeeListJob(config.get('service.employee-schedule'), function (err) {
    if (err) {
      log.error(err);
    } else {
      log.info('daily employee list saved');
    }
  });
  dailyELJ.on('run', function () {
    log.info('daily employee list job run');
  });
  dailyELJ.on('canceled', function () {
    log.warn('daily employee list job canceled');
  });

  dailyOLJ = orgListJob(config.get('service.org-schedule'), function (err) {
    if (err) {
      log.error(err);
    } else {
      log.info('daily org list saved');
    }
  });
  dailyOLJ.on('run', function () {
    log.info('daily org list job run');
  });
  dailyOLJ.on('canceled', function () {
    log.warn('daily org list job canceled');
  });
});

mongoose.connection.on('error', function (err) {
  log.error('Mongoose default connection error: ' + err);
});

mongoose.connection.on('disconnected', function () {
  log.warn('Mongoose default connection disconnected');
});

mongoose.connect(mongoURL, mongoOptions);
// mongoDB ends

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

if (app.get('env') === 'production') {
  var logStream = rotator.getStream({
    filename: path.resolve(config.get('app.log_dir'), 'access.log'),
    frequency: 'daily'
  });
  app.use(logger('combined', {
    stream: logStream
  }));
}

if (app.get('env') === 'development') {
  app.use(logger('dev'));
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'bower_components')));

app.use('/', routes);
app.use('/employees', employees);
app.use('/org', org);
app.use('/auth', auth)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
