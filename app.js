
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , events = require('./routes/events')
    , user = require('./routes/user')
    , blogs = require('./routes/blogs')
    , comments = require('./routes/comments')
    , relatedevents = require('./routes/relatedevents')
    , activity = require('./routes/activity')
    , badges = require('./routes/badges')
    , inquiry = require('./routes/inquiry')
    , userInquiryList = require('./routes/userInquiryList')
    ,inquiryDashboard = require('./routes/inquiryDashboard')
  , http = require('http')
    , db = require('./dbConnection')
  , path = require('path');
var static = require('node-static');

var app = express();

// all environments
app.set('port', process.env.PORT || 3013);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/events', events.list);
app.get('/events/username/:username', events.username);
app.get('/events/username/:username/:verb', events.username_verb);
app.get('/events/verb/:verb', events.verb);

app.get('/relatedevents/:eventid', relatedevents.list);
app.get('/relatedevents/activity/:verb/:eventid', relatedevents.listActivity);
app.get('/badges', badges.list);
app.get('/flatActivity', activity.flatList);
app.get('/activity', activity.list);
app.get('/activity/total/:user', activity.listForUser);
app.get('/activity/:verb', activity.listForVerb);
app.get('/activity/:verb/:user', activity.listForVerbAndUser);
app.get('/activitybydate/:date/:verb', activity.date);
app.get('/activitybydate/:date', activity.date);
app.get('/blogposts', blogs.list);
app.get('/blogposts/:url', blogs.blogpost);

app.get('/inquiries/getById/:inquiryId', inquiry.getInquiry_RF);
app.get('/inquiries/collectAll', inquiry.getInquiries_RF);
app.get('/inquiries/getByUser/:userAuthId/:userAuthProvider', inquiry.getInquiriesOfUser_RF);

app.get('/user/list', user.getUsers_RF);

app.get('/userInquiryList/:userAuthId/:userAuthProvider' , userInquiryList.userInquiryList);

app.get('/inquiryDashboard/:inquiryId/:userAuthId/:userAuthProvider', inquiryDashboard.inquiryDashboard);

app.get('/comments', comments.list);
app.get('/comments/:url', comments.comment);




http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


//create static file server where we'll add LARAe03 interface
var file = new static.Server('./LARAe03');

require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        //
        // Serve files!
        //
        file.serve(request, response);
    }).resume();
}).listen(4013);