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
function convertToEventsByUsersAndEventId(data)
{
    var orderedData = {};
    data.forEach(
        function(d)
        {
            var username = d.username.toLowerCase();
            var context = JSON.parse(d.context);
            var event = {};
            event.inquiryId = context.course;
            //quick hack
            if(context.phase == "Data Collection") context.phase = 3;
            event.phase = context.phase;

            event.subphase = context.subphase;
            event.username = username;
            event.data = d.object;
            event.id = d.event_id;
            try
            {
                event.originalRequest = JSON.parse(d.originalrequest)
            }
            catch(exc)
            {
                console.log(exc.toString());
                console.log(d.originalrequest.toString());
            }
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