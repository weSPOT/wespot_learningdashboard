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

var http = require('http');
var RESTful = require('../RESTful.js');
var DEV_OR_PROD_WESPOT = "inquiry.wespot.net";
exports.users = {};

exports.getUsers = function(callback)
{
    RESTful.doGET_many(DEV_OR_PROD_WESPOT,'/services/api/rest/json/?method=site.users&api_key=27936b77bcb9bb67df2965c6518f37a77a7ab9f8',callback);
}

exports.getUsersPerInquiry = function(inquiryId, callback)
{
    RESTful.doGET(DEV_OR_PROD_WESPOT,'/services/api/rest/json/?method=inquiry.users&api_key=27936b77bcb9bb67df2965c6518f37a77a7ab9f8&inquiryId='+inquiryId,callback);
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
        d.forEach(function(u)
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