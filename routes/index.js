var user = require('./user.js');
/*
 * GET home page.
 */

exports.index = function(req, res){

  user.getUsers(function(d){
    res.render('index.html', {users: d[0].result});}
  );
};