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

//---------------
//get inquiry data from jose's datastore
//PARAMETERS:
// - inquiryId
//---------------
exports.getEvents = function(inquiryId, callback)
{
    RESTful.doGET('ariadne.cs.kuleuven.be','/wespot-ws/events?context='+ inquiryId , callback, "DDr8yQIDHVaL4ogvV6YP0gtPvA0UnL6e");
    //RESTful.doGETPORT('dali.cs.kuleuven.be',8082,'/datastore/events?context='+ inquiryId , callback, "DDr8yQIDHVaL4ogvV6YP0gtPvA0UnL6e");
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
    RESTful.doGET(DEV_OR_PROD_WESPOT,'/services/api/rest/json/?method=site.inquiries&api_key=27936b77bcb9bb67df2965c6518f37a77a7ab9f8',callback);
}

exports.getSubInquiries = function(inquiryId, callback, inquiry, nrOfInq, req, res)
{
    RESTful.doGET(DEV_OR_PROD_WESPOT,'/services/api/rest/json/?method=inquiry.subinquiries&api_key=27936b77bcb9bb67df2965c6518f37a77a7ab9f8&inquiryId='+inquiryId,callback);
}

exports.getParentInquiry = function(inquiryId, callback, inquiry, nrOfInq, req, res)
{
    RESTful.doGET(DEV_OR_PROD_WESPOT,'/services/api/rest/json/?method=inquiry.parent&api_key=27936b77bcb9bb67df2965c6518f37a77a7ab9f8&inquiryId='+inquiryId,callback);
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
    RESTful.doGET(DEV_OR_PROD_WESPOT,'/services/api/rest/json/?method=user.inquiries&oauthId='+userAuthId+'&oauthProvider='+userAuthProvider+'&api_key=27936b77bcb9bb67df2965c6518f37a77a7ab9f8',callback);
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

//DIAGNOSTICS CONFIG CALLS

//GET THE PHASES WE SHOULD ONLY SHOW
exports.getPhases = function(inquiryId, callback)
{
    RESTful.doGET(DEV_OR_PROD_WESPOT,'/services/api/rest/json/?method=inquiry.phases&inquiry_id=' + inquiryId + '&api_key=27936b77bcb9bb67df2965c6518f37a77a7ab9f8',function(data,errorMessage){
        if (errorMessage != undefined || data[0].status != 0 || data[0].result.phases == null) {
            callback([1, 2, 3,4,5,6]);
            return;
        }
        callback(data[0].result.as_array);
    });
}

//GET SKILLS
exports.getSkillsAndActivities = function(inquiryId, callback)
{
    //get skills
    RESTful.doGET(DEV_OR_PROD_WESPOT,'/services/api/rest/json/?method=inquiry.skills&inquiry_id=' + inquiryId + '&api_key=27936b77bcb9bb67df2965c6518f37a77a7ab9f8',function(data,errorMessage){
        if (errorMessage != undefined || data[0].status != 0) {
            callback(errorMessage);
            return;
        }
        var skills = data[0].result;
        if(skills.length == 0) {
            callback({});
            return;
        }
        var skillIdToSkill = {};
        var skillsForURL = "";
        skills.forEach(function(skill){
            skillIdToSkill[skill.skill_id] = skill;
            skillsForURL += skill.skill_id + ",";
        });
        //get activities that go with skills
        RESTful.doGET(DEV_OR_PROD_WESPOT,'/services/api/rest/json/?method=inquiry.activities_per_skill&inquiry_id=' + inquiryId + '&skill_ids='+ skillsForURL +'&api_key=27936b77bcb9bb67df2965c6518f37a77a7ab9f8',function(data,errorMessage) {
            var activitiesPerSkillId = data[0].result;
            Object.keys(activitiesPerSkillId).forEach(function(activity){
                if(skillIdToSkill[activity] == undefined)
                {

                    return;
                }
                skillIdToSkill[activity].activities = activitiesPerSkillId[activity];
            });
            callback(skillIdToSkill);
        });



    });
}


//GET ADMINS OF AN INQUIRY
exports.getAdmins = function(inquiryId, callback)
{
    RESTful.doGET(DEV_OR_PROD_WESPOT,'/services/api/rest/json/?method=inquiry.admins&inquiryId=' + inquiryId + '&api_key=27936b77bcb9bb67df2965c6518f37a77a7ab9f8',function(data,errorMessage){
        if (errorMessage != undefined || data[0].status != 0) {
            callback([]);
            return;
        }
        callback(data[0].result);
    });
}





