var https = require('https');
/*
 * GET home page.
 */

exports.index = function(req,res)
{
    var parameters = "?client_id=" + encodeURIComponent(req.body.client_id) +
                     "&client_secret=" + encodeURIComponent(req.body.client_secret) +
                    "&code=" + encodeURIComponent(req.body.code) +
                    "&grant_type=" + encodeURIComponent(req.body.grant_type) +
                    "&redirect_uri=" + encodeURIComponent(req.body.redirect_uri);
    https.get("https://wespot-arlearn.appspot.com/oauth/token" + parameters, function(result){
        console.log("statusCode: ", result.statusCode);
        console.log("headers: ", result.headers);
            var body = "";
            result.on('data',function(d){
                body += d;

             });
        result.on('end',function(){
            res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.write(body)//;JSON.stringify(body));
            res.end();
        });
            result.on('error',function(d) {
                res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                res.write("Error with oauth system");
                res.end();

              });
    });

}

