/* ****************************************************************************
 * Copyright (C) 2014 KU Leuven
 * <p/>
 * This library is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * <p/>
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 * <p/>
 * You should have received a copy of the GNU Lesser General Public License
 * along with this library.  If not, see <http://www.gnu.org/licenses/>.
 * <p/>
 * Contributors: Sven Charleer
 * *************************************************************************** */

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

