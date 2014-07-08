var user = require('./user.js');
/*
 * GET home page.
 */

exports.index = function(req,res)
{
    var provider = req.params.provider;
    var activeUser = req.session.passport.user;
    var authProvider = "";
    if(provider == "google")
    {

        authProvider = "google";
        authId = activeUser.id;
    }
    if(provider == "facebook")
    {

        authProvider = provider;
        authId = activeUser.id;
    }

    if(provider == "wespot")
    {

        authProvider = "wespot";
        authId = activeUser.id;
    }
    //TODO: add other accounts

    req.session["activeUser"] = authProvider + "_" + authId;
    req.session["authId"] = authId;
    req.session["authProvider"] = authProvider;
    user.getUsers(function(d){
        d[0].result.forEach(function(u)
        {
            try{
                //TODO: should not lowercase the ID, quick fix
                user.users[u.oauthProvider.toLowerCase() + "_" + u.oauthId.toLowerCase()] = {name:u.name, icon:u.icon};
            }
            catch(exc)
            {
                console.log(u.oauthProvider);
            }
        });

        res.redirect("/wespot/dashboard_v2/"+authId+"/"+authProvider);
    });

}

//old user list index
exports.users = function(req, res){

  user.getUsers(function(d){
    res.render('users.html', {users: d[0].result});}
  );
};
