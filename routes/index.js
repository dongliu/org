var express = require('express');
var index = express.Router();

/* GET home page. */
index.get('/', function(req, res) {
  res.render('index');
});

module.exports = index;
