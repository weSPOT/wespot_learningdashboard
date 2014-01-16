var http = require('http');
var RESTful = require('../RESTful.js').RESTful;
//---------------
//get user data from ELGG
//PARAMETERS:
//---------------

exports.getUsers = function(req, res) {
    //param

    return RESTful.doGET(res,'inquiry.wespot.net','/services/api/rest/json/?method=site.users&api_key=27936b77bcb9bb67df2965c6518f37a77a7ab9f8');
}