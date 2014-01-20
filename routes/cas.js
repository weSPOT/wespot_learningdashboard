var cas = require('grand_master_cas');

exports.accessDenied = function(req, res)
{
    res.send("access denied");
}

exports.logout = function(req,res)
{
    delete req.session["activeUser"];
    delete req.session["authId"];
    delete req.session["activeProvider"];
    cas.logout(req,res);

    //req.session.destroy();

    //res.send("logged out");
}