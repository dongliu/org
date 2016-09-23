var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var rotator = require('file-stream-rotator');
var log = require('./lib/log');
var bodyParser = require('body-parser');


var config = require('./config/config.js');

var routes = require('./routes/index');
var employees = require('./routes/employees');

var app = express();

var employeeListJob = require('./lib/task-schedule').employeeListJob;

var dailyELJ;

// mongoDB starts
var mongoose = require('mongoose');
mongoose.connection.close();


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

var mongoURL = 'mongodb://' + (config.mongo.address || 'localhost') + ':' + (config.mongo.port || '27017') + '/' + (config.mongo.db || 'org');

if (config.mongo.user && config.mongo.pass) {
  mongoOptions.user = config.mongo.user;
  mongoOptions.pass = config.mongo.pass;
}

if (config.mongo.auth) {
  mongoOptions.auth = config.mongo.auth;
}

mongoose.connection.on('connected', function () {
  log.info('Mongoose default connection opened.');
  // start the daily jobs
  dailyELJ = employeeListJob(config.service.schedule, function (err) {
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
    filename: path.resolve(config.app.log_dir, 'access.log'),
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
