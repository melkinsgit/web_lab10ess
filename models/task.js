// task.js for mongoose - defines prototype of JSON object

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/* task db prototype */

var taskSchema = new Schema ({
	name : String,
	completed : Boolean
});

// mongoose.model turns it into a Task object - uppercase first letter - because it's like a class definition
var Task = mongoose.model('Task', taskSchema);

// using the module exports statement allows us to create Task objects in other files; we use the require statement to include this file, which gives us access to the Task
module.exports = Task;