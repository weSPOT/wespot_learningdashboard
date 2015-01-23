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

var passport = require('passport')
    , OAuth2Strategy = require('passport-oauth').OAuth2Strategy;


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


passport.use('provider', new OAuth2Strategy({
        authorizationURL: 'https://wespot-arlearn.appspot.com/Login.html',
        tokenURL: 'https://wespot-arlearn.appspot.com/oauth/token',
        clientID: 'LARAe',
        clientSecret: 'thisiswespot',
        callbackURL: 'http://ariadne.cs.kuleuven.be/wespot/'
    },
    function(accessToken, refreshToken, profile, done) {
        /*User.findOrCreate(..., function(err, user) {
            done(err, user);
        });*/
        done(null,profile);
    }
));



passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {

    done(null, {user: user});
});


app.get(path.join(context,'/auth/provider'), passport.authenticate('provider'));

app.get(path.join(context,'/auth/provider/callback'),
    passport.authenticate('provider', { successRedirect: '/',
        failureRedirect: '/login' }));

// cas.bouncer prompts for authentication and performs login if not logged in. If logged in it passes on.
app.get(path.join(context,'/login'), routes.index);
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

