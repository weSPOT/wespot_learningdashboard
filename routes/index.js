var user = require('./user.js');
/*
 * GET home page.
 */

exports.index = function(req, res){

  user.getUsers()
  res.render('index.html');
};