var express = require('express');
var router = express.Router();

/* GET home page. This is going to go to task page instead */
// get the index page, but redirect to the tasks page
router.get('/', function(req, res, next) {
  res.redirect('tasks');
});

module.exports = router;
