
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  //, events = require('./routes/events')
    , user = require('./routes/user')
   // , blogs = require('./routes/blogs')
   // , comments = require('./routes/comments')
   // , relatedevents = require('./routes/relatedevents')
   // , activity = require('./routes/activity')
   // , badges = require('./routes/badges')
    , inquiry = require('./routes/inquiry')
    , userInquiryList = require('./routes/userInquiryList')
    ,inquiryDashboard = require('./routes/inquiryDashboard')
    ,casRoute = require('./routes/cas')
  , http = require('http')
   // , db = require('./dbConnection')
  , path = require('path');
var cas = require('grand_master_cas');
var static = require('node-static');

var app = express();

var context = '/wespot';

// all environments
app.use(express.cookieParser());
app.use(express.session({secret: "LARA.emo_was_here"}));

app.set('port', process.env.PORT || 3015);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use("/wespot/static", express.static(path.join(__dirname, 'public')));

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
    service: "http://ariadne.cs.kuleuven.be/wespot/", // your site
    sessionName: "cas_user",          // the cas user_name will be at req.session.cas_user (this is the default)
    renew: false,                     // true or false, false is the default
    gateway: false,                   // true or false, false is the default
    redirectUrl: path.join(context,'/accessDenied')            // the route that cas.blocker will send to if not authed. Defaults to '/'
});

// cas.bouncer prompts for authentication and performs login if not logged in. If logged in it passes on.
app.get(path.join(context,'/'), cas.bouncer, routes.index);
// cas.blocker redirects to the redirectUrl supplied above if not logged in.

app.get(path.join(context,'/logout'), casRoute.logout);
//app.get(path.join(context,'/accessDenied'), cas.blocker, casRoute.accessDenied);
app.get(path.join(context,'/accessDenied'), casRoute.accessDenied);

//REST services
app.get(path.join(context,'/inquiries/getById/:inquiryId'), inquiry.getInquiry_RF);
app.get(path.join(context,'/inquiries/collectAll'), inquiry.getInquiries_RF);
app.get(path.join(context,'/inquiries/getByUser/:userAuthId/:userAuthProvider'), inquiry.getInquiriesOfUser_RF);
app.get(path.join(context,'/user/list'), user.getUsers_RF);
app.get(path.join(context,'/inquiryMiniDashboard/:inquiryId/:userAuthId/:userAuthProvider'), inquiryDashboard.inquiryMiniDashboard);


//web pages
app.get(path.join(context,'/userInquiryList/:userAuthId/:userAuthProvider') ,cas.bouncer, userInquiryList.userInquiryList);
app.get(path.join(context,'/inquiryDashboard/:inquiryId/:userAuthId/:userAuthProvider'),cas.bouncer,  inquiryDashboard.inquiryDashboard);




http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

