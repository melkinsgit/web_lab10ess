// Lab 10 Ess tasks.js

var express = require('express');
var router = express.Router();
// NO LONGER USING THIS var ObjectID = require('mongodb').ObjectID;
// include the prototype - which is in models - it is task.js (singular)
var Task = require('../models/task.js')

/* GET */
// Gets a list of NOT completed tasks
router.get('/', function (req, res, next) {
	
	Task.find( { completed : false}, function (error, allTasks) {
		if (error)  // get an allTasks (array) unless there is an error
		{
			return next(error);
		}
		res.render('tasks', {title : "TODO", tasks : allTasks });
	} ); 
	
} ) ;

/* POST New Task */
// ADD NEW TASK
// Adds new task to the database then redirects to tasks so we see the list
router.post('/addtask', function (req, res, next) {
	// where req is from the client and has a body with a task_name value
	console.log('trying to add a task');
	// if there is no data sent to request or there is no name for the task sent
	if (!req.body || !req.body.task_name)
	{
		return next(new Error('no data provided') );
	}
	
	// create a new Task by instantiating a Task object
	var newTask = Task ({name : req.body.task_name, completed : false});
	console.log(newTask);
	
	// if all the data is here, go ahead and save the new TO DO, of course it is not completed
	newTask.save(function (error, task) {
		if (error)
		{
			return next(error);  // if the save didn't work
		}
		else 
		{
			res.redirect('/tasks');  // if all went as planned show us the tasks
		}
	} );
} );


/* GET completed tasks */
// Gets a list of the completed tasks
router.get( '/completed', function (req, res, next) {
  	Task.find ({ completed : true}, function (error, tasklist) {
		if (error)  // get a tasklist (array) unless there is an error
		{
			return next(error);
		}
		// we can display the full task list or an empty array
		res.render('tasks_completed', {title : "Completed", tasks : tasklist || [] });
	} );
} );


/* POST All tasks completed */
router.post('/alldone', function (req, res, next) {
	
	Task.update ( { completed : false }, { completed : true }, {multi : true}, function (error, count) {
		if (error)
		{
			console.log('error ' + error);
			return next(error)
		}
		res.redirect('/tasks')
	} );
} );


// this gets called for routes with url parameters - i.e. when you need to send something to a db req - such as DELETE and POST reqs
// It provides a task object (_id, name, completed) as an ATTRIBUTE of the req object
// Order matters - we don't want it to operate on methods above

/* PARAM */
// finds a task with a given id - is called from other methods to return the task object
router.param('task_id', function (req, res, next, taskId) {
	
	console.log("params being extracted from the URL for " + taskId);
	
	// request from the db collection tasks exactly 1 task with matching id
	Task.findById ( taskId, function (error, task) { // where task is task associated with the taskId from the client
		if (error)
		{
			return next(error); // get out of fn
		}
		req.task = task;  // sets a value to the request object; adds data to the data coming from the client
		return next();
	} );
} );


/* POST Completed task */
router.post('/:task_id', function (req, res, next) {
	
	if (!req.body.completed)
	{
		return next (new Error ('body missing paramter?'));
	}
	Task.findByIdAndUpdate(req.task._id, {completed : true }, function (error, result){
			if (error)
			{
				return next(error);
			}
			res.redirect('/tasks');
	} );
} );




/* DELETE Delete a given task */
router.delete('/:task_id', function (req, res, next) {
	
	Task.findByIdAndRemove( req.task._id, function (error, result) {
		if (error)
		{
			return next(error);
		}
		res.sendStatus(200);  // send success to AJAX call
	} );
} );

module.exports = router;