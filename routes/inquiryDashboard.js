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


var inquiry = require('./inquiry.js');
var user = require('./user.js');
/*
 * GET home page.
 */

/* return the events by user hash and event id hash
 parameters
 - data
      format:
        data.context = {course, phase, subphase}
        data.object = (url|other)
        data.username = authprovider_authid
 - returns
      format:
        [user]
            username
            [phase]
                [eventid]
                    inquiryId
                    phase
                    subphase
                    username
                    data
*/



function convertEventData(rawEvent) {
    var event = {};

    event.data = rawEvent;
    event.id = rawEvent.event_id;

    //convert to a day

    event.startTime = Date.UTC(new Date(rawEvent.starttime).getFullYear(), new Date(rawEvent.starttime).getMonth(), new Date(rawEvent.starttime).getDate());
    var today = Date.UTC(new Date(Date.now()).getFullYear(), new Date(Date.now()).getMonth(), new Date(Date.now()).getDate());
    if(event.startTime == today)
        event.today = true;
    else event.today = false;

    var context = rawEvent.context;


    if(context.phase == "Data Collection") context.phase = 3;

    event.inquiryId = context.course;
    event.phase = context.phase;
    event.subphase = context.subphase;
    event.object = rawEvent.object;
    try {
        event.originalRequest = rawEvent.originalrequest;// JSON.parse(rawEvent.originalrequest)

        if(rawEvent.verb == "response") //ARLearn
        {
            if(rawEvent.originalrequest.responseValue.imageUrl != undefined)
            {
                event.html = "<img src='" + rawEvent.originalrequest.responseValue.imageUrl.replace(/\\/g, "") + "'></img>";
                event.object = rawEvent.originalrequest.responseId;
            }
            if(rawEvent.originalrequest.responseValue.audioUrl != undefined)
            {
                event.html = "<audio controls> <source src='" + rawEvent.originalrequest.responseValue.audioUrl.replace(/\\/g, "") + "'> Your browser does not support the audio tag.</audio>";
                event.html += "<br/>[<a  target='_blank' href='" + rawEvent.originalrequest.responseValue.audioUrl.replace(/\\/g, "") + "'>source</a>]";
                event.object = rawEvent.originalrequest.responseId;
            }    //
            if(rawEvent.originalrequest.responseValue.videoUrl != undefined)
            {
                event.html = "<video controls> <source src='" + rawEvent.originalrequest.responseValue.videoUrl.replace(/\\/g, "") + "' type='video/mp4'> Your browser does not support the video tag.</video>";
                event.html += "<br/>[<a  target='_blank' href='" + rawEvent.originalrequest.responseValue.videoUrl.replace(/\\/g, "") + "'>source</a>]";
                event.object =  rawEvent.originalrequest.responseId;
            }
            if(rawEvent.originalrequest.responseValue.text != undefined)
            {
                event.html = rawEvent.originalrequest.responseValue.text;
                event.object =  rawEvent.originalrequest.responseId;
            }
            if(rawEvent.originalrequest.value != undefined && rawEvent.originalrequest.value.tags != undefined)
            {
                event.tags = rawEvent.originalrequest.value.tags;
            }

            return event;
        }
        if(rawEvent.verb == "rated") //ELGG
        {
            event.rating = rawEvent.originalrequest.value;
            event.source = rawEvent.object;
            return event;
        }
        if(rawEvent.verb == "like") //ELGG
        {
            event.liked = true;
            event.source = rawEvent.object;
            return event;
        }
        if(rawEvent.verb == "comment"
            || rawEvent.verb == "create" || rawEvent.verb == "reply" || rawEvent.verb == "answer")

        {

            var htmlTitle = "";
            var htmlData = "";
            if(rawEvent.originalrequest.value && rawEvent.originalrequest.value.title != undefined)
            {
                htmlTitle =  "<h3 class='phase"+ event.phase+ "'>" + rawEvent.originalrequest.value.title + "</h3>"

            }
            if(rawEvent.originalrequest.value && rawEvent.originalrequest.value.description != undefined)
            {

                htmlData = "<p>"+rawEvent.originalrequest.value.description  + "</p>"
            }
            else
            {
                htmlData = rawEvent.originalrequest.value;
            }
            event.html =  htmlTitle + "<span class='thread_subtitle phase"+ event.phase+ "''>" + user.users[rawEvent.username.toLowerCase()].name + " [" + event.subphase + "]</span>"+ htmlData + "<br/>[<a target='_blank' href='" + rawEvent.object + "'>source</a>]";
            if(rawEvent.originalrequest.value && rawEvent.originalrequest.value.tags != undefined)
                event.tags = rawEvent.originalrequest.value.tags;
            return event;
        }


    }
    catch (exc) {
        console.log(exc.toString());
        console.log(JSON.stringify(rawEvent));
        //console.log(rawEvent.originalrequest.toString());
        return null;
    }



    return null;
}
function convertToEventsByUsersAndEventId(data)
{

    var orderedData = {};
    var widgetsPerPhase = {};
    var ratingsPerEvent = {};

    data.forEach(
        function(d)
        {
            var username = d.username.toLowerCase();
            //small hack, seems we're getting an odd user
            username = username.replace(":","_");

            var event = convertEventData(d);
            if(event == null) return;
            if(event.rating != null)
            {
                if(ratingsPerEvent[event.source] == undefined)
                {
                    ratingsPerEvent[event.source] = {rating: 0, ratingCount: 0, liked:0, usersWhoRated:{}};


                }
                //store the fact that this person rated, and from when that rating was
                if(Object.keys(ratingsPerEvent[event.source].usersWhoRated).indexOf(username) < 0)
                {
                    ratingsPerEvent[event.source].usersWhoRated[username] = {date: new Date(event.data.starttime).getTime(), rating: event.rating};
                }
                //compare if this person's rating is his latest rating
                if(ratingsPerEvent[event.source].usersWhoRated[username].date < new Date(event.data.starttime).getTime())
                {
                    ratingsPerEvent[event.source].usersWhoRated[username] = {date: new Date(event.data.starttime).getTime(), rating: event.rating};
                }


                return;
            }
            if(event.liked != null)
            {
                if(ratingsPerEvent[event.source] == undefined)
                {
                    ratingsPerEvent[event.source] = {rating: 0, ratingCount: 0, liked:0, usersWhoRated:[]};

                }
                ratingsPerEvent[event.source].liked++;
                return;
            }

            event.username = username;
            if(widgetsPerPhase[event.phase] == undefined)
                widgetsPerPhase[event.phase] = [];
            if(widgetsPerPhase[event.phase].indexOf(event.subphase) == -1)
                widgetsPerPhase[event.phase].push(event.subphase);
            if(orderedData[username] == undefined)
            {
                orderedData[username] = {};
                //PHASES
                orderedData[username][1] = [];
                orderedData[username][2] = [];
                orderedData[username][3] = [];
                orderedData[username][4] = [];
                orderedData[username][5] = [];
                orderedData[username][6] = [];

            }
            orderedData[username].username = event.username;

            try{
            orderedData[username][parseInt(event.phase)].push(event);
            }
            catch(exc)
            {
                console.log(event.phase);

            }
        }
    );

    //sort the rating out
   if(Object.keys(ratingsPerEvent).length > 0)
   {
       Object.keys(ratingsPerEvent).forEach(function(d){
           Object.keys(ratingsPerEvent[d].usersWhoRated).forEach(function(e){
            ratingsPerEvent[d].rating += ratingsPerEvent[d].usersWhoRated[e].rating;
            ratingsPerEvent[d].ratingCount++;
        })
    });
   }
   return {events: orderedData, widgetsPerPhase: widgetsPerPhase, ratings:ratingsPerEvent};

}

exports.inquiryDashboard = function(req, res){

  inquiry.getInquiry(req.params.inquiryId, function(d){
    //order the events by user

    var parsedData = convertToEventsByUsersAndEventId(d);
    res.render('dashboard_v2.html', {widgetsPerPhase:parsedData.widgetsPerPhase, ratings:parsedData.ratings, users: user.users, events: parsedData.events, userAuthId:req.params.userAuthId, userAuthProvider: req.params.userAuthProvider});}
  );
};

exports.inquiryMiniDashboard = function(req, res){
    var userAuthId = req.params.userAuthId;
    var userAuthProvider = req.params.userAuthProvider;
    var inquiryId = req.params.inquiryId;
    inquiry.getInquiry(inquiryId, function(d){
            //order the events by user

            var parsedData = convertToEventsByUsersAndEventId(d);

        res.render('MiniDashboard.html', { events: parsedData.events[(userAuthProvider + "_" + userAuthId).toLowerCase()],
            ratings:parsedData.ratings,
            userAuthId:req.params.userAuthId,
            userAuthProvider: req.params.userAuthProvider,
            inquiryId: inquiryId});
    });



};

exports.dashboard_v2 = function(req, res)
{
    var userAuthId = req.params.userAuthId;
    var userAuthProvider = req.params.userAuthProvider;


    user.getUsers(function(d){
        d.forEach(function(u)
        {
            try{
                //TODO: should not lowercase the ID, quick fix
                user.users[u.oauthProvider.toLowerCase() + "_" + u.oauthId.toLowerCase()] = {name:u.name, icon:u.icon};
            }
            catch(exc)
            {
                console.log(u.oauthProvider);
            }
        }
        );
        inquiry.getInquiriesOfUser(userAuthId, userAuthProvider, function(d){
                if(user.users[(userAuthProvider + "_" + userAuthId).toLowerCase()] != undefined)
                {

                    //load all inquiries of the user! (might wanna do some caching here and there at some point)
                    var dataPerInquiry = {};
                    var inquiries = d[0].result;
                    var nrOfInquiries = d[0].result.length;
                    inquiries.forEach(function(inq){
                        inquiry.getInquiry(inq.inquiryId, function(d, errorMessage){

                            if(errorMessage != undefined)
                            {
                                res.render('noInquiries.html', {errorMessage: errorMessage, users: user.users, inquiries: [], userAuthId:req.params.userAuthId, userAuthProvider: req.params.userAuthProvider, iframe:true });
                                return;
                            }

                            //order the events by user
                            var parsedData = convertToEventsByUsersAndEventId(d);
                            dataPerInquiry[inq.inquiryId] = {};
                            dataPerInquiry[inq.inquiryId].inquiry = inq;
                            dataPerInquiry[inq.inquiryId].data = parsedData;
                            dashboard_render_yesno(dataPerInquiry, nrOfInquiries,req, res);
                        });});


                }

                else
                    res.render('noInquiries.html', {users: user.users, inquiries: d[0].result, userAuthId:req.params.userAuthId, userAuthProvider: req.params.userAuthProvider, iframe:true });

            }

        );
    });


}

function dashboard_render_yesno(data, total,req, res)
{
    if(Object.keys(data).length >= total)
     res.render('dashboard_v2.html', {data:data, users: user.users, userAuthId:req.params.userAuthId, userAuthProvider: req.params.userAuthProvider, iframe:true});
    else
        console.log("still loading");
}