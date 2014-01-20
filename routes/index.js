var user = require('./user.js');
/*
 * GET home page.
 */

exports.index = function(req,res)
{
    var activeUser = req.session["cas_user"];
    var authProvider = "";
    if(activeUser.indexOf("Google") != -1)
    {
        var userSplit = activeUser.split("#");
        authProvider = "google";
        authId = userSplit[1];
    }
    if(activeUser.indexOf("Facebook") != -1)
    {
        var userSplit = activeUser.split("#");
        authProvider = "facebook";
        authId = userSplit[1];
    }
    //TODO: add other accounts

    req.session["activeUser"] = authProvider + "_" + authId;
    req.session["authId"] = authId;
    req.session["authProvider"] = authProvider;
    user.getUsers(function(d){
        d[0].result.forEach(function(u)
        {
            try{
            user.users[u.oauthProvider.toLowerCase() + "_" + u.oauthId] = {name:u.name, icon:u.icon};
            }
            catch(exc)
            {
                console.log(u.oauthProvider);
            }
        });

        res.redirect("/userInquiryList/"+authId+"/"+authProvider);
    });

}

//old user list index
exports.users = function(req, res){

  user.getUsers(function(d){
    res.render('users.html', {users: d[0].result});}
  );
};
