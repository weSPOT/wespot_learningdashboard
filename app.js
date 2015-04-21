
/**
 * Module dependencies.
 */
//DEV
//var url = "http://localhost:3015";
//PROD
var url = "http://ariadne.cs.kuleuven.be";
var heapdump = require('heapdump');
var express = require('express')
    , routes = require('./routes')
    , login = require('./routes/login')
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
    ,oauthConverter = require('./routes/oauthConverter')
    ,casRoute = require('./routes/cas')
    , http = require('http')
// , db = require('./dbConnection')
    , path = require('path');
var cas = require('grand_master_cas');
var static = require('node-static');
var https = require('https');



var app = express();

var context = '/wespot';

// all environments



app.set('port', process.env.PORT || 3015);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use("/wespot/static", express.static(path.join(__dirname, 'public')));

app.use(express.cookieParser("LARA.emo_was_here"));
app.use(express.session());

app.use(app.router);


// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}


//REST services
app.get(path.join(context,'/inquiries/getById/:inquiryId'), inquiry.getInquiry_RF);
app.get(path.join(context,'/inquiries/collectAll'), inquiry.getInquiries_RF);
app.get(path.join(context,'/inquiries/getByUser/:userAuthId/:userAuthProvider'), inquiry.getInquiriesOfUser_RF);
app.get(path.join(context,'/user/list'), user.getUsers_RF);
app.get(path.join(context,'/user/mapping'), user.userMapping);
app.get(path.join(context,'/inquiryMiniDashboard/:inquiryId/:userAuthId/:userAuthProvider'), inquiryDashboard.inquiryMiniDashboard);

//POST to REST for oauth
app.post(path.join(context, '/oauthConverter'), oauthConverter.index);



function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect(path.join(context,'/'));
}

app.all('*', function(req,res,next){
    if (req.params[0] == path.join(context,'/') ||  req.params[0] == path.join(context,'/logout')
        || req.params[0].indexOf('/static/') != -1 || req.params[0].indexOf('/dashboard_v2/') != -1 || req.params[0].indexOf('/user/mapping/') != -1)
        next();
    else
        ensureAuthenticated(req,res,next);
});

//web pages
app.get(path.join(context,'/userInquiryList/:userAuthId/:userAuthProvider') , inquiryDashboard.dashboard_v2);
app.get(path.join(context,'/inquiryDashboard/:inquiryId/:userAuthId/:userAuthProvider'),  inquiryDashboard.inquiryDashboard);
app.get(path.join(context,'/dashboard_v2/:userAuthId/:userAuthProvider/:inquiryId'),  inquiryDashboard.dashboard_v2);
app.get(path.join(context,'/inquiryDashboard/:inquiryId/'), inquiryDashboard.inquiryDashboard);

/*setInterval(function () {
    heapdump.writeSnapshot()
}, 60000 * 30);
*/

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});

