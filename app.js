
/**
 * Module dependencies.
 */
//DEV
//var url = "http://localhost:3015";
//PROD
var url = "http://ariadne.cs.kuleuven.be"

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

var passport = require('passport')
    , OAuth2Strategy = require('passport-oauth').OAuth2Strategy,
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
    FacebookStrategy = require('passport-facebook').Strategy;


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
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);


// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}


passport.use('wespot_provider', new OAuth2Strategy({
        authorizationURL: 'https://wespot-arlearn.appspot.com/Login.html',
        tokenURL: url + '/wespot/oauthConverter',
        clientID: 'LARAe',
        clientSecret: 'thisiswespot',
        callbackURL: url + '/wespot/auth/wespot_provider/callback'
    },
    function(accessToken, refreshToken, profile, done) {


        https.get("https://wespot-arlearn.appspot.com/oauth/resource_query?access_token=" + accessToken, function(result){

            var user = "";
            result.on('data',function(d){
                user += d;

            });
            result.on('end',function(){
                console.log(user);
                done(null,JSON.parse(user));
            });
            result.on('error',function(d) {


            });
        });
    }
));

passport.use('google_provider',new GoogleStrategy({
        clientID: "906280201493-pju3qst1ljcnumm029fhgsh40l9fse6o.apps.googleusercontent.com",
        clientSecret: "YxY6oui1sSKZ9Yx12SM88q99",
        callbackURL: url+"/wespot/auth/google_provider/callback"

    },
    function(token, refreshToken, profile, done)
    {
        console.log("accesstoken: " + token);
        console.log(JSON.stringify(profile));
       /* https.get("https://www.googleapis.com/oauth2/v1/userinfo?access_token=" + token, function(result){

            var user = "";
            result.on('data',function(d){
                user += d;

            });
            result.on('end',function(){
                console.log(user);
                done(null,user);
            });
            result.on('error',function(d) {


            });
        });*/
        done(null,profile);
    }
));

passport.use("facebook_provider",new FacebookStrategy({
        clientID: "1432259707033792",
        clientSecret: "74a50b3ce1db0d59d857cc5e7ee7ed53",
        callbackURL: url+"/wespot/auth/facebook_provider/callback"
    },
    function(accessToken, refreshToken, profile, done) {
        done(null,profile);
    }
));

passport.serializeUser(function(user, done) {
    console.log("serialize user:" + user);
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    console.log("deserialize user:" + user);
    done(null, {user: user});
});


app.get(path.join(context,'/auth/wespot_provider'), passport.authenticate('wespot_provider'));
app.get(path.join(context,'/auth/google_provider'), passport.authenticate('google_provider',{ scope : ['profile', 'email'] }));
app.get(path.join(context,'/auth/facebook_provider'), passport.authenticate('facebook_provider'));
app.get(path.join(context,'/auth/wespot_provider/callback'),
    passport.authenticate('wespot_provider', { successRedirect: path.join(context,'/success/wespot/'),
        failureRedirect: path.join(context,'/') }));
app.get(path.join(context,'/auth/google_provider/callback'),
    passport.authenticate('google_provider', { successRedirect: path.join(context,'/success/google/'),
        failureRedirect: path.join(context,'/') }));
app.get(path.join(context,'/auth/facebook_provider/callback'),
    passport.authenticate('facebook_provider', { successRedirect: path.join(context,'/success/facebook/'),
        failureRedirect: path.join(context,'/') }));


// cas.bouncer prompts for authentication and performs login if not logged in. If logged in it passes on.
app.get(path.join(context,'/success/:provider'), routes.index);
// cas.blocker redirects to the redirectUrl supplied above if not logged in.

//app.get(path.join(context,'/logout'), casRoute.logout);
//app.get(path.join(context,'/accessDenied'), cas.blocker, casRoute.accessDenied);
//app.get(path.join(context,'/accessDenied'), casRoute.accessDenied);

//REST services
app.get(path.join(context,'/inquiries/getById/:inquiryId'), inquiry.getInquiry_RF);
app.get(path.join(context,'/inquiries/collectAll'), inquiry.getInquiries_RF);
app.get(path.join(context,'/inquiries/getByUser/:userAuthId/:userAuthProvider'), inquiry.getInquiriesOfUser_RF);
app.get(path.join(context,'/user/list'), user.getUsers_RF);
app.get(path.join(context,'/inquiryMiniDashboard/:inquiryId/:userAuthId/:userAuthProvider'), inquiryDashboard.inquiryMiniDashboard);

//POST to REST for oauth
app.post(path.join(context, '/oauthConverter'), oauthConverter.index);


app.get(path.join(context,'/') , login.login);

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect(path.join(context,'/'));
}

app.all('*', function(req,res,next){
    if (req.params[0] == path.join(context,'/') ||  req.params[0] == path.join(context,'/logout')
        || req.params[0].indexOf('/static/') != -1 )
        next();
    else
        ensureAuthenticated(req,res,next);
});

//web pages
app.get(path.join(context,'/userInquiryList/:userAuthId/:userAuthProvider') , userInquiryList.userInquiryList);
app.get(path.join(context,'/inquiryDashboard/:inquiryId/:userAuthId/:userAuthProvider'),  inquiryDashboard.inquiryDashboard);




http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});

