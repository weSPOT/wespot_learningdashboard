
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
    ,casRoute = require('./routes/cas')
  , http = require('http')
    , db = require('./dbConnection')
  , path = require('path');
var cas = require('grand_master_cas');
var static = require('node-static');

var app = express();

// all environments
app.use(express.cookieParser());
app.use(express.session({secret: "LARA.emo_was_here"}));

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



//CAS
cas.configure({
    casHost: "cas-no-ssl.wespot.it.fmi.uni-sofia.bg",//"tapies",   // required
    casPath: "/cas",                  // your cas login route (defaults to "/cas")
    ssl: false,                        // is the cas url https? defaults to false
    casPort: 7070,                        // defaults to 80 if ssl false, 443 if ssl true
    service: "http://localhost:3013", // your site
    sessionName: "cas_user",          // the cas user_name will be at req.session.cas_user (this is the default)
    renew: false,                     // true or false, false is the default
    gateway: false,                   // true or false, false is the default
    redirectUrl: '/test'            // the route that cas.blocker will send to if not authed. Defaults to '/'
});

// cas.bouncer prompts for authentication and performs login if not logged in. If logged in it passes on.
app.get('/', cas.bouncer, routes.index);
// cas.blocker redirects to the redirectUrl supplied above if not logged in.
app.get('/', cas.blocker, casRoute.accessDenied);
app.get('/logout', casRoute.logout);


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

