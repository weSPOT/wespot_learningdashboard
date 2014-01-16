var http = require('http');
var RESTful = require('../RESTful.js');


exports.getUsers = function(callback)
{
    RESTful.doGET('inquiry.wespot.net','/services/api/rest/json/?method=site.users&api_key=27936b77bcb9bb67df2965c6518f37a77a7ab9f8',callback);
}

exports.getUsers_RF = function(req, res) {
    exports.getUsers(
        function(d)
        {
            res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.write(JSON.stringify(d));
            res.end();
            return;
        }
    );
}
