var inquiry = require('./inquiry.js');
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
            var context = JSON.parse(d.context);
            var event = {};
            event.inquiryId = context.course;
            event.phase = context.phase;
            event.subphase = context.subphase;
            event.username = d.username.toLowerCase();
            event.data = d.object;
            if(orderedData[d.username.toLowerCase()] == undefined)
                orderedData[d.username.toLowerCase()] = {};
            orderedData[d.username.toLowerCase()].username = event.username;
            orderedData[d.username.toLowerCase()][d.event_id] = event;
        }
    );
    return orderedData;

}

exports.inquiryDashboard = function(req, res){

  inquiry.getInquiry(req.params.inquiryId, function(d){
    //order the events by user
    var parsedData = convertToEventsByUsersAndEventId(d);
    res.render('inquiryDashboard.html', {events: parsedData, userAuthId:req.params.userAuthId, userAuthProvider: req.params.userAuthProvider});}
  );
};