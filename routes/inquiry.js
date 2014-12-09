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

//---------------
//get inquiry data from jose's datastore
//PARAMETERS:
// - inquiryId
//---------------
exports.getInquiry = function(inquiryId, callback)
{
    RESTful.doGET('ariadne.cs.kuleuven.be','/wespot-ws/events?context='+ inquiryId , callback);
}

exports.getInquiry_RF = function(req, res) {
    //param
    var inquiryId = req.params.inquiryId;
    exports.getInquiry(inquiryId, function(d)
        {
            res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.write(JSON.stringify(d));
            res.end();
            return;
        }
    );

}



//---------------
//get inquiries from ELGG
//PARAMETERS:
// -
//---------------
exports.getInquiries = function(callback)
{
    RESTful.doGET('inquiry.wespot.net','/services/api/rest/json/?method=site.inquiries&api_key=27936b77bcb9bb67df2965c6518f37a77a7ab9f8',callback);
}

exports.getInquiries_RF = function(req, res) {
    exports.getInquiries(function(d)
    {
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.write(JSON.stringify(d));
        res.end();
        return;
    });
}

//---------------
//get inquiries of user from ELGG
//PARAMETERS:
// - userAuthProvider
// - userAuthId
//---------------
exports.getInquiriesOfUser = function(userAuthId, userAuthProvider, callback)
{
    RESTful.doGET('inquiry.wespot.net','/services/api/rest/json/?method=user.inquiries&oauthId='+userAuthId+'&oauthProvider='+userAuthProvider+'&api_key=27936b77bcb9bb67df2965c6518f37a77a7ab9f8',callback);
}
exports.getInquiriesOfUser_RF = function(req, res) {
    var userAuthId = req.params.userAuthId;
    var userAuthProvider = req.params.userAuthProvider;

    exports.getInquiriesOfUser(userAuthId, userAuthProvider,function(d){
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.write(JSON.stringify(d));
        res.end();
        return;
    });
}








