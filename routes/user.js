var http = require('http');
var RESTful = require('../RESTful.js');

exports.users = {};

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

exports.userMapping = function(req,res)
{
    var users = {};
    exports.getUsers(function(d){
        d[0].result.forEach(function(u)
        {
            try{

                users[u.oauthProvider.toLowerCase() + "_" + u.oauthId.toLowerCase()] = {name:u.name, icon:u.icon};
            }
            catch(exc)
            {
                console.log(u.oauthProvider);
            }
        });


        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.write(JSON.stringify(users));
        res.end();
        return;

    });
}