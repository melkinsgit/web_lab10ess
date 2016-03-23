// Lab 10 Ess app.js

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// add Mongo, Mongo Object ID and assert
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
const assert = require('assert');

// required the files in the routes dir
// the index route
var index = require('./routes/index');
// the new tasks route
var tasks = require('./routes/tasks');
// the new about route
var about = require('./routes/about');
// the users route has been eliminated, as we eliminated the file in the routes dir

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// create database connection string
var url = "mongodb://localhost:27017/todo"

MongoClient.connect(url, function(err, db) {
	if (err)
	{
		console.log("Error connecting to Mongo server ", err);
		assert(!err);  // crash application if this err encountered
	}
	
	// otherwise show that we're connected
	console.log("Established database connection");
	
	// TO DO set up routes, middleware and error handlers (added code from outisde this callback) here
	
	// give all routes access to DB
	app.use(function (req, res, next) {
		req.db = {};
		req.db.tasks = db.collection('tasks');
		next();
	} );
	
	// routes from the root level of the routes dir
	app.use('/', index);  // don't have to say /index, it is assumed
	app.use('/about', about);
	app.use('/tasks', tasks);
	
	// error handlers - this code was originally outside the callback on the connection to db

	// catch 404 and forward to error handler
	app.use(function(req, res, next) {
	  var err = new Error('Not Found');
	  err.status = 404;
	  next(err);
	});

	// development error handler
	// will print stacktrace
	if (app.get('env') === 'development') {
	  app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
		  message: err.message,
		  error: err
		});
	  });
	}

	// production error handler
	// no stacktraces leaked to user
	app.use(function(err, req, res, next) {
	  res.status(err.status || 500);
	  res.render('error', {
		message: err.message,
		error: {}
	  });
	});
});

module.exports = app;
