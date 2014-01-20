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
    var context = rawEvent.context;
    //try{
        //context = JSON.parse(rawEvent.context);
    //}
    //catch(exc)
    //{
    //    console.log(exc.toString());

    //}

    if(context.phase == "Data Collection") context.phase = 3;

    event.inquiryId = context.course;
    event.phase = context.phase;
    event.subphase = context.subphase;

    try {
        event.originalRequest = rawEvent.originalrequest;// JSON.parse(rawEvent.originalrequest)

        if(rawEvent.verb == "response") //ARLearn
        {
            if(rawEvent.originalrequest.responseValue.imageUrl != undefined)
                event.html = "<img src='" + rawEvent.originalrequest.responseValue.imageUrl.replace(/\\/g, "") + "'></img>";
            if(rawEvent.originalrequest.responseValue.audioUrl != undefined)
            {
                event.html = "<audio controls> <source src='" + rawEvent.originalrequest.responseValue.audioUrl.replace(/\\/g, "") + "'> Your browser does not support the audio tag.</audio>";
                event.html += "[<a href='" + rawEvent.originalrequest.responseValue.audioUrl.replace(/\\/g, "") + "'>source</a>]";
            }    //
            if(rawEvent.originalrequest.responseValue.videoUrl != undefined)
            {
                event.html = "<video controls> <source src='" + rawEvent.originalrequest.responseValue.videoUrl.replace(/\\/g, "") + "' type='video/mp4'> Your browser does not support the video tag.</video>";
                event.html += "[<a href='" + rawEvent.originalrequest.responseValue.videoUrl.replace(/\\/g, "") + "'>source</a>]";
            }
            if(rawEvent.originalrequest.responseValue.text != undefined)
                event.html = rawEvent.originalrequest.responseValue.text;

            return event;
        }
        if(rawEvent.verb == "like") //ELGG
        {
            event.html = event.subphase + " liked [<a href='" + rawEvent.object + "'>source</a>]";
            return event;
        }
        if(rawEvent.verb == "comment") //ELGG
        {
            event.html = event.subphase + " commented on [<a href='" + rawEvent.object + "'>source</a>]";
            return event;
        }
        if(rawEvent.verb == "create") //ELGG
        {
            event.html = event.subphase + " created [<a href='" + rawEvent.object + "'>source</a>]";
            return event;
        }
        if(rawEvent.verb == "rated") //ELGG
        {
            event.html = event.subphase + " rated [<a href='" + rawEvent.object + "'>source</a>]";
            return event;
        }
    }
    catch (exc) {
        console.log(exc.toString());
        console.log(rawEvent.originalrequest.toString());
        return null;
    }



    return null;
}
function convertToEventsByUsersAndEventId(data)
{
    var orderedData = {};
    data.forEach(
        function(d)
        {
            var username = d.username.toLowerCase();


            var event = convertEventData(d);
            if(event == null) return;
            event.username = username;
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

            orderedData[username][parseInt(event.phase)].push(event);
        }
    );
    return orderedData;

}

exports.inquiryDashboard = function(req, res){

  inquiry.getInquiry(req.params.inquiryId, function(d){
    //order the events by user
    var parsedData = convertToEventsByUsersAndEventId(d);
    res.render('inquiryDashboard.html', {users: user.users, events: parsedData, userAuthId:req.params.userAuthId, userAuthProvider: req.params.userAuthProvider});}
  );
};