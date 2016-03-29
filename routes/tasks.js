// Lab 10 Ess tasks.js

var express = require('express');
var router = express.Router();
var ObjectID = require('mongodb').ObjectID;

// this gets called for routes with url parameters - i.e. when you need to send something to a db req - such as DELETE and POST reqs
// It provides a task object (_id, name, completed) as an ATTRIBUTE of the req object
// Order matters - we don't want it to operate on methods above

/* PARAM */
// finds a task with a given id - is called from other methods to return the task object
router.param('task_id', function (req, res, next, taskId) {
	console.log("params being extracted from the URL for " + taskId);
	// request from the db collection tasks exactly 1 task with matching id
	req.db.tasks.find ( { _id : ObjectID(taskId)} ).limit(1).toArray(function (error, task) { // where task is the name of the returned array
		if (error)
		{
			console.log ("param error " + error);
			return next(error); // get out of fn
		}
		if (task.length != 1 )  // i.e. no matches to ids because it cannot be mroe than 1 due to limit in req
		{
				return next(new Error (task.length + ' tasks found, should be 1') );
		}
		req.task = task[0];  // the only element that should be returned for a match - this should be the task object with the ATTRIBUTE that has info about the name and state of the task
		console.log(req.task);
		return next();
	} );
} );

/* GET */
// Gets a list of NOT completed tasks
router.get('/', function (req, res, next) {
	
	req.db.tasks.find( { completed : false} ).toArray (function (error, taskList) {
		if (error)  // get a tasklist (array) unless there is an error
		{
			return next(error);
		}
		var allTasks = taskList || []; // tasks is the taskList or an empty array
		res.render('tasks', {title : "TODO", tasks : allTasks });
	} ); 
	
} ) ;

/* POST New Task */
// ADD NEW TASK
// Adds new task to the database then redirects to tasks so we see the list
router.post('/addtask', function (req, res, next) {
	// if there is no data sent to request or there is no name for the task sent
	if (!req.body || !req.body.task_name)
	{
		return next(new Error('no data provided') );
	}
	
	// if all the data is there, go ahead and save the new TO DO, of course it is not completed
	req.db.tasks.save( { name : req.body.task_name, completed : false}, function (error, task) {
		if (error)
		{
			return next(error);  // if the save didn't work
		}
		if (!task)
		{
			return next(new Error ('error saving new task') );  // if the save didn't result in a returned task
		}
		res.redirect('/tasks');  // if all went as planned show us the tasks
	} );
} );

/* GET */
// Gets list of completed tasks
router.get('/completed', function(req, res, next) {
	req.db.tasks.find ( {completed:true} ).toArray( function (error, taskList) {
		if (error){
			return next(error);
		}
		res.render('tasks_completed', {title:'Completed', tasks:taskList || {}});
	} );  // end find
} );  // end get

/* POST Completed task */
router.post('/:task_id', function (req, res, next) {
	
	if (!req.body.completed)
	{
		return next (new Error ('body missing paramter?'));
	}
	req.db.tasks.updateOne(
		{_id : ObjectID(req.task._id)},
		{$set :{completed : true}},
		function(error, result) {
			if (error)
			{
				return next(error);
			}
			res.redirect('/tasks');
	} );
} );

/* POST */
// Marks all tasks as completed
router.post('/:task_id', function (req, res, next) {
	req.db.tasks.updateMany ( {completed : false}, {$set : { completed:true }}, function (error, count) {
		if (error) {
			console.log('error ' + error);
			return next(error);
		}
		res.redirect('/tasks');
	} );  // end updateMany
} ); // post call back

/* DELETE Delete a given task */
router.delete('/:task_id', function (req, res, next) {
	
	req.db.tasks.remove ( { _id:ObjectID(req.task._id) }, function (error, result) {
		if (error)
		{
			return next(error);
		}
		res.sendStatus(200);  // send success to AJAX call
	} );
} );


/* GET completed tasks */
// Gets a list of the completed tasks
router.get( '/', function (req, res, next) {
	req.db.taskList.find ({ completed : true} ).toArray (function (error, tasklist) {
		if (error)  // get a tasklist (array) unless there is an error
		{
			return next(error);
		}
		// we can display the full task list or an empty array
		res.render('tasks_completed', {title : "Completed", tasks : tasklist || [] });
	} );
} );

// TODO



/* POST All tasks completed */
router.post('/alldone', function (req, res, next) {
	
	req.db.tasks.updateMany ( { completed : false }, {$set : { completed : true }}, function (error, count) {
		if (error)
		{
			console.log('error ' + error);
			return next(error)
		}
		res.redirect('/tasks')
	} );
} );



module.exports = router;